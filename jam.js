var jazz = require('jazz-midi')
, Jazz = new jazz.MIDI()
, MongoClient = require('mongodb').MongoClient
, express = require('express')
, http = require('http')
, path = require('path');

var out=Jazz.MidiOutOpen(0);
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(express.favicon('public/images/favicon.ico'));

MongoClient.connect('mongodb://localhost:27017/npm', function(err, db) {
  if(err) throw err;
  db.dropCollection('midi', function(err, result){});
  var count = -1;
  app.post('/post', function (req, res) {
    /* Handling the AngularJS post request*/
    var msg = req.body.msg;
    Jazz.MidiOutLong(msg);
    count ++;
    res.send(msg);
    /* Querying MongoDB*/
    var midi = { '_id' : count, 'msg' : msg };
    db.collection('midi').insert(midi, function(err, inserted) {
      if(err) throw err;
      console.dir("Successfully inserted: " + JSON.stringify(inserted));
    });
  });  
});

http.createServer(app).listen(3003, function () {
  console.log("Express server listening on port 3003");
});