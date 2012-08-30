var fs = require('fs');
var Biz = require('../model').Biz;
var mongooseApiQuery = require('mongoose-api-query');

var booleanProps = ['gcc', 'edi', 'exportcd', 'women', 'veteran', 'dav', 'vietnam', 'rgstrtnccrind',
                    'naics.naicsprimind', 'naics.naicsgreenind', 'naics.naicssmllbusind', 'naics.naicsemrgsmllbusind'];

exports.index = function(req, res) {

  var pageOptions = {perPage: 10, page: req.query.page || 1};
  var query = Biz.apiQuery(req.query, pageOptions).sort('name');
  var response = {};

  if (req.query.ne_lat) {
    var box = [[parseFloat(req.query['sw_lng']), parseFloat(req.query['sw_lat'])], [parseFloat(req.query['ne_lng']),  parseFloat(req.query['ne_lat'])]];
    query.within.box(box);
  }

  query.exec(function (err, results) {
    if (err) res.send({err:err});
    else {
      response.results = results;
      response.meta = pageOptions;

      query.count(function(err, count){
        response.meta.count = count;
        response.meta.totalPages = Math.ceil(count / pageOptions.perPage);
        res.send(response);
      });
    }
  });
};

exports.show = function(req, res) {

  var q = Biz.findOne({user_id: req.params.user_id}, function(err, biz) {
    if (err) res.send({err: err});
    else {
      res.send(biz);
    }
  });
};
