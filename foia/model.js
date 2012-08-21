var mongoose = require('mongoose');
var bizSchema = new mongoose.Schema({

});

bizSchema.statics.createFromDump = function(row) {
  //console.log(row);
};

var Biz = exports.Biz = DB.model('Biz', bizSchema);