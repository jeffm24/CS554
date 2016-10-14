const gulp = require("gulp");
const concatenate = require("gulp-concat");
const autoPrefix = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const gulpSASS = require("gulp-sass");
const uglify = require("gulp-uglify");
const order = require("gulp-order");
const run = require('gulp-run');
const livereload = require('gulp-livereload');

const jsFiles = "./public/js/source/*.js";
const sassFiles = "./public/css/source/*.scss";
const handlebarsFiles = "./views/**/*.handlebars";

gulp.task("scripts", () => {
    gulp.src([jsFiles])
        .pipe(order([
            "main.js"
        ]))
        .pipe(concatenate("scripts.min.js"))
        //.pipe(uglify())
        .pipe(gulp.dest("./public/js/"))
        .pipe(livereload());
});

gulp.task("sass", () => {
    gulp.src(sassFiles)
        .pipe(order([
            "main.scss"
        ]))
        .pipe(concatenate("styles.scss"))
        .pipe(gulpSASS())
        .pipe(concatenate("styles.min.css"))
        .pipe(autoPrefix())
        .pipe(cleanCSS())
        .pipe(gulp.dest("./public/css/"))
        .pipe(livereload());
});

gulp.task('handlebars', function() {
    gulp.src(handlebarsFiles)
        .pipe(livereload());
});


gulp.task('run', function() {
    return run('electron .').exec();
});


gulp.task("watch", () => {
    livereload.listen();
    gulp.watch(sassFiles, ["sass"]);
    gulp.watch(jsFiles, ["scripts"]);
    gulp.watch(handlebarsFiles, ['handlebars']);
});

gulp.task("default", ["watch", "run"]);
