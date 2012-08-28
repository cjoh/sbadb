module.exports = function(req, options, callback) {

  var context = this;

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
    , page = 1
    , per_page = 100
    , skip
    , query;

  var parseSchemaForKey = function (schema, keyPrefix, lcKey, val, option) {

    var addSearchParam = function (param) {
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

      if (val.match(/([0-9]+,?)/) && val.match(',')) {
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

      if (val.match(/([0-9]+,?)/) && val.match(',')) {
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
      , val = req.query[key].replace(/{(.*)}/, '')
      , option;

    if (matches = req.query[key].match(/{(.*)}/)){
      option = matches[1];
    }

    if (options.custom_params.call(context, key, val, searchParams) === true) {
      continue;
    }

    if (lcKey === "page") {
      page = parseInt(val);

    } else {
      parseSchemaForKey(options.model.schema, "", lcKey, val, option);
    }
  }

  // Query the database and return the results as JSON.
  skip = (page - 1) * per_page,
  query = options.model.find(searchParams).skip(skip).limit(per_page);

  console.log(searchParams)

  var attributes = {
    page: page,
    per_page: per_page,
    searchParams: searchParams
  };

  callback(query, attributes);

}