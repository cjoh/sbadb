var fs = require('fs');
var Biz = require('../model').Biz;

var booleanProps = ['gcc', 'edi', 'exportcd', 'women', 'veteran', 'dav', 'vietnam', 'rgstrtnccrind',
                    'naics.naicsprimind', 'naics.naicsgreenind', 'naics.naicssmllbusind', 'naics.naicsemrgsmllbusind'];

exports.index = function(req, res) {

  var searchParams = {}
    , page = 1;

  var convertToBoolean = function (str) {
    if (str.toLowerCase() === "true" ||
        str.toLowerCase() === "t" ||
        str === "1"){
      return true;
    } else {
      return false;
    }
  }

  // Construct new searchParams object, using lowercase keys
  // and case-insensitive values.
  for (key in req.query) {
    var lcKey = key.toLowerCase()
      , val = req.query[key];

    if (lcKey == 'page'){
      page = parseInt(val);

    } else if (lcKey == 'near') {
      // divide by 69 to convert miles to degrees
      // default to 5 miles
      var maxDistance = (typeof req.query['radius'] === 'undefined' ? 5 : parseFloat(req.query['radius'])) / 69;
      var latlng = val.split(',');
      searchParams["latlon"] = {$near: [parseFloat(latlng[0]), parseFloat(latlng[1])], $maxDistance: maxDistance};

    } else if (lcKey == 'radius') {
      // see above

    } else if (booleanProps.indexOf(lcKey) !== -1) {
      searchParams[lcKey] = convertToBoolean(val);

    } else if (!isNaN(parseInt(val))) {
      searchParams[lcKey] = val;
    } else {
      searchParams[lcKey] = {$regex: val, $options: "-i"};
    }
  }

  // Query the database and return the results as JSON.
  var per_page = 20,
      skip = (page - 1) * per_page,
      query = Biz.find(searchParams).skip(skip).limit(per_page);

  query.exec(function (err, results) {

    if (err) return console.log(err);

    var response = {};
    response.results = results;
    response.meta = {page: page, per_page: per_page }

    Biz.count(searchParams, function(err, count){
      response.meta.count = count;
      response.meta.total_pages = Math.ceil(count / per_page);
      res.send(response);
    });

  });
};
