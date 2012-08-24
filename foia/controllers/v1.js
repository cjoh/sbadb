var fs = require('fs');
var Biz = require('../model').Biz;

exports.index = function(req, res) {

  var searchParams = {}
    , page = 1;

  // Construct new searchParams object, using lowercase keys
  // and case-insensitive values.
  for (key in req.query) {
    if (key.toLowerCase() == 'page'){
      page = parseInt(req.query[key]);
      continue;
    }
    searchParams[key.toLowerCase()] = new RegExp(req.query[key], 'i');
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
      res.send(response);
    });

  });
};
