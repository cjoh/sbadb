var fs = require('fs');
var Biz = require('./model').Biz;
exports.parse = function(req, res) {
  fs.readFile(__dirname + '/dump/PRO_ID.TXT', 'ascii', function (err,data) {
    if (err) {
      return console.log("ERROR! -- \n" + err);
    }
    var rows = data.split("\n");
    var len = rows.length;
    for (var i=0; i<len; i++) {
      var row = rows[i];
      Biz.createFromDump(row);
    }
    res.send(len + " records loaded");
  });
};