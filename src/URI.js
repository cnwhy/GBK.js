module.exports = function(GBK){
	var passChars = '!\'()*-._~';	
	var otherPassChars = '#$&+,/:;=?@';
	function getModue(passChars){
		var passBits = passChars.split('').sort();
		var isPass = function (s){
			return ~passChars.indexOf(s) || /[0-9a-zA-Z]/.test(s)
		}
		return {
			encode:function(str){
				return (str+'').replace(/./g,function(v){
					if(isPass(v)) return v;
					var bitArr = GBK.encode(v);
					for(var i=0; i<bitArr.length; i++){
						bitArr[i] = '%' + ('0'+bitArr[i].toString(16)).substr(-2).toUpperCase();
					}
					return bitArr.join('');
				})
			},
			decode:function(enstr){
				enstr = String(enstr);
				var outStr = '';
				for(var i=0; i<enstr.length; i++){
					var char = enstr.charAt(i);
					if(char === '%' && i + 2 < enstr.length){ 
						var code1 = parseInt(enstr.substr(i+1,2),16)
						if(!isNaN(code1)){
							var _i = i + 2;
							if(code1 > 0x80){
								var code2;
								if(enstr.charAt(_i+1) === '%'){
									code2 = parseInt(enstr.substr(_i+2,2),16)
									_i += 3;
								}else{
									code2 = enstr.charCodeAt(_i+1);
									_i += 1;
								}
								if(code2 >= 0x40){
									i = _i;
									outStr += GBK.decode([code1,code2]);
									continue;
								}
							}else{
								i += 2;
								outStr += String.fromCharCode(code1);
								continue;
							}
						}
					}
					outStr += char;
				}
				return outStr;

			}
		}
	}

	var URIComponent = getModue(passChars);
	var URI = getModue(passChars + otherPassChars);

	return {
		encodeURI:URI.encode,
		decodeURI:URI.decode,
		encodeURIComponent:URIComponent.encode,
		decodeURIComponent:URIComponent.decode
	}
};