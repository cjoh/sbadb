exports.init = function(app){
  app.get('/foiaimport', require('./foia/controllers/import').parse);
  app.get('/v1/bizs', require('./foia/controllers/v1').index);
  //other routes go here
};