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
  $scope.recording = 'Rec';
  
  $scope.rec = function() {
    $scope.state = $scope.state === false ? true: false;
    if($scope.state){
      $scope.recording = 'Rec';
      $http({method: 'POST', url:'/OK'}).success(function (response) {
        $scope.timestamps = response;
        console.log($scope.timestamps);
      });
    } 
    else {
      $scope.recording = 'Stop';
      $http.post('/rec', {msg: [0xb0, 120, 0]}).success(function (response) {
        console.log(response);
      });
      $scope.current = $.now();
    }
    $("button").blur();  
  };

  $scope.render = function (time) {
    if (!$scope.stopped) {
      $scope.time = $.now() - $scope.starttime;
      $scope.$apply();

      $scope.$watch('time', function(value) {
        var moment = $scope.timestamps[$scope.pos];
        if (value >= moment) {
          $scope._send({_id: moment});
          $scope.pos ++;
        }
      });      
      $scope.requestId = window.requestAnimationFrame($scope.render);
    }
  }
  $scope.start = function () {
  	 $scope.pos = 0;
    $scope.starttime = $.now();
    $scope.requestId = window.requestAnimationFrame($scope.render);
    $scope.stopped = false;
    $("button").blur();
  }
  $scope.stop = function () {
  	 $http.post('/panic', {msg: [0xb0, 120, 0]});
    if ($scope.requestId) {
      window.cancelAnimationFrame($scope.requestId);
    }
    $scope.stopped = true;
    $scope.pos = null;
    $("button").blur();
  }
        
  $scope._send = function (send) {
    $http({
      method: 'POST',
      url: '/play',
      data: send
    });     
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

  $scope.steps = keys;
  if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {$scope.steps = _keys};
  $scope.current_scale = 0;
  $scope.mode = $scope.steps[$scope.current_scale];
  $scope.keyAllowed = {};
  $scope.highlight = function () {
  	 angular.forEach($scope.mode, function(value) {
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
  
  $scope.changemidi = function() { var num = $.inArray($scope._out, $scope.list);
    $scope.time = $.now() - $scope.current;
    $http.post('/out', {out: num, timestamp: $scope.time, msg: [0xc0, $.inArray($scope._sound, $scope.sounds), 0]});
    $('select').blur();
  };  
  
  $scope.onKeyDown = function ($event) {
    var theKey = arguments[0].keyCode;
    if ($scope.keyAllowed[theKey] === false) return;
    $scope.keyAllowed[theKey] = false;
    var all = $('span'); all.removeClass("col");
    if (theKey == 38) {
      Object.keys($scope.mode).map(function(value, index){
        $scope.mode[value] ++;
        var sel = $('#' + $scope.mode[value]); 
        sel.addClass("col");
      });
    }; 
    if (theKey == 40) {
      Object.keys($scope.mode).map(function(value, index){
        $scope.mode[value] --;
        var sel = $('#' + $scope.mode[value]); 
        sel.addClass("col");
      })
    };
    if (theKey == 32 && $scope.stopped) {
      $scope.rec();
    };    
    var key = $scope.mode[theKey];
    if(key){ 
      $scope.time = $.now() - $scope.current;
      $scope.send({timestamp: $scope.time, msg: [0x90, key, $scope.volume]});
      $scope.note.push(key); 
    }   
  };

  $scope.onKeyUp = function ($event) {
    var theKey = arguments[0].keyCode;
    $scope.keyAllowed [theKey] = true;
    var key = $scope.mode[theKey];
    if(key) {
    	$scope.time = $.now() - $scope.current;
      $scope.send({timestamp: $scope.time, msg: [0x80, key, 0]});
      $scope.note.splice($scope.note.indexOf(key),1);
    }
  };   
    
  $scope.changeScale = function() {
    $scope.current_scale = $scope.scales.indexOf($scope._scale); 
    $scope.mode = $scope.steps[$scope.current_scale];
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
  
};
