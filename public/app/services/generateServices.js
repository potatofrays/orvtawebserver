angular.module('generateServices', [])

.factory('Reports', function($http) {
    var generateFactory = {}; // Create the userFactory object

    // Register users in database
    generateFactory.generateFraud = function(){
        return $http.get('/api/fraud/');
    }
    generateFactory.generateFactual = function(){
        return $http.get('/api/factual/');
    }
    //Report Generate--------------------------
    generateFactory.Annual =function(){
        return $http.get('/api/station/');
    }
    generateFactory.Type = function(){
        return $http.get('/api/accidentType/');
    }
    generateFactory.Cause = function(){
        return $http.get('/api/accidentCause/');
    }
    generateFactory.vehicleType = function(){
        return $http.get('/api/vehicleType/');
    }
    generateFactory.violation = function(){
        return $http.get('/api/violation/');
    }

    return generateFactory;
})
