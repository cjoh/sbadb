exports.init = function(app){
  app.get('/v1/bizs', require('./foia/controllers/v1').index);
  //other routes go here
};