'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.initConfig({
    myAppOptions:{
      app : 'src',
      dist : 'dist'
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    connect: {
      options: {
        port: 9002,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        keepalive: true
      },
      test: {
        options: {
          base: '<%= myAppOptions.app %>'
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    }
  });
  
  grunt.registerTask('serve', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist']);
    }

    grunt.task.run([
      'open:server',
      'connect:test'
    ]);
  });
  
  grunt.registerTask('build', function() {
    grunt.log.error('build task not yet implemented');
  });

};