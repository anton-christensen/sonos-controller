const SonosDiscovery = require('sonos-discovery');
const http = require('http');
const settings = {
	port: 1234,
	cacheDir: './cache'
}

var discovery = new SonosDiscovery(settings);
var queue = [];
var player;

discovery.on('topology-change', function (data) {
	console.log("EVENT: topology-change");
	console.log(data);
});

discovery.on('transport-state', function (data) {
	console.log("EVENT: transport-state");
	console.log(data);

	player = data;
	updateQueue();
	uiUpdateCurrentSong();
});

discovery.on('group-volume', function (data) {
	console.log("EVENT: group-volume");
	console.log(data);
});

discovery.on('volume-change', function (data) {
	console.log("EVENT: volume-change");
	console.log(data);
});

discovery.on('group-mute', function (data) {
	console.log("EVENT: group-mute");
	console.log(data);
});

discovery.on('mute-change', function (data) {
	console.log("EVENT: mute-change");
	console.log(data);
});

discovery.on('favorites', function (data) {
	console.log("EVENT: favorites");
	console.log(data);
});

discovery.on('list-change', function (data) {
	updateQueue();
	console.log("EVENT: list-change");
	console.log(data);
});

discovery.on('dead', function (data) {
	console.log("EVENT: dead");
	console.log(data);
});

discovery.on('queue-change', function (player) {
	updateQueue();
	console.log("EVENT: queue-change");
	console.log(player);
});

function updateQueue() {
	if(!player) return;
	player.getQueue().then(q => {
		queue = q; 
		uiUpdateQueue();
	});
}




setInterval(uiUpdateTime, 1000);

function uiUpdateTime() {
	if(!player) return;
	var percentage = player.state.elapsedTime / player.state.currentTrack.duration;
	$('.time-bar .passed').width((percentage*100)+"%")
}

function uiUpdateQueue() {
	if(!player) return;
	var list = $('.queue-list');
	list.empty();
	for(var i = player.state.trackNo; i < queue.length; i++) {
		list.append(`
          <div class="queue-item">
            <img src="${player.baseUrl}${queue[i].albumArtUri}" class="queue-cover" height="80">
            <div class="info">
              <h3 class="track-title">${queue[i].title}</h3>
              <span class="track-artist">${queue[i].artist}</span>
            </div>
          </div>`);
	}
}

function uiUpdateCurrentSong() {
	$('[class*="coverart"]').css('background-image', `url(${player.state.currentTrack.absoluteAlbumArtUri})`);
	$('.sec-now-playing .info .track').html(player.state.currentTrack.title);
	$('.sec-now-playing .info .artist').html(player.state.currentTrack.artist);
	$('.sec-now-playing .info .album').html(player.state.currentTrack.album);
	/*
	absoluteAlbumArtUri:"https://i.scdn.co/image/5e120b79b46dcc5a7223c8e29a3dffbf93399c19"
	album:"Melrose EP"
	albumArtUri:"/getaa?s=1&u=x-sonos-spotify%3aspotify%253atrack%253a5A1u2GMvgMOMECWuYRBNc1%3fsid%3d9%26flags%3d8224%26sn%3d1"
	artist:"Foy Vance"
	duration:391
	stationName:""
	title:"Be the Song"
	type:"track"
	uri:"x-sonos-spotify:spotify%3atrack%3a5A1u2GMvgMOMECWuYRBNc1?sid=9&flags=8224&sn=1"
	*/
}


$(document).on('click', '.play-controls .play-pause', function(e) {
	if(!player) return;

	if(player.state.playbackState == "PLAYING") {
		player.pause();
		$(this).removeClass('play').addClass('pause');
	}
	else {
		player.play();
		$(this).removeClass('pause').addClass('play');
	}
});

$(document).on('click', '.play-controls .prev', function(e) {
	if(!player) return;
	player.previousTrack();
});

$(document).on('click', '.play-controls .next', function(e) {
	if(!player) return;
	player.nextTrack();
});

$(document).on('click', '.time-bar', function(event) {
	if(!player) return;
	var percentage = event.offsetX / $(this).width();
	var val = Math.round(percentage*player.state.currentTrack.duration);
	console.log("scrolling to " + val);
	player.timeSeek(val);
});