"use strict";


module.exports = function(app, Topic){
  app.get('/api/topics', function(req, res){
    console.log('Received GET request to /topics');
    Topic.find()
    .exec( (err, docs)=> err?res.end(err):res.json(docs))
  });
  
  app.post('/api/topics', function(req, res){
    console.log('Received POST request to /topics');
    console.log(JSON.stringify(req.body));
    let t = new Topic(req.body);
    t.save()
    .then(err=>{
      if (err) res.end(err);
      else res.json({message: 'Topic added to db', data: t});
    });
  });
  
  app.get('/api/create-topic', function(req, res){
    res.render('load-topic');
  });
};