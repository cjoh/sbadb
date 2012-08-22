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

var recursivePro = function(bizs, cb) {
  if (bizs.length > 0) {
    var boolProps = ['Gcc', 'Edi', 'ExportCd', 'Women', 'Veteran', 'Dav', 'Vietnam', 'RgstrtnCCRInd'];
    var row = bizs.shift();
    convertToBoolean(boolProps, row);
    newBiz = new Biz(row);
    newBiz.save(function(err) {
      if (!err) {
        recursivePro(bizs, cb);
      } else {
        console.log("Error saving newBiz: " + err);
      }
    });
  } else {
    cb();
  }
};

var recursiveNaics = function(naics, cb) {
  if (naics.length > 0) {
    var boolProps = ['NAICSPrimInd', 'NAICSGreenInd', 'NAICSSmllBusInd', 'NAICSEmrgSmllBusInd'];
    var naic = naics.shift();
    convertToBoolean(boolProps, naic);

    Biz.findOne({User_Id: naic.User_Id}, function(err, biz) {
      if (err) console.log("ERR FINDING BIZ");
      else if (biz === null) {
        console.log("NO BIZ MATCHES FOR " + naic.User_Id + ". Moving on...");
        recursiveNaics(naics, cb);
      } else {
        delete naic['User_Id'];
        biz.naics.push(naic);
        biz.save(function(err) {
          if (!err) {
            recursiveNaics(naics, cb);
          } else {
            console.log("Error saving naics biz: " + err);
          }
        });
      }
    });

  } else {
    cb();
  }
};

exports.parse = function(req, res) {
  txtToJson(__dirname + '/../dump/PRO_ID_SAMPLE.TXT', function(bizs){
    recursivePro(bizs, function(){
      txtToJson(__dirname + '/../dump/NAICS_SAMPLE.TXT', function(naics){
        recursiveNaics(naics, function(){
          res.send("Records all loaded!");
        });
      });
    });
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
        doc[keys[j].toLowerCase()] = (typeof vals[j] == 'undefined' || vals[j] === '') ? '' : vals[j].replace(/^\s+|\s+$/g,"");
      }
      retJson.push(doc);
    }
    cb(retJson);
  });
};