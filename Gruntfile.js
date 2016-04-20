module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        expand : true,
        cwd : './static/js',
        src: ['**/*.js'],
        filter: 'isFile',
        dest: './static/js-min/'
      }
    }
    , less:{
        development: {
            options:{
                compress : true
            },
            files:[
                {
                    expand: true
                    , cwd : 'static/less'
                    ,src: ['**/*.less']
                    ,dest: './static/css/'
                    ,ext : '.css'
                }
            ]
        }
    }
    , watch:{
        options:{
            liveload:true
        }
        ,scripts:{
            files: ['./static/less/**/*.less']
            , tasks: 'less'
            , options:{
                spawn:false
            }
        }
    }
  });

  // 加载包含 "uglify" 任务的插件。
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['uglify','less','watch']);

};
