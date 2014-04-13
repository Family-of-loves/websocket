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
		, roomname = req.body.roomname;
		
	if(roomname && roomname.trim() !== ''){
		if(!management.hasRoom(roomname)){
			management.addRoom(roomname);
			isSuccess = true;
		}
	}
	res.render('makeroom', {
		isSuccess : isSuccess
		, roomname : roomname
	});
});

app.get('/join/:id', function(req,res){
	var isSuccess = false
	,	roomname = req.params.id;
	
	if(management.hasRoom(roomname)){ 
		isSuccess = true;
				
		res.render('room', {
			isSuccess : isSuccess
			, roomname : roomname
			, username : req.session.username
			, attendants : management.getAttendantsList(roomname)
		});
	} else {
		isSuccess = false;
		res.render('error', { 
			errCode : 404,
			errMsg : '방을 찾지 못하였습니다',
			errArg : req.param.id
		});
	}
});

//app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
require('./routes/proc')(server);
