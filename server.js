var exp = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
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
//importing functions
import{getUserById, getUserByUsername, comparePassword, createUser} from 'models/user';
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
    errorFormatter: (param, msg, value)=> {
        let namespace = param.split('.')
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
app.get('/reg', (req, res)=>{
	res.render('register');
});
app.get('/register', (req, res)=> {
    User.createUser(req.query, (err, user)=> {
		if(err) throw err;
		console.log(user);
	});
	res.redirect('/in');
 });


app.get('/', ensureAuthenticated, (req, res) => {
        console.log('getting all contacts ');
    var temp = Contact.find({userid: req.user.id})
    .exec((err, contacts) => {
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
		res.redirect('/in');
	}
}
// Module end

//login module

passport.serializeUser((data, done)=> {
    console.log('Serializing', data);
    done(null, data._id);
});

passport.deserializeUser((id, done)=> {
    console.log('De-serializing');
    User.getUserById(id, (err, user)=> {
        console.log('getting by idd');
        done(err, user);
    });
});


passport.use('local', new LocalStrategy(
    (username, password, done)=> {
       let email=username;
       let pass=password;
        console.log("into LocalStrategy ", password);
        User.getUserByUsername(email, (err, data)=>{
            console.log('Into callback',err,data);
            let x = data;
   	        if(err) throw err;
            if(!data){
                console.log("invalid password");
                return done(null, false, {message: 'ID not registered Please register!'});
   	        }

               User.comparePassword(pass, data['pass'], (err, data)=>{
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

app.get('/in', (req, res)=>{
	res.render('login');
});

app.get('/login', passport.authenticate('local', {successRedirect:'/', failureRedirect:'/in'}),
  (req, res)=> {
    res.redirect('/');
  });
// Module end

// Logout Module

app.get('/out', (req, res)=>{
	req.logout();
	res.redirect('/in');
});
// Module end

app.get('/', (req, res)=>{

});

app.get('/contacts2', (req, res)=> {
    console.log('Removing the specified contact!');
    Contact.findOne({ name: req.body.name}, (err, data)=>{
        if(err){
            return console.error(err);
        }else{
            Contact.remove((err)=>{
            if(err){
                return console.error(err);
            }})
        }
    })
    .exec((err, contacts)=> {
        if(err) {
            res.send('error occured')
        } else {
            console.log(contacts);
            res.json(contacts);
        }
    });
});

app.post('/data', (req, res) =>{

    var newEntry = new Contact();

    let w = newEntry.userid = req.user.id;
    let x = newEntry.name = req.body.name;
    let y = newEntry.email = req.body.email;
    let z = newEntry.mobile = req.body.mobile;

    newEntry.save((err, data) =>{
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

app.get('/up', (req, res)=>{
	Contact.findOneAndUpdate({name: req.params.name}, {$set:{name:req.body.n_name, email: req.body.email, mobile: req.body.mobile}}, {upsert:false}, (err, data)=>{
		if(err){
			console.log('Error Encountered!');
		}else{
			console.log(data);
            res.render('w')
			res.send(204);
			}
	})
}) 

app.get('/del', (req, res)=> {
    let x = req.query.id;
    console.log(x);
    Contact.findOneAndRemove({'_id':x}, (err, data)=> {
        if(err) {
            res.send('error removing')
        } else {
            res.redirect('/');
        }});
    });

app.listen(8081, ()=> {
  console.log('Server running on http://localhost:' + 8081);
});