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
			socket.set('uid', data.uid);
			socket.set('uname', data.name);
			if( management.hasRoom(data.roomid) ){
				joinedRoom = data.roomid;
				
				// 방참가
				socket.join(joinedRoom);
				// 참가 했다는 이벤트를 연결된 모든 클라이언트에게 전송
				socket.broadcast.to(joinedRoom).emit('joined' , data);
				// 방과 관련된 배열에 방 참가자 관리를 위한 메소드
				management.joinRoom(joinedRoom, data.uid, data.name, data.team, data.item);
			} else {
				/* 
					방이 없는경우 
					(서버가 재시작된다면 이 방은 없어져야함)
					이때 Private 통신을 통하여 로그아웃 시킴.
				*/
			}
		});
		socket.on('message', function(data){
			if(joinedRoom) 
				socket.broadcast.to(joinedRoom).emit('message', data);
		});
		socket.on('leave', function(data){
			console.log(data);
			if(joinedRoom){
				management.leaveRoom(joinedRoom, data.username);
				socket.broadcast.to(joinedRoom).emit('leaved', {username : data.username});
				socket.leave(joinedRoom);
			}
		});
		socket.on('disconnect', function(){
			var uid = null;
			var uname = null;
			// 연결시 저장 해 두었던 정보를 연결해지 할 때 불러내기 위하여 사용함.
			socket.get('uid', function(err,data){
				uid = data;
			});
			socket.get('uname', function(err,data){
				uname = data;
			});			
			if(joinedRoom){
				management.leaveRoom(joinedRoom, uid);
				socket.broadcast.to(joinedRoom).emit('leaved', {name : uname});
				socket.leave(joinedRoom);
			}
		});
		// 방 폭파
		socket.on('destroy', function(data){
			management.removeRoom(data.roomid);
			management.removeUser(data.groupname);
			socket.emit('destroySucc', data);
		});
	});
}

