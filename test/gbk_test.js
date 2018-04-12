var path = require('path');
var ststemjs = require('systemjs');
var GBK_node = require('../gbk');
function test(GBK){
	var testStr = "时顺地?abc地"
		,testArr = [ 202, 177, 203, 179, 181, 216, 63, 97, 98, 99, 181, 216 ];
	// console.log(GBK.encode(testStr).join());
	if(GBK.encode(testStr).join() != testArr.join()) throw('编码错误!');
	if(GBK.decode(testArr) != testStr) throw('解码错误!');
}

Promise.resolve(GBK_node)
.then(test)
.then(console.log.bind(null,'node OK!'),console.error);

ststemjs.import(path.join(__dirname ,'../dist/gbk.js'))
.then(test)
.then(console.log.bind(null,'gbk_b OK!'),console.error);

ststemjs.import(path.join(__dirname ,'../dist/gbk2.js'))
.then(test)
.then(console.log.bind(null,'gbk2_b OK!'),console.error);