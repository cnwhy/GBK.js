var map = require('./map.json');

function loop() {
	var arr = [];
	var n = 0;
	for (var i = 0x81; i <= 0xfe; i++) {
		for (var j = 0x40; j <= 0xfe; j++) {
			if (
				(j == 0x7f) ||
				((0xa1 <= i && i <= 0xa7) && j <= 0xa0) ||
				((0xaa <= i && i <= 0xaf) && j >= 0xa1) ||
				(0xf8 <= i && j >= 0xa1)
			) {
				continue;
			}
			var key = i << 8 | j;
			var val = map[key];
			arr.push(val||"");
			n++;
		}
	}
	// console.log(n); //22046;
	// console.log(arr.length); //22046;
	// return n;
	return arr;
}
var arr = loop();
arr = arr.map(function(v){
	if(v){
		return ('000' + (+v).toString(16)).match(/....$/)[0];
	}else{
		return '#';
	}
})
var gs= '';
var _b = null;
for (var k = 0; k < arr.length; k++) {
	var hex = arr[k];
	if (hex == '#') {
		gs += '#';
		if (arr.slice(k + 1, k + 3).join('') === "##") {
			for (var kk = k + 3; kk < arr.length; kk++) {
				if (arr[kk] !== "#") break;
			}
			gs += (kk - k - 3) + '$';
			k = kk - 1;
			continue;
		}
	} else {
		var b1 = hex.substr(0, 2);
		if (_b === b1) {
			gs += hex.substr(2, 2);
		} else {
			gs += gs && _b ? ',' : '';
			_b = null;
			var next = arr[k + 1];
			if (next && b1 === next.substr(0, 2)) {
				_b = b1;
				gs += b1 + ':' + hex.substr(2, 2) + next.substr(2, 2);
				k++;
			} else {
				gs += hex;
			}
		}
	}
}

console.log(gs)