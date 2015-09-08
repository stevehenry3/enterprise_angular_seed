mainApp.directive('maBuildWebsite', function() {
    return {
        restrict: 'E',
        replace: false,
        controller: 'maBuildWebsiteCtrl',
        templateUrl: 'main/templates/maBuildWebsite.tpl.html',
        scope: {

        }
    }
});

mainApp.controller('maBuildWebsiteCtrl', function($scope) {
    console.log("Created 'maBuildWebsite' directive!");

});