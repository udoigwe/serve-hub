$(function () {
	"use strict";

	$(document).ready(function ($) {
		register();
		login();
		logout();
		recogniseMe();
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
					<a class="nav-link" href="/provider/services">
						My Dashboard
					</a>
				`);
			}

			if (userCategory === "Admin") {
				$(".dashboard-link").html(`
					<a class="nav-link" href="/admin/dashboard">
						My Dashboard
					</a>
				`);
			}

			if (userCategory === "Customer") {
				$(".dashboard-link").remove();
			}
		}
	}
});
