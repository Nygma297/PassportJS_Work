var exp = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
// var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var User = require('./models/user');
var Contact =  require('./models/model')
var app = exp();
var path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'})); 
app.set('view engine', 'handlebars');

mongoose.connect('mongodb://localhost/cbdb');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(exp.static(path.join(__dirname, 'web')));

app.use(session({
    secret: 'Secret'
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/',(req,rea,cb)=>{
    console.log('Requesting '+req.url);
    cb();
});
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

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

//Register Module
app.get('/reg', function(req, res){
	res.render('register');
});
app.get('/register', function(req, res){
    User.createUser(req.query, function(err, user){
		if(err) throw err;
		console.log(user);
	});
	res.redirect('/in');
    //  newUser.save(function(err, data) {
    //      if(err) {
    //          res.send('error saving data');
    //      } else {
    //          console.log(data);
    //      }         
    // });		
    // req.flash('success_msg', 'Registered? Go on log-in!');
//*/
 });


app.get('/', ensureAuthenticated, function(req, res){
        console.log('getting all contacts ');
    var temp = Contact.find({userid: req.user.id})
    .exec(function(err, contacts) {
        if(err) {
            res.send('error occured')
        } else {
            console.log(contacts);
            res.render('index', {temp: contacts} );
        }
    });
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		// req.flash('error_msg','Welcome! lets get you in!');
		res.redirect('/in');
	}
}
// Module end

//login module

passport.serializeUser(function(data, done) {
    console.log('Serializing', data);
    data._id
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
       var email=username;
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
// Module end

// Logout Module

app.get('/out', function(req, res){
	req.logout();

	// req.flash('success_msg', 'You Logged Out! Wanna Go again?');

	res.redirect('/in');
});
// Module end

// module.exports = app;
// app.use(flash());

/*app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('Success!');
  res.locals.error_msg = req.flash('Errror Occured!');
  res.locals.error = req.flash('Error Encountered');
  res.locals.user = req.user || null;
  next();
});
//*/
// app.get('/index.html', function(req, res){
	// res.sendFile(__dirname + '/' + 'index.html');
// });

app.get('/', function(req, res) {

});

app.get('/contacts2', function(req, res) {
    console.log('Removing the specified contact!');
    Contact.findOne({ name: req.body.name}, function(err, data){
        if(err){
            return console.error(err);
        }else{
            Contact.remove(function(err){
            if(err){
                return console.error(err);
            }})
        }
    })
    .exec(function(err, contacts) {
        if(err) {
            res.send('error occured')
        } else {
            console.log(contacts);
            res.json(contacts);
        }
    });
});
//*/

app.post('/data', function(req, res) {

    var newEntry = new Contact();

    var w = newEntry.userid = req.user.id;
    var x = newEntry.name = req.body.name;
    var y = newEntry.email = req.body.email;
    var z = newEntry.mobile = req.body.mobile;

    newEntry.save(function(err, data) {
        if(err) {
            res.send('error saving data');
        } else {
            console.log(data);
        }
        var data = {
            _id: w, name: x, email: y, mobile: z
        };
            res.redirect('/');
    });
})

/*
app.post('/data2', function(req, res) {
  Book.create(req.body, function(err, book) {
    if(err) {
      res.send('error saving book');
    } else {
      console.log(book);
      res.send(book);
    }
  }); 
});
//*/

app.get('/up', function(req, res){
	Contact.findOneAndUpdate({name: req.params.name}, {$set:{name:req.body.n_name, email: req.body.email, mobile: req.body.mobile}}, {upsert:false}, function(err, data){
		if(err){
			console.log('Error Encountered!');
		}else{
			console.log(data);
            res.render('w')
			res.send(204);
			}
	})
}) 

app.get('/del', function(req, res) {
    var x = req.query.id;
    console.log(x);
    Contact.findOneAndRemove({'_id':x}, function(err, data) {
        if(err) {
            res.send('error removing')
        } else {
            res.redirect('/');
        }});
    });
//*/

app.listen(8081, function() {
  console.log('Server running on http://localhost:' + 8081);
});