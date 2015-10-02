"use strict";

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      dist: {
        files: {
          'dist/app.js': [ 'dist/app.js' ]
        }
      }
    },

    html2js: {
      dist: {
        src: [ 'src/view/*.html' ],
        dest: 'tmp/templates.js'
      },
      options: {
        htmlmin: {
          collapseWhitespace: true
        }
      }
    },

    clean: {
      temp: {
        src: [ 'tmp' ]
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'src/js/angular.min.js',
          'src/js/angular-animate.min.js',
          'src/js/angular-aria.min.js',
          'src/js/angular-messages.min.js',
          'src/js/angular-route.min.js',
          'src/js/angular-material.js',
          'src/js/app.js',
          'tmp/*.js' ],
        dest: 'dist/app.js'
      }
    },

    connect: {
      server: {
        options: {
          hostname: 'localhost',
          port: 8080
        }
      }
    },

    watch: {
      dev: {
        files: [ 'Gruntfile.js', 'src/js/*.js', 'src/view/*.html', 'src/css/*.css' ],
        tasks: [ 'cssmin', 'html2js:dist', 'concat:dist', 'clean:temp' ],
        options: {
          atBegin: true
        }
      },
      min: {
        files: [ 'Gruntfile.js', 'app/*.js', '*.html' ],
        tasks: [ 'cssmin', 'html2js:dist', 'concat:dist', 'clean:temp', 'uglify:dist' ],
        options: {
          atBegin: true
        }
      }
    },

    cssmin: {
      dist: {
        src: ['src/css/*.css'],
        dest: 'dist/app.css'
      }
    },

    compress: {
      dist: {
        options: {
          archive: '<%= pkg.name %>-<%= pkg.version %>.zip'
        },
        files: [{
          src: [ 'index.html' ],
          dest: '/'
        }, {
          src: [ 'dist/**' ],
          dest: 'dist/'
        }, {
          src: [ 'assets/**' ],
          dest: 'assets/'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('dev', [ 'connect:server', 'watch:dev' ]);
  grunt.registerTask('minified', [ 'connect:server', 'watch:min' ]);
  grunt.registerTask('package', [ 'html2js:dist', 'cssmin', 'concat:dist', 'uglify:dist',
    'clean:temp', 'compress:dist' ]);
};