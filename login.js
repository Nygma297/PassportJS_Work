var expressValidator = require('express-validator');
var session = require('express-session');
var exp = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var User = require('./user');
var Contact =  require('./model')
var cookieParser = require('cookie-parser');
var path = require('path');
var app = exp();
app.set('views', path.join(__dirname, 'views'));
mongoose.connect('mongodb://localhost/cbdb');
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'})); 
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(session{secret:'s'})
app.use(exp.static(path.join(__dirname, 'web')));

app.use(session({
    secret: 'Secret'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));
//login module

passport.serializeUser(function(data, done) {
    console.log('Serializing', data);
    done(null, data._id);
});

passport.deserializeUser(function(id, done) {
    console.log('De-serializing');
    User.getUserById(id, function(err, user) {
        console.log('getting by idd');
        done(err, user);
    });
});


passport.use('local', new LocalStrategy(
    function(username, password, done) {
       var  email=username;
       var pass=password;
        console.log("into LocalStrategy ", password);
        User.getUserByUsername(email, function(err, data){
            console.log('Into callback',err,data);
            var x = data;
            // User.findOne({"email":email}, function(err, data){
   	        if(err) throw err;
            if(!data){
                console.log("invalid password");
                return done(null, false, {message: 'ID not registered Please register!'});
   	        }

               User.comparePassword(pass, data['pass'], function(err, data){
   	            if(err) throw err;
                if(data){
                    console.log(x);
       		        return done(null, x);
   	   	        } else {
                        console.log('failed');
        	        return done(null, false, {message: 'Invalid password!'});
   	            }
            });
        });
    }   
));

app.get('/in', function(req, res){
	res.render('login');
});

app.get('/login', passport.authenticate('local', {successRedirect:'/', failureRedirect:'/in'}),
  function(req, res) {
          res.redirect('/');
  });

app.listen(8081, function() {
  console.log('Server running on http://localhost:' + 8081);
});