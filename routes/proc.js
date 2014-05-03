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

			if( management.hasRoom(data.roomid) ){
				joinedRoom = data.roomid;
				
				socket.join(joinedRoom);
				socket.emit('joined', {
					isSuccess : true
				,	data : data
				});
				socket.broadcast.to(joinedRoom).emit('joined', {
					isSuccess : true
				,	data : data
				});
				management.joinRoom(joinedRoom, data.username);
			} else {
				/* 
					방이 없는경우 
					(서버가 재시작된다면 이 방은 없어져야함)
					이때 Private 통신을 통하여 로그아웃 시킴.
				*/
			}
		});
		
		socket.on('joinUser', function(data){
			var isSuccess = true
			,	username = data.username;
			
			if(username && username.trim() !== ''){
				if(!management.hasUser(username)){
					management.addUser(username);
					isSuccess = true;
				}
			}
				
		});
		
		socket.on('message', function(data){
			if(joinedRoom){
				socket.broadcast.to(joinedRoom).emit('message', {isSuccess : true ,data : data});
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
		socket.on('destroy', function(data){
			management.removeRoom(data.roomid);
			management.removeUser(data.groupname);
			socket.emit('destroySucc', data);
		});
		
		socket.on('tryEstablished', function(data){
			socket.broadcast.emit("disconnUser", data);
		});
	});
}

