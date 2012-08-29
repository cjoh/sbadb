var fs = require('fs');
var Biz = require('../model').Biz;
var mongooseApiQuery = require('mongoose-api-query');

var booleanProps = ['gcc', 'edi', 'exportcd', 'women', 'veteran', 'dav', 'vietnam', 'rgstrtnccrind',
                    'naics.naicsprimind', 'naics.naicsgreenind', 'naics.naicssmllbusind', 'naics.naicsemrgsmllbusind'];

exports.index = function(req, res) {

  mongooseApiQuery(req.query, {
    custom_params: function(key, val, searchParams) {
      if (key === "near") {
        // divide by 69 to convert miles to degrees
        // default to 5 miles
        var maxDistance = (typeof req.query['radius'] === 'undefined' ? 5 : parseFloat(req.query['radius'])) / 69;
        var latlng = val.split(',');
        searchParams["latlon"] = {$near: [parseFloat(latlng[0]), parseFloat(latlng[1])], $maxDistance: maxDistance};
        return true;
      }
    },
    model: Biz,
    per_page: 100
  }, function(query, attributes){

    query.exec(function (err, results) {
      if (err) return console.log(err);

      var response = {};
      response.results = results;
      response.meta = {page: attributes.page, per_page: attributes.per_page }

      Biz.count(attributes.searchParams, function(err, count){
        response.meta.count = count;
        response.meta.total_pages = Math.ceil(count / attributes.per_page);
        res.send(response);
      });

    });
  });

};
