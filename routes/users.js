"use strict";
const bcrypt = require('bcryptjs');

module.exports = function(app, User){
  app.post('/api/users/login', function(req, res){
    console.log('GET request to /api/users/login');
    User.findOne({ 'username' : req.body.username})
    .then(user=>{
      if (user){
        //compare password
        if (bcrypt.compareSync(req.body.password, user.password)){
          console.log('correctly authenticated user '+user.username);
          prepSession(req, user);
          res.redirect('/');
        }
        else{
          res.end('wrong password');
        }
      }
      else{
        res.end('No user');
      }
    })
    .catch(err=>{
      console.log('error in api/users/login route ', err.toString());
      res.end(err.toString());
    });
  });

  app.get('/api/users/student', function(req, res){
    User.findOne({ 'username' : 'vmoreno'})
    .then(user=>{
      prepSession(req, user);
      res.redirect('/quiz');
    });
  });

  app.post('/api/users/register', function(req,res){
    User.find({'username': req.body.username})
    .then(user=>{
      if (user.length){
        console.log('/api/users/register route tried to create user that already exists: '+req.body.username);
        res.end('error: username already exists');
      }
      else{
        let u = new User(req.body);
        u.save()
        .then(dbres=>{
          console.log(('success registering: \n'+JSON.stringify(dbres)));
          prepSession(req, u);
          res.redirect('/');
        })
        .catch(err=>{res.end('error: '+err.toString())});
      }
    })
    .catch(err=>{
      console.log('error in api/users/register route ', err.toString());
      res.end(err.toString());
    });
  });

  app.get('/logout', function(req,res){
    req.session.isAuthenticated = false;
    delete req.session.username;
    res.redirect('/login.html');
  });
};

function prepSession(req, user){
  req.session.isAuthenticated = true;
  req.session.username = user.username;
  req.session.uid = user._id;
  console.log(req.session.username);
}
