angular.module('reportServices', [])

.factory('Report', function($http) {
    var reportFactory = {}; // Create the reportFactory object

    reportFactory.create = function(violationData) {
        return $http.post('/api/violations', violationData);
    };
    reportFactory.createVehicleType = function(vehicleData) {
        return $http.post('/api/vehicles', vehicleData);
    };
    reportFactory.createStation = function(stationData) {
        return $http.post('/api/stations', stationData);
    };
    // Delete a user
    reportFactory.deleteViolation = function(violation_committed) {
        return $http.delete('/api/violationdataManagement/' + violation_committed);
    };
    // Delete a user
    reportFactory.deleteVehicle = function(vehicle_type) {
        return $http.delete('/api/vehicledataManagement/' + vehicle_type);
    };
    reportFactory.getVehicleType = function(id) {
        return $http.get('/api/editVehicleType/' + id);
    };
    // Edit a vehicle
    reportFactory.vehicleTypeChanges = function(id) {
        return $http.put('/api/editVehicleType', id);
    };
    reportFactory.getViolations = function(id) {
        return $http.get('/api/editViolation/' + id);
    };
    // Edit a vehicle
    reportFactory.violationChanges = function(id) {
        return $http.put('/api/editViolation', id);
    };
    reportFactory.getStations = function(id) {
        return $http.get('/api/editStation/' + id);
    };
    // Edit a vehicle
    reportFactory.stationChanges = function(id) {
        return $http.put('/api/editStation', id);
    };
    reportFactory.getFind = function(){
        return $http.get('/api/findReport/');
    };

    reportFactory.getViolationsData = function(){
        return $http.get('/api/violationdataManagement/');
    };
    reportFactory.getStationData = function(){
        return $http.get('/api/stationdataManagement/');
    };

    reportFactory.getVehicleTypesData = function(){
        return $http.get('/api/vehicledataManagement/');
    };
  //get info
     reportFactory.getReports = function(id){
         return $http.get('/api/editReport2/' +id);
     }
     //edit
     reportFactory.reportChanges = function(id){
         return $http.put('/api/editReport2', id);
     }
     //get info
    reportFactory.getEditedReports = function(id){
        return $http.get('/api/editReport/' +id);
    }
    //edit
    reportFactory.citizenReportChanges = function(id){
        return $http.put('/api/editReport', id);
    }
    // Get people involved to then edit
    reportFactory.getPeopleInvolved = function(id) {
        return $http.get('/api/editPeopleInvolved/' + id);
    };
    // Edit a  people involved
    reportFactory.peopleChanges = function(id) {
        return $http.put('/api/editPeopleInvolved', id);
    };
    // Get vehicle to then edit
    reportFactory.getVehicle = function(id) {
        return $http.get('/api/editVehicle/' + id);
    };
    // Edit a vehicle
    reportFactory.vehicleChanges = function(id) {
        return $http.put('/api/editVehicle', id);
    };
    reportFactory.savePeople = function(id){
       return $http.put('/api/addPeople', id);
    }
   reportFactory.saveVehicle = function(id){
      return $http.put('/api/addVehicle', id);
    }
    reportFactory.getCitizenReports = function() {
        return $http.get('/api/citizenReportManagement/');
    };

      return reportFactory; // Return reportFactory object
  });
