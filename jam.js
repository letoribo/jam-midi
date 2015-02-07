var jazz = require('jazz-midi')
, Jazz = new jazz.MIDI()
, MongoClient = require('mongodb').MongoClient
, express = require('express')
, http = require('http')
, path = require('path');
var out = Jazz.MidiOutOpen(0);
var list = Jazz.MidiOutList();
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(express.favicon('public/images/favicon.ico'));
 
MongoClient.connect('mongodb://localhost:27017/npm', function(err, db) {
  if(err) throw err;
  db.dropCollection('midi', function(err, result){});  
  /* Handling the AngularJS post request*/
  app.post('/post', function (req, res) {
    var msg = req.body.msg;
    Jazz.MidiOutLong(msg);
    res.send(msg);
    var timestamp = req.body.timestamp; 
    var midi = { '_id' : timestamp, 'msg' : msg };
    insert(midi);
  });
  app.post('/list', function (req, res) {
    res.send(list);
  });
  app.post('/rec', function (req, res) {
  	 var msg = req.body.msg;
    Jazz.MidiOutLong(msg);
    res.send(msg);
    db.dropCollection('midi', function(err, result){});
    console.dir("database cleaned");
  });
  app.post('/play', function (req, res) {
  	 var id = req.body;
  	 db.collection('midi').findOne(id, function(err, row) {
      if(err) throw err;
      var msg = row.msg;
      Jazz.MidiOutLong(msg);
      console.dir(msg);
    });
    res.send(id);
  });
  app.post('/out', function (req, res) {
    var out = req.body.out;
    Jazz.MidiOutOpen(out);
    var msg = req.body.msg;
    Jazz.MidiOutLong(msg);     
    res.send(msg); 
    var timestamp = req.body.timestamp;
    var midi = { '_id' : timestamp, 'msg' : msg };
    insert(midi);  
  });
  app.post('/OK', function (req, res) {
    var cursor = db.collection('midi').find();	
    cursor.toArray(function(err, docs){
      var timestamps = docs.map(function(obj){
        return obj._id;
      });
      res.send(timestamps);
      console.log("retrieved records:");
      console.log(docs);
    });
  });
  app.post('/panic', function (req, res) {
  	 var msg = req.body.msg;
    Jazz.MidiOutLong(msg);
    res.send(msg);
  }); 
  /* Querying MongoDB*/
  var insert = function (midi) {
  	 db.collection('midi').insert(midi, function(err, inserted) {
      if(err) throw err;
      console.dir("Successfully inserted: " + JSON.stringify(inserted));
    });
  } 
});

http.createServer(app).listen(3003, function () {
  console.log("Express server listening on port 3003");
});