var fs = require('fs');
var Biz = require('../model').Biz;
var bizBooleans = require('../model').bizBooleans;

exports.index = function(req, res) {

  var searchParams = {}
    , page = 1
    , skipKeys = ['page', 'near', 'radius'];

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
    if (key.toLowerCase() == 'page'){
      page = parseInt(req.query[key]);
    } else if (key.toLowerCase() == 'near') {
      // divide by 69 to convert miles to degrees
      var maxDistance = (typeof req.query['radius'] === 'undefined' ? 5 : parseFloat(req.query['radius'])) / 69;
      var latlng = req.query[key].split(',');
      searchParams["latlon"] = {$near: [parseFloat(latlng[0]), parseFloat(latlng[1])], $maxDistance: maxDistance};
    } else if (bizBooleans.indexOf(key.toLowerCase()) !== -1) {
      searchParams[key.toLowerCase()] = convertToBoolean(req.query[key]);
      continue;
    }

    if (skipKeys.indexOf(key) !== -1) {
      continue;
    } else {
      searchParams[key.toLowerCase()] = new RegExp(req.query[key], 'i');
    }
  }

  // Query the database and return the results as JSON.
  var per_page = 20,
      skip = (page - 1) * per_page,
      query = Biz.find(searchParams).skip(skip).limit(per_page);

  query.exec(function (err, results) {

    if (err) return handleError(err);

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
