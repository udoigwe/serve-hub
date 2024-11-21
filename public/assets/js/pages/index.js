$(function () {
	("use strict");

	let token = sessionStorage.getItem("token");

	$(document).ready(function ($) {
		search();

		$(".btn-book").on("click", function () {
			const serviceID = $(this).attr("service-id");
			var bookingModal = $("#booking-modal");
			blockUI();

			//fetch service details
			$.ajax({
				url: `${API_URL_ROOT}/services/${serviceID}`,
				type: "GET",
				dataType: "json",
				/* headers: { "x-access-token": token }, */
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
	});

	//load service categories
	function loadServiceCategories() {
		blockUI();

		$.ajax({
			type: "GET",
			url: `${API_URL_ROOT}/service-categories?service_category_status=Active`,
			dataType: "json",
			/* headers: { "x-access-token": token }, */
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
		$(".btn-search").on("click", function (e) {
			e.preventDefault();
			blockUI();

			var form = $("#service-filter-form");
			var search_term = form.find(".keyword").val();
			var location = form.find(".location").val();

			// Base URL
			var url = "/services";

			// Create an array to hold the query parameters
			var queryParams = [];

			// Add parameters only if they are not empty
			if (search_term)
				queryParams.push(
					`search_term=${encodeURIComponent(search_term)}`
				);
			if (location)
				queryParams.push(`location=${encodeURIComponent(location)}`);

			// Join the parameters with '&' and append them to the base URL
			if (queryParams.length > 0) {
				url += `?${queryParams.join("&")}`;
			}

			unblockUI();
			window.location = url;
		});
	}
});
