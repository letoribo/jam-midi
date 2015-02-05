var jazz = require('jazz-midi')
, Jazz = new jazz.MIDI()
, express = require('express')
, http = require('http'), path = require('path');

var out = Jazz.MidiOutOpen(0);
var list = Jazz.MidiOutList();
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(express.favicon('public/images/favicon.ico'));

app.post('/post', function (req, res) {
  var msg = req.body.msg; 
  console.log(msg); 
  Jazz.MidiOutLong(msg);
  res.send(msg);
});  
  
app.post('/list', function (req, res) {
  res.send(list);
});

app.post('/out', function (req, res) {
  var out = req.body.out;
  Jazz.MidiOutOpen(out);
  var msg = req.body.msg; 
  console.log(msg); 
  Jazz.MidiOutLong(msg);
});

var server = http.createServer(app).listen(3003, function () { 
  console.log("Express server listening on port 3003");
});