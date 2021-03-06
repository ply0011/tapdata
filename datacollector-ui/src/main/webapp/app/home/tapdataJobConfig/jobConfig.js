 
angular
  .module('dataCollectorApp.home')
  .controller('jobConfigController', function ($scope,    $rootScope,    api, pipelineService, pipelineConstant) {
    angular.extend($scope, {
      addOneOPFilter: function(type){
        $scope.pipelineConfig.metadata.op_filter[type].filters.push({collection:'', op: ''})
      },
      removeFromOPFilters: function(type,index){
        $scope.pipelineConfig.metadata.op_filter[type].filters.splice(index, 1);
      }, 
      tempSave: function(){
        $scope.lastChangeTime = new Date().getTime();
        var t = $scope.lastChangeTime
        setTimeout(function(){
          if($scope.lastChangeTime == t)
            $rootScope.$broadcast('pip-saveUpdates', $scope.pipelineConfig)
        },1000)
      }
    })

    if(!$scope.pipelineConfig.metadata.op_filter || $scope.pipelineConfig.metadata.op_filter.length === 0) {
      $scope.pipelineConfig.metadata.op_filter = [
        {"action": "skip", "filters":[{ collection:'', op: ''}]},
        {"action": "abort", "filters":[{ collection:'', op: ''}]},
      ]
    }
    
    $scope.pipelineConfig.metadata.op_filter2 =`
      tableA.delete
      *.dropTable
      tableB*.create_index
    `

    $scope.$watch('pipelineConfig.metadata.tapdata_syncDate', function() {
        if(typeof $scope.pipelineConfig.metadata.tapdata_syncDate === 'string'){
            $scope.pipelineConfig.metadata.tapdata_syncDate =  new Date($scope.pipelineConfig.metadata.tapdata_syncDate)
        }
      
    });
    $scope.$watch('pipelineConfig.metadata.op_filter', function(newVal,oldVal,indexChanged){
      console.log('wt', 'pipelineConfig.metadata.op_filter',newVal,oldVal,indexChanged)
    }, true); 


  });
