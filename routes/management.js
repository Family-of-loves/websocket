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
	// 방 관리
		, hasRoom : function (roomname){
			var rooms = this.rooms.filter(function(element){
				return (element.name === roomname);
			});
			if (rooms.length > 0 ){
				return true;
			} else {
				return false;
			}
		}
		, addRoom : function(roomname){
			// 채팅 참가하는 사람들에게 
			this.rooms.push({name : roomname, attendants : []})
		}
		, getRoomList : function(){
			return this.rooms.map( function(element){
				return element.name;
			});
		}
	// 참가자 관리
		, joinRoom: function(roomname, user){
			var rooms = this.rooms.filter(function(element){
				return (element.name === roomname);
			});
			
			if(!this.hasAttendant(rooms[0].attendants, user)){
				rooms[0].attendants.push(user);
//				console.log(rooms[0]);
			}
		}
		, hasAttendant: function(attendants, user){
			return attendants.some(function(element){
				return (element === user);
			});
		}
		, getAttendantsList: function(roomname){
			var rooms = this.rooms.filter(function(element){
				return (element.name === roomname);
			});
			return rooms[0].attendants;
		}
		, leaveRoom: function(roomname, user){
			var rooms = this.rooms.filter(function(element){
				return (element.name === roomname);
			});
			
			rooms[0].attendants.forEach(function(element, index, attr){
				if(element === user){
					attr.splice(index, 1);
				}
			});
		}
}