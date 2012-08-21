var fs = require('fs');
var Biz = require('./model').Biz;

var convertToBoolean = function(bit) {
  if (typeof bit == 'undefined') return false;
  if (bit.toUpperCase() == 'Y') {
    return true;
  } else {
    return false;
  }
};

exports.parse = function(req, res) {
  console.log("calling parse");
  txtToJson(__dirname + '/dump/PRO_ID.TXT', function(json){
    console.log("Back with the json");
    var boolProps = ['Gcc'];
    for (var i=0, leni = json.length; i<leni; i++) {
      for (var j=0, lenj = boolProps.length; j<lenj; j++) {
        json[i][boolProps[j]] = convertToBoolean(json[i][boolProps[j]]);
      }
    }
    res.send(json.length + " records loaded");
  });
};

var txtToJson = function(filepath, cb) {
  fs.readFile(filepath, 'ascii', function (err,data) {
    if (err) {
      return console.log("ERROR! -- \n" + err);
    }
    var rows = data.split("\n");
    var keys = rows.shift().split('\t');
    var numkeys = keys.length;
    var retJson = [];
    for (var i=0, len = rows.length; i<len; i++) {
      var vals = rows[i].split('\t');
      var doc = {};
      for (var j=0; j<numkeys; j++){
        doc[keys[j]] = (typeof vals[j] == 'undefined' || vals[j] === '') ? '' : vals[j].replace(/^\s+|\s+$/g,"");
      }
      retJson.push(doc);
    }
    console.log("calling the cb");
    cb(retJson);
  });
};