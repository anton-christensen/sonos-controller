$(document).ready(function() {
	function onResize() {
		$('.coverart-large').height($('.coverart-large').width());
		$('.queue-list').height(
			$('.queue-list').parent().height()-$('.sec-now-playing').height()-134
		);
	}

	$( window ).resize(onResize);
	onResize();
});