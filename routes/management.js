var management = module.exports = {
	// 사용자 관리
	users: []
	, rooms: []
		, hasUser: function (username){
			var users = this.users.filter(function(element){
				return (element === username);
			});
			
			if( users.length > 0 ){
				return true;
			} else {
				return false;
			}
		} 
		, addUser: function (username){
			this.users.push(username);
		}
		, removeUser: function(username){
			this.users.forEach(function(element, index, attr){
				if(element === username)
					attr.splice(index, 1);
			});
		}
	// 방 관리
		, hasRoom : function (roomid){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			if (rooms.length > 0 ){
				return true;
			} else {
				return false;
			}
		}
		, addRoom : function(roomid, roompw, groupname){
			// 채팅 참가하는 사람들에게 
			this.rooms.push({id : roomid, password : roompw, desc : groupname, attendants : []})
		}
		, removeRoom : function(roomid){
			this.rooms.forEach(function(element, index, attr){
				if(element.id === roomid)
					attr.splice(index, 1);
			});
		}
		, getRoomDescribe : function(roomid){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			return rooms[0].desc;
		}
		, getRoomPassword : function(roomid){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			return rooms[0].password;
		}
		/*
		, getRoomList : function(){
			return this.rooms.map( function(element){
				return element.desc;
			});
		}
		*/
	// 참가자 관리
		, joinRoom: function(roomid, user){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			
			if(!this.hasAttendant(rooms[0].attendants, user)){
				rooms[0].attendants.push(user);
			}
		}
		, hasAttendant: function(attendants, user){
			return attendants.some(function(element){
				return (element === user);
			});
		}
		, getAttendantsList: function(roomid){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			return rooms[0].attendants;
		}
		, leaveRoom: function(roomid, user){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			console.log(rooms);
			rooms[0].attendants.forEach(function(element, index, attr){
				if(element === user){
					attr.splice(index, 1);
				}
			});
		}
}