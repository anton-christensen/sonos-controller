
/*
album:   'https://api.spotify.com/v1/search?type=album&limit=1&q=album:',
song:    'https://api.spotify.com/v1/search?type=track&limit=50&q=',
station: 'https://api.spotify.com/v1/search?type=artist&limit=1&q='
*/

$(document).on('input', '.search', function() {
	console.log(`https://api.spotify.com/v1/search?type=track&limit=50&q=`+encodeURIComponent($(this).val()));
	$.getJSON(
		`https://api.spotify.com/v1/search?type=track&limit=50&q=`+encodeURIComponent($(this).val()),
		function(data) {
			console.log(data);

			var list = $('.search-result-list');
			list.empty();
			var tracks = data.tracks.items;
			for(var i = 0; i < tracks.length; i++) {
				var track = tracks[i];
				var artists = "";
				for(var j = 0; j < track.artists.length; j++) {
					if(j > 0) artists += ", ";
					artists += track.artists[j].name;
				}
				var image = "img/album-placeholder.png";
				for(var j = track.album.images.length-1; j >= 0; j--) {
					if(track.album.images[j].height > 50) {
						image = track.album.images[j].url;
						break;
					}
				}

				list.append(`
					<div class="search-result-item">
						<img src="${image}" class="queue-cover">
						<div class="info">
							<h3 class="track-title">${track.name}</h3>
							<h4 class="track-artist">${artists}</h4>
						</div>
					</div>`
				);
			}
		}
	).fail(function() {
		$('.search-result-list').empty();
	});
});