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

	$routeProvider.when('/blog',
		{
			templateUrl: 'blog/templates/blBlog.tpl.html',
			controller: 'blBlogCtrl'
		}
	);

	$routeProvider.when('/about',
		{
			templateUrl: 'about/templates/abAbout.tpl.html',
			controller: 'aboutCtrl'
		}
	);

	$routeProvider.when('/contact',
		{
			templateUrl: 'contact/templates/coContactUs.tpl.html',
			controller: 'coContactUsCtrl'
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
