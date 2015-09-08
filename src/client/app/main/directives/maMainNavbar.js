mainApp.directive('maMainNavbar', function() {
    return {
        restrict: 'E',
        replace: false,
        controller: 'maMainNavbarCtrl',
        templateUrl: 'main/templates/maMainNavbar.tpl.html',
        scope: {

        }
    }
});

mainApp.controller('maMainNavbarCtrl', function($scope) {
    console.log("Created 'maMainNavbar' directive!");

});