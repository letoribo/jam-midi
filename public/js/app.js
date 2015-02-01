var myModule = angular.module('myModule',[]);
function myController($scope, $http) {
  $scope.note = [];
  $scope.scales = Scales;
  $scope._scale='natural major,ionian';
  $scope.sounds = sounds;
  $scope._sound='Drawbar Organ';
	 
  $scope.keys = {
    b: [1,3,'|',6,8,10,'|',13,15,'|',18,20,22,'|',25,27,'|',30,32,34,'|',37,39,'|',42,44,46,'|',49,51,'|',54,56,58,'|',61,63,'|',66,68,70,'|',73,75,'|',78,80,82,'|',85,87,'|',90,92,94,'|',97,99,'|',102,104,106,'|',109,111,'|',114,116,118,'|',121,123,'|',126],
    w: [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24,26,28,29,31,33,35,36,38,40,41,43,45,47,48,50,52,53,55,57,59,60,62,64,65,67,69,71,72,74,76,77,79,81,83,84,86,88,89,91,93,95,96,98,100,101,103,105,107,108,110,112,113,115,117,119,120,122,124,125,127]
  }
  $scope.down = function(id){ $scope.send({msg: [0x90, id, 120]});
    $scope.note.push(id);
  }	
  $scope.up = function(id){ $scope.send({msg: [0x80, id, 0]});
    $scope.note.splice($scope.note.indexOf(id),1);
  }	

  $scope.changeSnd = function() { $scope.send({msg: [0xc0, $.inArray($scope._sound, $scope.sounds), 0]});
    $('select').blur();
  };
  $scope.init = function () {
    $scope.changeSnd();
  };
  steps = keys;
  if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {steps = _keys};
  $scope.current_scale = 0;
  tonic = 0;
  keyAllowed = {}; 

  $scope.isSelected = function (id) {
    if( $scope.note.indexOf(id) > -1){
      return true;
    }
    return false;
  };   
  
  $scope.data = {}
  $scope.response = {}
  
  $scope.send = function (send) {
    var posting = $http({
      method: 'POST',
      url: '/post',
      data: send,
      processData: false
    })  

    posting.success(function (response) {
      /*executed when server responds back*/
      console.log(response);
      $scope.response.data = response;
    });
  }            
  
  $scope.onKeyDown = function ($event) {
    var theKey = arguments[0].keyCode;
    if (keyAllowed [theKey] === false) return;
    keyAllowed [theKey] = false;
    if (theKey == 38) {
  	   tonic ++ ;
      Object.keys(steps[$scope.current_scale]).map(function(value, index){
        steps[$scope.current_scale][value] ++ ;
      });
    }; 
    if (theKey == 40) {
  	   tonic-- ;
      Object.keys(steps[$scope.current_scale]).map(function(value, index){
        steps[$scope.current_scale][value] -- ;
      })
    };    
    var key = steps[$scope.current_scale][theKey];
    if(key){ 
      $scope.send({msg: [0x90, key, 120]});
      $scope.note.push(key); 
    }   
  };

  $scope.onKeyUp = function ($event) {
    var theKey = arguments[0].keyCode;
    keyAllowed [theKey] = true;
    var key = steps[$scope.current_scale][theKey];
    if(key) {
      $scope.send({msg: [0x80, key, 0]});
      $scope.note.splice($scope.note.indexOf(key),1);
    }
  };   
    
  $scope.changeScale = function() {
    $scope.current_scale = $scope.scales.indexOf($scope._scale);
    $('select').blur();
  };
};
