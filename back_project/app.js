var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var matchingRouter = require('./routes/matching');
var companyRouter = require('./routes/company');

var app = express();
const sqlite3 = require('sqlite3')
const dataBase = 'dataBase.sqlite3'


//database connexion
var db = new sqlite3.Database(dataBase,err=>{
  if(err) throw err
  console.log('Database connected');
})

 db.run("CREATE TABLE IF NOT EXISTS companies (id INTEGER PRIMARY KEY, source_id NUMBER, name TEXT, website TEXT, email TEXT,phone NUMBER, address TEXT, postal_code NUMBER, city TEXT, country TEXT,source_name TEXT)");
 db.run('CREATE TABLE IF NOT EXISTS Matching(id INTEGER PRIMARY KEY, company_id_datasetA NUMBER, number_matches_datasetB NUMBER,valid TEXT)');
db.run('drop table companies')
app.use(function(req,res,next){ 
  req.db=db;
  next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/matching', matchingRouter);
app.use('/company', companyRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
