const nconf = module.parent.parent.require('nconf');
const User = module.parent.parent.require('./user');
const Auth = module.parent.parent.require('./controllers/authentication');
const ssoUrlBase64 = Buffer.from(nconf.get('ssoPath')).toString('base64');
const apiUrlBase64 = Buffer.from(nconf.get('rspeerApi')).toString('base64');

const rp = require('request-promise');

const LoginService = {};

LoginService.onRouteChange = async (req, res, next) => {
	res.cookie('sso_url', ssoUrlBase64);
	res.cookie('api_url', apiUrlBase64);
	const idToken = req.query.idToken;
	if(idToken) {
		await LoginService.loginWithToken(req, idToken);
		return res.redirect('/')
	}
	if(req.path !== "/login") {
		return next();
	}
	if(!req.query.overrideLogin) {
		const sso = nconf.get('ssoPath');
		return res.redirect(`${sso}?redirect=${nconf.get('url')}`);
	}
	return next();
};

LoginService.onLoginBuild = async (data, callback) => {
	callback(null, data);
};

LoginService.loginWithToken = async (req, token) => {

	const lookupUser = (email) => new Promise((res, rej) => {
		User.getUidByEmail(email, (err, uid) => {
			if(err) rej("Failed to lookup user by email " + email);
			res(uid);
		})
	});

	const login = (userId) => new Promise((res, rej) => {
		req.login({uid: userId}, function () {
			Auth.onSuccessfulLogin(req, userId, (err) => {
				if (err) res(err);
				res();
			})
		});

	});

	const user = await rp(`${nconf.get("rspeerApi")}/user/me`, {
		headers: {
			'Authorization': `bearer ${token}`
		}
	});
	const parsed = JSON.parse(user);
	const userId = await lookupUser(parsed.email);
	if(userId == null) {
		return;
	}
	try {
		await login(userId);
	} catch (e) {
		console.log(e);
	}
};

module.exports = LoginService;
