const map = require('../data/map_gbk-utf8.json');  // GBK标准中有的字符于UTF8码的映射表 总字数 21886
const zip = require('./zip')

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

// arr = arr.slice(0,10);
var zipData = zip.zip(zip.arrHex(arr));

module.exports = {
	data: arr,
	arrHex: zip.arrHex,
	zipData: zipData,
	decodeFn: zip.decodeFn,
	unZipFn: zip.unZipFn,
	unZip: zip.unZip
};