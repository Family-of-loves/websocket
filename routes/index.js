
/*
 * GET home page.
 */

exports.index = function(req, res){
  var sessionNickname = null;
  
  res.render('index', { 
  	title: 'Express',
  	sessionNickname: req.session.nickname
  });
};