angular.module('userApp', ['appRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'resetController', 'addCtrl','managementController','reportServices','reportManagementController', 'addCtrl','headerCtrl', 'geolocation', 'gservice', 'resetRequestController','angularjs-datetime-picker', 'generateController'])

.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');

  });
