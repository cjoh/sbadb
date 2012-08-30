var mongoose = require('mongoose');
var request = require('superagent');

var geocodeCacheSchema = new mongoose.Schema({
  address: String,
  latlon: Array
});

var bizSchema = new mongoose.Schema({
  user_id: {type: String, index: true},
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

bizSchema.pre('save', function (next) {
  var biz = this;

  if (biz.latlon.length === 0){
    var full_address = this.address + ' ' + this.city + ', ' + this.state + ' ' + this.zip;

    cachedGeocodes = GeocodeCache.findOne({address: full_address}, function(err, result) {
      if (err || result === null) {
        request.get('http://50.17.218.115/street2coordinates/' + full_address)
        .end(function(res){
          if (res.ok) {
            var json = JSON.parse(res.text);
            var results = json[Object.keys(json)[0]];
            if (results == null) {
              console.log("Couldn't geocode the following:");
              console.log(json);
              next();
            } else {
              biz.latlon = [results['longitude'], results['latitude']];
              var newCache = new GeocodeCache({address: full_address, latlon: biz.latlon});
              newCache.save();
              console.log('Geocoded! ' + results['longitude'] + ', ' + results['latitude']);
            }
          } else {
            console.log('Oh no! error!');
          }
          next();
        });
      } else {
        biz.latlon = result.latlon;
        console.log('geocoded from cache');
        next();
      }
    });



  } else {
    next();
  }

});

exports.Biz = DB.model('Biz', bizSchema);
exports.GeocodeCache = GeocodeCache = DB.model('GeocodeCache', geocodeCacheSchema);
