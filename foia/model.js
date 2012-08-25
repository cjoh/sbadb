var mongoose = require('mongoose');
var request = require('superagent');

var bizBooleans = exports.bizBooleans = ['gcc', 'edi', 'exportcd', 'women', 'veteran', 'dav', 'vietnam', 'rgstrtnccrind',
                                             'naics.naicsprimind', 'naics.naicsgreenind', 'naics.naicssmllbusind',
                                             'naics.naicsemrgsmllbusind'];

var bizSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  address: String,
  address1: String,
  city: String,
  cnty: String,
  state: String,
  zip: String,
  phone: String,
  fax: String,
  cdist: String,
  msa: String,
  duns: String,
  cage: String,
  yrest: String,
  contact: String,
  title: String,
  url: String,
  gcc: {type: Boolean, default: false},
  edi: {type: Boolean, default: false},
  busparntdunsnmb: String,
  exportcd: {type: Boolean, default: false},
  exporctobjtvtxt: String,
  technetind: String,
  emall: String,
  tof: String,
  minc: String,
  women: {type: Boolean, default: false},
  veteran: {type: Boolean, default: false},
  dav: {type: Boolean, default: false},
  vietnam: {type: Boolean, default: false},
  rgstrtnccrind: {type: Boolean, default: false},
  buslastupdtdt: Date,
  latlon: Array,

  naics: [ new mongoose.Schema({
    naicscd: Number,
    naicsyrnmb: Number,
    naicsprimind: {type: Boolean, default: false},
    naicsgreenind: {type: Boolean, default: false},
    naicssmllbusind: {type: Boolean, default: false},
    naicsemrgsmllbusind: {type: Boolean, default: false}
  })]
  //alt simpler NAICS
  //naics: Array
});

bizSchema.index({'latlon':'2d'});

bizSchema.pre('save', true, function (next, done) {
  var biz = this;

  request.get('http://50.17.218.115/street2coordinates/' + this.address + ' '
               + this.city + ', ' + this.state + ' ' + this.zip)
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
