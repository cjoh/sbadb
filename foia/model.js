var mongoose = require('mongoose');

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
  latlon: Array
});

//bizSchema.index({'latlon':'2d'});

bizSchema.statics.createFromDump = function(row) {

};

exports.Biz = DB.model('Biz', bizSchema);