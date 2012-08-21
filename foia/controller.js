var fs = require('fs');
var Biz = require('./model').Biz;

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
  txtToJson(__dirname + '/dump/PRO_ID_SAMPLE.TXT', function(json){
    var boolProps = ['Gcc', 'Edi', 'ExportCd', 'Women', 'Veteran', 'Dav', 'Vietnam', 'RgstrtnCCRInd'];
    for (var i=0, leni = json.length; i<leni; i++) {
      convertToBoolean(boolProps, json[i]);

      newBiz = new Biz(json[i]);
      newBiz.save();
      // console.log(json[i]);
    }
    res.send(json.length + " records loaded");
  });

  // // Jed: what is wrong with this?
  // txtToJson(__dirname + '/dump/NAICS_SAMPLE.TXT', function(json){
  //   var boolProps = ['NAICSPrimInd', 'NAICSGreenInd', 'NAICSSmllBusInd', 'NAICSEmrgSmllBusInd'];
  //   for (var i=0, leni = json.length; i<leni; i++) {
  //     convertToBoolean(boolProps, json[i]);

  //     naic = json[i];

  //     biz = Biz.findOne({'User_Id': json[i]['User_Id']}, function(err, biz) {
  //       if (err) return handleError(err);
  //       if (biz == null) return console.log('not found');

  //       delete naic['User_Id'];
  //       biz.naics.push(naic);

  //       console.log(naic);

  //       biz.save();
  //     });
  //   }
  //   res.send(json.length + " records loaded");
  // });

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
    cb(retJson);
  });
};