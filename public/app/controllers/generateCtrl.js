angular.module('generateController', ['generateServices'])

// Controller: User to control the management page and managing of user accounts
.controller('generateCtrl', function(Reports, $scope) {
    var app = this;
    $scope.list = {}
    //all fraud
    function generateFraud() {
            Reports.generateFraud().then(function(data) {
                  if (data.data.success) {
                        app.fraud = data.data.fraud;

                  }
            });
      };
      generateFraud();
      //all factual
      function generateFactual(){
            Reports.generateFactual().then(function(data){
                  if (data.data.success) {
                        app.factual = data.data.factual;
                  }
            })
      };
      generateFactual();


      //annual Reports
      function generateAnnual(){
            Reports.Annual().then(function(data){
                  if(data.data.success){
                        app.station = data.data.station;
                  }
            })
      };
      generateAnnual();
      //accident type
      function generateType(){
            Reports.Type().then(function(data){
                  if(data.data.success){
                        app.type = data.data.type;
                  }
            })
      };
      generateType();

      //accident cause
      function generateCause(){
            Reports.Cause().then(function(data){
              if(data.data.success){
                app.cause = data.data.cause;
              }
            })
      };

      generateCause();

      //vehicle type
      function generateVehicle(){
            Reports.vehicleType().then(function(data){
                if(data.data.success){
                  app.vehicleType = data.data.vehicleType;
                }
            })
      };
      generateVehicle();

      //violation
      function generateViolation(){
            Reports.violation().then(function(data){
              if(data.data.success){
                app.violation = data.data.violation;
              }
            })
      };
      generateViolation();

});
