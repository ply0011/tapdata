var gulp = require('gulp');
var gutil = require('gulp-util');
//var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var riot = require('gulp-riot');
var rename = require('gulp-rename');
//var sh = require('shelljs');
var del = require('del');
var uglify = require('gulp-uglify');
//var templateCache = require('gulp-angular-templatecache');

gulp.task('clean', function (cb) {
	  del([       
	    'js/visor*',
	    'js/core/visor*',
	    'js/diagrammenu.js',
	    'js/diagrammenu.min.js'
	  ], cb);
	});



gulp.task('default',function(){		 
     
	 gulp.src(['js/core/tags/propertyEditorWidget.tag','js/core/tags/propertyEditorExtension.tag','js/core/tags/propertyEditorObjectData.tag','js/core/tags/widgets.tag','js/core/tags/navigation.tag'])
     .pipe(concat("visor.ui.tag"))    //www/js下所有的js文件 合并到libs.js
     .pipe(riot())
     .pipe(gulp.dest("js/core"))  //合并后文件放入目标文件夹
     .pipe(rename("visor.ui.js"))    //重命名
     .pipe(uglify())   
     .pipe(rename("visor.ui.min.js")) 
     .pipe(gulp.dest("js")) 
     
    gulp.src(['js/diagrammenu.tag'])     
     .pipe(riot())
     .pipe(gulp.dest("js"))  //合并后文件放入目标文件夹
     .pipe(rename("diagrammenu.js"))    //重命名
     .pipe(uglify())   
     .pipe(rename("diagrammenu.min.js")) 
     .pipe(gulp.dest("js")) 
         
     gulp.src(['js/core/widgets/visor.core.js','js/core/widgets/visor.widgets.js','js/core/widgets/*.js'])
	    .pipe(concat("visor_widgets.js"))    //www/js下所有的js文件 合并到libs.js        
	    .pipe(gulp.dest("js/core"))  //合并后文件放入目标文件夹
	    .pipe(uglify())                   //混淆文件
	    .pipe(rename("visor_widgets.min.js"))    //重命名
	    .pipe(gulp.dest("js"));  //合并后文件放入目标文件夹
	    
	    gulp.src(['js/core/designer/*.js'])
	    .pipe(concat("visor_designer.js"))    //www/js下所有的js文件 合并到libs.js        
	    .pipe(gulp.dest("js/core"))  //合并后文件放入目标文件夹
	    .pipe(uglify())                   //混淆文件
	    .pipe(rename("visor_designer.min.js"))    //重命名
	    .pipe(gulp.dest("js"));  //合并后文件放入目标文件夹
      
  
})