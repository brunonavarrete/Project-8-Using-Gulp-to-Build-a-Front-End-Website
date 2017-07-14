const 	gulp = require('gulp'), // -v 4 alpha
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		maps = require('gulp-sourcemaps'),
		rename = require('gulp-rename'),
		sass = require('gulp-sass'),
		csso = require('gulp-csso'),
		imagemin = require('gulp-imagemin'),
		replace = require('gulp-replace-path'),
		browserSync = require('browser-sync').create(),
		del = require('del');

const opts = {
	src: 'src',
	dist: 'dist'
}

// Build pipeline
	// scripts
		gulp.task('concatScripts', gulp.series( () => {
			return gulp.src([
				`${opts.src}/js/circle/autogrow.js*`,
				`${opts.src}/js/circle/circle.js*`
				])
			.pipe(maps.init())
			.pipe(concat('global.js'))
			.pipe(maps.write('./'))
			.pipe(gulp.dest(`${opts.src}/js`))
		}));

		gulp.task('scripts',gulp.series('concatScripts', () => {
			return gulp.src(`${opts.src}/js/global.js`)
			.pipe(uglify())
			.pipe(rename('all.min.js'))
			.pipe(gulp.dest(`${opts.dist}/scripts`))
		}));

	// styles
		gulp.task('compileSass', gulp.series( () => {
			return gulp.src(`${opts.src}/sass/**/*.scss*`)
			.pipe(maps.init())
			.pipe(sass())
			.pipe(rename('global.css'))
			.pipe(maps.write('./'))
			.pipe(gulp.dest(`${opts.src}/css`))
			.pipe(browserSync.stream())
		}));

		gulp.task('styles', gulp.series('compileSass', () => {
			return gulp.src(`${opts.src}/css/global.css`)
			.pipe(csso())
			.pipe(rename('all.min.css'))
			.pipe(gulp.dest(`${opts.dist}/styles`))
		}));

	// images
		gulp.task('images', gulp.series( () => {
			return gulp.src(opts.src + '/images/*.{png,gif,jpg}')
			.pipe(imagemin())
			.pipe(gulp.dest(`${opts.dist}/content`))
		}));

	// html
		gulp.task('html', gulp.series( () => {
			return gulp.src(`${opts.src}/index.html`)
			.pipe(replace('css/global.css','styles/all.min.css'))
			.pipe(replace('js/global.js','scripts/all.min.js'))
			.pipe(replace('images/','content/'))
			.pipe(gulp.dest(`${opts.dist}`))
		}) );

	// clean
		gulp.task('clean', gulp.series( () => {
			return del([opts.dist]);
		}));

	// build
		gulp.task('build', gulp.series('clean', ['scripts', 'styles', 'images', 'html']));	

	// reload
		gulp.task('reload', gulp.series('styles', (done) => {
			browserSync.reload();
			done();
		}));

// Dev pipeline
	// default
		gulp.task('default', gulp.series('build', () => {
			// serve
				browserSync.init({
					server: {
						baseDir: 'dist'
					}
				});
			// watch
				gulp.watch(opts.src + '/sass/**/*.scss', gulp.series('reload') );
		}));