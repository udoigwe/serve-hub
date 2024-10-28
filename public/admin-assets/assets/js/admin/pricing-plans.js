$(function () {
	"use strict";

	let token = sessionStorage.getItem("token");

	$(document).ready(function () {
		loadPricingPlans();
		dataTableAlertPrevent("table");

		$("#pricing-plans").on("click", ".btn-edit", function () {
			var planID = $(this).parents("tr").attr("id");
			var editModal = $("#editModal");

			//fetch user details
			$.ajax({
				url: `${API_URL_ROOT}/pricing/${planID}`,
				type: "GET",
				dataType: "json",
				headers: { "x-access-token": token },
				success: function (response) {
					var plan = response.plan;

					editModal
						.find(".modal-title")
						.text(plan.subscription_plan_title);
					editModal
						.find(".subscription_plan_title")
						.val(plan.subscription_plan_title);
					editModal.find(".duration").val(plan.duration);
					editModal.find(".no_of_services").val(plan.no_of_services);
					editModal
						.find(".no_of_images_per_service")
						.val(plan.no_of_images_per_service);
					editModal.find(".is_featured").val(plan.is_featured);
					editModal.find(".price").val(plan.price);
					editModal.find(".service_charge").val(plan.price);
					editModal
						.find(".subscription_plan_status")
						.val(plan.subscription_plan_status);
					editModal
						.find(".subscription_plan_id")
						.val(plan.subscription_plan_id);
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

		$("#pricing-plans").on("click", ".btn-delete", function () {
			var planID = $(this).parents("tr").attr("id");
			deletePricingPlan(planID);
		});

		//submit new pricing plan
		$("#new-pricing-plan").on("submit", function (e) {
			e.preventDefault();
			newPricingPlan();
		});

		//edit pricing plan
		$("#update-plan").on("submit", function (e) {
			e.preventDefault();
			updatePricingPlan();
		});
	});

	//internal function to register new pricing Plan
	function newPricingPlan() {
		swal({
			title: "Attention",
			text: "Are you sure you want to add this pricing plan?",
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
				var form = $("#new-pricing-plan"); //form
				var table = $("#pricing-plans").DataTable();
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
					url: `${API_URL_ROOT}/pricing`,
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
						form.get(0).reset();
						$(".selectpicker").selectpicker("refresh");
						table.ajax.reload(null, false);
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

	//internal function to update pricing plan
	function updatePricingPlan() {
		swal({
			title: "Attention",
			text: "Are you sure you want to update this pricing plan?",
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
				var form = $("#update-plan"); //form
				var planID = form.find(".subscription_plan_id").val();
				var table = $("#pricing-plans").DataTable();
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
					type: "PUT",
					url: `${API_URL_ROOT}/pricing/${planID}`,
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

	//internal function to delete pricing plan
	function deletePricingPlan(planID) {
		swal({
			title: "Attention",
			text: "Are you sure you want to delete this Plan?",
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
				var table = $("#pricing-plans");
				var rowCount = table.find("tbody tr").length;
				blockUI();

				$.ajax({
					type: "DELETE",
					url: `${API_URL_ROOT}/pricing/${planID}`,
					dataType: "json",
					headers: { "x-access-token": token },
					success: function (response) {
						unblockUI();
						showSimpleMessage(
							"Success",
							response.message,
							"success"
						);
						table.DataTable().ajax.reload(null, false);
					},
					error: function (req, status, error) {
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

	//load plans
	function loadPricingPlans() {
		var table = $("#pricing-plans");

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
				url: API_URL_ROOT + "/pricing/datatable/fetch",
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
				{ orderable: false, targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
			],
			order: [[0, "desc"]],
			columns: [
				{
					data: "subscription_plan_id",
					render: function (data, type, row, meta) {
						return meta.row + meta.settings._iDisplayStart + 1;
					},
				},
				{ data: "subscription_plan_title" },
				{ data: "duration" },
				{ data: "no_of_services" },
				{ data: "no_of_images_per_service" },
				{ data: "is_featured" },
				{ data: "price" },
				{ data: "service_charge" },
				{
					data: "subscription_plan_status",
					render: function (data, type, row, meta) {
						var status =
							data == "Active"
								? `<span class="badge outline-badge-success">${data}</span>`
								: `<span class="badge outline-badge-danger">${data}</span>`;
						return status;
					},
				},
				{
					data: "subscription_plan_created_at",
					render: function (data, type, row, meta) {
						var createdAt = moment(data).format(
							"MMMM Do YYYY, h:mm:ss a"
						);
						return createdAt;
					},
				},
				{
					data: "subscription_plan_id",
					render: function (data, type, row, meta) {
						var actions = `
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-delete" title="Delete Plan"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <button class="btn btn-dark mb-2 mr-2 rounded-circle btn-edit" title="Edit Plan" data-toggle="modal" data-target="#editModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                        `;

						return actions;
					},
				},
			],
		});
	}
});
