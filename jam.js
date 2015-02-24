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
var db, song, Song;

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
  res.send(msg);
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
  if (Song) db.collection(Song).findOne(id, function(err, row) {
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
  Song = null;
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
app.post('/panic', function (req, res) {
  var msg = req.body.msg;
  Jazz.MidiOutLong(msg);
  res.send(msg);
}); 
app.post('/OK', function (req, res) {
  song = req.body.song;
  var cursor = db.collection(song).find().sort( { _id: 1 } );	
  cursor.toArray(function(err, docs){
    var timestamps = docs.map(function(obj){
      return obj._id;
    });
    res.send(timestamps);
    console.log("retrieved from: " + song);
    console.log(docs);
  });
});
app.post('/All', function (req, res) {
  Song = req.body.song;
  var cursor = db.collection(song).find().sort( { _id: 1 } );	
  cursor.toArray(function(err, docs){
   res.send(docs);
  });
});

/* Querying MongoDB*/
app.post('/remove', function (req, res) {
  song = req.body.song;
  if (typeof(req.body.timestamp) !== "undefined") {
  	 var timestamp = req.body.timestamp;
  	 db.collection(song).remove({_id: timestamp}, {safe: true}, function(err, result) {
      if (err) {
        console.log(err); throw err;
      }
    });
    res.send("removed: " + timestamp);
  }
});
app.post('/insert', function (req, res) {
  var msg = req.body.msg;
  var timestamp = req.body.timestamp;
  res.send(msg);
  var midi = { '_id' : timestamp, 'msg' : msg };
  db.collection(Song).insert(midi, function(err, inserted) {
    if(err) throw err;
    console.dir("Inserted into: " + song + " " + JSON.stringify(inserted));
  }); 
});	
app.post('/update', function (req, res) {
  var msg = req.body.msg;
  Jazz.MidiOutLong(msg);
  res.send(msg);
  var timestamp = req.body._id; 
  var query = { '_id' : timestamp };
  var operator = { '$set' : {'msg': msg} };
  db.collection(Song).findAndModify( query,
  [['_id','desc']],
  operator, // replacement
  function(err, object) {
    if (err){
      console.warn(err.message);
    } else {
    	 console.dir("old value: ");
      console.dir(object);
    }
  });   
});
var insert = function (song, midi) {
  db.collection(song).insert(midi, function(err, inserted) {
    if(err) throw err;
    console.dir("Inserted into: " + song + " " + JSON.stringify(inserted));
  });
} 
