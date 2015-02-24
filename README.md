# jam-midi ![jam-midi](http://i.imgur.com/uN7xa7t.png)


### AngularJS computer keyboard piano maintained MongoDB


jam is shortcut for **J**azz **A**ngularJS **M**ongoDB


![jam-midi](http://i.imgur.com/tIsLIfU.jpg)


API reference is available at http://jazz-soft.net/doc/Jazz-Plugin/reference.html


Questions and comments are welcome at http://jazz-soft.org/


## How to jam?

    npm install jam-midi
    node jam 

and point your browser to localhost:3003
or use localhost:3003/jam.html
to view all messages with zoom:

![jam](http://i.imgur.com/qV3xwVn.jpg)


## jam example

``` js
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
```

<img src="http://i.imgur.com/7KnCa5a.png" width="200"> example
- Open [mongolab.com](https://mongolab.com) website
- Click **Sign up** button
- Fill in your user information then hit **Create account**
- From the dashboard, click on **Create new** button
- Select **any** cloud provider
- Under *Plan* click on **Single-node (development)** tab and select **Sandbox** (it's free)
 - Leave MongoDB version as is
- Enter **Database name** for your app
- Then click on **Create new MongoDB deployment** button
- Click to the recently created database
- You should see the following message:
 - *A database user is required to connect to this database.* **Click here** *to create a new one.*
- Click the link and fill in **DB Username** and **DB Password** fields
- Finally, in `jam.js` instead of `'mongodb://localhost:27017/npm'`, use the following URI with your credentials:
 - `'mongodb://USERNAME:PASSWORD@ds*****.mongolab.com:*****/DATABASE_NAME'`
 
 ![Mongolab](http://i.imgur.com/8UBmspM.jpg)


## ja example (simple implementation without MongoDB)

    node ja 

and point your browser to localhost:3003/ja.html

``` js
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
```    

## Scales available:
1. natural major,ionian
2. natural minor,aeolian,algerian
3. harmonic minor
4. harmonic major,ethiopian
5. double harmonic major
6. double harmonic minor
7. neapolitan major
8. neapolitan minor
9. six tone symmetrical
10. tritone
11. 2 semitone tritone
12. slendro,salendro
13. pentatonic major
14. pentatonic minor
15. spanish,jewish,phrygian major
16. spanish 8 tone
17. flamenco
18. chromatic
19. nine tone
20. enigmatic
21. diminished
22. inverted diminished,diminished blues,symmetrical
23. half diminished
24. whole tone
25. leading whole tone
26. augmented
27. altered
28. overtone,acoustic
29. prometheus
30. prometheus neapolitan
31. dorian
32. ukrainian dorian
33. phrygian
34. lydian minor
35. lydian dominant
36. lydian
37. lydian augmented
38. mixolydian,dominant 7th
39. mixolydian augmented
40. locrian
41. locrian natural
42. locrian major
43. locrian ultra
44. locrian super,whole tone diminished
45. hungarian major
46. hungarian minor,egyptian
47. romanian
48. gypsy
49. persian
50. oriental
51. hindu,adonai malakh
52. indian
53. byzantine,chahargah,arabian
54. marva
55. mohammedan
56. pD
57. pE,balinese
58. pC,pG,pF,chinese,mongolian
59. pA,hirajoshi
60. pB
61. chinese 2
62. javanese
63. todi
64. pelog
65. iwato
66. japanese,kumoi
67. blues
68. bluesy
69. harmonics
70. bebop major
71. bebop minor
72. bebop tonic minor
73. bebop dominant
74. bebop dominant flatnine
75. 3 semitone
76. 4 semitone
