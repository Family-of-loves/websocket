var management = module.exports = {
	// 사용자 관리
	users: []
	, rooms: []
		, hasUser: function (uid){
			var users = this.users.filter(function(element){
				return (element === uid);
			});
			
			if( users.length > 0 ){
				return true;
			} else {
				return false;
			}
		} 
		, addUser: function (uid, username, team, item){
			this.users.push({uid : uid, name : username, team : team, item : item});
		}
		, removeUser: function(uid){
			this.users.forEach(function(element, index, attr){
				if(element === uid)
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
		, addRoom : function(roomid, roompw, groupname, isStart){
			this.rooms.push({
					id : roomid, 
					password : roompw, 
					desc : groupname, 
					isStarted : false, 
					attendants : []
				})
		}
		, removeRoom : function(roomid){
			this.rooms.forEach(function(element, index, attr){
				if(element.id === roomid)
					attr.splice(index, 1);
			});
		}
		, setGameStarted : function(roomid){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			rooms[0].isStarted = true;
		}
		, getGameStarted : function(roomid){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			return rooms[0].isStarted;
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
		
		, getRoomList : function(){
			return this.rooms.map( function(element){
				return {'roomid' : element.id, 'groupname':element.desc, 'attendants':element.attendants};
			});
		}
		
	// 참가자 관리
		, joinRoom: function(roomid, uid, username, team, item){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});	
			if(!this.hasAttendant(rooms[0].attendants, uid)){
				rooms[0].attendants.push({uid : uid, name : username, team : team, item : item});
			}
		}
		, hasAttendant: function(attendants, uid){
			return attendants.some(function(element){
				return (element === uid);
			});
		}
		, getAttendantsList: function(roomid){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			return rooms[0].attendants;
		}
		, leaveRoom: function(roomid, uid){
			var rooms = this.rooms.filter(function(element){
				return (element.id === roomid);
			});
			rooms[0].attendants.forEach(function(element, index, attr){
				if(element.uid === uid){
					attr.splice(index, 1);
				}
			});
		}
}