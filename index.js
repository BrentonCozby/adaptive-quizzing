"use strict";
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

/*DB stuff */
mongoose.connect('mongodb://localhost:27017/adaptive-quizzing');
mongoose.connection.once('open', ()=>console.log('Connected to DB!'));
const Question = require('./models/Question.js');
const Topic = require('./models/Topic.js');
const User = require('./models/User.js');
mongoose.Promise = global.Promise;
User.findOne({username: 'vmoreno'}, (err, person) => {
  if (err) console.log(err);
  else if (!person){
    new User({
      username: 'vmoreno',
      password: 'abc123',
      admin: true
    }).save().then( ()=>console.log("saved admin user"));

  }
  else console.log('Found person: '+JSON.stringify(person));
});


/*App and middlewares */
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('static'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'l4kjafkjefbgkjlfdsn4slvd',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: 'mongodb://localhost/sessions'
  })
}));

app.use((req,res,next)=>{
//  console.log('session:');
//  console.log(req.session);
  if ( shouldNotAuth(req) ) return next();
  else res.redirect('/login.html');
})


/* Routes */
//app.get('/login', (req,res)=>res.render('login'));
app.get('/', (req,res)=>{
  console.log('request to /');
  res.render('main', {username: req.session.username});
});

app.get('/quiz', (req,res)=>{
  console.log('request to /quiz');
  res.render('quiz');
});

require('./routes/questions.js')(app, Question);
require('./routes/topics.js')(app, Topic);
require('./routes/users.js')(app, User);
require('./routes/quiz.js')(app, Question);

function shouldNotAuth(req){
  const openPaths = ['/api/users/login',
                     '/api/users/student',
                     '/api/users/register',
                     '/quiz',
                     'logout'];
  return req.session.isAuthenticated || openPaths.indexOf(req.path) >= 0;

}

const port = 3333;
app.listen(port, ()=> console.log('App listening on port ', port));
