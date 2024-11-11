$(function () {
	("use strict");

	let token = sessionStorage.getItem("token");

	$(document).ready(function ($) {
		loadBookings();
		/* loadSubscriptions(); */

		$("body").on("click", ".sub-btn", function () {
			var subscriptionPlanID = $(this).attr("plan-id");
			blockUI();

			//fetch plane details
			$.ajax({
				url: `${API_URL_ROOT}/pricing/${subscriptionPlanID}`,
				type: "GET",
				dataType: "json",
				headers: { "x-access-token": token },
				success: function (response) {
					var plan = response.plan;
					unblockUI();
					payWithPayStack(
						plan.price,
						payloadClaim(token, "user_email"),
						payloadClaim(token, "user_id"),
						subscriptionPlanID
					);
				},
				error: function (req, status, error) {
					unblockUI();
					alert(req.responseJSON.message);
				},
			});
		});

		$("#filter").on("submit", function (e) {
			e.preventDefault();

			var form = $(this);
			var storeID =
				payloadClaim(token, "user_role") !== "Super Admin"
					? payloadClaim(token, "user_store_id")
					: form.find("#store_id").val();
			var cashierID =
				payloadClaim(token, "user_role") == "Cashier"
					? payloadClaim(token, "user_id")
					: form.find("#cashier_id").val();
			var paymentMode = form.find("#payment_mode").val();
			var status = form.find("#status").val();
			var startTime = form.find("#datepicker").val();
			var endTime = form.find("#datepicker1").val();
			var fields = form.find("input.required, select.required");

			blockUI();

			for (var i = 0; i < fields.length; i++) {
				if (fields[i].value == "") {
					/*alert(fields[i].id)*/
					$("#" + fields[i].id).focus();
					unblockUI();
					showSimpleMessage(
						"Attention",
						`${fields[i].name} is required`,
						"error"
					);
					return false;
				}
			}

			loadInvoices(
				storeID,
				cashierID,
				paymentMode,
				status,
				startTime,
				endTime
			);
			unblockUI();
		});

		$("#store_id1").on("change", function () {
			var storeID = $(this).find("option:selected").val();

			blockUI();

			if (storeID) {
				//load products related to store
				$.ajax({
					type: "GET",
					url: `${API_URL_ROOT}/products?store_id=${storeID}`,
					dataType: "json",
					headers: { "x-access-token": token },
					success: function (response) {
						if (response.error == false) {
							var products = response.result.products;
							var html =
								'<option value="">Choose Product</option>';

							for (var i = 0; i < products.length; i++) {
								html += `
                                    <option value="${products[i].product_id}">${products[i].product_name}</option>
                                `;
							}

							$("select.product_id").html(html);

							$("select.product_id").selectpicker("refresh");

							unblockUI();
						} else {
							unblockUI();
							showSimpleMessage(
								"Attention",
								response.message,
								"error"
							);
						}
					},
					error: function (req, status, error) {
						unblockUI();
						showSimpleMessage(
							"Attention",
							"ERROR - " + req.status + " : " + req.statusText,
							"error"
						);
					},
				});

				//load VAT and Discount charges
				$.ajax({
					type: "GET",
					url: `${API_URL_ROOT}/stores/${storeID}`,
					dataType: "json",
					headers: { "x-access-token": token },
					success: function (response) {
						if (response.error == false) {
							var store = response.store;

							$(".invoice_vat").attr(
								"data-value",
								store.store_vat_rate
							);
							$(".invoice_vat").text(
								`(${store.store_vat_rate}%)`
							);

							$(".invoice_discount").attr(
								"data-value",
								store.store_discount_rate
							);
							$(".invoice_discount").text(
								`(${store.store_discount_rate}%)`
							);

							unblockUI();
						} else {
							unblockUI();
							showSimpleMessage(
								"Attention",
								response.message,
								"error"
							);
						}
					},
					error: function (req, status, error) {
						unblockUI();
						showSimpleMessage(
							"Attention",
							"ERROR - " + req.status + " : " + req.statusText,
							"error"
						);
					},
				});
			} else {
				$("select.product_id").html(
					`<option value="">Choose Product</option>`
				);
				unblockUI();
			}
		});

		$("#store_id2").on("change", function () {
			var storeID = $(this).find("option:selected").val();

			blockUI();

			if (storeID) {
				//load products related to store
				$.ajax({
					type: "GET",
					url: `${API_URL_ROOT}/products?store_id=${storeID}`,
					dataType: "json",
					headers: { "x-access-token": token },
					success: function (response) {
						if (response.error == false) {
							var products = response.result.products;
							var html =
								'<option value="">Choose Product</option>';

							for (var i = 0; i < products.length; i++) {
								html += `
                                    <option value="${products[i].product_id}">${products[i].product_name}</option>
                                `;
							}

							$("#product_id1").html(html);

							$("#product_id1").selectpicker("refresh");

							unblockUI();
						} else {
							unblockUI();
							showSimpleMessage(
								"Attention",
								response.message,
								"error"
							);
						}
					},
					error: function (req, status, error) {
						unblockUI();
						showSimpleMessage(
							"Attention",
							"ERROR - " + req.status + " : " + req.statusText,
							"error"
						);
					},
				});
			} else {
				$("#product_id").html(
					`<option value="">Choose Product</option>`
				);
				unblockUI();
			}
		});

		$("#form-new-sales").on("submit", function (e) {
			e.preventDefault();

			submitInvoice();
		});

		$(".btn-generate").on("click", function () {
			generateProductFinancialReport();
		});
	});

	//internal function to delete an invoice
	function deleteInvoice(invoiceID) {
		swal({
			title: "Attention",
			text: "Are you sure you want to delete this invoice? NOTE: Deleted product quantity will add to product stock",
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
				var table = $("#invoices");

				blockUI();

				$.ajax({
					type: "DELETE",
					url: `${API_URL_ROOT}/invoices/${invoiceID}`,
					dataType: "json",
					headers: { "x-access-token": token },
					success: function (response) {
						if (response.error == false) {
							unblockUI();
							showSimpleMessage(
								"Success",
								response.message,
								"success"
							);
							table.DataTable().ajax.reload(null, false);
						} else {
							unblockUI();
							showSimpleMessage(
								"Attention",
								response.message,
								"error"
							);
						}
					},
					error: function (req, status, error) {
						unblockUI();
						showSimpleMessage(
							"Attention",
							"ERROR - " + req.status + " : " + req.statusText,
							"error"
						);
					},
				});
			} else {
				showSimpleMessage("Canceled", "Process Abborted", "error");
			}
		});
	}

	//load invoices
	function loadInvoices(
		storeID = "",
		cashierID = "",
		paymentMode = "",
		status = "",
		startTime = "",
		endTime = ""
	) {
		var table = $("#invoices");

		var storeID =
			payloadClaim(token, "user_role") !== "Super Admin"
				? payloadClaim(token, "user_store_id")
				: storeID;

		var cashierID =
			payloadClaim(token, "user_role") == "Cashier"
				? payloadClaim(token, "user_id")
				: cashierID;

		table.DataTable({
			dom: `<"row"<"col-md-12"<"row"<"col-md-4"l><"col-md-4"B><"col-md-4"f>>><"col-md-12"rt><"col-md-12"<"row"<"col-md-5"i><"col-md-7"p>>>>`,
			buttons: {
				buttons: [
					{ extend: "copy", className: "btn" },
					{ extend: "csv", className: "btn" },
					{ extend: "excel", className: "btn" },
					{ extend: "print", className: "btn" },
					{
						className: "btn",
						text: "New Invoice",
						attr: {
							title: "New Invoice",
							id: "btn-new-invoice",
							"data-toggle": "modal",
							"data-target": "#salesModal",
							"data-animation": "fall",
							"data-plugin": "custommodal",
							"data-overlayColor": "#012",
						},
					},
					{
						className: "btn",
						text: "Product Report",
						attr: {
							title: "Product Report",
							id: "btn-product-report",
							"data-toggle": "modal",
							"data-target": "#productModal",
							"data-animation": "fall",
							"data-plugin": "custommodal",
							"data-overlayColor": "#012",
						},
					},
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
				url: `${API_URL_ROOT}/invoices/data-table/fetch?store_id=${storeID}&payment_mode=${paymentMode}&status=${status}&cashier_id=${cashierID}&start_time=${startTime}&end_time=${endTime}`,
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
					targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
				},
			],
			order: [[0, "desc"]],
			columns: [
				{
					data: "invoice_id",
					render: function (data, type, row, meta) {
						return meta.row + meta.settings._iDisplayStart + 1;
					},
				},
				{ data: "store_name" },
				{ data: "invoice_uuid" },
				{ data: "invoice_customer_name" },
				{
					data: "invoice_gross_total",
					render: function (data, type, row, meta) {
						return formatNumber(data);
					},
				},
				{ data: "total_invoice_vat" },
				{ data: "total_invoice_discount" },
				{
					data: "invoice_net_total",
					render: function (data, type, row, meta) {
						return formatNumber(data);
					},
				},
				{
					data: "invoice_paid_amount",
					render: function (data, type, row, meta) {
						return formatNumber(data);
					},
				},
				{
					data: "invoice_due",
					render: function (data, type, row, meta) {
						return formatNumber(data);
					},
				},
				{ data: "invoice_payment_method" },
				{ data: "cashier" },
				{
					data: "invoice_order_timestamp",
					render: function (data, type, row, meta) {
						return moment
							.unix(data)
							.format("MMMM Do YYYY, h:mm:ss a");
					},
				},
				{
					data: "invoice_status",
					render: function (data, type, row, meta) {
						var invoiceStatus =
							data == "Unpaid"
								? `<span class="badge badge-danger"> ` +
								  data +
								  ` </span>`
								: data == "Paid"
								? `<span class="badge badge-success"> ` +
								  data +
								  ` </span>`
								: `<span class="badge badge-warning"> ` +
								  data +
								  ` </span>`;
						return invoiceStatus;
					},
				},
				{
					data: "invoice_id",
					render: function (data, type, row, meta) {
						var actions =
							`
                            <a href="javascript:void(0);" class="btn btn-link font-18 text-muted btn-sm btn-print" title="Print Invoice" data-id="` +
							data +
							`" data-toggle="modal" data-target="#printModal" data-animation="fall" data-plugin="custommodal" data-overlayColor="#012"><i class="mdi mdi-printer"></i>
                            </a>
                            <a href="javascript:void(0);" class="btn btn-link font-18 text-muted btn-sm btn-delete" title="Delete Invoice" data-id="` +
							data +
							`"><i class="mdi mdi-close"></i>
                            </a>
                        `;

						return actions;
					},
					searchable: false,
					sortable: false,
				},
			],
		});
	}

	function loadPlans() {
		blockUI();

		$.ajax({
			url: `${API_URL_ROOT}/pricing?subscription_plan_status=Active`,
			type: "GET",
			dataType: "json",
			headers: { "x-access-token": token },
			success: function (response) {
				var plans = response.data;
				var html = "";

				for (var i = 0; i < plans.length; i++) {
					const plan = plans[i];

					html += `
                        <div class="col-md-4 ">
                            <div class=" card ">
                                <div class=" card-header">
                                    <div class="price-level">
                                        <h6 class="fs-14">${
											plan.subscription_plan_title
										}</h6>
                                    </div>
                                    <h1 class="d-flex align-items-center ">$${
										plan.price
									} <span class="text-gray fs-12 ms-2">/
                                            month</span></h1>
                                </div>
                                <div class="card-body">
                                    <ul>
                                        <li><i class="ti ti-square-rounded-check me-1 text-success"></i>${
											plan.no_of_services
										} ${
						plan.no_of_services !== 1 ? "Services" : "Service"
					}
                                        </li>
                                        <li><i class="ti ti-square-rounded-check me-1 text-success"></i> ${
											plan.no_of_images_per_service
										} ${
						plan.no_of_images !== 1
							? "Images Per Service"
							: "Image Per Service"
					}
                                        </li>
                                        <li> <i class="ti ti-square-rounded-check me-1 text-success"></i>${
											plan.is_featured
												? "Featured Service"
												: "Unfeatured Service"
										}</li>
                                        <li><i class="ti ti-square-rounded-check me-1 text-success"></i>${
											plan.service_charge
										}% Service Charge </li>
                                        <li><i class="ti ti-square-rounded-check me-1 text-success"></i> ${Math.floor(
											plan.duration / 60
										)} Minutes</li>
                                    </ul>
                                    <div class="text-center d-flex align-items-center">
                                        <a href="javascript:void(0);" plan-id="${
											plan.subscription_plan_id
										}"
                                            class="btn btn-dark w-100 d-flex align-items-center justify-content-center sub-btn">Choose
                                            Plan <i class="feather-arrow-right-circle ms-2"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
				}

				$(".provider-price").append(html);
				unblockUI();
			},
			error: function (req, status, err) {
				unblockUI();
				alert(req.responseJSON.message);
			},
		});
	}

	//load stores
	function loadStores() {
		if (payloadClaim(token, "user_role") == "Super Admin") {
			blockUI();

			$.ajax({
				type: "GET",
				url: `${API_URL_ROOT}/stores?status=Active`,
				dataType: "json",
				headers: { "x-access-token": token },
				success: function (response) {
					if (response.error == false) {
						var stores = response.result.stores;

						var html = "";

						for (var i = 0; i < stores.length; i++) {
							html += `
                                <option value="${stores[i].store_id}">${stores[i].store_name}</option>
                            `;
						}

						$("#store_id").append(html);
						$("#store_id1").append(html);
						$("#store_id2").append(html);
						$(".selectpicker").selectpicker("refresh");
						unblockUI();
					} else {
						unblockUI();
						showSimpleMessage(
							"Attention",
							response.message,
							"error"
						);
					}
				},
				error: function (req, status, error) {
					unblockUI();
					showSimpleMessage(
						"Attention",
						"ERROR - " + req.status + " : " + req.statusText,
						"error"
					);
				},
			});
		}
	}

	//load products
	function loadProducts() {
		var storeID =
			payloadClaim(token, "user_role") !== "Super Admin"
				? payloadClaim(token, "user_store_id")
				: $("#store_id1").find("option:selected").val();

		blockUI();

		$.ajax({
			type: "GET",
			url: `${API_URL_ROOT}/products?store_id=${storeID}`,
			dataType: "json",
			headers: { "x-access-token": token },
			success: function (response) {
				if (response.error == false) {
					var products = response.result.products;
					var html = "";

					for (var i = 0; i < products.length; i++) {
						html += `
                            <option value="${products[i].product_id}">${products[i].product_name}</option>
                        `;
					}

					$("select.product_id").append(html);
					$(".selectpicker").selectpicker("refresh");
					unblockUI();
				} else {
					unblockUI();
					showSimpleMessage("Attention", response.message, "error");
				}
			},
			error: function (req, status, error) {
				unblockUI();
				showSimpleMessage(
					"Attention",
					"ERROR - " + req.status + " : " + req.statusText,
					"error"
				);
			},
		});
	}

	//load products
	function loadProducts1() {
		if (payloadClaim(token, "user_role") == "Admin") {
			var storeID = payloadClaim(token, "user_store_id");

			blockUI();

			$.ajax({
				type: "GET",
				url: `${API_URL_ROOT}/products?store_id=${storeID}`,
				dataType: "json",
				headers: { "x-access-token": token },
				success: function (response) {
					if (response.error == false) {
						var products = response.result.products;
						var html = "";

						for (var i = 0; i < products.length; i++) {
							html += `
                                <option value="${products[i].product_id}">${products[i].product_name}</option>
                            `;
						}

						$("#product_id1").append(html);
						$(".selectpicker").selectpicker("refresh");
						unblockUI();
					} else {
						unblockUI();
						showSimpleMessage(
							"Attention",
							response.message,
							"error"
						);
					}
				},
				error: function (req, status, error) {
					unblockUI();
					showSimpleMessage(
						"Attention",
						"ERROR - " + req.status + " : " + req.statusText,
						"error"
					);
				},
			});
		}
	}

	function loadOrderedItem() {
		$("#ordered-items-list").on("change", ".product_id", function () {
			var parentTR = $(this).parents("tr");

			var productID = $(this).find("option:selected").val();

			blockUI();

			if (productID) {
				$.ajax({
					type: "GET",
					url: `${API_URL_ROOT}/products/${productID}`,
					dataType: "json",
					headers: { "x-access-token": token },
					success: function (response) {
						if (response.error == false) {
							var product = response.product;

							parentTR
								.find(".product_stock")
								.val(product.product_stock);
							parentTR
								.find(".product_unit_price")
								.val(product.product_price);
							parentTR
								.find(".product_vat_rate")
								.val(product.product_vat_rate);
							parentTR
								.find(".product_discount_rate")
								.val(product.product_discount_rate);
							parentTR.find(".quantity_ordered").val(0);
							parentTR.find(".sub_total").val(0);

							unblockUI();
						} else {
							unblockUI();
							showSimpleMessage(
								"Attention",
								response.message,
								"error"
							);
						}
					},
					error: function (req, status, error) {
						unblockUI();
						showSimpleMessage(
							"Attention",
							"ERROR - " + req.status + " : " + req.statusText,
							"error"
						);
					},
				});
			} else {
				parentTR.find(".product_stock").val(0);
				parentTR.find(".product_unit_price").val(0);
				parentTR.find(".quantity_ordered").val(0);
				parentTR.find(".product_vat_rate").val(0);
				parentTR.find(".product_discount_rate").val(0);
				parentTR.find(".product_unit_price").val(0);
				parentTR.find(".sub_total").val(0);

				unblockUI();
			}
		});
	}

	function priceSummary() {
		var grossTotal = 0;

		$("#ordered-items-list tbody")
			.find("tr")
			.each(function () {
				grossTotal += parseFloat($(this).find(".sub_total").val());
			});

		var netTotal = grossTotal;

		$(".invoice_gross_total").attr("data-value", grossTotal);
		$(".invoice_net_total").attr("data-value", netTotal);

		$(".invoice_gross_total").text(formatNumber(grossTotal));
		$(".invoice_net_total").text(formatNumber(netTotal));
	}

	function pricing() {
		$("#ordered-items-list").on(
			"keyup change",
			".quantity_ordered",
			function () {
				var _this = $(this);
				var parentTR = _this.parents("tr");
				var qty = _this.val();
				var productID = parentTR
					.find(".product_id option:selected")
					.val();
				var qtyInStock = parseFloat(
					parentTR.find(".product_stock").val()
				);
				var unitPrice = parseFloat(
					parentTR.find(".product_unit_price").val()
				);
				var vatRate = parseFloat(
					parentTR.find(".product_vat_rate").val()
				);
				var discountRate = parseFloat(
					parentTR.find(".product_discount_rate").val()
				);

				if (productID) {
					if (isNaN(qty)) {
						showSimpleMessage(
							"Attention",
							"Quantity ordered must be numbers only",
							"error"
						);

						_this.val(0);
					} else if (qty > qtyInStock) {
						showSimpleMessage(
							"Attention",
							"Sorry!!! Quantity ordered cannot be more than quantity in stock",
							"error"
						);

						_this.val(qtyInStock);
					} else if (qty == 0) {
						parentTR.find(".sub_total").val(0);
						priceSummary();
					} else {
						parentTR
							.find(".sub_total")
							.val(
								qty * unitPrice +
									(vatRate / 100) * unitPrice -
									(discountRate / 100) * unitPrice
							);
						priceSummary();
					}
				} else {
					showSimpleMessage(
						"Attention",
						"Please select a product",
						"error"
					);

					_this.val(0);
				}
			}
		);
	}

	function removeOrderItem() {
		$("#ordered-items-list").on("click", ".btn-remove", function () {
			var parentTR = $(this).parents("tr");

			var TRCount = $("#ordered-items-list tbody").find("tr").length;

			if (TRCount == 1) {
				showSimpleMessage(
					"Attention",
					"You cannot remove all records",
					"error"
				);
				return false;
			}

			parentTR.remove();

			priceSummary();
		});
	}

	function newOrderItem() {
		$("#ordered-items-list").on("click", ".btn-add", function () {
			var parentTR = $(this).parents("tr");

			var rowID = parseInt(parentTR.attr("data-row-id"));

			var uuidV4 = uuidv4();

			var productOptionsHTML = `<option value="">Choose Product</option>`;

			var storeID =
				payloadClaim(token, "user_role") == "Super Admin"
					? $("#store_id1").find("option:selected").val()
					: payloadClaim(token, "user_store_id");

			blockUI();

			if (storeID) {
				$.ajax({
					type: "GET",
					url: `${API_URL_ROOT}/products?store_id=${storeID}`,
					dataType: "json",
					headers: { "x-access-token": token },
					success: function (response) {
						if (response.error == false) {
							var products = response.result.products;

							for (var i = 0; i < products.length; i++) {
								productOptionsHTML += `
                                    <option value="${products[i].product_id}">${products[i].product_name}</option>
                                `;
							}

							var TR = `
                                <tr data-row-id="${uuidV4}">
                                    <td>
                                        <select class="form-control form-control-sm selectpicker required product_id" name="product_id" data-live-search="true">
                                            ${productOptionsHTML}
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" class="form-control required product_stock" placeholder="Quantity in stock" name="product_stock" value="0" readonly>
                                    </td>
                                    <td>
                                        <input type="number" class="form-control quantity_ordered required" placeholder="Quantity Ordered" name="quantity_ordered" value="0">
                                    </td>
                                    <td>
                                        <input type="number" class="form-control product_unit_price required" placeholder="Product Unit Price" name="product_unit_price" value="0" readonly>
                                    </td>
                                    <td>
                                        <input type="number" class="form-control product_vat_rate required" placeholder="Product VAT Rate" name="product_vat_rate" value="0" readonly>
                                    </td>
                                    <td>
                                        <input type="number" class="form-control product_discount_rate required" placeholder="Product Discount Rate" name="product_discount_rate" value="0" readonly>
                                    </td>
                                    <td>
                                        <input type="text" class="form-control sub_total required" placeholder="Gross Total" name="sub_total" value="0" readonly>
                                    </td>
                                    <td>
                                        <a href="javascript:void(0)" class="btn btn-add  btn-warning btn-sm waves-effect waves-light"><i class="mdi mdi-plus"></i></a>
                                        <a href="javascript:void(0)" class="btn btn-remove btn-danger btn-sm waves-effect waves-light"><i class="mdi mdi-minus"></i></a>
                                    </td>
                                </tr>
                            `;

							$(TR).insertAfter(parentTR);

							$("#ordered-items-list")
								.find(".selectpicker")
								.selectpicker("refresh");

							unblockUI();
						} else {
							unblockUI();
							showSimpleMessage(
								"Attention",
								response.message,
								"error"
							);
						}
					},
					error: function (req, status, error) {
						unblockUI();
						showSimpleMessage(
							"Attention",
							"ERROR - " + req.status + " : " + req.statusText,
							"error"
						);
					},
				});
			} else {
				unblockUI();
				showSimpleMessage("Attention", "No store detected", "error");
			}
		});
	}

	function fixTableResponsive() {
		$(".table-responsive")
			.on("shown.bs.dropdown", function (e) {
				var t = $(this),
					m = $(e.target).find(".dropdown-menu"),
					tb = t.offset().top + t.height(),
					mb = m.offset().top + m.outerHeight(true),
					d = 20; // Space for shadow + scrollbar.

				if (t[0].scrollWidth > t.innerWidth()) {
					if (mb + d > tb) {
						t.css("padding-bottom", mb + d - tb);
					}
				} else {
					t.css("overflow", "visible");
				}
			})
			.on("hidden.bs.dropdown", function () {
				$(this).css({
					"padding-bottom": "",
					overflow: "",
				});
			});
	}

	function salesModalSetup() {
		$(".cashier").text(
			`${payloadClaim(token, "user_firstname")} ${payloadClaim(
				token,
				"user_lastname"
			)}`
		);
		$(".order_date").text(`${moment().format("MMMM Do, YYYY")}`);

		if (payloadClaim(token, "user_role") !== "Super Admin") {
			loadProducts();
		}
	}

	function submitInvoice() {
		swal({
			title: "Attention",
			text: "Are you sure you want to submit this invoice? NOTE: You will not be able to edit after submission!!!",
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
				var form = $("#form-new-sales"); //form
				var fields = form.find("input.required, select.required");
				var invoiceGrossTotal = $(".invoice_gross_total").attr(
					"data-value"
				);
				var invoiceNetTotal =
					$(".invoice_net_total").attr("data-value");
				var table = $("#invoices").DataTable();
				var salesModal = $("#salesModal");

				var formMeta = {
					invoiceGrossTotal,
					invoiceNetTotal,
				};

				var items = [];

				blockUI();

				for (var i = 0; i < fields.length; i++) {
					if (fields[i].value == "") {
						unblockUI();
						form.find(`[name="${fields[i].name}"]`).focus();
						showSimpleMessage(
							"Attention",
							`${fields[i].name} is required`,
							"error"
						);
						return false;
					}
				}

				$("#ordered-items-list tbody")
					.find("tr")
					.each(function (index) {
						var item = {
							product_id: $(this)
								.find(".product_id option:selected")
								.val(),
							product_stock: $(this).find(".product_stock").val(),
							quantity_ordered: $(this)
								.find(".quantity_ordered")
								.val(),
							product_unit_price: $(this)
								.find(".product_unit_price")
								.val(),
							product_vat_rate: $(this)
								.find(".product_vat_rate")
								.val(),
							product_discount_rate: $(this)
								.find(".product_discount_rate")
								.val(),
							sub_total: $(this).find(".sub_total").val(),
						};

						items.push(item);
					});

				formMeta.items = items;

				// Append formmeta to the form.
				$("<input>")
					.attr({
						type: "hidden",
						name: "form_meta",
						id: "form_meta",
						value: JSON.stringify(formMeta),
					})
					.appendTo(form);

				$.ajax({
					type: "POST",
					url: API_URL_ROOT + "/invoices",
					data: JSON.stringify(form.serializeObject()),
					dataType: "json",
					contentType: "application/json",
					headers: { "x-access-token": token },
					success: function (response) {
						if (response.error == false) {
							unblockUI();
							showSimpleMessage(
								"Success",
								response.message,
								"success"
							);
							form.get(0).reset();
							salesModal
								.find(".selectpicker")
								.selectpicker("val", "");
							//salesModal.find('.close').click();
							refreshForm();
							table.ajax.reload(null, false);
						} else {
							unblockUI();
							showSimpleMessage(
								"Attention",
								response.message,
								"error"
							);
						}
					},
					error: function (req, status, error) {
						unblockUI();
						showSimpleMessage(
							"Attention",
							"ERROR - " + req.status + " : " + req.statusText,
							"error"
						);
					},
				});
			} else {
				showSimpleMessage("Canceled", "Process Abborted", "error");
			}
		});
	}

	function refreshForm() {
		var itemList = `
            <tr data-row-id="1">
                <td id="tr_1">
                    <select class="selectpicker form-control form-control-sm required product_id" name="product_id" data-live-search="true">
                        <option value="">Choose Product</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control required product_stock" placeholder="Quantity in stock" name="product_stock" value="0" readonly>
                </td>
                <td>
                    <input type="number" class="form-control quantity_ordered required" placeholder="Quantity Ordered" name="quantity_ordered" value="0">
                </td>
                <td>
                    <input type="number" class="form-control product_unit_price required" placeholder="Product Unit Price" name="product_unit_price" value="0" readonly>
                </td>
                <td>
                    <input type="number" class="form-control product_vat_rate required" placeholder="Product VAT Rate" name="product_vat_rate" value="0" readonly>
                </td>
                <td>
                    <input type="number" class="form-control product_discount_rate required" placeholder="Product Discount Rate" name="product_discoun_rate" value="0" readonly>
                </td>
                <td>
                    <input type="number" class="form-control sub_total required" placeholder="Sub Total" name="sub_total" value="0" readonly>
                </td>
                <td>
                    <!-- <div class="d-print-none"> -->
                        <a href="javascript:void(0)" class="btn btn-add  btn-warning btn-sm waves-effect waves-light"><i class="mdi mdi-plus"></i></a>
                        <a href="javascript:void(0)" class="btn btn-remove btn-danger btn-sm waves-effect waves-light"><i class="mdi mdi-minus"></i></a>
                    <!-- </div> -->
                </td>
            </tr>
        `;

		var summaryHTML = `
            <p><b>Gross Total:</b> <span class="float-right"> &nbsp;&nbsp;&nbsp; <span>NGN</span> <span class="invoice_gross_total" data-value="0">0</span></p>
            <h3><span>NGN</span> <span class="invoice_net_total" data-value="0">0</h3>
        `;

		$("#ordered-items-list tbody").html(itemList);
		$(".summary").html(summaryHTML);
		$(".selectpicker").selectpicker("refresh");

		if (payloadClaim(token, "user_role") !== "Super Admin") {
			loadProducts();
		}
	}

	function print() {
		$("#printModal").on("click", ".btn-print", function () {
			const content = $(".content");

			const printArea = $("#printModal .print-area").detach();
			const containerFluid = $(".container-fluid").detach();

			content.append(printArea);

			const backdrop = $("body .modal-backdrop").detach();
			$(".modal-backdrop").remove();

			window.print();

			content.empty();
			content.append(containerFluid);

			$("#printModal .modal-body").append(printArea);

			$("body").append(backdrop);
		});
	}

	function print1() {
		$("#productModal").on("click", ".btn-print", function () {
			const content = $(".content");

			const printArea = $("#productModal .print-area").detach();
			const containerFluid = $(".container-fluid").detach();

			content.append(printArea);

			const backdrop = $("body .modal-backdrop").detach();
			$(".modal-backdrop").remove();

			window.print();

			content.empty();
			content.append(containerFluid);

			$("#productModal .modal-body").append(printArea);

			$("body").append(backdrop);
		});
	}

	function generateProductFinancialReport() {
		var productModal = $("#productModal");
		var productID = productModal.find("#product_id1 option:selected").val();
		var startingDate = productModal.find("#starting_date").val();
		var endingDate = productModal.find("#ending_date").val();
		var fields = productModal.find("input.required, select.required");

		blockUI();

		for (var i = 0; i < fields.length; i++) {
			if (fields[i].value == "") {
				unblockUI();
				productModal.find(`[name="${fields[i].name}"]`).focus();
				showSimpleMessage(
					"Attention",
					`${fields[i].name} is required`,
					"error"
				);
				return false;
			}
		}

		$.ajax({
			url: `${API_URL_ROOT}/product-financial-report?product_id=${productID}&starting_date=${startingDate}&ending_date=${endingDate}`,
			type: "GET",
			dataType: "json",
			headers: { "x-access-token": token },
			success: function (response) {
				if (response.error == false) {
					unblockUI();
					var totalQty = parseInt(response.data.tqty) || 0;
					var totalCP = parseInt(response.data.tcp) || 0;
					var totalSP = parseInt(response.data.tsp) || 0;
					var totalVAT = parseInt(response.data.tvat) || 0;
					var totalDiscount = parseInt(response.data.td) || 0;

					productModal.find("table tbody").html(
						`
                        <tr>
                            <td>1</td>
                            <td>${formatNumber(totalQty)}</td>
                            <td>NGN ${formatNumber(totalCP)}</td>
                            <td>NGN ${formatNumber(totalSP)}</td>
                            <td>NGN ${formatNumber(totalVAT)}</td>
                            <td>NGN ${formatNumber(totalDiscount)}</td>
                            <td>NGN ${formatNumber(
								totalSP + totalVAT - totalDiscount - totalCP
							)}</td>
                        </tr>
                    `
					);
				} else {
					unblockUI();
					showSimpleMessage("Attention", response.message, "error");
				}
			},
			error: function (req, status, error) {
				unblockUI();
				showSimpleMessage(
					"Attention",
					"ERROR - " + req.status + " : " + req.statusText,
					"error"
				);
			},
		});
	}

	//pay with paystack
	function payWithPayStack(
		amount,
		emailaddress,
		userID,
		subscription_plan_id
	) {
		let now = Math.floor(Date.now() / 1000);

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
				verifyPayment(
					subscription_plan_id,
					amount,
					userID,
					response.reference
				);
			},
		});

		handler.openIframe();
	}

	//verify payment
	function verifyPayment(
		subscription_plan_id,
		amount,
		subscriber_id,
		transaction_id
	) {
		blockUI();

		$.ajax({
			type: "POST",
			url: `${API_URL_ROOT}/subscriptions`,
			data: JSON.stringify({
				subscription_plan_id,
				amount,
				subscriber_id,
				transaction_id,
			}),
			dataType: "json",
			contentType: "application/json",
			headers: { "x-access-token": token },
			success: function (response) {
				unblockUI();
				alert(response.message);
			},
			error: function (req, status, error) {
				unblockUI();
				alert(req.responseJSON.message);
			},
		});
	}

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
							}" class="me-2" data-bs-toggle="modal" data-bs-target="#edit-booking-status-modal"><i class="ti ti-edit"></i></a></td>
                        </tr>
                    `;
				}

				$(".bookings").find("tbody").append(html);
				unblockUI();
			},
			error: function (req, status, error) {
				unblockUI();
				alert(req.responseJSON.message);
			},
		});
	}
});
