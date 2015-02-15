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
var db, song;

MongoClient.connect('mongodb://localhost:27017/npm', function(err, database) {
  if(err) throw err;
  db = database;  
  http.createServer(app).listen(3003, function () {
    console.log("Express server listening on port 3003");
  });
});
 
/*Handling the AngularJS post request*/
app.post('/post', function (req, res) {
  var msg = req.body.msg;
  Jazz.MidiOutLong(msg);
  res.send("received: " + msg);
  var timestamp = req.body.timestamp;
  if (!timestamp) song = false; 
  var midi = { '_id' : timestamp, 'msg' : msg };
  if (song) insert(song, midi);
});
app.post('/list', function (req, res) {
  res.send(list);
});
app.post('/songs', function (req, res) {
  db.collections(function(err, collections){
  	 var colls = collections.map(function(obj){
      return obj.collectionName === "system.indexes" ? null : obj.collectionName;
    });
  	 res.send(colls);
  });
});
app.post('/rec', function (req, res) {
  if (req.body.song) song = req.body.song;
  var msg = req.body.msg;
  Jazz.MidiOutLong(msg);
  res.send(song);
  db.dropCollection(song, function(err, result){});
  console.dir("db." + song + " cleaned");
});
app.post('/play', function (req, res) {
  var id = req.body;
  db.collection(song).findOne(id, function(err, row) {
    if(err) throw err;
    if (row) {
      var msg = row.msg;
      Jazz.MidiOutLong(msg);
      res.send(msg);
    }
  });
});
app.post('/drop', function (req, res) {
  if (req.body.song)
  song = req.body.song;
  db.dropCollection(song, function(err, result){});
  console.log('drop: ' + song);
  res.send('drop: ' + song);
});
app.post('/out', function (req, res) {
  var out = req.body.out;
  Jazz.MidiOutOpen(out);
  var msg = req.body.msg;
  Jazz.MidiOutLong(msg);     
  res.send(msg); 
  var timestamp = req.body.timestamp;
  if (!timestamp) song = false;
   var midi = { '_id' : timestamp, 'msg' : msg };
  insert(song, midi);  
});
app.post('/OK', function (req, res) {
  song = req.body.song;
  var cursor = db.collection(song).find();	
  cursor.toArray(function(err, docs){
    var timestamps = docs.map(function(obj){
      return obj._id;
    });
    res.send(timestamps);
    console.log("retrieved from: " + song);
    console.log(docs);
  });
});
app.post('/panic', function (req, res) {
  var msg = req.body.msg;
  Jazz.MidiOutLong(msg);
  res.send(msg);
}); 
/* Querying MongoDB*/
var insert = function (song, midi) {
  db.collection(song).insert(midi, function(err, inserted) {
    if(err) throw err;
    console.dir("Inserted into: " + song + " " + JSON.stringify(inserted));
  });
} 
