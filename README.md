# jam-midi
![jam-midi](http://i.imgur.com/uN7xa7t.png)


### AngularJS computer keyboard piano maintained MongoDB


jam is shortcut for **J**azz **A**ngularJS **M**ongoDB


![jam-midi](http://i.imgur.com/OaV23Kq.jpg)


API reference is available at http://jazz-soft.net/doc/Jazz-Plugin/reference.html


Questions and comments are welcome at http://jazz-soft.org/


## How to jam?

    
## jam example    
    node jam 

and point your browser to localhost:3003
or use localhost:3003/jam.html
to view all messages with zoom:

![jam](http://i.imgur.com/2BtmCca.jpg)



<img src="http://i.imgur.com/7KnCa5a.png" width="200"> example
- Open [mlab.com](https://mlab.com) website
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
 - `'mongodb://USERNAME:PASSWORD@ds*****.mlab.com:*****/DATABASE_NAME'`
 
 ![Mongolab](http://i.imgur.com/8UBmspM.jpg)


## ja example (simple implementation without MongoDB)

    node ja 

and point your browser to localhost:3003/ja.html
    

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
