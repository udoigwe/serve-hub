$(function () {
	'use strict';

	let token = sessionStorage.getItem('token');
	//const ps = new PerfectScrollbar(document.querySelector('.mt-container'));

	$(document).ready(function(){

		dashboard();
	});

	function dashboard()
	{
		$.ajax({
			type:'GET',
			url:API_URL_ROOT+'/dashboard',
			dataType:'json',
			headers:{'x-access-token':token},
			success:function(response)
			{
				if(response.error == false)
				{
					var dashboard = response.dashboard;
			
					$('.user-count').text(formatNumber(dashboard.userCount));
					$('.artist-count').text(formatNumber(dashboard.artistCount));
					$('.album-count').text(formatNumber(dashboard.albumCount));
					$('.video-count').text(formatNumber(dashboard.videoCount));
					$('.song-count').text(formatNumber(dashboard.songCount));
					$('.unread-count').text(formatNumber(dashboard.messageCount));
					$('.news-count').text(formatNumber(dashboard.newsCount));
					$('.genre-count').text(formatNumber(dashboard.genreCount));
				}
				else
				{
					showSimpleMessage("Attention", response.message, "error");
				}
			},
			error:function(req, err, status)
			{
				showSimpleMessage("Attention", req.responseJSON.message, "error");
			}
		})
	}
});