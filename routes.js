exports.init = function(app){
  app.get('/foiaimport', require('./foia/controllers/import').parse);
  //other routes go here
};