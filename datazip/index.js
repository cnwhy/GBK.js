const map = require('../data/map_gbk-utf8.json');  // GBK标准中有的字符于UTF8码的映射表 总字数 21886
const Zip = require('./zip')
const Hex = require('./Hex')

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
			if(key === 0 ){console.log('=======')}
			arr.push(val || "");
			n++;
		}
	}
	return arr;
}();

var zip = null;
var zipData,bit;
for(var i = 40; i <= 80; i++){
	var _zip = Zip(Hex(i));
	_zip.zipData = _zip.zip(_zip.arrHex(arr));
	// console.log(i,_zip.zipData.length);
	if(!zip || zip.zipData.length > _zip.zipData.length){
		zip = _zip;
		bit = i;
	}
	// var _zipData = zip.zip(zip.arrHex(arr));
}
console.log(bit);

// arr = arr.slice(0,10);

module.exports = {
	data: arr,
	arrHex: zip.arrHex,
	zipData: zip.zipData,
	decodeFn: zip.decodeFn,
	unZipFn: zip.unZipFn,
	unZip: zip.unZip
};