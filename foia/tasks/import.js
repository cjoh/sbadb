var fs = require('fs')
var mongoose = require('mongoose');
global.DB = mongoose.createConnection('localhost', 'dsbs');
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

var parse = function() {
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

      convertToBoolean(['naicsprimind', 'naicsgreenind', 'naicssmllbusind', 'naicsemrgsmllbusind'], doc);

      Biz.findOne({user_id: doc.user_id}, function(err, biz) {
        if (err) {
          console.log("ERR FINDING BIZ");
          return cb();
        } else if (biz === null) {
          console.log("NO BIZ MATCHES FOR " + doc.user_id + ". Moving on...");
          return cb();
        } else {
          delete doc['user_id'];
          biz.naics.push(doc);
          biz.save(function(err) {
            if (err) return console.log("Error saving newBiz: " + err);
            console.log('naic saved user: ' + biz.user_id + ' naiccd: ' + doc.naicscd);
            return cb();
          });
        }
      });

    }, function(){
      console.log("Fin.");
      process.exit();
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
        console.log(rows.length + ' rows remaining');
        parseLine(rows);
      });
    }

    rows.shift();
    parseLine(rows);
  });
};

parse();