/**
 * Module dependencies.
 */

var express = require('express')
	, management = require('./routes/management.js');
var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');

/* Session-based Authorization */
var cookie  =   require('cookie')
,   connect =   require('connect');

/* Express & Socket.io */ 
var app = express();
var server = http.createServer(app);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
// 사용자 관리를 위하여 세션과 쿠키 사용
app.use(express.cookieParser());
app.use(express.session({secret : 'secret', key: 'express.sid'}));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
/*
app.post('/enter', function(req, res){
	var isSuccess = false
		, username = req.body.username;
		
	if(username && username.trim() !== ''){
		if(!management.hasUser(username)){
			management.addUser(username);
			req.session.username = username;
			isSuccess = true;
		}
	}
	res.render('enter', {
		isSuccess : isSuccess
		, username : username
		, roomlist : management.getRoomList()
	});
});

app.get('/enter', function(req, res){
	if(req.session.username){
		res.render( 'enter' , {
			isSuccess: true
			, username: req.session.username
			, roomlist: management.getRoomList()
		});
	} else {
		res.render( 'enter', {
			isSuccess: false
			, username : ''
		});
	}
});

app.post('/makeroom', function(req, res){
	var isSuccess = false
		, roomid = req.body.roomid;
		
	if(roomid && roomid.trim() !== ''){
		if(!management.hasRoom(roomid)){
			management.addRoom(roomid);
			isSuccess = true;
		}
	}
	res.render('makeroom', {
		isSuccess : isSuccess
		, roomid : roomid
	});
});
*/

app.post('/make', function(req,res){
	var isSuccess = false
	,	roomid = req.body.roomid
	,	roompw = req.body.roompw
	,	groupname = req.body.groupname
	
	if(groupname && groupname.trim() !== ''){
		if(!management.hasUser(groupname)){
			management.addUser(groupname);
			req.session.groupname = groupname;
			req.session.roomid = roomid;
			req.session.roompw = roompw;
			isSuccess = true;
		} else {
			// do stuff
		}
	}
	isSuccess = false;
	if(roomid && roomid.trim() !== ''){
		if(!management.hasRoom(roomid)){
			management.addRoom(roomid, roompw, groupname);
			isSuccess = true;
		}
	}
	
	res.render('make', {
		isSuccess : isSuccess
		, roomid : roomid
		, roompw : roompw
		, groupname : groupname
	});
});

app.get('/join/:id', function(req,res){
	var	isSuccess = false
	,	roomid = req.params.id
	,	groupname = req.session.groupname
	
	if(management.hasRoom(roomid)){
		var authRoom = management.getRoomPassword(roomid);
		
		// 관리자 페이지 접근시 세션이 없는경우!
		(authRoom == req.session.roompw) ? isSuccess = true : isSuccess = false;
		
		res.render('room', {
			isSuccess : isSuccess
			, roomid : roomid
			, groupname : groupname
			, attendants : management.getAttendantsList(roomid)
		});
	} else {
		res.render('error', { 
			errCode : 404,
			errMsg : '방을 찾지 못하였습니다',
			errArg : req.param.id
		});
	}
});

app.post('/join', function(req,res){
	var isSuccess = false
	,	roomid = req.body.roomid
	,	roompw	= req.body.roompw
	,	groupname = management.getRoomDescribe(req.body.roomid);

	if(roomid && roomid.trim() !== ''){
		if(management.hasRoom(roomid)){
			req.session.roomid = roomid;
			req.session.roompw = roompw;
			req.session.groupname = groupname;
			isSuccess = true;
			console.log(req.session.roompw);
			res.render('make', {
				isSuccess : isSuccess
				, roomid : roomid
				, roompw : roompw
				, groupname : groupname
			});

		}
	}

});

app.get('/logout', function(req,res){
	res.render('logout', {
		roomid : req.session.roomid,
		groupname : req.session.groupname
	});
	req.session.destroy();
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
require('./routes/proc')(server);
