
/*
 * GET home page.
 */

exports.index = function(req, res){
  var sessionNickname = null;
  
  res.render('index', { 
  	title: 'We are the RunningMan'
  	, sessionRoomid: req.session.roomid
  	, uid : new Date().getTime()
  });
};