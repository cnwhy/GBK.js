
function getCode(str, i) {
	i = i || 0;
	return str.charCodeAt(i);
}

function getCodeHex(str,i){
	return getCode(str,i).toString(16);
}

function getCodeHexReg(str,i){
	return '\\x' + getCodeHex(str,i).padStart(2,"0")
}

function strToCodeStr(str){ //字符串转为代码中能用的字符串
	return JSON.stringify(str);
}

var chars = {
	'empt' : '#',
	'end' : '$',
	'set' : '!',
	'and' : '%',
	'split' : ' '
}

var reserved_max = (function(){
	var code = "";
	for(var k in chars){
		// console.log(chars[k] , code)
		if(chars[k] > code){
			code = chars[k]
		}
	}
	// console.log(code)
	return getCode(code);
})();

var _zip = function(thisHex){
	if(reserved_max >= thisHex.asciiRange[0]) throw 'Hex 占用保留字!';
	var BIT = thisHex.asciiRange[1] - thisHex.asciiRange[0] + 1;
	function arrHex(arr) {

		return arr.map((v) => {
			return v ? thisHex.encode(+v).padStart(3,thisHex.encode(0)) : chars.empt;
		});
	}
	
	/*
	压缩规则
	#  空码位符号
	#5$ 连续5个空码位  =>  ########
	ab!bcdef 前两位一至连续码位  => abb abc abd abe abf
	ab!a%dg 前两位一至,后一位连续 => aba abb abc abd abg
	" "(空格) 分隔符
	*/

	function zip(arr) {
		//开始生成压缩数据
		var gs = '';
		var c_k = chars.empt,
			c_e = chars.end,
			c_s = chars.set,
			c_a = chars.and,
			c_p = chars.split;

		var b01 = null //上一个码位的前两位
			,b2 = null //上一个码位的第三位
			,b2_mark = false;

		for (var k = 0; k < arr.length; k++) {
			var hex = arr[k];
			if (hex === c_k) {
				/* 处理空码位 */
				if(b2_mark){
					gs += c_a + b2;
					b2_mark = false;
				}
				b2 = null;
				gs += c_k;
				// 连续空码位处理
				// console.log(arr.slice(k + 1, k + 3).join(''))
				if (arr.slice(k + 1, k + 3).join('') === c_k.repeat(2)) {
					for (var kk = k + 3; kk < arr.length; kk++) {
						if (arr[kk] !== c_k) break;
					}
					gs += (kk - k - 3) + c_e;
					k = kk - 1;
					continue;
				}
			} else {
				// 压缩码位数据
				var _01 = hex.substr(0, 2);
				var _2 = hex.substr(2);
				// console.log(b01,_01);
				if (b01 === _01) {
					// gs += _2;
					if (b2 && getCode(b2) + 1 === getCode(_2)) {
						if (b2_mark) {// 第二位压缩已经是压缩状态;
							b2 = _2;
							continue; 
						}
						// k > 3 && console.log(hex); 
						var next = arr[k + 1]
							, n_01 = next ? next.substr(0, 2) : ''
							, n_2 = next ? next.substr(2) : ''
						if (next && b01 === n_01 && getCode(_2) + 1 === getCode(n_2)) {
							b2_mark = true;
							b2 = n_2;
							k++
							continue;
						}else{
							b2 = _2;
							gs += _2;
						}
					} else if (b2_mark) {
						gs += c_a + b2 + _2;
						b2_mark = false;
						b2 = _2;
					} else {
						b2 = _2;
						gs += _2;
					}
				} else {
					if(b2_mark){
						gs += c_a + b2;
						b2_mark = false;
						b2 = null;
					}
					gs += gs && b01 ? c_p : '';
					b01 = null;
					b2 = null;
					var next = arr[k + 1];
					if (next && _01 === next.substr(0, 2)) {
						b01 = _01;
						b2 = next.substr(2);
						gs += _01 + c_s + _2 + b2;
						k++;
					} else {
						gs += hex;
					}
				}
			}
		}
		if(b2_mark){
			gs += c_a + b2;
		}
		return gs;
	}
	
	//用于解压
	var unZipFn = function () {
		var b_e = getCodeHexReg(thisHex.encode(0)) + '-' + getCodeHexReg(thisHex.encode(BIT - 1));
		var r_k = getCodeHexReg(chars.empt),
			r_e = getCodeHexReg(chars.end),
			r_s = getCodeHexReg(chars.set),
			r_a = getCodeHexReg(chars.and),
			r_p = getCodeHexReg(chars.split);

		var reg = new RegExp(`([${b_e}]{2})${r_s}([${b_e}${r_k}]+)(?:${r_p}|$)`, 'g');
		return `function unZip() {
			return arguments[0].replace(/${r_k}(\\d+)${r_e}/g, function (a, b) {
					return Array(+b + 4).join(${strToCodeStr(chars.empt)});
				})
				.replace(/[${b_e}]${r_a}[${b_e}]/g,function(a){
					var b = a.substr(0,1).charCodeAt(0)
						,e = a.substr(2).charCodeAt(0)
						,str = String.fromCharCode(b);				
					while(b++<e){
						str += String.fromCharCode(b);
					}
					return str;
				})
				.replace(/${r_k}/g, ${strToCodeStr(chars.empt.repeat(3))})
				.replace(${reg}, function (all, hd, dt) {
					return dt.replace(/./g, function (a) {
						if (a != ${strToCodeStr(chars.empt)}) {
							return hd + a;
						} else {
							return a;
						}
					});
				})
				.match(/.../g);
		}`
	}();
	
	var  unZip = eval('(' + unZipFn + ')');

	return {
		arrHex: arrHex,
		zip: zip,
		decodeFn: thisHex.decodeFn,
		unZipFn: unZipFn,
		unZip: eval('(' + unZipFn + ')')
	};
}

// arr = arr.slice(0,10);
// var zipData = zip(arrHex(arr));
// console.log(zipData.replace(/\\/g, "\\\\"))

// console.log(arrHex(arr).join(',').length);
// console.log(JSON.stringify(zipData));
// console.log(unZip(zipData).join(',').length);


module.exports = _zip;