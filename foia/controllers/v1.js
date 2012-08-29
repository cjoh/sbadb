var fs = require('fs');
var Biz = require('../model').Biz;
var mongooseApiQuery = require('mongoose-api-query');

var booleanProps = ['gcc', 'edi', 'exportcd', 'women', 'veteran', 'dav', 'vietnam', 'rgstrtnccrind',
                    'naics.naicsprimind', 'naics.naicsgreenind', 'naics.naicssmllbusind', 'naics.naicsemrgsmllbusind'];

exports.index = function(req, res) {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  mongooseApiQuery(req.query, {
    custom_params: function(key, val, searchParams) {
      if (key === "ne_lat") {
        var box = [[parseFloat(req.query['sw_lng']), parseFloat(req.query['sw_lat'])], [parseFloat(req.query['ne_lng']),  parseFloat(req.query['ne_lat'])]];
        console.log(box)
        searchParams["latlon"] = {$within: {$box: box}};
        return true;
      }
    },
    model: Biz,
    per_page: 10
  }, function(query, attributes){

    query.sort('name').exec(function (err, results) {
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
