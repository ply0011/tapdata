 
angular
  .module('dataCollectorApp.home')
  .controller('jobConfigController', function ($scope, pipelineService, pipelineConstant) {
    angular.extend($scope, {
      addOneOPFilter: function(){
        $scope.pipelineConfig.metadata.op_filter.push([{db:'', collection:'', op: ''}])
      },
      removeFromOPFilters: function(index){
        $scope.pipelineConfig.metadata.op_filter.splice(index, 1);
      }
    })

    
    if($scope.pipelineConfig.metadata.op_filter.length === 0){
      $scope.pipelineConfig.metadata.op_filter = [{db:'', collection:'', op: ''}]
    }
    $scope.$watch('pipelineConfig.metadata.tapdata_syncDate', function() {
        if(typeof $scope.pipelineConfig.metadata.tapdata_syncDate === 'string'){
            $scope.pipelineConfig.metadata.tapdata_syncDate =  new Date($scope.pipelineConfig.metadata.tapdata_syncDate)
        }
      
    });
    $scope.$watchCollection('pipelineConfig.metadata.op_filter', function(newVal,oldVal,indexChanged){
      console.log('wt', 'pipelineConfig.metadata.op_filter',newVal,oldVal,indexChanged)
    }, true); 


  });
