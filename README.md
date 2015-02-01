# jam-midi



### AngularJS computer keyboard piano maintained MongoDB



jam is shortcut for **J**azz **A**ngularJS **M**ongoDB


![jam-midi](http://i.imgur.com/f37O1o4.jpg)


API reference is available at http://jazz-soft.net/doc/Jazz-Plugin/reference.html



Questions and comments are welcome at http://jazz-soft.org/


## How to jam?

    npm install jam-midi
    node jam 

and point your browser to localhost:3003


## jam example


    ``` js
    var jazz = require('jazz-midi')
    , Jazz = new jazz.MIDI()
    , _ = require('underscore')
    , MongoClient = require('mongodb').MongoClient
    , express = require('express')

    , http = require('http')
    , path = require('path');

    var app = express();
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.bodyParser());
    app.use(express.favicon('public/images/favicon.ico'));

    MongoClient.connect('mongodb://localhost:27017/npm', function(err, db) {
      if(err) throw err;
      var count = -1;
      app.post('/post', function (req, res) {

        /* Handling the AngularJS post request*/
        var msg = req.body.msg;
        var out=Jazz.MidiOutOpen(0);
        Jazz.MidiOutLong(msg);
        count ++;
        res.send(msg);

        /* Querying MongoDB*/
        var midi = { '_id' : count, 'msg' : msg };
        db.dropCollection('midi', function(err, result){});
        db.collection('midi').insert(midi, function(err, inserted) {
          if(err) throw err;
          console.dir("Successfully inserted: " + JSON.stringify(inserted));
        });
      });  
    });

    http.createServer(app).listen(3003, function () {
      console.log("Express server listening on port 3003");
    });
    ```

## ja example (simple implementation without MongoDB)


    ``` js
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
    ``` js

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
