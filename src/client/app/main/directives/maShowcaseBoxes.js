mainApp.directive('maShowcaseBoxes', function() {
    return {
        restrict: 'E',
        replace: false,
        controller: 'maShowcaseBoxesCtrl',
        templateUrl: 'main/templates/maShowcaseBoxes.tpl.html',
        scope: {

        }
    }
});

mainApp.controller('maShowcaseBoxesCtrl', function($scope) {
    console.log("Created 'maShowcaseBoxes' directive!");

});