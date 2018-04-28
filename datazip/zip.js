// const Hex = require('./Hex');
// const Hex64 = Hex(BIT); // 基于ASCII的64进制转换类 

function getCode(str, i) {
	i = i || 0;
	return str.charCodeAt(i);
}

var _zip = function(thisHex){
	var BIT = thisHex.asciiRange[1] - thisHex.asciiRange[0] + 1;
	function arrHex(arr) {
		return arr.map((v) => {
			return v ? (new Array(3).join(thisHex.encode(0)) + thisHex.encode(+v)).match(/...$/)[0] : "#"
		});
	}
	
	
	/*
	压缩规则
	#  空码位
	#5$ 连续5个空码位  =>  ########
	ab+bcdef 前两位一至连续码位  => abb abc abd abe abf
	ab+a-dg 前两位一至,后一位连续 => aba abb abc abd abg
	, 分隔符
	*/
	function zip(arr) {
		//开始生成压缩数据
		var gs = '';
		var b01 = null //上一个码位的前两位
			,b2 = null //上一个码位的第三位
			,b2_mark = false;
		for (var k = 0; k < arr.length; k++) {
			var hex = arr[k];
			
			if (hex === '#') {
				if(b2_mark){
					gs += '-' + b2;
					b2_mark = false;
				}
				b2 = null;
				// 处理空码位
				gs += '#';
				// 连续空码位处理
				// console.log(arr.slice(k + 1, k + 3).join(''))
				if (arr.slice(k + 1, k + 3).join('') === "##") {
					for (var kk = k + 3; kk < arr.length; kk++) {
						if (arr[kk] !== "#") break;
					}
					gs += (kk - k - 3) + '$';
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
						gs += '-' + b2 + _2;
						b2_mark = false;
						b2 = _2;
					} else {
						b2 = _2;
						gs += _2;
					}
				} else {
					if(b2_mark){
						gs += '-' + b2;
						b2_mark = false;
						b2 = null;
					}
					gs += gs && b01 ? ',' : '';
					b01 = null;
					b2 = null;
					var next = arr[k + 1];
					if (next && _01 === next.substr(0, 2)) {
						b01 = _01;
						b2 = next.substr(2);
						gs += _01 + '+' + _2 + b2;
						k++;
					} else {
						gs += hex;
					}
				}
			}
		}
		if(b2_mark){
			gs += '-' + b2;
		}
		return gs;
	}
	
	//用于解压
	var unZipFn = function () {
		var b = thisHex.encode(0).charCodeAt(0).toString(16) //起始字符
			, e = thisHex.encode(BIT - 1).charCodeAt(0).toString(16)//结束字符
		var reg = new RegExp(`([\\x${b}-\\x${e}]{2})\\+([\\x${b}-\\x${e}\\#]+)(?:\\,|$)`, 'g');
		return `function unZip() {
			return arguments[0].replace(/\\#(\\d+)\\$/g, function (a, b) {
					return Array(+b + 4).join('#');
				})
				.replace(/[\\x${b}-\\x${e}]\\-[\\x${b}-\\x${e}]/g,function(a){
					var b = a.substr(0,1).charCodeAt(0)
						,e = a.substr(2).charCodeAt(0)
						,str = String.fromCharCode(b);				
					while(b++<e){
						str += String.fromCharCode(b);
					}
					return str;
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