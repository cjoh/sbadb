exports.init = function(app){
  app.get('/foiaimport', require('./foia/controller').parse);
  //other routes go here
};