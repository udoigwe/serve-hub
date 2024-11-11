$(function () {
	("use strict");

	let token = sessionStorage.getItem("token");

	$(document).ready(function ($) {
		loadServiceCategories();
		search();
		setValues();
		serviceBooking();

		$(".btn-book").on("click", function () {
			const serviceID = $(this).attr("service-id");
			var bookingModal = $("#booking-modal");
			blockUI();

			//fetch service details
			$.ajax({
				url: `${API_URL_ROOT}/services/${serviceID}`,
				type: "GET",
				dataType: "json",
				headers: { "x-access-token": token },
				success: function (response) {
					var service = response.service;
					bookingModal
						.find(".modal-title")
						.text(
							`${service.service_title} $${service.service_price}/hr`
						);
					bookingModal.find(".service_id").val(service.service_id);
					bookingModal
						.find(".service_price")
						.val(service.service_price);
					unblockUI();
				},
				error: function (req, status, error) {
					unblockUI();
					alert(req.responseJSON.message);
				},
			});
		});

		$("#range").ionRangeSlider({
			type: "double", // for selecting a range (min and max)
			min: 0,
			max: 100,
			from: getQueryParam("price_from")
				? parseInt(getQueryParam("price_from"))
				: 0,
			to: getQueryParam("price_to")
				? parseInt(getQueryParam("price_to"))
				: 0,
			onFinish: function (data) {
				// Triggered when the slider value is set (after the user stops dragging)
				console.log("Selected values:", data.from, data.to); // Logs the selected values
			},
		});
	});

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
					const selected = getQueryParam("service_category_id")
						? parseInt(getQueryParam("service_category_id").trim())
						: null;
					const isSelected =
						category.service_category_id === selected
							? "selected"
							: "";
					html += `
                        <option value="${category.service_category_id}" ${isSelected}>${category.service_category}</option>
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

	//set values
	function setValues() {
		var search_term = getQueryParam("search_term");
		var location = getQueryParam("location");
		var form = $("#service-filter-form");

		if (search_term) {
			form.find(".keyword").val(search_term);
		}
		if (location) {
			form.find(".location").val(location);
		}
	}

	//function search
	function search() {
		$("#service-filter-form").on("submit", function (e) {
			e.preventDefault();
			blockUI();

			var form = $(this);
			var search_term = form.find(".keyword").val();
			var service_category_id = form
				.find("select.service_category_id option:selected")
				.val();
			var location = form.find(".location").val();

			// Get the instance of the slider
			var sliderInstance = $("#range").data("ionRangeSlider");

			// Access the minimum and maximum range values from the slider configuration
			var minRange = sliderInstance.options.min;

			// Access the current values
			var currentFrom = sliderInstance.result.from;
			var currentTo = sliderInstance.result.to;

			// Treat currentFrom and currentTo as `undefined` if they match the slider's full range
			currentFrom = currentFrom === minRange ? undefined : currentFrom;
			currentTo = currentTo === minRange ? undefined : currentTo;

			// Base URL
			var url = "/services";

			// Create an array to hold the query parameters
			var queryParams = [];

			// Add parameters only if they are not empty
			if (search_term)
				queryParams.push(
					`search_term=${encodeURIComponent(search_term)}`
				);
			if (service_category_id)
				queryParams.push(
					`service_category_id=${encodeURIComponent(
						service_category_id
					)}`
				);
			if (location)
				queryParams.push(`location=${encodeURIComponent(location)}`);
			if (currentFrom !== undefined)
				queryParams.push(`price_from=${currentFrom}`);
			if (currentTo !== undefined)
				queryParams.push(`price_to=${currentTo}`);

			// Join the parameters with '&' and append them to the base URL
			if (queryParams.length > 0) {
				url += `?${queryParams.join("&")}`;
			}

			window.location = url;
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
				var endDate = form.find(".end_date").val();
				var endTime = form.find(".end_time").val();
				var service_price = parseFloat(
					form.find(".service_price").val()
				);
				var client_email = form.find(".client_email").val();

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
				const serviceEndTime = moment(`${endDate} ${endTime}:00`);

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

				payWithPayStack(amountPaid, client_email);
				unblockUI();
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
});
