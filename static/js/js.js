$(document).ready(function() {
	function onResize() {
		$('.coverart-large').height($('.coverart-large').width());
		$('.queue-list').height(
			$('.queue-list').parent().height()-$('.sec-now-playing').height()-134
		);
	}
	/*
	$('.time-bar').on('click', function(event) {
		var percentage = event.offsetX / $(this).width();
		$('.time-bar .passed').width((percentage*100)+"%")
	});
	*/
	$( window ).resize(onResize);
	onResize();
});