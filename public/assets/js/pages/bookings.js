$(function () {
	("use strict");

	let token = sessionStorage.getItem("token");

	$(document).ready(function ($) {
		loadBookings();

		$(".bookings").on("click", ".btn-edit", function () {
			var serviceBookingID = $(this).attr("booking-id");
			$("#update-booking-status-form")
				.find(".service_booking_id")
				.val(serviceBookingID);
		});

		$("#update-booking-status-form").on("submit", function (e) {
			e.preventDefault();

			if (
				confirm("Are you sure you want to update this booking status?")
			) {
				var form = $(this);
				var fields = form.find("input.required, select.required");

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
					url: `${API_URL_ROOT}/booking-status`,
					data: JSON.stringify(form.serializeObject()),
					dataType: "json",
					contentType: "application/json",
					headers: { "x-access-token": token },
					success: function (response) {
						unblockUI();
						alert(response.message);
						form.get(0).reset();
						$("#edit-booking-status-modal")
							.find(".ti-circle-x-filled")
							.click();
						loadBookings();
					},
					error: function (req, status, err) {
						alert(req.responseJSON.message);
						unblockUI();
					},
				});
			}
		});
	});

	//load bookings
	function loadBookings() {
		var providerID = payloadClaim(token, "user_id");

		blockUI();

		$.ajax({
			type: "GET",
			url: `${API_URL_ROOT}/bookings?provider_id=${providerID}`,
			dataType: "json",
			headers: { "x-access-token": token },
			success: function (response) {
				var bookings = response.data;
				var html = "";
				var serial = 0;

				for (var i = 0; i < bookings.length; i++) {
					const booking = bookings[i];
					html += `
                        <tr>
                            <td class="text-gray">${(serial += 1)}</td>
                            <td class="text-body">${booking.service_title}</td>
                            <td class="text-gray fw-500">${
								booking.client_fullname
							}</td>
                            <td class="text-gray fw-500">${
								booking.client_email
							}</td>
                            <td class="text-gray fw-500">${
								booking.client_phone
							}</td>
                            <td class="text-gray fw-500">${
								booking.client_address
							}</td>
                            <td class="text-gray fw-500">${booking.remarks}</td>
                            <td class="text-gray">${moment(
								booking.booked_at
							).format("Do MMM YYYY hh:mm:ss A")}</td>
                            <td class="text-gray">${moment(
								booking.start_time
							).format("Do MMM YYYY hh:mm:ss A")}</td>
                            <td class="text-gray">${moment(
								booking.end_time
							).format("Do MMM YYYY hh:mm:ss A")}</td>
                            <td class="text-gray fw-500">$${parseFloat(
								booking.amount_paid
							).toFixed(2)}</td>
                            <td class="text-gray fw-500">$${parseFloat(
								booking.expected_payout
							).toFixed(2)}</td>
                            <td class="text-gray fw-500">$${parseFloat(
								booking.service_charge
							).toFixed(2)}</td>
                            <td class="text-gray fw-500">${
								booking.transaction_id
							}</td>
                            <td><span class="badge ${
								booking.booking_status === "Booked"
									? "badge-soft-warning"
									: booking.booking_status ===
									  "Provider Accepted"
									? "badge-soft-info"
									: booking.booking_status ===
									  "Provided Rejected"
									? "badge-soft-danger"
									: booking.booking_status === "Canceled"
									? "badge-soft-danger"
									: "badge-soft-success"
							}">${booking.booking_status}</span></td>
                            <td><span class="badge ${
								booking.payout_status === "Pending Payout"
									? "badge-soft-warning"
									: booking.payout_status ===
									  "Scheduled For Payout"
									? "badge-soft-info"
									: "badge-soft-success"
							}">${booking.payout_status}</span></td>
                            <td><a href="javascript:void(0);" booking-id="${
								booking.service_booking_id
							}" class="me-2 btn-edit" data-bs-toggle="modal" data-bs-target="#edit-booking-status-modal"><i class="ti ti-edit"></i></a></td>
                        </tr>
                    `;
				}

				$(".bookings").find("tbody").html(html);
				unblockUI();
			},
			error: function (req, status, error) {
				unblockUI();
				alert(req.responseJSON.message);
			},
		});
	}
});
