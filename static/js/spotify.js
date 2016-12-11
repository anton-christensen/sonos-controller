'use strict'

var Spotify = function (system) {
	var self = this;
	self.resultList = [],
	self.serviceId = system.getServiceId('Spotify');
	self.serviceType = system.getServiceType('Spotify');
	self.accountSN = 1;

	self.doSongSearch = function(query) {
		return new Promise(function(resolve, reject) {
			$.getJSON(
				`https://api.spotify.com/v1/search?type=track&limit=50&q=`+encodeURIComponent(query),
				function(data) {
					self.resultList = [];
					var tracks = data.tracks.items;
					for(var i = 0; i < tracks.length; i++) {
						var track = tracks[i];

						var resultItem = {
							metadata: self._getMetadata(track),
							uri: self._getUri(track),
							name: track.name,
							artist: self._getArtist(track),
							albumArtUri: self._getAlbumArt(track)
						};

						self.resultList.push(resultItem);

					}
					resolve(self.resultList);
				}
			).fail(function() {
				self.resultList = [];
				resolve(self.resultList);
			});
		});
	},

	self._getArtist = function(track) {
		var artists = "";
		for(var j = 0; j < track.artists.length; j++) {
			if(j > 0) artists += ", ";
			artists += track.artists[j].name;
		}
		return artists;
	},

	self._getAlbumArt = function(track) {
		var image = "img/album-placeholder.png";
		for(var j = track.album.images.length-1; j >= 0; j--) {
			if(track.album.images[j].height > 50) {
				image = track.album.images[j].url;
				break;
			}
		}
		return image;
	},

	self._getUri = function(track) {
		return `x-sonos-spotify:spotify%3atrack%3a${track.id}?sid=${self.serviceId}&flags=8224&sn=${self.accountSN}`;
	},
	
	self._getMetadata = function(track) {
		var id = "00032020spotify%3atrack%3a" + encodeURIComponent(track.id);
		const token = `SA_RINCON${self.serviceType}_X_#Svc${self.serviceType}-0-Token`;
		const parentUri = "00020000track:" + track.id;
		const objectType = "item.audioItem.musicTrack";

		var title = track.name; // maybe empty string?

		return `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
		        xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
		        <item id="${id}" parentID="${parentUri}" restricted="true"><dc:title>${title}</dc:title><upnp:class>object.${objectType}</upnp:class>
		        <desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">${token}</desc></item></DIDL-Lite>`;
	}
};