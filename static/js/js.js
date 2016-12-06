$(document).ready(function() {
	function onResize() {
		$('.coverart-large').height($('.coverart-large').width());
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