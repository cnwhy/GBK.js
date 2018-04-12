"use strict";
var ua = require('../data/map_gbk-utf8.json');
// javascript object 对像的方式, 无自定义码
// console.log('映射字數:',Object.keys(ua).length);
exports.decode = function (arr) {
	var str = '';
	for (var n = 0, max = arr.length; n < max; n++) {
		var Code = arr[n];
		if (Code & 0x80) {
			Code = ua[Code << 8 | arr[++n]]
		}
		str += String.fromCharCode(Code);
	}
	return str;
}