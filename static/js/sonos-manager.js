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
	if(!player) player = discovery.getAnyPlayer();
	updateTopology(data);
});

discovery.on('transport-state', function (data) {
	console.log("EVENT: transport-state");
	console.log(data);

	// player = data;
	uiUpdateRoomList();
	uiUpdateCurrentSong();
	updateQueue();
	uiUpdatePlayPause();
	uiUpdateSoundControls();
});

discovery.on('group-volume', function (data) {
	console.log("EVENT: group-volume");
	console.log(data);

	uiUpdateSoundControls();
});

discovery.on('volume-change', function (data) {
	console.log("EVENT: volume-change");
	console.log(data);

	uiUpdateSoundControls();
});

discovery.on('group-mute', function (data) {
	console.log("EVENT: group-mute");
	console.log(data);
	
	uiUpdateSoundControls();
});

discovery.on('mute-change', function (data) {
	console.log("EVENT: mute-change");
	console.log(data);

	uiUpdateSoundControls();
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

function updateTopology(zones) {
	uiUpdateRoomList();
}

function updateQueue() {
	if(!player) return;
	player.getQueue().then(q => {
		queue = q; 
		uiUpdateQueue();
	});
}




setInterval(uiUpdateTime, 1000);

function zpad(time) {
	return ("00"+time).substr(-2);
}

function uiUpdateTime() {
	if(!player) return;
	var percentage = player.state.elapsedTime / player.state.currentTrack.duration;
	$('.time-bar .passed').width((percentage*100)+"%");
	$('.timestamp').html(`${Math.floor(player.state.elapsedTime/60)}:${zpad(player.state.elapsedTime%60)}/${Math.floor(player.state.currentTrack.duration/60)}:${zpad(player.state.currentTrack.duration%60)}`)
}

function uiUpdateQueue() {
	if(!player) return;
	var list = $('.queue-list');
	list.empty();
	for(var i = player.state.trackNo; i < queue.length; i++) {
		list.append(`
          <div class="queue-item" track-no="${i+1}">
            <img src="${player.baseUrl}${queue[i].albumArtUri}" class="queue-cover">
            <div class="info">
              <h3 class="track-title">${queue[i].title}</h3>
              <h4 class="track-artist">${queue[i].artist}</h4>
            </div>
          </div>`);
	}
}

function uiUpdateCurrentSong() {
	$('.currently-playing .coverart').css('background-image', `url(${player.state.currentTrack.absoluteAlbumArtUri})`);
	$('.currently-playing .info .current-track').html(player.state.currentTrack.title);
	$('.currently-playing .info .current-artist').html(player.state.currentTrack.artist);
	$('.currently-playing .info .current-album').html(player.state.currentTrack.album);
	
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

function uiUpdatePlayPause() {
	if(!player) return;

	if(player.state.playbackState == "PLAYING") {
		$(".play-controls .play-pause").removeClass('play').addClass('pause');
	}
	else {
		$(".play-controls .play-pause").removeClass('pause').addClass('play');
	}
}

function uiUpdateRoomList() {
	var groups = discovery.zones;
	var domList = $('.room-list');
	domList.empty();
	for(var i = 0; i < groups.length; i++) {
		var group = groups[i];
		var classes = "";
		var playing = (group.coordinator.state.playbackState == "PLAYING" ? " active" : "")
		if(player && group.coordinator.uuid == player.uuid) {
			classes += " active";
		}


		domList.append(`
			<div class="room${classes}" uuid="${group.coordinator.uuid}">
            	<h3>${group.coordinator.roomName}</h3>
            	<div class="icon icon-equalizer${playing}"></div><h4>${group.coordinator.state.currentTrack.title} - ${group.coordinator.state.currentTrack.artist}</h4>
          	</div>
        `);
	}
}

function uiUpdateSoundControls() {
	if(!player) return;
	var playmodeState = player.state.playMode;

	$('.sound-controls .crossfade').toggleClass("active", playmodeState.crossfade);
	$('.sound-controls .shuffle').toggleClass("active", playmodeState.shuffle);
	$('.sound-controls .repeat').toggleClass("active", playmodeState.repeat == 'all' || playmodeState.repeat == 'one');
	$('.sound-controls .mute').toggleClass("active", player.state.mute);
	$('.sound-controls .volume-bar .volume').width(player.state.volume+"%");
}


$(document).on('click', '.queue-item', function(e) {
	if(!player) return;
	console.log($(this).attr('track-no'));
	player.trackSeek($(this).attr('track-no'));
});

$(document).on('click', '.time-bar', function(event) {
	if(!player) return;
	var percentage = event.offsetX / $(this).width();
	var val = Math.round(percentage*player.state.currentTrack.duration);


	$('.time-bar .passed').width((percentage*100)+"%")
	player.timeSeek(val);
});

$(document).on('click', '.play-controls .play-pause', function(e) {
	if(!player) return;

	if(player.state.playbackState == "PLAYING") {
		player.pause();
		$(this).removeClass('pause').addClass('play');
	}
	else {
		player.play();
		$(this).removeClass('play').addClass('pause');
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

$(document).on('click', '.sound-controls .crossfade', function(e) {
	if(!player) return;
	player.crossfade(!$(this).hasClass('active'));
	$(this).toggleClass('active');
});

$(document).on('click', '.sound-controls .shuffle', function(e) {
	if(!player) return;
	player.shuffle(!$(this).hasClass('active'));
	$(this).toggleClass('active');
});

$(document).on('click', '.sound-controls .repeat', function(e) {
	if(!player) return;
	player.repeat((!$(this).hasClass('active') ? 'all' : 'none'));
	$(this).toggleClass('active');
});

$(document).on('click', '.sound-controls .mute', function(e) {
	if(!player) return;
	if($(this).hasClass('active')) { player.unMute();}
	else { player.mute(); }
	$(this).toggleClass('active');
});

$(document).on('click', '.sound-controls .volume-bar', function(event) {
	if(!player) return;
	var percentage = event.offsetX / $(this).width();
	var val = Math.round(percentage*100);

	$('.sound-controls .volume-bar .volume').width((percentage*100)+"%");
	player.setVolume(val);
});