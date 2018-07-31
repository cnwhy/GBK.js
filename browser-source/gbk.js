'use strict';
// 多进制转换后的数字还原函数 构建时会替换占位符
var Fn_Hex_decode = Function("{{decodeFn}}");

// 解压Unicode编码字符串函数 构建时会替换占位符
var Fn_unzip = Function("{{unZipFn}}");

function gbkArray(gbkArr) {
	var data = [];
	for (var i = 0x81, k = 0; i <= 0xfe; i++) {
		if (data.length > 0) {
			data.length += 0x40 + 1;
		}
		for (var j = 0x40; j <= 0xfe; j++) {
			if (
				(j == 0x7f) ||
				((0xa1 <= i && i <= 0xa7) && j <= 0xa0) ||
				((0xaa <= i && i <= 0xaf) && j >= 0xa1) ||
				(0xf8 <= i && j >= 0xa1)
			) {
				data.push(undefined);
				continue;
			}
			var hex = gbkArr[k++];
			var key = Fn_Hex_decode(hex);
			data.push(key ? key : undefined);
		}
	}
	return data;
};

var GBK = function () {
	// 生成按GBk编码顺数排列的编码映射数组  构建时会替换 zipData 的占位符
	var gbk_us = gbkArray(Fn_unzip(String("{{zipData}}")));
	var gbk = require('../src/')(gbk_us);
	return gbk;
}();

module.exports = GBK;