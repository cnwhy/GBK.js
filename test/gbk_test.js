var path = require('path');
var ststemjs = require('systemjs');
var GBK = require('../gbk');
function test(GBK){
	var testStr = "时顺地?abc地"
		,testArr = [ 202, 177, 203, 179, 181, 216, 63, 97, 98, 99, 181, 216 ];
	var url = 'https://abc.com/?kk=abv&bb=火车头#top',
		URI = 'https://abc.com/?kk=abv&bb=%BB%F0%B3%B5%CD%B7#top',
		URIComponent = 'https%3A%2F%2Fabc.com%2F%3Fkk%3Dabv%26bb%3D%BB%F0%B3%B5%CD%B7%23top';

	// console.log(GBK.encode(testStr).join());
	if(GBK.encode(testStr).join() != testArr.join()) throw('gbk编码错误!');
	if(GBK.decode(testArr) != testStr) throw('gbk解码错误!');
	if(GBK.URI.encodeURI(url) != URI) throw('URI编码错误!');
	if(GBK.URI.decodeURI(URI) != url) throw('URI解码错误!');
	if(GBK.URI.encodeURIComponent(url) != URIComponent) throw('URI编码错误!');
	if(GBK.URI.decodeURIComponent(URIComponent) != url) throw('URI解码错误!');	

}

// console.log(GBK.encode('#$&+,/:;=?@'));
// console.log(';,/?:@&=+$#'.split('').sort().join(''));

// console.log(GBK.URI.encodeURI("https://abc.com/?kk=abv&bb=火车头#top"));
// console.log(GBK.URI.encodeURIComponent("https://abc.com/?kk=abv&bb=火车头#top"));

Promise.resolve(GBK)
.then(test)
.then(console.log.bind(null,'node OK!'),console.error);

ststemjs.import(path.join(__dirname ,'../dist/gbk.js'))
.then(test)
.then(console.log.bind(null,'gbk_b OK!'),console.error);

ststemjs.import(path.join(__dirname ,'../dist/gbk2.js'))
.then(test)
.then(console.log.bind(null,'gbk2_b OK!'),console.error);