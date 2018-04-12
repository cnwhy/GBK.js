"use strict";
var us = require('../data/gbk_code_arr.json');

//array对像方法 , 无自定义码
// console.log('总数:',us.filter(x=>x).length);
exports.decode = function (arr) {
	var str = "";
	for (var n = 0, max = arr.length; n < max; n++) {
		var Code = arr[n];
		if (Code & 0x80) {
			Code = us[(Code << 8 | arr[++n]) - 33088]
		}
		str += String.fromCharCode(Code);
	}
	return str;
}