var app = app || angular
  .module('blgCoreApp', [
    'gettext'
//,'tmh.dynamicLocale'
  ]);
app.factory('translate',
  ['gettextCatalog', //'tmhDynamicLocale',
      function (gettextCatalog/*, tmhDynamicLocale*/) {
          return {
              setCurrentLanguage: function (locale) {
                  sessionStorage.locale = locale;
                  var local_path = './languages/' + locale + '.json';
                  gettextCatalog.loadRemote(local_path);
                  gettextCatalog.setCurrentLanguage(locale);
              },
              getCurrentLanguage: function () { return gettextCatalog.getCurrentLanguage(); },
              getString: function (str, data) { return gettextCatalog.getString(str, data); },
              getErrorString: function (errorCode, data) {
                  var str = isNaN(errorCode) ? errorCode : gettextCatalog.getString(errorCode, data);
                  if (!isNaN(str)) {
                      var defaultErrorCode = 10;
                      str = gettextCatalog.getString(defaultErrorCode) + ' (' + errorCode + ')';
                  }
                  return str;
              }
          };
      } ])
  .run(['translate', // initialize for language setting
  function (translate) {
      var locale = 'en-US';
      translate.setCurrentLanguage(locale);
  }]);

  app.controller('mainCtrl', ['$scope', 'translate',
  function($scope, translate) {
    $scope.$on('setLanguage', function(e, locale) {
      translate.setCurrentLanguage(locale);
    });
  }]);

  jQuery('body').attr('ng-controller', 'mainCtrl');

  angular.$setLanguage = function (locale) {
      var scope = angular.element('body').scope();
      scope.$apply(function () {
          scope.$emit('setLanguage', locale);
      });
  };

  angular.element(document).ready(function () {
      angular.bootstrap(document, ['blgCoreApp']);
  });
