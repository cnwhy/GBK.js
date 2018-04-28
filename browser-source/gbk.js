(function (name, factory) {
	if (typeof define === 'function' && (define.amd || define.cmd)) {
		define([], factory);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		global[name] = factory();
	} else {
		throw new Error("加载 " + name + " 模块失败！，请检查您的环境！")
	}
}('GBK', function () {
	// 多进制转换后的数字还原函数 构建时会替换占位符
	var Fn_Hex_decode = Function("{{decodeFn}}");
	
	// 解压Unicode编码字符串函数 构建时会替换占位符
	var Fn_unzip = Function("{{unZipFn}}");

	var GBK = function () {
		function gbkArray(gbk) {
			var data = []
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
					var hex = gbk[k++];
					var key = Fn_Hex_decode(hex);
					data.push(key ? key : undefined);
				}
			}
			return data;
		};
		// 生成按GBk编码顺数排列的编码映射数组  构建时会替换 zipData 的占位符
		var gbk_us = gbkArray(Fn_unzip("{{zipData}}"));
		var arr_index = 0x8140;
		var gbk = {
			decode: function (arr) {
				var str = "";
				for (var n = 0, max = arr.length; n < max; n++) {
					var Code = arr[n];
					if (Code & 0x80) {
						Code = gbk_us[(Code << 8 | arr[++n]) - 0x8140]
					}
					str += String.fromCharCode(Code || 63);
				}
				return str;
			},
			encode: function (str) {
				str += '';
				var gbk = [];
				var wh = '?'.charCodeAt(0);
				for (var i = 0; i < str.length; i++) {
					var charcode = str.charCodeAt(i);
					if (charcode < 0x80) gbk.push(charcode)
					else {
						var gcode = gbk_us.indexOf(charcode);
						if (~gcode) {
							gcode += 0x8140;
							gbk.push(0xFF & (gcode >> 8), 0xFF & gcode);
						} else {
							gbk.push(wh);
						}
					}
				}
				return gbk;
			}
		}
		gbk.URI = require('../src/URI')(gbk);
		return gbk;
	}();

	return GBK;
}))