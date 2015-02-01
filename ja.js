var jazz = require('jazz-midi')
, Jazz = new jazz.MIDI()
, express = require('express')
, http = require('http'), path = require('path');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(express.favicon('public/images/favicon.ico'));
  app.post('/post', function (req, res) {
    /* Handling the AngularJS post request*/
    var msg = req.body.msg; 
    console.log(msg); 
    var out=Jazz.MidiOutOpen(0);
    Jazz.MidiOutLong(msg);
    res.send(msg);
  });  

http.createServer(app).listen(3003, function () {
  console.log("Express server listening on port 3003");
});