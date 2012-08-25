var fs = require('fs');
var Biz = require('../model').Biz;

var convertToBoolean = function(props, json) {
  for (var i=0, len = props.length; i<len; i++) {
    if (typeof json[props[i]] == 'undefined') continue;
    if (json[props[i]].toUpperCase() == 'Y') {
      json[props[i]] = true
    } else {
      json[props[i]] = false
    }
  }
};

exports.parse = function(req, res) {
  importFromTxt(__dirname + '/../dump/PRO_ID.TXT', function(doc, cb){
    // save function
    convertToBoolean(['gcc', 'edi', 'exportcd', 'women', 'veteran', 'dav', 'vietnam', 'rgstrtnccrind'], doc);
    newBiz = new Biz(doc);
    newBiz.save(function(err) {
      if (err) return console.log("Error saving newBiz: " + err);
      return cb();
    });

  }, function(){

    importFromTxt(__dirname + '/../dump/NAICS.TXT', function(doc, cb){

      convertToBoolean(['NAICSPrimInd', 'NAICSGreenInd', 'NAICSSmllBusInd', 'NAICSEmrgSmllBusInd'], doc);

      Biz.findOne({User_Id: doc.User_Id}, function(err, biz) {
        if (err) {
          console.log("ERR FINDING BIZ");
        } else if (biz === null) {
          return console.log("NO BIZ MATCHES FOR " + doc.User_Id + ". Moving on...");
        } else {
          delete doc['User_Id'];
          biz.naics.push(doc);
          biz.save(function(err) {
            if (err) return console.log("Error saving newBiz: " + err);
            console.log('naic saved');
            return cb();
          });
        }
      });

    }, function(){
      res.send('fin');
    });
  });

};

var importFromTxt = function(filepath, saveFn, cb) {
  fs.readFile(filepath, 'ascii', function (err,data) {
    if (err) return console.log("ERROR! -- \n" + err);

    var rows = data.split("\n");
    var keys = rows[0].split('\t');
    var numkeys = keys.length;

    var parseLine = function (rows) {
      var firstRow = rows.shift();
      if (rows.length === 0) return cb();
      var vals = firstRow.split('\t');
      var doc = {};

      for (var j=0; j<numkeys; j++){
        doc[keys[j].toLowerCase()] = (typeof vals[j] == 'undefined' || vals[j] === '') ? '' : vals[j].replace(/^\s+|\s+$/g,"");
      }

      saveFn(doc, function(){
        console.log(rows.length + ' bizs remaining');
        parseLine(rows);
      });
    }

    rows.shift();
    parseLine(rows);
  });
};