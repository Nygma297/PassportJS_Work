var express = require('express');
var app = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
app.get('/register', function(req, res){
	res.render('register');
});

// Login
app.get('/login', function(req, res){
	res.render('login');
});

// Register User
app.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.user;
	var password = req.body.pwd;
	var cpassword = req.body.cpwd;

	req.checkBody('cpassword', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: pwd
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'Registered? Go on log-in!');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, data){
   		if(err) throw err;
   		if(data){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

app.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You Logged Out! Wanna Go again?');

	res.redirect('/users/login');
});

module.exports = app;