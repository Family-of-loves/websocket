
/*
 * GET home page.
 */

exports.index = function(req, res){
  var sessionNickname = null;
  
  res.render('index', { 
  	title: 'We are the RunningMan'
  	, sessionRoomname: req.session.roomname
  	
  });
};