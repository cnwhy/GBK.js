var Benchmark = require('benchmark');
var fs = require('fs');
var textbuff = fs.readFileSync(__dirname+"/gbk");
var textbuff_min = fs.readFileSync(__dirname+"/gbk_min");
var iconv = require('iconv-lite');

var iconv_gbk = { 
	decode: function(arr){
		return iconv.decode(arr,'gbk');
	}
}


// console.log(iconv_gbk.decode(textbuff_min));
// return;

var gbks = {
	'obj     ' : require('./v_decode/gbk_ObjectMap'),
	// 'map     ' : require('./v_decode/gbk_Map'),
	'Array   ' : require('./v_decode/gbk_Array'),
	'2       ' : require('./v_decode/gbk_2'),
	'iconv   ' : iconv_gbk,
}

function addTest(suite,buff){
	for(var a in gbks){
		(function(){
			var gbk_dc = gbks[a].decode;
			//console.log('a: ',gbk_dc(textbuff));
			suite.add(a,function(){
				gbk_dc(buff);
			})
		}())
	}
}

console.log('big:')
var suite = new Benchmark.Suite;
addTest(suite,textbuff);

// 添加测试
suite
	// .add('obj', function () {
	// 	/o/.test('Hello World!');
	// })
	// .add('String#indexOf', function () {
	// 	'Hello World!'.indexOf('o') > -1;
	// })
	// add listeners
	.on('cycle', function (event) {
		console.log(String(event.target));
	})
	// .on('complete', function () {
	// 	console.log(this.filter('fastest'));
	// })
	// run async
	.run({ 'async': false });

console.log('small:')
var suite1 = new Benchmark.Suite;
addTest(suite1,textbuff_min);
	
suite1
	.on('cycle', function (event) {
		console.log(String(event.target));
	})
	.run({ 'async': false });
