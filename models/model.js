var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cb = new Schema({
    
    userid:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},    
    name:String,
    mobile:Number,
    email:String
});

module.exports = mongoose.model('Contact', cb); 