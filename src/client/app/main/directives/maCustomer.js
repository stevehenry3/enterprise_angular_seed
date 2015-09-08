mainApp.directive('maCustomer', function() {
	return {
		restrict: 'E',
		replace: false,
		controller: 'maCustomerCtrl',
		templateUrl: 'main/templates/maCustomer.tpl.html',
		scope: {
			
		}
	}
});

mainApp.controller('maCustomerCtrl', function($scope, maCustomerService) {
	console.log("Created 'maCustomer' directive!");
	
	$scope.customer = maCustomerService.getCustomer();
});