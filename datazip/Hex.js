var RANGE_END = 126; //ascii 可视字符最大码

/**
 * 以ascii字符进行无符号制转换 所有进制的最大数都为 ~ 
 * @param {Int} bit 几进制 最大95 因为ascii可视字符只有95个
 */
function Hex(bit) {
	var _max = bit >> 0;
	var RANGE_BEGIN = RANGE_END - _max + 1;
	if (RANGE_BEGIN < 32 || RANGE_BEGIN >= RANGE_END) throw TypeError('参数错误!')
	
	function hexCode(n, code) {
		code = code || '';
		var y = n % _max >> 0; //取余数
		code = String.fromCharCode(RANGE_BEGIN + y) + code;
		if (y < n) {
			return hexCode(n / _max >> 0, code)
		} else {
			// if (~code.indexOf("0")) throw n;
			return code;
		}
	}
	
	// function unHexCode(str){
	// 	var n = 0;
	// 	for (var i = 0,w = str.length; i < w; i++) {
	// 		var code = str.charCodeAt(i);
	// 		if(code < RANGE_BEGIN || code > RANGE_END) return NaN;
	// 		n += (code - RANGE_BEGIN) * Math.pow(_max, w - i - 1);
	// 	}
	// 	return n;
	// }
	
	var decodeFn = (function(){
		return `function decode(){
			var n = 0, str = arguments[0];
			for (var i = 0,w = str.length; i < w; i++) {
				var code = str.charCodeAt(i);
				if(code < ${RANGE_BEGIN} || code > ${RANGE_END}) return NaN;
				n += (code - ${RANGE_BEGIN}) * Math.pow(${_max}, w - i - 1);
			}
			return n;
		}`;
	})();

	return {
		asciiRange: [RANGE_BEGIN,RANGE_END],
		encode : function(n){
			return hexCode(Math.abs(n) >> 0);
		},
		// decode : unHexCode,
		decode : eval('('+decodeFn+')'), 
		decodeFn : decodeFn
	}
}

module.exports = Hex;
