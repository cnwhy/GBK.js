//用二分法的形式 搜索;

// 多进制转换后的数字还原函数
var Fn_Hex_decode = Function("{{decodeFn}}");
// 解压Unicode编码字符串函数
var Fn_unzip = Function("{{unZipFn}}");

var GBK = function () {

	/**
	 * 生成按GBk编码顺数排列的编码映射数组
	 */
	function getSortGBK(gbk) {
		var data = []
		for (var i = 0x81, k = 0; i <= 0xfe; i++) {
			for (var j = 0x40; j <= 0xfe; j++) {
				if (
					(j == 0x7f) ||
					((0xa1 <= i && i <= 0xa7) && j <= 0xa0) ||
					((0xaa <= i && i <= 0xaf) && j >= 0xa1) ||
					(0xf8 <= i && j >= 0xa1)
				) {
					continue;
				}
				var hex = gbk[k++];
				var key = Fn_Hex_decode(hex);
				if (isNaN(key)) continue;
				data.push([key, i << 8 | j])
			}
		}
		return data;
	};

	// 以GBk编码顺数排列的编码映射数组
	var data_sort_gbk = getSortGBK(Fn_unzip(String("{{zipData}}")));

	// 以Unicode编码顺序排列的编码映射数组
	var data_sort_unicode = data_sort_gbk.slice(0).sort(function (a, b) { return a[0] - b[0]; });

	/**
	 * 查询映射码
	 * @param {uint32} charCode 
	 * @param {bool} isgbk 
	 */
	function search(charCode, isgbk) {
		var k = 0,
			v = 1,
			arr = data_sort_unicode;
		isgbk && (k = 1, v = 0, arr = data_sort_gbk);

		// 二分法搜索
		var i,
			b = 0,
			e = arr.length - 1;

		while (b <= e) {
			i = ~~((b + e) / 2);
			var _i = arr[i][k];
			if (_i > charCode) {
				e = --i;
			} else if (_i < charCode) {
				b = ++i;
			} else {
				return arr[i][v];
			}
		}
		return -1;
	}

	var gbk = {
		encode: function (str) {
			str += '';
			var gbk = [];
			var wh = '?'.charCodeAt(0);
			for (var i = 0; i < str.length; i++) {
				var charcode = str.charCodeAt(i);
				if (charcode < 0x80) gbk.push(charcode)
				else {
					var gcode = search(charcode)
					if (~gcode) {
						gbk.push(0xFF & (gcode >> 8), 0xFF & gcode);
					} else {
						gbk.push(wh);
					}
				}
			}
			return gbk;
		},
		decode: function (arr) {
			var kb = '', str = "";
			for (var n = 0, max = arr.length; n < max; n++) {
				var Code = arr[n];
				if (Code & 0x80) {
					Code = search(Code << 8 | arr[++n], true);
				}
				str += String.fromCharCode(Code);
			}
			return str;
		}
	};
	gbk.URI = require('../src/URI')(gbk);
	return gbk;
}();

module.exports = GBK;