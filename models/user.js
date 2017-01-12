var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var salt = '$2a$04$/VN/w3ktES8MKWqhLIckpe';

// User Schema
var UserSchema = new Schema({
    name:String,
    mobile:Number,
    email:String,
	pass:{
		type : String,
		required : true
}
});

var User = mongoose.model('User', UserSchema);
exports.User = User;
exports.createUser = (userDetails, callback)=> {
		bcrypt.hash(userDetails.pwd, salt, (err, hash)=> {
			if(err){
				return console.error(err);
			}
			let newUser = new User();

			newUser.name = userDetails.name;
			newUser.email = userDetails.email;
			newUser.mobile = userDetails.mobile;
			newUser.pass = hash;
	        newUser.save(callback);
	   
	});
}
//*/
export function getUserByUsername(email, callback){
	console.log('Getting user');
	var query = {email: email};
	User.findOne(query, callback);
}

export function getUserById(id, callback){
	console.log('Getting ID');
	User.findById(id, callback);
}

// exports.comparePassword = (candidateUser, candidatePass, salt, callback)=>{
	// User.findOne({"email":candidateUser}, (err, data)=> {
	// 	var x = data["pass"];
	// })
	// console.log(x);
	// bcrypt.compare(candidatePass, x, ( err, isMatch)=> {
    // 	if(err) throw err;
	// 	if(isMatch){
	// 		callback(null, isMatch);
	// 		console.log(x);
	// 	}
	// });
// }
export function comparePassword(candidatePass, salt, callback){	
	console.log('comparing pass',candidatePass);
	bcrypt.compare(candidatePass, salt, (err, isMatch)=> {
    	if(err) throw err;
		console.log('Password match is ',isMatch);
    	callback(null, isMatch);
	});
}