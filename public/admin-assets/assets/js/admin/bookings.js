$(function () {
	"use strict";

	let token = sessionStorage.getItem("token");

	$(document).ready(function () {
		loadBookings();
		dataTableAlertPrevent("table");

		$("#existing-bookings").on("click", ".btn-edit", function () {
			var bookingID = $(this).parents("tr").attr("id");
			var editModal = $("#editModal");

			//fetch user details
			$.ajax({
				url: `${API_URL_ROOT}/bookings/${bookingID}`,
				type: "GET",
				dataType: "json",
				headers: { "x-access-token": token },
				success: function (response) {
					var booking = response.booking;
					editModal
						.find(".booking_status")
						.val(booking.booking_status);
					editModal.find(".payout_status").val(booking.payout_status);
					editModal
						.find(".service_booking_id")
						.val(booking.service_booking_id);
					editModal.find(".selectpicker").selectpicker("refresh");
				},
				error: function (req, status, error) {
					showSimpleMessage(
						"Attention",
						req.responseJSON.message,
						"error"
					);
				},
			});
		});

		//edit service statuses
		$("#updateBookingStatus").on("submit", function (e) {
			e.preventDefault();
			updateBookingStatuses();
		});
	});

	//internal function to update service category
	function updateBookingStatuses() {
		swal({
			title: "Attention",
			text: "Are you sure you want to update this service booking statuses?",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes!",
			cancelButtonText: "No!",
			/*closeOnConfirm: false,
            closeOnCancel: false*/
		}).then(function (result) {
			if (result.value) {
				//name vairables
				var form = $("#updateBookingStatus"); //form
				var table = $("#existing-bookings").DataTable();
				var fields = form.find("input.required, select.required");

				blockUI();

				for (var i = 0; i < fields.length; i++) {
					if (fields[i].value == "") {
						/*alert(fields[i].id);*/
						unblockUI();
						showSimpleMessage(
							"Attention",
							`${fields[i].name} is required`,
							"error"
						);
						$("#" + fields[i].id).focus();
						return false;
					}
				}

				$.ajax({
					type: "POST",
					url: `${API_URL_ROOT}/booking-statuses`,
					data: JSON.stringify(form.serializeObject()),
					dataType: "json",
					contentType: "application/json",
					headers: { "x-access-token": token },
					success: function (response) {
						unblockUI();
						showSimpleMessage(
							"Success",
							response.message,
							"success"
						);
						table.ajax.reload(null, false);
						$("#editModal").find(".close").click();
					},
					error: function (req, status, error) {
						unblockUI();
						showSimpleMessage(
							"Attention",
							req.responseJSON.message,
							"error"
						);
					},
				});
			} else {
				showSimpleMessage("Canceled", "Process Abborted", "error");
			}
		});
	}

	//load bookings
	function loadBookings() {
		var table = $("#existing-bookings");

		table.DataTable({
			dom: `<"row"<"col-md-12"<"row"<"col-md-4"l><"col-md-4"B><"col-md-4"f>>><"col-md-12"rt><"col-md-12"<"row"<"col-md-5"i><"col-md-7"p>>>>`,
			buttons: {
				buttons: [
					{ extend: "copy", className: "btn" },
					{ extend: "csv", className: "btn" },
					{ extend: "excel", className: "btn" },
					{ extend: "print", className: "btn" },
				],
			},
			oLanguage: {
				oPaginate: {
					sPrevious:
						'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
					sNext: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
				},
				sInfo: "Showing _START_ to _END_ of _TOTAL_ entries",
				sSearch:
					'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
				sSearchPlaceholder: "Search...",
				sLengthMenu: "Results :  _MENU_",
			},
			lengthMenu: [7, 10, 20, 50, 100, 500, 1000],
			stripeClasses: [],
			drawCallback: function () {
				$(".dataTables_paginate > .pagination").addClass(
					" pagination-style-13 pagination-bordered mb-5"
				);
			},
			language: {
				infoEmpty:
					"<span style='color:red'><b>No records found</b></span>",
			},
			processing: true,
			serverSide: true,
			destroy: true,
			autoWidth: false,
			pageLength: 100,
			ajax: {
				type: "GET",
				url: API_URL_ROOT + "/bookings/datatable/fetch",
				dataType: "json",
				headers: { "x-access-token": token },
				complete: function () {
					//$("#loadingScreen").hide();
					//$('.panel-refresh').click();
				},
				async: true,
				error: function (xhr, error, code) {
					console.log(xhr);
					console.log(code);
				},
			},
			columnDefs: [
				{
					orderable: false,
					targets: [
						1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
					],
				},
			],
			order: [[0, "desc"]],
			columns: [
				{
					data: "service_booking_id",
					render: function (data, type, row, meta) {
						return meta.row + meta.settings._iDisplayStart + 1;
					},
				},
				{ data: "service_title" },
				{ data: "client_fullname" },
				{ data: "client_email" },
				{ data: "client_phone" },
				{ data: "client_address" },
				{
					data: "amount_paid",
					render: function (data, type, row, meta) {
						return formatter.format(data);
					},
				},
				{
					data: "expected_payout",
					render: function (data, type, row, meta) {
						return formatter.format(data);
					},
				},
				{
					data: "service_charge",
					render: function (data, type, row, meta) {
						return formatter.format(data);
					},
				},
				{
					data: "service_price",
					render: function (data, type, row, meta) {
						return formatter.format(data);
					},
				},
				{ data: "service_category" },
				{ data: "provider" },
				{ data: "transaction_id" },
				{
					data: "booked_at",
					render: function (data, type, row, meta) {
						var createdAt = moment(data).format(
							"MMMM Do YYYY, h:mm:ss a"
						);
						return createdAt;
					},
				},
				{
					data: "booking_status",
					render: function (data, type, row, meta) {
						var bookingStatus =
							data === "Completed"
								? `<span class="badge outline-badge-success">${data}</span>`
								: data === "Booked"
								? `<span class="badge outline-badge-warning">${data}</span>`
								: data === "Canceled"
								? `<span class="badge outline-badge-danger">${data}</span>`
								: data === "Provider Accepted"
								? `<span class="badge outline-badge-info">${data}</span>`
								: `<span class="badge outline-badge-default">${data}</span>`;
						return bookingStatus;
					},
				},
				{
					data: "payout_status",
					render: function (data, type, row, meta) {
						var payoutStatus =
							data === "Paid Out"
								? `<span class="badge outline-badge-success">${data}</span>`
								: data === "Scheduled For Payout"
								? `<span class="badge outline-badge-warning">${data}</span>`
								: `<span class="badge outline-badge-info">${data}</span>`;
						return payoutStatus;
					},
				},
				{
					data: "service_booking_id",
					render: function (data, type, row, meta) {
						var actions = `
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-edit" title="Update Statuses" data-toggle="modal" data-target="#editModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                        `;

						return actions;
					},
				},
			],
		});
	}
});
