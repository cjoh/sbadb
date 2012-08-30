exports.init = function(app){
  app.get('/v1/bizs', require('./controllers/v1').index);
  app.get('/v1/bizs/:id', require('./controllers/v1').single);
};