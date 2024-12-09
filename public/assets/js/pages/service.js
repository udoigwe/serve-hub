$(function () {
	("use strict");

	let token = sessionStorage.getItem("token");

	$(document).ready(function ($) {
		newReview();
		newMessage();
		serviceBooking();

		$(".rating").on("click", function () {
			const rating = $(this).attr("rating");
			const reviewForm = $("#add-review-form");

			reviewForm.find(".review-rating").val(rating);
		});

		$(".services").on("click", ".update-btn", function () {
			var serviceID = $(this).attr("service-id");
			var updateModal = $("#update-service");
			blockUI();

			//fetch service details
			$.ajax({
				url: `${API_URL_ROOT}/services/${serviceID}`,
				type: "GET",
				dataType: "json",
				headers: { "x-access-token": token },
				success: function (response) {
					var service = response.service;
					updateModal
						.find(".modal-title")
						.text(service.service_title);
					updateModal
						.find("select.service_category_id")
						.val(service.service_category_id);
					updateModal
						.find(".service_title")
						.val(service.service_title);
					updateModal
						.find(".service_price")
						.val(service.service_price);
					updateModal
						.find(".service_discount_rate")
						.val(service.service_discount_rate);
					updateModal
						.find(".service_location_y")
						.val(service.service_location_y);
					updateModal
						.find(".service_location_y")
						.val(service.service_location_y);
					updateModal
						.find(".service_location_x")
						.val(service.service_location_x);
					updateModal
						.find(".service_youtube_video_url")
						.val(service.service_youtube_video_url);
					updateModal
						.find(".service_description")
						.val(service.service_description);
					updateModal
						.find(".service_address")
						.val(service.service_address);
					updateModal
						.find(".service_status")
						.val(service.service_status);
					updateModal.find(".service_id").val(service.service_id);
					unblockUI();
				},
				error: function (req, status, error) {
					unblockUI();
					alert(req.responseJSON.message);
				},
			});
		});
	});

	function loadServices() {
		const subscriber_id = payloadClaim(token, "user_id");
		blockUI();

		$.ajax({
			url: `${API_URL_ROOT}/services?subscriber_id=${subscriber_id}`,
			type: "GET",
			dataType: "json",
			headers: { "x-access-token": token },
			success: function (response) {
				var services = response.data;
				var html = "";

				for (var i = 0; i < services.length; i++) {
					const service = services[i];
					console.log(
						service.service_images[0]?.service_image_filename
					);
					html += `
                        <div class="col-xl-4 col-md-6">
                            <div class="card p-0">
                                <div class="card-body p-0">
                                    <div class="img-sec w-100">
                                        <a href="service-details.html"><img
                                                src="/uploads/service-gallery/${service.service_images[0]?.service_image_filename}"
                                                class="img-fluid rounded-top w-100" alt="img"></a>
                                        <div
                                            class="image-tag d-flex justify-content-end align-items-center">
                                            <span class="trend-tag">${service.service_category}</span>
                                            <span
                                                class="trend-tag-2  d-flex justify-content-center align-items-center rating text-gray"><i
                                                    class="fa fa-star filled me-1"></i>4.9</span>
                                        </div>
                                    </div>
                                    <div class="p-3">
                                        <h5 class="mb-2 text-truncate">
                                            <a href="service-details.html">${service.service_title}</a>
                                        </h5>
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <p class="fs-14 mb-0"><i class="ti ti-map-pin me-2"></i>${service.service_address}
                                            </p>
                                            <h5>$${service.service_price} / hr 
                                            </h5>
                                        </div>
                                        <div class="d-flex gap-3">
                                            <a href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#update-service" class="update-btn" service-id="${service.service_id}"><i class="ti ti-edit me-2"></i>Edit</a>
                                            <a href="javascript:void(0);" class="delete-btn" service-id="${service.service_id}><i class="ti ti-info-circle me-2"></i>Delete</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
				}

				$(".services").html(html);
				unblockUI();
			},
			error: function (req, status, err) {
				unblockUI();
				alert(req.responseJSON.message);
			},
		});
	}

	//load service categories
	function loadServiceCategories() {
		blockUI();

		$.ajax({
			type: "GET",
			url: `${API_URL_ROOT}/service-categories?service_category_status=Active`,
			dataType: "json",
			headers: { "x-access-token": token },
			success: function (response) {
				var categories = response.data;
				var html = "";

				for (var i = 0; i < categories.length; i++) {
					const category = categories[i];
					html += `
                        <option value="${category.service_category_id}">${category.service_category}</option>
                    `;
				}

				$("select.service_category_id").append(html);
				$(".service_category_id").trigger("chosen:updated");
				unblockUI();
			},
			error: function (req, status, error) {
				unblockUI();
				alert(req.responseJSON.message);
			},
		});
	}

	function newReview() {
		$("#add-review-form").on("submit", function (e) {
			e.preventDefault();

			if (confirm("Are you sure you want to submit this review?")) {
				var form = $(this);
				var fields = form.find(
					"input.required, select.required, textarea.required"
				);

				blockUI();

				for (var i = 0; i < fields.length; i++) {
					if (fields[i].value == "") {
						/*alert(fields[i].id)*/
						unblockUI();
						//form.find("#" + fields[i].id).focus();
						alert(`${fields[i].name} is required`);
						return false;
					}
				}

				if (!token) {
					alert("Please login before reviewing this service");
					return false;
				}

				$.ajax({
					type: "POST",
					url: `${API_URL_ROOT}/reviews`,
					data: JSON.stringify(form.serializeObject()),
					dataType: "json",
					contentType: "application/json",
					headers: { "x-access-token": token },
					success: function (response) {
						unblockUI();
						alert(response.message);
						form.get(0).reset();
						$("#add-review-form")
							.find(".ti-circle-x-filled")
							.click();
						window.location.reload();
					},
					error: function (req, status, err) {
						alert(req.responseJSON.message);
						unblockUI();
					},
				});
			} else {
				alert("Operation cancelled");
			}
		});
	}

	function newMessage() {
		$("#enquiry-form").on("submit", function (e) {
			e.preventDefault();

			if (confirm("Are you sure you want to submit this enquiry?")) {
				var form = $(this);
				var fields = form.find(
					"input.required, select.required, textarea.required"
				);

				blockUI();

				for (var i = 0; i < fields.length; i++) {
					if (fields[i].value == "") {
						/*alert(fields[i].id)*/
						unblockUI();
						//form.find("#" + fields[i].id).focus();
						alert(`${fields[i].name} is required`);
						return false;
					}
				}

				$.ajax({
					type: "POST",
					url: `${API_URL_ROOT}/messages`,
					data: JSON.stringify(form.serializeObject()),
					dataType: "json",
					contentType: "application/json",
					headers: { "x-access-token": token },
					success: function (response) {
						unblockUI();
						alert(response.message);
						form.get(0).reset();
						$("#add-enquiry").find(".ti-circle-x-filled").click();
						window.location.reload();
					},
					error: function (req, status, err) {
						alert(req.responseJSON.message);
						unblockUI();
					},
				});
			} else {
				alert("Operation cancelled");
			}
		});
	}

	//function book a service
	function serviceBooking() {
		$("#service-booking-form").on("submit", function (e) {
			e.preventDefault();

			if (confirm("Are you sure you want to book for this service?")) {
				blockUI();
				var form = $("#service-booking-form");
				var startDate = form.find(".start_date").val();
				var startTime = form.find(".start_time").val();
				/* var endDate = form.find(".end_date").val();
				var endTime = form.find(".end_time").val(); */
				var service_price = parseFloat(
					form.find(".service_price").val()
				);
				var client_email = form.find(".client_email").val();
				var service_id = form.find(".service_id").val();

				var fields = form.find(
					"input.required, select.required, textarea.required"
				);

				for (var i = 0; i < fields.length; i++) {
					if (fields[i].value == "") {
						unblockUI();
						alert(`${fields[i].name} is required`);
						return false;
					}
				}

				const serviceStartTime = moment(`${startDate} ${startTime}:00`);
				const serviceEndTime = moment(
					`${startDate} ${startTime}:00`
				).add(1, "hours");
				//const serviceEndTime = moment(`${endDate} ${endTime}:00`);

				if (serviceEndTime.isBefore(serviceStartTime)) {
					unblockUI();
					alert(`Service end time cannot be before service end time`);
					return false;
				}

				const hoursDifference = serviceEndTime.diff(
					serviceStartTime,
					"hours",
					true
				);

				const amountPaid = service_price * hoursDifference;

				const availabilityCheckData = {
					schedule_start_time: serviceStartTime,
					schedule_end_time: serviceEndTime,
					service_id,
				};

				$.ajax({
					type: "POST",
					url: `${API_URL_ROOT}/service-availability-check`,
					data: JSON.stringify(availabilityCheckData),
					contentType: "application/json", // Set the Content-Type to JSON
					dataType: "json",
					success: function (response) {
						payWithPayStack(amountPaid, client_email);
						unblockUI();
					},
					error: function (req, status, err) {
						alert(req.responseJSON.message);
						unblockUI();
					},
				});
			} else {
				alert("Operation abortted");
			}
		});
	}

	//pay with paystack
	function payWithPayStack(amount, emailaddress) {
		let handler = PaystackPop.setup({
			key: "pk_test_62c0e79a2fe8bceaaf7e9e637bbc0b7acdbe1e20", // Replace with your public key
			email: emailaddress,
			amount: amount * 100,
			currency: "NGN",
			onClose: function () {
				showSimpleMessage(
					"Attention",
					"Hope you will complete this order as soon as possible.",
					"error"
				);
			},
			callback: function (response) {
				verifyPayment(response.reference, amount);
			},
		});

		handler.openIframe();
	}

	//verify payment
	function verifyPayment(transaction_id, amount) {
		var form = $("#service-booking-form");
		var startDate = form.find(".start_date").val();
		var startTime = form.find(".start_time").val();
		var endDate = form.find(".end_date").val();
		var endTime = form.find(".end_time").val();
		var client_fullname = form.find(".client_fullname").val();
		var client_email = form.find(".client_email").val();
		var client_phone = form.find(".client_phone").val();
		var client_address = form.find(".client_address").val();
		var remarks = form.find(".remarks").val();
		var service_id = form.find(".service_id").val();
		const service_start_time = moment(
			`${startDate} ${startTime}:00`
		).format("YYYY-MM-DD HH:mm:ss");
		const service_end_time = moment(`${endDate} ${endTime}:00`).format(
			"YYYY-MM-DD HH:mm:ss"
		);
		const formData = {
			client_fullname,
			client_email,
			client_phone,
			client_address,
			remarks,
			service_start_time,
			service_end_time,
			service_id,
			transaction_id,
			amount,
		};

		$.ajax({
			type: "POST",
			url: `${API_URL_ROOT}/bookings`,
			data: JSON.stringify(formData),
			contentType: "application/json", // Set the Content-Type to JSON
			dataType: "json",
			success: function (response) {
				unblockUI();
				alert(response.message);
				form.get(0).reset();
				$("#booking-modal").find(".ti-circle-x-filled").click();
			},
			error: function (req, status, err) {
				alert(req.responseJSON.message);
				unblockUI();
			},
		});
	}

	function updateService() {
		$("#update-service-form").on("submit", function (e) {
			e.preventDefault();

			if (confirm("Are you sure you want to update this service?")) {
				var form = $(this);
				var serviceID = form.find(".service_id").val();
				var fields = form.find(
					"input.required, select.required, textarea.required"
				);

				blockUI();

				for (var i = 0; i < fields.length; i++) {
					if (fields[i].value == "") {
						/*alert(fields[i].id)*/
						unblockUI();
						//form.find("#" + fields[i].id).focus();
						alert(`${fields[i].name} is required`);
						return false;
					}
				}

				$.ajax({
					type: "PUT",
					url: `${API_URL_ROOT}/services/${serviceID}`,
					data: new FormData(form[0]),
					dataType: "json",
					contentType: false,
					processData: false,
					cache: false,
					headers: { "x-access-token": token },
					success: function (response) {
						unblockUI();
						alert(response.message);
						form.get(0).reset();
						$("#update-service")
							.find(".ti-circle-x-filled")
							.click();
						loadServices();
					},
					error: function (req, status, err) {
						alert(req.responseJSON.message);
						unblockUI();
					},
				});
			} else {
				alert("Operation cancelled");
			}
		});
	}

	//delete a service
	function deleteService() {
		$(".services").on("click", ".delete-btn", function () {
			if (confirm("Are you sure you want to delete this service?")) {
				var serviceID = $(this).attr("service-id");

				blockUI();

				$.ajax({
					type: "DELETE",
					url: `${API_URL_ROOT}/services/${serviceID}`,
					dataType: "json",
					headers: { "x-access-token": token },
					success: function (response) {
						loadServices();
						unblockUI();
						alert(response.message);
					},
					error: function (req, status, error) {
						unblockUI();
						alert(req.responseJSON.message);
					},
				});
			}
		});
	}
});
