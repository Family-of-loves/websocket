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
	});
	
	var room = io
	.on('connection', function(socket){
		var joinedRoom = null;
		
		socket.on('join', function(data){
			socket.set('uid', data.uid);
			socket.set('uname', data.name);
			if( management.hasRoom(data.roomid) ){
				joinedRoom = data.roomid;
				if(!management.getGameStarted(joinedRoom)){
					socket.join(joinedRoom);
					socket.broadcast.to(joinedRoom).emit('joined' , data);
					management.joinRoom(joinedRoom, data.uid, data.name, data.team, data.item);
				} else {
					if(data.team == 2){
						socket.join(joinedRoom);
						socket.broadcast.to(joinedRoom).emit('joined' , data);
						management.joinRoom(joinedRoom, data.uid, data.name, data.team, data.item);
					}
				}
			}
		});
		socket.on('start', function(data){
			management.setGameStarted(data.roomid);
			socket.broadcast.to(joinedRoom).emit('gameStart', data);
		});
		socket.on('chkRoom', function(data){
			if(management.hasRoom(data.roomid)){
				if(management.getGameStarted(data.roomid)){
					socket.emit('established', data.uid, {statCode : 600, statMsg : "게임이 진행 중입니다."});
					//socket.disconnect();
				} else {				
					socket.emit('established', data.uid, {statCode : 200, statMsg : "참가 성공"});
				}
			} else {
				socket.emit('established', data.uid, {statCode : 403, statMsg : "게임이 존재하지 않습니다."});
//				socket.disconnect();
			}
		});
		socket.on('message', function(data){
			if(joinedRoom) 
				socket.broadcast.to(joinedRoom).emit('message', data);
		});
		socket.on('minigame', function(data){
			if(joinedRoom)
				socket.broadcast.to(joinedRoom).emit('minigame', data);
		});
		socket.on('resMinigame', function(data){
			if(joinedRoom)
				socket.broadcast.to(joinedRoom).emit('resMinigame', data);
		});
		socket.on('leave', function(data){
			if(joinedRoom){
				management.leaveRoom(joinedRoom, data.name);
				socket.broadcast.to(joinedRoom).emit('leaved', data);
				socket.leave(joinedRoom);
			}
		});
		socket.on('disconnect', function(){
			var uid = null;
			var uname = null;
			
			socket.get('uid', function(err,data){
				uid = data;
			});
			socket.get('uname', function(err,data){
				uname = data;
			});			
			if(joinedRoom){
				management.leaveRoom(joinedRoom, uid);
				
				if(!management.getGameStarted(joinedRoom))
					socket.broadcast.to(joinedRoom).emit('leaved', {uid : uid, name : uname});
					
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