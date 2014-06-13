var latitude = 0;
var longitude = 0;
var map = {};
var markers = [];
var infowindow;

$('document').ready(function(){
	var room = io.connect('/');
	var activitys = $('#activitys');
	var messageBox = $('#message');
	var groupname = $('#groupname').val();
	var blueTeam = $('#blueTeam');
	var redTeam = $('#redTeam');
	var manager = "관리자"+Math.floor(Math.random() * 10) + 1;;
	
	function showMessage(msg){
		activitys.append($('<p>').text(msg));
		activitys.scrollTop(activitys[0].scrollHheight);
	}
	
	$('#notifySender').submit(function(e){
		e.preventDefault();
		var msg = messageBox.val();
		
		if($.trim(msg) !== ''){
			showMessage( manager + ' : ' + msg);
			room.json.send({name: manager, msg:msg, team: 2});
			messageBox.val('')	
		}
	});
	
	$('#gameStart').click(function(){
		room.emit('start', {
			roomid: $('#roomid').val() 
		});
		$('.game-mapview .modal-backdrop, .game-mapview .modal-inner').remove();
	});
	
	/*
		Socket Method define
	*/
	
	room.on('connect', function(){
		room.emit('join', {
				roomid : $('#roomid').val()
			,	uid: new Date().getTime()
			,	name: manager
			,	team: "2"
			,	item: "3"
		});
	});
	
	room.on('joined', function(data){
		showMessage(data.name + ' 님이 참가하였습니다.');
		if(data.team == 0){
			blueTeam.append($('<li>').attr('id', 'attendant-' + data.name).text(data.name));
		} else if(data.team == 1){
			redTeam.append($('<li>').attr('id', 'attendant-' + data.name).text(data.name));							
		} else {
			//do stuff your plan
		}
	});
	
	room.on('message', function(data){
		console.log(data);
		if ( $("#participantInfo > #"+data.uid+"").length === 0 ) {
			$("#participantInfo").append("<input type='hidden' id="+data.uid+" data-name="+data.name+" data-team="+data.team+" data-latitude="+data.latitude+" data-longitude="+data.longitude+">");
		} else {
			$("#"+data.uid).attr({
				"data-latitude" : data.latitude,
				"data-longitude" : data.longitude
			});
		}
		if(data.team == 2)
			showMessage(data.name + " : " + data.msg);
			readMarkers();
	});

	room.on("leaved", function(data){
		showMessage(data.name + "님이 나가셨습니다.");
		$("#attendant-" + data.name).remove();
		$("#"+data.uid).remove();
		readMarkers();
	});
});
			
window.onload = function() {
	navigator.geolocation.getCurrentPosition(function(position) {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		
		mapOptions = {
			center: new google.maps.LatLng(latitude, longitude),
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		
		map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
	});
};
(function () {
	google.maps.Map.prototype.markers = new Array();
	
	google.maps.Map.prototype.addMarker = function(marker) {
		this.markers[this.markers.length] = marker;
	};

	google.maps.Map.prototype.getMarkers = function() {
		return this.markers
	};

	google.maps.Map.prototype.clearMarkers = function() {
		if(infowindow) {
			infowindow.close();
		}
	
		for(var i=0; i<this.markers.length; i++){
			this.markers[i].setMap(null);
		}
	};
})();
function createMarker(name, latlng, team) {
	var marker = new google.maps.Marker({position: latlng, map: map, icon:'../img/marker_'+team+'_web.png'});
	google.maps.event.addListener(marker, "click", function() {
		if (infowindow) infowindow.close();
			infowindow = new google.maps.InfoWindow({content: name});
			infowindow.open(map, marker);
		});
	return marker;
}
function readMarkers(){
	deleteMarkers();
	$("#participantInfo > input").each(function(index, value){
		var loc = new google.maps.LatLng($(this).attr("data-latitude"), $(this).attr("data-longitude"));
		map.addMarker(createMarker($(this).attr("data-name"),loc,$(this).attr("data-team")));
	});
}
function deleteMarkers() {
	map.clearMarkers();
	markers = [];
}