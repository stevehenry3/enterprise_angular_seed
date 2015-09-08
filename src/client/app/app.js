'use strict';

// Declare app level module which depends on views, and components
var mainApp = angular.module('mainApp', ['ngRoute', 'ngResource']);


mainApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/main',
			{
				templateUrl: 'main/templates/main.tpl.html',
				controller: 'mainCtrl'
			}
	);
	
	$routeProvider.when('/sample',
			{
				templateUrl: 'main/templates/sample.tpl.html',
				controller: 'sampleCtrl'
			}
	);
	
	$routeProvider.otherwise({redirectTo: 'main'});
}]);
