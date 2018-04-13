var gbk_us = require('./data/gbk_code_arr.json');
var arr_index = 0x8140; //33088;
var GBK = function () {
	var gbk = {
		decode: function (arr) {
			var str = "";
			for (var n = 0, max = arr.length; n < max; n++) {
				var Code = arr[n];
				if (Code & 0x80) {
					Code = gbk_us[(Code << 8 | arr[++n]) - arr_index]
				}
				str += String.fromCharCode(Code || 63);
			}
			return str;
		},
		encode: function (str) {
			str += '';
			var gbk = [];
			var wh = '?'.charCodeAt(0); //gbk中没有的字符的替换符
			for (var i = 0; i < str.length; i++) {
				var charcode = str.charCodeAt(i);
				if (charcode < 0x80) gbk.push(charcode)
				else {
					var gcode = gbk_us.indexOf(charcode);
					if (~gcode) {
						gcode += arr_index;
						gbk.push(0xFF & (gcode >> 8), 0xFF & gcode);
					} else {
						gbk.push(wh);
					}
				}
			}
			return gbk;
		}
	}
	gbk.URI = require('./src/URI')(gbk);
	return gbk;
}();
module.exports = GBK;