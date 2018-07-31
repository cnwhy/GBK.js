var gulp = require("gulp");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var clean = require("gulp-clean");
var header = require("gulp-header");
var replace = require("gulp-replace");


var rollup = require("rollup");
var commonjs = require("rollup-plugin-commonjs");
var resolve = require("rollup-plugin-node-resolve");

var package = require("./package.json");

var NAME = "GBK";
var banner =
	'/*!\n' +
	' * ' + package.name + ' v' + package.version + '\n' +
	' * Homepage ' + package.homepage + '\n' +
	' * License ' + package.license + '\n' +
	' */\n';
var outputDir = 'dist/'

// 构建浏览器文件
gulp.task('browserFile', function () {
	var zip = require('./datazip');
	var decodeFn = zip.decodeFn
		,unZipFn = zip.unZipFn;
	return gulp.src('./browser-source/!(*.build).js')
		.pipe(replace('String("{{zipData}}")', JSON.stringify(zip.zipData)))
		.pipe(replace('Function("{{decodeFn}}")', decodeFn))
		.pipe(replace('Function("{{unZipFn}}")', unZipFn))
		.pipe(rename({
			extname: ".build.js"
		}))
		.pipe(gulp.dest('./browser-source'))
})

function runRollup(input, output, format) {
	var inputopt = {
		plugins: [
			resolve(),
			commonjs()
		]
	}
	var outputopt = {
		format: format ? format :'umd',
		name: NAME,
		banner: banner,
		sourcemap: false
	}
	return rollup.rollup(Object.assign({}, inputopt, {
		input: input
	})).then(function (bundle) {
		return bundle.write(Object.assign({}, outputopt, {
			file: output,
		}))
	})
}

gulp.task('clear:outdir', function(){
	return gulp.src(outputDir,{read: false})
		.pipe(clean());
})

gulp.task('clear:tempfile',['build'], function(){
	return gulp.src('./browser-source/*.build.js',{read: false})
		.pipe(clean());
})


gulp.task('rollup', ['clear:outdir','browserFile'], function () {
	return Promise.all([
		runRollup('./browser-source/gbk.build.js', outputDir + 'gbk.js'),
		runRollup('./browser-source/gbk2.build.js', outputDir + 'gbk2.js'),
		// runRollup('./browser-source/gbk.build.js', outputDir + 'gbk.cjs.js','cjs'),
		// runRollup('./browser-source/gbk2.build.js', outputDir + 'gbk2.cjs.js','cjs'),
	]).then(function(){
		// return Promise.all([
		// 	runRollup(outputDir + 'gbk.cjs.js', outputDir + 'gbk.js'),
		// 	runRollup(outputDir + 'gbk2.cjs.js', outputDir + 'gbk2.js'),
		// ])
	})
})

gulp.task('min',['rollup'],function () {
	return gulp.src(['dist/!(*.min).js'])
	.pipe(uglify())
	.pipe(header(banner))
	.pipe(rename({
		suffix:".min"
	}))
	.pipe(gulp.dest(outputDir));
})

gulp.task('build',['browserFile','rollup','min'], function () {
	// var zip = require('./datazip');
	// var decodeFn = zip.decodeFn
	// 	,unZipFn = zip.unZipFn;
	// // return;
	// return gulp.src('./browser-source/*.js')
	// 	.pipe(replace('String("{{zipData}}")', JSON.stringify(zip.zipData)))
	// 	.pipe(replace('Function("{{decodeFn}}")', decodeFn))
	// 	.pipe(replace('Function("{{unZipFn}}")', unZipFn))
	// 	.pipe(browserify())
	// 	.pipe(header(banner))
	// 	.pipe(gulp.dest('./dist'))
	// 	//生成压缩版
	// 	.pipe(uglify())
	// 	.pipe(header(banner))
	// 	.pipe(rename({ suffix: ".min" }))
	// 	.pipe(gulp.dest('./dist'));
})

gulp.task('default', ['build','clear:tempfile']);