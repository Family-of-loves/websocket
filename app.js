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
// 서버시작시 자동으로 방 생성 (테스트방)
management.addRoom("test", "test", "test");

app.post('/make', function(req,res){
	var isSuccess = false
	,	uid = req.body.uid
	,	roomid = req.body.roomid
	,	roompw = req.body.roompw
	,	groupname = req.body.groupname
	,	isRestful = req.body.isRestful;
	
	if(groupname && groupname.trim() !== ''){
		if(!management.hasUser(groupname)){
			management.addUser(uid, groupname, 2, 3);
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

	if(isRestful == '0'){	
		res.render('make', {
			isSuccess : isSuccess
			, roomid : roomid
			, roompw : roompw
			, groupname : groupname
		});
	} else {
		res.send({
			"response": isSuccess
			, roomid : roomid
			, roompw : roompw
			, groupname : groupname

		});
	}
});

app.get('/join/:id', function(req,res){
	var	isSuccess = false
	,	isStarted = false
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
			, isStarted : management.getGameStarted(roomid)
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

app.get('/list', function(req,res){
	res.send(management.getRoomList());
});

app.get('/logout', function(req,res){
	
	
	if(typeof req.session.roomid == 'undefined'){
		res.send({"response" : "false"});
	} else {
		res.render('logout', {
			roomid : req.session.roomid,
			groupname : req.session.groupname
		});
	}
	req.session.destroy();
});

server.listen(app.get('port'), function(){});
require('./routes/proc')(server);
