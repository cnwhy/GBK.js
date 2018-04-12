var path = require("path");
var gulp = require("gulp");
var UglifyJS = require("uglify-js");
var browserify = require("gulp-browserify");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var header = require("gulp-header");
var replace = require("gulp-replace");
var package = require("./package.json");
var banner =
	'/*!\n' +
	' * ' + package.name + ' v' + package.version + '\n' +
	' * Homepage ' + package.homepage + '\n' +
	' * License ' + package.license + '\n' +
	' */\n'

function minifyFnstr(fnstr){
	var result = UglifyJS.minify(fnstr);
	if(result.error) throw result.error;
	return result.code;
}


gulp.task('build', function () {
	var zip = require('./datazip');
	var decodeFn = zip.decodeFn
		,unZipFn = zip.unZipFn;
	// return;
	return gulp.src('./browser-source/*.js')
		.pipe(replace('"{{zipData}}"', JSON.stringify(zip.zipData)))
		.pipe(replace('Function("{{decodeFn}}")', decodeFn))
		.pipe(replace('Function("{{unZipFn}}")', unZipFn))
		.pipe(browserify())
		.pipe(header(banner))
		.pipe(gulp.dest('./dist'))
		//生成压缩版
		.pipe(uglify())
		.pipe(header(banner))
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest('./dist'));
})

gulp.task('default', ['build']);