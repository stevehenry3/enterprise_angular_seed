mainApp.factory('maCustomerService', function($resource) {
	
	var customerRes = $resource('api/customer', null, {
		get: { 
			method: 'GET', 
			isArray: false, 
			url: 'api/customer' 
		}
	});
	
	return {
		getCustomer: getCustomer
	};
	
	function getCustomer() {
		return customerRes.get();
	}
	
	
});