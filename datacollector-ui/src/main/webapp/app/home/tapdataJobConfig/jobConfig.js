 
angular
  .module('dataCollectorApp.home')
  .controller('jobConfigController', function ($scope, pipelineService, pipelineConstant) {
   
    $scope.$watch('pipelineConfig.metadata.tapdata_syncDate', function() {
        if(typeof typeof $scope.pipelineConfig.metadata.tapdata_syncDate === 'string'){
            $scope.pipelineConfig.metadata.tapdata_syncDate =  new Date($scope.pipelineConfig.metadata.tapdata_syncDate)
        }
      
    });
  });
