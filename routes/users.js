var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
	User.find({})
  	.then((users) => {
		
		const result = users.map(user => {
			delete user["salt"];
			delete user["hash"];
			return user;
		});
		res.statusCode = 200;
 		res.setHeader('Content-Type', 'application/json');
		res.json(result);
 	})
});

router.post('/signup', cors.corsWithOptions, function(req, res, next) {
	
	User.register(new User({username: req.body.username}), req.body.password, 
	(err, user) => {
		
		if (err) {
			res.statusCode = 500;
			res.setHeader('Content-Type', 'application/json');
			res.json({err: err});
		}
		else {
			if (req.body.firstname){
				user.firstname = req.body.firstname;
			}
			if (req.body.lastname){
				user.lastname = req.body.lastname;
			}
			user.save((err, user) => {
				if (err){
					res.statusCode = 500;
					res.setHeader('Content-Type', 'application/json');
					res.json({err: err});
					return ;
				}
				passport.authenticate('local')(req, res, () => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json({success: true, status: 'Registration Successful'});
				});
			});
		}
	});
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {

	passport.authenticate('local', (err, user, info) => {
		if (err)
			return next(err);

		if (!user) {
			res.statusCode = 401;
			res.setHeader('Content-Type', 'application/json');
			res.json({success: false, status: 'Login Failed', err: info});		
		}
		req.logIn(user, (err) => {
			if (err) {
				res.statusCode = 401;
				res.setHeader('Content-Type', 'application/json');
				res.json({success: false, status: 'Login Failed', err: 'Could not log in user!'});
			}
				
			var token = authenticate.getToken({_id: req.user._id});

			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json({success: true, token: token, status: 'Login Successful!'});

	});
	})(req, res, next);
});

router.get('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	}
	else {
		var err = new Error('You are not logged in!');
		err.status = 403;
		next(err);
	}
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
	if (req.user) {
		var token = authenticate.getToken({_id: req.user._id});

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json({success: true, token: token, status: 'You are succcessfully logged in!'});
	}
})

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
	passport.authenticate('jwt', {session: false}, (err, user, info) => {
		if (err)
			return next(err);

		if (!user) {
			res.statusCode = 401;
			res.setHeader('Content-Type', 'application/json');
			res.json({status: 'JWT invalid', success: false, err: info});
		}
		else {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json({success: true, user: user, status: 'JWT Valid!'});
		}

	})(req, res);
})

module.exports = router;
