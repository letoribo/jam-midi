var myModule = angular.module('myModule', ['pragmatic-angular']);
function myController($scope, $timeout, $http) {
  $scope.note = [];
  $scope.scales = Scales;
  $scope._scale='natural major,ionian';
  $scope.sounds = sounds;
  $scope._sound='Drawbar Organ';
  $scope.volume = 117;
  $scope.modulation = 10;
  $scope.pan = 64;
  $scope.timestamps = [];
  $scope.state = true;
  $scope.State = true;
  $scope.recording = 'Rec';
  $scope.playing = 'Play';
  $scope.Bytes0 = [128,144,176,192];

  $scope.changeBytes = function() {
  	 var timestamp = $scope.timestamps[$scope.pos];
  	 $http.post('/update', {_id: timestamp, msg: [Number($scope._b0), Number($scope._b1), Number($scope._b2)]}).success(function (response) {
      $scope.msg = response; console.log(response, $scope.text);
      var id = response[1];
      var status = response[0]; 
      $scope.All[$scope.pos].msg[0] = status;
      $scope.All[$scope.pos].msg[1] = id;
      $scope.All[$scope.pos].msg[2] = response[2];
      if (status == 144) $scope.note.push(id);
      if (status == 128) $scope.note.splice($scope.note.indexOf(id),1);           
    });   
    $('select').blur();
  };
  
  $scope.store = function(t) {
  	 $scope.old = t;
  	 console.log($scope.old);
  };
  $scope.isNumber = function(t) {
  if (!angular.isNumber($scope._t)) {$scope._t = $scope.old; return null;}
  }
  $scope.change_t = function(t) {
  	 if (angular.equals(t, null)) {$scope._t = $scope.old; return null;}
    var remove_id = $scope.timestamps[0] + $scope.old;
    var insert_id = $scope.timestamps[0] + t;
    if (insert_id !== remove_id)
    if ($scope.timestamps.indexOf(insert_id) == -1)
    $http.post('/remove', {song: $scope.text, timestamp: remove_id}).success(function (response) {
    	console.log(response);
      $http.post('/insert', {timestamp: insert_id, msg: [Number($scope._b0), Number($scope._b1), Number($scope._b2)]}).success(function (response) { 
        $scope.retrieve($scope.text);
      });
    })
    else {alert ("duplicate id!")}    
  };
  
  $scope.retrieve = function(name) {
  	 if (!$scope.State) return null; 
    $scope.text = name;
    $http.post('/OK', {song: name}).success(function (response) {
      $scope.timestamps = response; $scope._t = $scope.timestamps[$scope.pos] - $scope.timestamps[0];
      console.log($scope.timestamps);
    });
    $scope.pos = 0;
    $scope.retrieveAll($scope.text);
  }; 
   
  $scope.retrieveAll = function(name) {
    $http.post('/All', {song: name}).success(function (response) {
      $scope.All = response;
      var all = response; 
      if (all.length > 0) {
      $scope.msg = all[0].msg; 
      $scope._b0 = all[0].msg[0];
      $scope._b1 = all[0].msg[1];
      $scope._b2 = all[0].msg[2];
      $scope.row = [{
    	  one: all[0], two: all[1], three: all[2], four: all[3], five: all[4], six: all[5],
        seven: all[6], eight: all[7]
      }];
      }
    });   
  };
  
  $scope.rec = function() {
  	 var text = $scope.text;
  	 if (text == "") return null; 
    $scope.state = !$scope.state;
    
    if($scope.state){
      $scope.recording = 'Rec';
      if (text) $scope.retrieve(text);
    } 
    else {
      $scope.recording = 'Stop';
      $http.post('/rec', {song: text, msg: [0xb0, 120, 0]}).success(function (response) {
        console.log(response);
      });
      $scope.current = $.now();
    }
    $("button").blur();  
  };
  
  $scope.table = function(p) {
    var all = $scope.All;
    $scope.row = [{
    	one: all[p], two: all[p+1], three: all[p+2], four: all[p+3], five: all[p+4], six: all[p+5],
      seven: all[p+6], eight: all[p+7]
    }];
    $scope._b0 = $scope.row[0].one.msg[0];
    $scope._b1 = $scope.row[0].one.msg[1];
    $scope._b2 = $scope.row[0].one.msg[2];
    $scope._t = $scope.timestamps[$scope.pos] - $scope.timestamps[0];
  }
  
  $scope.render = function (time) {
    if (!$scope.stopped) {
      $scope.time = $.now() - $scope.starttime;
      $scope.$apply();

      $scope.$watch('time', function(value) {
        var jiff = value + $scope.timestamps[0];
        var moment = $scope.timestamps[$scope.pos];
        if (jiff >= moment) {
          $http.post('/play', {_id: moment}).success(function (response) {
            $scope.msg = response;
            var status = response[0]; $scope._b0 = status;
            var id = response[1]; $scope._b1 = id;            
            if (status == 144) $scope.note.push(id);
            if (status == 128) $scope.note.splice($scope.note.indexOf(id),1);           
          });
          $scope.table($scope.pos);    
          $scope.pos ++;
          if ($scope.pos == $scope.All.length) {$scope.State = false; $scope.play();}
        }
      });      
      $scope.requestId = window.requestAnimationFrame($scope.render);
    }
  }
  $scope.play = function() {
    $scope.State = !$scope.State;   
    if($scope.State){
      $http.post('/panic', {msg: [0xb0, 120, 0]});
      $scope.playing = 'Play';
      if ($scope.requestId) {
        window.cancelAnimationFrame($scope.requestId);
      }
      $scope.stopped = true;
      $scope.pos = null;
      $scope.note = [];
      $scope.time = null;
      $("button").blur();
    } 
    else {
      $scope.pos = 0;
      $scope.starttime = $.now();
      $scope.requestId = window.requestAnimationFrame($scope.render);
      $scope.stopped = false;
      $scope.playing = 'Stop';
      $("button").blur();  
    };  
  };
  $scope.range = function (start, end) {
    var array = new Array();
    for(var i = start; i < end; i++) {
      array.push(i);
    }
    return array;
  } 
 
  $scope.keys = {
    b: [1,3,'|',6,8,10,'|',13,15,'|',18,20,22,'|',25,27,'|',30,32,34,'|',37,39,'|',42,44,46,'|',49,51,'|',54,56,58,'|',61,63,'|',66,68,70,'|',73,75,'|',78,80,82,'|',85,87,'|',90,92,94,'|',97,99,'|',102,104,106,'|',109,111,'|',114,116,118,'|',121,123,'|',126],
    w: [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24,26,28,29,31,33,35,36,38,40,41,43,45,47,48,50,52,53,55,57,59,60,62,64,65,67,69,71,72,74,76,77,79,81,83,84,86,88,89,91,93,95,96,98,100,101,103,105,107,108,110,112,113,115,117,119,120,122,124,125,127]
  }
  $scope.down = function(id){
  	 $scope.time = $.now() - $scope.current;
  	 $scope.send({timestamp: $scope.time, msg: [0x90, id, $scope.volume]});
    $scope.note.push(id);
  }	
  $scope.up = function(id){ 
    $scope.time = $.now() - $scope.current;
    $scope.send({timestamp: $scope.time, msg: [0x80, id, 0]});
    $scope.note.splice($scope.note.indexOf(id),1);
  }	

  $scope.changeSnd = function() {
  	 $scope.time = $.now() - $scope.current;
  	 $scope.send({timestamp: $scope.time, msg: [0xc0, $.inArray($scope._sound, $scope.sounds), 0]});
    $('select').blur();
  };
  $scope.init = function () {
  	 $scope.get_midioutlist();
    $scope.changeSnd();
    $scope.stopped = true;
  };

  steps = keys;
  if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {steps = _keys};
  $scope.current_scale = 0;
  keyAllowed = {};
  $scope.highlight = function () {
  	 angular.forEach(steps[$scope.current_scale], function(value) {
      var sel = $('#' + value); 
      sel.addClass("col");
    }); 
  } 

  $scope.isSelected = function (id) {
    if( $scope.note.indexOf(id) > -1){
      return true;
    }
    return false;
  };   
  
  $scope.data = {}
  
  $scope.send = function (send) {
    var posting = $http({
      method: 'POST',
      url: '/post',
      data: send
    })  

    posting.success(function (response) {
      /*executed when server responds back*/
      console.log(response);
      $scope.msg = response;
      $scope._b0 = $scope.msg[0];
      $scope._b1 = $scope.msg[1];
      $scope._b2 = $scope.msg[2];
    });
  } 
  
  $scope.get_midioutlist = function () {
    $http({method: 'POST', url:'/list'})           
    .success(function (response) {
      console.log(response);
      $scope.list = response;
      $scope._out = $scope.list[0];
    });
  } 
  
  $scope.getSongsList = function () {
    $http({method: 'POST', url:'/songs'})           
    .success(function (response) {
      console.log(response);
      $scope.items = response;
    });
  } 
  
  $scope.drop = function(li) {
  	 if (!$scope.State) return null;
    $http.post('/drop', {song: li});
    $scope.getSongsList();
    $scope.text = '';
    $scope.row = null;
    $scope.time = null;
  }
  
  $scope.changemidi = function() {
    $scope.time = $.now() - $scope.current;
    var num = $.inArray($scope._out, $scope.list); 
    $http.post('/out', {out: num, timestamp: $scope.time, msg: [0xc0, $.inArray($scope._sound, $scope.sounds), 0]});
    $('select').blur();
  };  
  
  $scope.onKeyDown = function ($event) {
    if ($event.target.id === "_t") return null;
    var theKey = arguments[0].keyCode;
    if (keyAllowed [theKey] === false) return;
    keyAllowed [theKey] = false;
    var all = $('span'); all.removeClass("col");
    if (theKey == 38) {
      Object.keys(steps[$scope.current_scale]).map(function(value, index){ console.log(value);
        steps[$scope.current_scale][value] ++;
        var sel = $('#' + steps[$scope.current_scale][value]); 
        sel.addClass("col");
      });
    }; 
    if (theKey == 40) {
      Object.keys(steps[$scope.current_scale]).map(function(value, index){
        steps[$scope.current_scale][value] --;
        var sel = $('#' + steps[$scope.current_scale][value]); 
        sel.addClass("col");
      })
    };
    if (theKey == 32 && $scope.stopped) {
    	if ($scope.typing) return null;
      $scope.rec();
    };    
    var key = steps[$scope.current_scale][theKey];
    if(key){ 
      $scope.time = $.now() - $scope.current;
      $scope.send({timestamp: $scope.time, msg: [0x90, key, $scope.volume]});
      $scope.note.push(key); 
    }   
  };

  $scope.onKeyUp = function ($event) {
  	 if ($event.target.id === "_t") return null;
    var theKey = arguments[0].keyCode;
    keyAllowed [theKey] = true;
    var key = steps[$scope.current_scale][theKey];
    if(key) {
    	$scope.time = $.now() - $scope.current;
      $scope.send({timestamp: $scope.time, msg: [0x80, key, 0]});
      $scope.note.splice($scope.note.indexOf(key),1);
    }
  };   
    
  $scope.changeScale = function() {
    $scope.current_scale = $scope.scales.indexOf($scope._scale);
    var all = $('span'); all.removeClass("col");
    $scope.highlight();
    $('select').blur();
  };
  
  $scope.changeVolume = function(event, ui) {
    $scope.volume = ui.value;
    $scope.time = $.now() - $scope.current;
    $scope.send({timestamp: $scope.time, msg: [0xb0, 7, ui.value]});
    $scope.$apply();
  };
  
  $scope.changeModulation = function(event, ui) {
    $scope.modulation = ui.value;
    $scope.time = $.now() - $scope.current;
    $scope.send({timestamp: $scope.time, msg: [0xb0, 1, ui.value]});
    $scope.$apply();
  };
  
  $scope.changePan = function(event, ui) {
    $scope.pan = ui.value;
    $scope.time = $.now() - $scope.current;
    $scope.send({timestamp: $scope.time, msg: [0xb0, 10, ui.value]});
    $scope.$apply();
  };

  $scope.$watch('checked', function(value) {
  	 $scope.time = $.now() - $scope.current;
    value ? $scope.send({timestamp: $scope.time, msg: [0xb0, 64, 64]}) : $scope.send({timestamp: $scope.time, msg: [0xb0, 64, 0]});
  });
  
  $scope.items = [];
  $scope.text = '';
  $scope.submit = function() { 
    var text = this.text.slice(0, 23);
    if (text !== "" && $scope.items.indexOf(text) == -1)
    $scope.items.push(text);// console.log($scope.items);
    $("input").blur();
    $scope.typing = null;
  };
  $scope.SelectAll = function(id) {
    $(id).focus().select();
  }
  $scope.position = function(sign) {
  	 if ($scope.pos == null) $scope.pos = 0;
    sign === "minus" ? $scope.pos > 0 ? $scope.pos -- : null : $scope.pos ++;
    if ($scope.pos < $scope.All.length) {$scope.msg = $scope.All[$scope.pos].msg}
    else {$scope.pos = 0}
  } 
  $scope.minimize = function(id) {
    $(id).attr( "width", 0 ).attr( "height", 0 );
  } 
  $scope.typing = function() {
    return true;
  }

  $scope.setDisabled = function() {
  	 $scope.typing = true;
  }
};
