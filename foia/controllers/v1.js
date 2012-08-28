var fs = require('fs');
var Biz = require('../model').Biz;

var booleanProps = ['gcc', 'edi', 'exportcd', 'women', 'veteran', 'dav', 'vietnam', 'rgstrtnccrind',
                    'naics.naicsprimind', 'naics.naicsgreenind', 'naics.naicssmllbusind', 'naics.naicsemrgsmllbusind'];

exports.index = function(req, res) {

  var convertToBoolean = function (str) {
    if (str.toLowerCase() === "true" ||
        str.toLowerCase() === "t" ||
        str.toLowerCase() === "yes" ||
        str.toLowerCase() === "y" ||
        str === "1"){
      return true;
    } else {
      return false;
    }
  }

  var searchParams = {}
    , page
    , per_page = 100
    , skip
    , query;

  var parseSchemaForKey = function (schema, keyPrefix, lcKey, val, option) {

    var addSearchParam = function (param) {
      console.log(param)
      for (key in param) {
        searchParams[keyPrefix + key] = param[key];
      }
    }

    var param = {};

    if (matches = lcKey.match(/(.+)\.(.+)/)) {
      // parse subschema
      if (schema.paths[matches[1]].constructor.name === "DocumentArray") {
        parseSchemaForKey(schema.paths[matches[1]].schema, matches[1] + ".", matches[2], val, option)
      }

    } else if (lcKey === "" || typeof schema.paths[lcKey] === "undefined"){
      // nada

    } else if (schema.paths[lcKey].constructor.name === "SchemaBoolean") {
      param[lcKey] = convertToBoolean(val);

    } else if (schema.paths[lcKey].constructor.name === "SchemaString") {

      if (val.match(/([0-9]+,?)/)) {
        if (option === "all") {
          param[lcKey] = {$all: val.split(',')};
        } else {
          param[lcKey] = {$in: val.split(',')};
        }
      } else if (val.match(/([0-9]+)/)) {
        if (option === "gt" ||
            option === "gte" ||
            option === "lt" ||
            option === "lte") {
          param[lcKey] = {};
          param[lcKey]["$" + option] = val;
        } else {
          param[lcKey] = val;
        }
      } else {
        param[lcKey] = {$regex: val, $options: "-i"};
      }


    } else if (schema.paths[lcKey].constructor.name === "SchemaNumber") {

      if (val.match(/([0-9]+,?)/)) {
        if (option === "all") {
          param[lcKey] = {$all: val.split(',')};
        } else {
          param[lcKey] = {$in: val.split(',')};
        }
      } else if (val.match(/([0-9]+)/)) {
        if (option === "gt" ||
            option === "gte" ||
            option === "lt" ||
            option === "lte") {
          param[lcKey] = {};
          param[lcKey]["$" + option] = val;
        } else {
          param[lcKey] = val;
        }
      }
    }

    if (param) addSearchParam(param);
  }


  // Construct searchParams
  for (key in req.query) {
    var lcKey = key.toLowerCase()
      , val = req.query[key]
      , option;

    if (lcKey === "page") {
      page = parseInt(val);

    } else if (lcKey === "near") {
      // divide by 69 to convert miles to degrees
      // default to 5 miles
      var maxDistance = (typeof req.query['radius'] === 'undefined' ? 5 : parseFloat(req.query['radius'])) / 69;
      var latlng = val.split(',');
      searchParams["latlon"] = {$near: [parseFloat(latlng[0]), parseFloat(latlng[1])], $maxDistance: maxDistance};

    } else {
      parseSchemaForKey(Biz.schema, "", lcKey, val, option);
    }
  }

  // Query the database and return the results as JSON.
  skip = (page - 1) * per_page,
  query = Biz.find(searchParams).skip(skip).limit(per_page);

  console.log(searchParams)

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
