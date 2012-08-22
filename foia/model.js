var mongoose = require('mongoose');
var request = require('superagent');

var bizSchema = new mongoose.Schema({
  User_Id: String,
  Name: String,
  Address: String,
  Address1: String,
  City: String,
  Cnty: String,
  State: String,
  Zip: String,
  Phone: String,
  Fax: String,
  Cdist: String,
  Msa: String,
  Duns: String,
  Cage: String,
  Yrest: String,
  Contact: String,
  Title: String,
  Url: String,
  Gcc: {type: Boolean, default: false},
  Edi: {type: Boolean, default: false},
  BusParntDUNSNmb: String,
  ExportCd: {type: Boolean, default: false},
  ExporctObjtvTxt: String,
  TechnetInd: String,
  Emall: String,
  Tof: String,
  Minc: String,
  Women: {type: Boolean, default: false},
  Veteran: {type: Boolean, default: false},
  Dav: {type: Boolean, default: false},
  Vietnam: {type: Boolean, default: false},
  RgstrtnCCRInd: {type: Boolean, default: false},
  BusLastUpdtDt: Date,
  latlon: Array,

  naics: [ new mongoose.Schema({
    NAICSCd: Number,
    NAICSYrNmb: Number,
    NAICSPrimInd: {type: Boolean, default: false},
    NAICSGreenInd: {type: Boolean, default: false},
    NAICSSmllBusInd: {type: Boolean, default: false},
    NAICSEmrgSmllBusInd: {type: Boolean, default: false}
  })]
  //alt simpler NAICS
  //naics: Array
});

bizSchema.index({'latlon':'2d'});

bizSchema.pre('save', true, function (next, done) {
  var biz = this;

  request.get('http://50.17.218.115/street2coordinates/' + this.Address + ' '
               + this.City + ', ' + this.State + ' ' + this.Zip)
  .end(function(res){
    if (res.ok) {
      var json = JSON.parse(res.text);
      var results = json[Object.keys(json)[0]];
      biz.latlon = [results['longitude'], results['latitude']];
      console.log('Geocoded!');
    } else {
      console.log('Oh no! error!');
    }
    done();
  });

 next();
});

exports.Biz = DB.model('Biz', bizSchema);