const map = require('../data/map_gbk-utf8.json');  // GBK标准中有的字符于UTF8码的映射表 总字数 21886
const Hex = require('./Hex');
const BIT = 64;
const Hex64 = Hex(BIT); // 基于ASCII的64进制转换类

// 获取GBK码区(无自定义码区)的对应UTF8编码
// 码区参考 https://zh.wikipedia.org/wiki/%E6%B1%89%E5%AD%97%E5%86%85%E7%A0%81%E6%89%A9%E5%B1%95%E8%A7%84%E8%8C%83
let arr = function () {
	let arr = [];
	let n = 0;
	for (let i = 0x81; i <= 0xfe; i++) {
		for (let j = 0x40; j <= 0xfe; j++) {
			if (
				(j == 0x7f) ||
				((0xa1 <= i && i <= 0xa7) && j <= 0xa0) ||
				((0xaa <= i && i <= 0xaf) && j >= 0xa1) ||
				(0xf8 <= i && j >= 0xa1)
			) {
				continue;
			}
			let key = i << 8 | j;
			let val = map[key];
			arr.push(val || "");
			n++;
		}
	}
	return arr;
}();
// console.log(arr.length); //有效编码位 846 + 6768 + 6080 + 8160 + 192 = 22046;

function arrHex(arr){
	return arr.map((v)=>{
		return v ? (new Array(3).join(Hex64.encode(0)) + Hex64.encode(+v)).match(/...$/)[0] : "###"
	});
}

function zip(arr) {
	//开始生成压缩数据
	var gs = '';
	var _b = null;
	for (var k = 0; k < arr.length; k++) {
		var hex = arr[k];
		if (hex == '###') {
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
				gs += hex.substr(2);
			} else {
				gs += gs && _b ? ',' : '';
				_b = null;
				var next = arr[k + 1];
				if (next && b1 === next.substr(0, 2)) {
					_b = b1;
					gs += b1 + '+' + hex.substr(2) + next.substr(2);
					k++;
				} else {
					gs += hex;
				}
			}
		}
	}
	return gs;
}
// arr = arr.slice(0,10);
var zipData = zip(arrHex(arr));
// console.log(zipData.replace(/\\/g, "\\\\"))

//用于解压
var unZipFn = function(){
	var b = Hex64.encode(0).charCodeAt(0).toString(16) //起始字符
		,e = Hex64.encode(BIT-1).charCodeAt(0).toString(16)//结束字符
	var reg = new RegExp(`([\\x${b}-\\x${e}]{2})\\+([\\x${b}-\\x${e}\\#]+)(?:\\,|$)`,'g');
	return `function unZip() {
		return arguments[0].replace	(/\\#(\\d+)\\$/g, function (a, b) {
				return Array(+b + 4).join('#');
			})
			.replace(/\\#/g, '###')
			.replace(${reg}, function (all, hd, dt) {
				return dt.replace(/./g, function (a) {
					if (a != '#') {
						return hd + a;
					} else {
						return a;
					}
				});
			})
			.match(/.../g);
	}`
}();

// var unZip = function(){
// 	return arguments[0].replace(/\#(\\d+)\\$/g, function (a, b) {
// 		return Array(+b + 4).join('#');
// 	})
// 	.replace(/\#/g, '###')
// 	.replace(/([\?-\~]{2})\+([\?-\~\#]+)(?:\,|$)/g, function (all, hd, dt) {
// 		return dt.replace(/./g, function (a) {
// 			if (a != '#') {
// 				return hd + a;
// 			} else {
// 				return a;
// 			}
// 		});
// 	})
// 	.match(/.../g);
// }


module.exports = {
	data: arr,
	arrHex: arrHex,
	zipData: zipData,
	decodeFn: Hex64.decodeFn,
	unZipFn: unZipFn,
	unZip: eval('('+unZipFn+')')
	// unZip: unZip
};