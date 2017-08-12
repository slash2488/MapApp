module.exports = function(config) {
    config.set({
      basePath: '../',
      frameworks: ['jasmine'],
      files: [
        "bower_components/angular/angular.js",
        // src files
        "app/scripts/app.js",
        // test files
        "test/**/**/*.js"
      ],
     
    });
  };