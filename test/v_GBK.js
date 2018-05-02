var path = require('path');
var fs = require('fs');
var systemjs = require('systemjs');
var Benchmark = require('benchmark');
var textbuff = fs.readFileSync(__dirname + "/gbk");
var textbuff_min = fs.readFileSync(__dirname + "/gbk_min");

var GBK_node = require('../');
var gbk_b = systemjs.import(path.join(__dirname, '../dist/gbk.js'))
var gbk2_b = systemjs.import(path.join(__dirname, '../dist/gbk2.js'))

var iconv = require('iconv-lite');
var iconv_gbk = { 
	decode: function(arr){
		return iconv.decode(arr,'gbk');
	},
	encode: function(str){
		return iconv.encode(str,'gbk');
	}
}



Promise.all([GBK_node, gbk_b, gbk2_b]).then(([gbk_node, gbk_b, gbk2_b]) => {
	var gbks = {
		'gbk_node  ': gbk_node,
		'gbk_b     ': gbk_b,
		'gbk2_b    ': gbk2_b,
		'iconv_gbk ': iconv_gbk,
	}

	var str = gbk2_b.decode(textbuff);
	var str_min = gbk2_b.decode(textbuff_min);
// console.log(str_min);
// console.log(gbk_node.encode("123"));

	function addTest_decode(suite, buff) {
		for (var a in gbks) {
			(function () {
				var gbk_dc = gbks[a].decode;
				suite.add(a, function () {
					gbk_dc(buff);
				})
			}())
		}
		return suite;
	}

	function addTest_encode(suite, str) {
		for (var a in gbks) {
			(function () {
				var gbk_en = gbks[a].encode;
				suite.add(a, function () {
					gbk_en(str);
				})
			}())
		}
		return suite;
	}

	console.log('big decode:')
	addTest_decode(new Benchmark.Suite, textbuff)
		.on('cycle', function (event) {
			console.log(String(event.target));
		})
		.run({ 'async': false });

	console.log('small decode:')
	addTest_decode(new Benchmark.Suite, textbuff_min)
		.on('cycle', function (event) {
			console.log(String(event.target));
		})
		.run({ 'async': false });

	console.log("-----------------")

	console.log('big encode:')
	addTest_encode(new Benchmark.Suite, str)
		.on('cycle', function (event) {
			console.log(String(event.target));
		})
		.run({ 'async': false });

	console.log('small encode:')
	addTest_encode(new Benchmark.Suite, str_min)
		.on('cycle', function (event) {
			console.log(String(event.target));
		})
		.run({ 'async': false });



}).catch(console.log)

