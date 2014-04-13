var management = require('./management');
/* Session-based Authorization */
var cookie  =   require('cookie')
,   connect =   require('connect');


module.exports = function(server){
	var io = require('socket.io').listen(server);
	
	io.configure(function(){
		io.set('log level', 3);
		io.set('transports', [
			'websocket'
			, 'flashsocket'
			, 'htmlfile'
			, 'xhr-polling'
			, 'jsonp-polling'
		]);
		/*io.set('authorization', function (handshakeData, accept) {
			if (handshakeData.headers.cookie) {		
			
				handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
				handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');
			
				if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
					return accept('Cookie is invalid.', false);
				}
			} else {
				return accept('No cookie transmitted.', false);
			} 
			accept(null, true);
		});*/
		
	});
	
	var room = io
	.on('connection', function(socket){
		var joinedRoom = null;
		
		socket.on('join', function(data){
			
			socket.set('username', data.username);
			
			if( management.hasRoom(data.roomname)){
				joinedRoom = data.roomname;
				
				socket.join(joinedRoom);
				
				socket.emit('joined', {
					isSuccess : true
					, username : data.username
					, joined_status : true
				});
				
				socket.broadcast.to(joinedRoom).emit('joined', {
					isSuccess : true
					, username : data.username
				});
				management.joinRoom(joinedRoom, data.username);
				
			} else {
				socket.emit('joined', {isSuccess:false});
			}
		});
		
		socket.on('message', function(data){
			if(joinedRoom){
				socket.broadcast.to(joinedRoom).json.send(data);
			}
		});
		
		socket.on('leave', function(data){
			if(joinedRoom){
				management.leaveRoom(joinedRoom, data.username);
				socket.broadcast.to(joinedRoom).emit('leaved', {username : data.username});
				socket.leave(joinedRoom);
			}
		});
		socket.on('disconnect', function(){
			var disconnUser = null;
			
			socket.get('username', function(err,data){
				disconnUser = data;
			});
			
			if(joinedRoom){
				management.leaveRoom(joinedRoom, disconnUser);
				socket.broadcast.to(joinedRoom).emit('leaved', {username : disconnUser});
				socket.leave(joinedRoom);
			}
		});
		
		socket.on('tryEstablished', function(data){
			socket.broadcast.emit("disconnUser", data);
		});
	});
}

