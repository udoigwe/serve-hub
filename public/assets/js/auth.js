$(function () {
	"use strict";

	$(document).ready(function ($) {
		register();
		login();
		logout();
		recogniseMe();
		becomeAProvider();

		//resend OTP
		resentOTP();
		//verify Account
		verifyAccount();

		providerDashboardLinkClick();
	});

	function register() {
		$(".register-form").on("submit", function (e) {
			e.preventDefault();
			var form = $(this);
			var email = form.find(".user_email").val();
			var password = form.find(".user_password").val();
			var repassword = form.find(".re_password").val();
			var avatar = form.find(".user_avatar").val();
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

			if (!validateEmail(email)) {
				//alert("All fields are required");
				unblockUI();
				alert("Please provide a valid email");
				return false;
			}
			if (password !== repassword) {
				unblockUI();
				alert("Passwords do not match");
				return false;
			}

			var extension = avatar.split(".").pop().toLowerCase();
			//Create array with the file extensions that we wish to upload
			var validFileExtensions = ["jpeg", "jpg", "png"];
			var file_length = $(".user_avatar").get(0).files.length;

			if ($.inArray(extension, validFileExtensions) == -1) {
				//invalid avatar format
				unblockUI();
				alert("Avatar must be a jpeg, jpg, png file formats");
				return false;
			}

			if (form.find(".user_avatar").get(0).files[0].size > 1024 * 1000) {
				//user image is more than 1MB
				unblockUI();
				form.find(".user_avatar").focus();
				alert("Avatar must not be more than 1MB in size");
				return false;
			}

			$.ajax({
				type: "POST",
				url: `${API_URL_ROOT}/sign-up`,
				data: new FormData(form[0]),
				dataType: "json",
				contentType: false,
				processData: false,
				cache: false,
				success: function (response) {
					unblockUI();
					alert(response.message);
					form.get(0).reset();
					$("#register-modal").find(".ti-circle-x-filled").click();
					window.location = `/account-verification?email=${email}`;
				},
				error: function (req, status, err) {
					alert(req.responseJSON.message);
					unblockUI();
				},
			});
		});
	}

	function login() {
		$(".login-form").on("submit", function (e) {
			e.preventDefault();
			var form = $(this);
			var email = form.find(".email").val();
			var fields = form.find("input.required, select.required");

			blockUI();

			for (var i = 0; i < fields.length; i++) {
				if (fields[i].value == "") {
					/*alert(fields[i].id)*/
					unblockUI();
					alert(`${fields[i].name} is required`);
					//$("#" + fields[i].id).focus();
					return false;
				}
			}

			if (!validateEmail(email)) {
				//alert("All fields are required");
				alert("Please provide a valid email");
				unblockUI();
				return false;
			} else {
				$.ajax({
					type: "POST",
					url: API_URL_ROOT + "/sign-in",
					data: JSON.stringify(form.serializeObject()),
					dataType: "json",
					contentType: "application/json",
					success: function (response) {
						var token = response.token; //generated access token from request
						sessionStorage.setItem("token", token); //set access token

						setRememberMe(); //store login details to hardrive if any
						sessionStorage.setItem("token", token); //set access token
						unblockUI();
						$("#login-modal").find(".ti-circle-x-filled").click();
						alert(response.message);
						window.location.reload();
					},
					error: function (req, status, err) {
						alert(req.responseJSON.message);
						unblockUI();
					},
				});
			}
		});
	}

	function logout() {
		$(".logout-btn").on("click", function () {
			if (confirm("Are you sure you want to log out")) {
				sessionStorage.removeItem("token");
				window.location = "/";
			}
		});
	}

	function recogniseMe() {
		const token = sessionStorage.getItem("token");

		if (token) {
			const userCategory = payloadClaim(token, "user_category");

			if (userCategory === "Service Provider") {
				$(".dashboard-link").html(`
					<a class="nav-link" href="/provider/dashboard?token=${token}">
						My Dashboard
					</a>
				`);
				$(".provider-link").remove();
			}

			if (userCategory === "Admin") {
				$(".dashboard-link").html(`
					<a class="nav-link" href="/admin/dashboard">
						My Dashboard
					</a>
				`);
				$(".provider-link").remove();
			}

			if (userCategory === "Customer") {
				$(".dashboard-link").remove();
			}

			$(".logged-user").text(
				`, ${payloadClaim(token, "user_full_name")}`
			);
			$(".signed-out-links").css("display", "inline-block");
			$(".signed-in-links").css("display", "none");
		} else {
			$(".signed-in-links").css("display", "inline-block");
			$(".signed-out-links").css("display", "none");
		}
	}

	function becomeAProvider() {
		$("#provider-form").on("submit", function (e) {
			e.preventDefault();

			if (confirm("Are you sure you want to proceed with this action")) {
				var form = $(this);
				var fields = form.find(
					"input.required, select.required, textarea.required"
				);

				var token = sessionStorage.getItem("token");

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
					unblockUI();
					alert("You must be a logged in customer to apply for this");
					return false;
				}

				$.ajax({
					type: "POST",
					url: `${API_URL_ROOT}/providers`,
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
						$("#provider-modal")
							.find(".ti-circle-x-filled")
							.click();
					},
					error: function (req, status, err) {
						alert(req.responseJSON.message);
						unblockUI();
					},
				});
			}
		});
	}

	function resentOTP() {
		$(".resend").on("click", function () {
			const email = getQueryParam("email");
			const formData = { email };

			blockUI();

			$.ajax({
				type: "POST",
				url: `${API_URL_ROOT}/resend-otp`,
				data: JSON.stringify(formData),
				dataType: "json",
				contentType: "application/json",
				success: function (response) {
					unblockUI();
					alert(response.message);
				},
				error: function (req, status, err) {
					alert(req.responseJSON.message);
					unblockUI();
				},
			});
		});
	}

	function verifyAccount() {
		$("#account-verification-form").on("submit", function (e) {
			e.preventDefault();

			var form = $(this);
			var email = getQueryParam("email");
			var digit1 = form.find("#digit-1").val();
			var digit2 = form.find("#digit-2").val();
			var digit3 = form.find("#digit-3").val();
			var digit4 = form.find("#digit-4").val();
			var otp = `${digit1}${digit2}${digit3}${digit4}`;
			var formData = { otp, email };

			blockUI();

			$.ajax({
				type: "POST",
				url: `${API_URL_ROOT}/verify-account`,
				data: JSON.stringify(formData),
				dataType: "json",
				contentType: "application/json",
				success: function (response) {
					unblockUI();
					alert(response.message);
					window.location = `/`;
				},
				error: function (req, status, err) {
					alert(req.responseJSON.message);
					form.get(0).reset();
					unblockUI();
				},
			});
		});
	}

	function providerDashboardLinkClick() {
		const token = sessionStorage.getItem("token");

		$(".provider-dashboard-link").on("click", function () {
			if (token) {
				window.location = `dashboard?token=${token}`;
			}
		});
	}
});
