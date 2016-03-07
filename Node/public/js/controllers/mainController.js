app.controller('MainController', ['$scope', '$http', function ($scope, $http) {
    var vm = this;
    vm.selected = 1;
    vm.floor = ["Basement", "Main Floor"];
    var isSwiped = false;
    vm.baseGradient = {r:37, g:57, b:215};
    vm.gradDiff = {r: 190, g:-17, b:-185};

    vm.structures = {};
    vm.thermostats = {
    	"dsrPBFOxrCkjeC-WxqXvsdMBl9jDPuky": {
    		temperature: 60,
    		isSelected: false
    	},
    	"dsrPBFOxrCmNRkq7e0V8BdMBl9jDPuky": {
    		temperature: 60,
    		isSelected: false
    	},
    	"dsrPBFOxrCmCP8uaEyWxztMBl9jDPuky": {
    		temperature: 60,
    		isSelected: false
    	},
    	"dsrPBFOxrCkcdtb1lbea8tMBl9jDPuky": {
    		temperature: 60,
    		isSelected: false
    	}
    }

    vm.roundedTemp = function(id) {
    	return Math.round(vm.thermostats[id].temperature);
    }

    vm.updateGradient = function(id) {
    	var room = $('#' + id).parent();
    	var factor = (vm.thermostats[id].temperature - 42) / 48;
    	var r = Math.round(vm.gradDiff['r'] * factor) + vm.baseGradient['r'];
    	var g = Math.round(vm.gradDiff['g'] * factor) + vm.baseGradient['g'];
    	var b = Math.round(vm.gradDiff['b'] * factor) + vm.baseGradient['b'];
    	var low = 'rgb(' + (r-20) + ',' + g + ',' + (b-30) + ')';
    	var high = 'rgb(' + (r+20) + ',' + g + ',' + (b+30) + ')';
    	room.css('background', 'linear-gradient(130deg,' + low + ',' + high + ')');
    }

    vm.updateGradients = function() {
    	$.each(Object.keys(vm.thermostats), function(key, val) {
    		vm.updateGradient(val);
    	});
    }

    vm.hover = function(left, top) {
    	if (vm.selected === 0) {
    		if (left > 234 && left < 566 && top > 136 && top < 464) {
    			var id = 'dsrPBFOxrCkjeC-WxqXvsdMBl9jDPuky';
				var t = vm.thermostats[id];
				$('#' + id).addClass('therm-hovered');
				t.isSelected = true;
			} else {
				$.each(Object.keys(vm.thermostats), function(key, val) {
					vm.thermostats[val].isSelected = false;
					$('#'+val).removeClass('therm-hovered');
				});
			}
    	} else {
    		if (left > 118 && left < 282 && top > 220 && top < 380) {
    			var id = 'dsrPBFOxrCmNRkq7e0V8BdMBl9jDPuky';
				var t = vm.thermostats[id];
				$('#' + id).addClass('therm-hovered');
				t.isSelected = true;
			} else if (left > 518 && left < 782 && top > 20 && top < 180) {
				var id = 'dsrPBFOxrCmCP8uaEyWxztMBl9jDPuky';
				var t = vm.thermostats[id];
				$('#' + id).addClass('therm-hovered');
				t.isSelected = true;
			} else if (left > 518 && left < 782 && top > 320 && top < 480) {
				var id = 'dsrPBFOxrCkcdtb1lbea8tMBl9jDPuky';
				var t = vm.thermostats[id];
				$('#' + id).addClass('therm-hovered');
				t.isSelected = true;
			} else {
				$.each(Object.keys(vm.thermostats), function(key, val) {
					vm.thermostats[val].isSelected = false;
					$('#'+val).removeClass('therm-hovered');
				});
			}    	
		}
    }

    vm.circular = function(gesture, controller) {
    	var tKeys = Object.keys(vm.thermostats);
		var frame = controller.frame();
    	$.each(tKeys, function(key, val) {
    		var thermostat = vm.thermostats[val];
    		if (thermostat.isSelected === true) {
    			var clockwise = false;
				var direction = frame.pointable(gesture.pointableIds[0]).direction;
				var dotProduct = Leap.vec3.dot(direction, gesture.normal);
				if (dotProduct  >  0) clockwise = true;
				if (clockwise) {
					if (thermostat.temperature < 90)thermostat.temperature += 0.1;
				} else {
					if (thermostat.temperature > 42)thermostat.temperature -= 0.1;
				}
				vm.updateGradient(val);
    		}
    	});
    	$scope.$apply();
    }

    vm.swipe = function() {
    	if (!isSwiped) {
    		isSwiped = true;
    		if (vm.selected === 0) {
	    		vm.selected = 1;
	    	} else {
	    		vm.selected = 0;
	    	}
	    	setTimeout(function(){isSwiped = false}, 1000);
    	}
    	vm.updateGradients();
    	$scope.$apply();
    }

    vm.keyTap = function() {
    	console.log('dnk')
    	var tKeys = Object.keys(vm.thermostats);
    	$.each(tKeys, function(key, val) {
    		var thermostat = vm.thermostats[val];
    		if (thermostat.isSelected === true) {
    			$http({
		            url: "http://localhost:3000/thermostats/temperature",
		            dataType: "json",
		            data: {key: val, temperature: Math.round(vm.thermostats[val].temperature)},
		            method: "PUT"
		        })
    		}
    	});
    	$scope.$apply();
    }

    var cursors = {};

	var controller = Leap.loop({enableGestures: true}, function(frame) {
		frame.hands.forEach(function(hand, index) {
			var cursor = ( cursors[index] || (cursors[index] = new Cursor()) );
			var coords = cursor.setTransform(hand.screenPosition(), hand.roll());
			vm.hover(coords[0], coords[1], index);
		});

		if (frame.hands.length < Object.keys(cursors).length) {
			var i = frame.hands.length;
			while (cursors[i]) {
				cursors[i].removeImage();
				delete cursors[i];
			}
		}
	}).use('screenPosition', {scale: 0.8});

	controller.on("gesture", function(gesture) {
		switch (gesture.type) {
			case 'circle':
				vm.circular(gesture, controller);
				break;
			case 'swipe':
				vm.swipe();
				break;
			case 'keyTap':
				vm.keyTap();
				break;
		}
	});


	var Cursor = function() {
		var cursor = this;
		var cursorParent = document.getElementById("plan-window");
		var width = cursorParent.offsetWidth;
		var height = cursorParent.offsetHeight;

		var img = document.createElement('img');
		img.src = './images/pointer.png';
		img.style.height = '20px';
		img.style.width = '20px';
		img.style.position = 'absolute';
		img.onload = function () {
			cursorParent.appendChild(img);
		}
		cursor.setTransform = function(position, rotation) {
			var left = position[0] - 500 - img.width  / 2;
			var top = position[1] + 100 - img.height / 2;
			img.style.left = left + 'px';
			img.style.top  = top + 'px';
			img.style.transform = 'rotate(' + -rotation + 'rad)';
			img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
			img.style.OTransform = img.style.transform;
			return [left, top];
		};
		cursor.removeImage = function() {
			img.parentNode.removeChild(img);
		}
	};

	cursors[0] = new Cursor();

	vm.updateTemperature = function() {
		$http({
            url: "http://localhost:3000/nest/structures",
            method: "GET",
        }).success(function(res) {
            var thermostats = res[Object.keys(res)[0]].thermostats;
            $.each(Object.keys(thermostats), function(key, val) {
            	vm.thermostats[val].temperature = thermostats[val].target_temperature_f;
            	vm.updateGradient(val);
            });
        });
    }

    vm.updateTemperature();

}]);