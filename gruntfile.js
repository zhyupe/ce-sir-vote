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

    cssmin: {
      dist: {
        src: ['src/css/*.css'],
        dest: 'dist/app.css'
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: [ 'index.html' ],
          dest: 'dist/'
        }, {
          expand: true,
          cwd: 'assets/',
          src: [ '**' ],
          dest: 'dist/assets/'
        }]
      }
    },
    'gh-pages': {
      options: {
        base: 'dist'
      },
      dist: {
        src: ['**']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('dev', [ 'html2js:dist', 'cssmin', 'concat:dist', 'copy:dist',
    'clean:temp', 'copy:dist']);
  grunt.registerTask('dist', [ 'html2js:dist', 'cssmin', 'concat:dist', 'uglify:dist', 'copy:dist',
    'clean:temp', 'copy:dist', 'gh-pages' ]);
};