const rspeerController = module.exports;
const nconf = require('nconf');
const User = require('./../user');

const hasValidToken = (req) => req.query.rspeerToken === nconf.get('rspeerApiToken');

rspeerController.register = function (req, res) {
	if(!hasValidToken(req)) {
		return res.json({error : "Invalid token."})
	}
	User.create({
		username : req.body.username,
		email : req.body.email,
		acceptTos : true
	}, function (err, data) {
		if(err) {
			res.json({error : err.message});
			return;
		}
		res.json({userId : data});
		return;
	});
};