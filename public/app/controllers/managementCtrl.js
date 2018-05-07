angular.module('managementController', [])

// Controller: User to control the management page and managing of user accounts
.controller('managementCtrl', function(User, $scope, $timeout, $location) {
    var app = this;

    app.loading = true; // Start loading icon on page load
    app.accessDenied = true; // Hide table while loading
    app.errorMsg = false; // Clear any error messages
    app.editAccess = false; // Clear access on load
    app.deleteAccess = false; // CLear access on load
    app.deleteUserAccess = false;
    app.permissionAccess = false;
    app.userAccess = false;
    app.stationAccess = false;
    app.mainAccess = false;
    //app.limit = 3; // Set a default limit to ng-repeat
    app.searchLimit = 0; // Set the default search page results limit to zero

    this.regUser = function(regData, valid, confirmed) {
        app.loading = true; // Activate bootstrap loading icon
        app.errorMsg = false; // Clear errorMsg each time user submits
        // If form is valid and passwords match, attempt to create user
        if (valid && confirmed) {
            app.regData.police_name = app.regData.firstName + " " + app.regData.lastName; // Combine first and last name before submitting to database
            app.regData.police_station = document.getElementById('stationChoices').value;
            // Runs custom function that registers the user in the database
            User.create(app.regData).then(function(data) {
                // Check if user was saved to database successfully
                if (data.data.success) {
                    app.loading = false; // Stop bootstrap loading icon
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // If successful, grab message from JSON object and redirect to login page
                   $scope.regData.police_name = "";
                    // Redirect after 2000 milliseconds (2 seconds)
                    $timeout(function() {
                        app.successMsg = false;
                          app.regData.police_name = "";
                    }, 2000);
                } else {
                    app.loading = false; // Stop bootstrap loading icon
                    app.disabled = false; // If error occurs, remove disable lock from form
                    $scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsg = data.data.message; // If not successful, grab message from JSON object
                    $timeout(function() {
                      app.errorMsg = false;
                    }, 2000);
                }
            });
        } else {
            app.disabled = false; // If error occurs, remove disable lock from form
            app.loading = false; // Stop bootstrap loading icon
            $scope.alert = 'alert alert-danger'; // Set class for message
            app.errorMsg = 'Please ensure form is filled our properly'; // Display error if valid returns false
        }
    };

    //  Custom function that checks if username is available for user to use
    this.checkUsername = function(regData) {
        app.checkingUsername = true; // Start bootstrap loading icon
        app.usernameMsg = false; // Clear usernameMsg each time user activates ngBlur
        app.usernameInvalid = false; // Clear usernameInvalid each time user activates ngBlur

        // Runs custom function that checks if username is available for user to use
        User.checkUsername(app.regData).then(function(data) {
            // Check if username is available for the user
            if (data.data.success) {
                app.checkingUsername = false; // Stop bootstrap loading icon
                app.usernameMsg = data.data.message; // If successful, grab message from JSON object
            } else {
                app.checkingUsername = false; // Stop bootstrap loading icon
                app.usernameInvalid = true; // User variable to let user know that the chosen username is taken already
                app.usernameMsg = data.data.message; // If not successful, grab message from JSON object
            }
        });
    };

    // Custom function that checks if e-mail is available for user to use
    this.checkEmail = function(regData) {
        app.checkingEmail = true; // Start bootstrap loading icon
        app.emailMsg = false; // Clear emailMsg each time user activates ngBlur
        app.emailInvalid = false; // Clear emailInvalid each time user activates ngBlur

        // Runs custom function that checks if e-mail is available for user to use
        User.checkEmail(app.regData).then(function(data) {
            // Check if e-mail is available for the user
            if (data.data.success) {
                app.checkingEmail = false; // Stop bootstrap loading icon
                app.emailMsg = data.data.message; // If successful, grab message from JSON object
            } else {
                app.checkingEmail = false; // Stop bootstrap loading icon
                app.emailInvalid = true; // User variable to let user know that the chosen e-mail is taken already
                app.emailMsg = data.data.message; // If not successful, grab message from JSON object
            }
        });
    };

    // Function: get all the users from database
    function getUsers() {
        // Runs function to get all the users from database
        User.getUsers().then(function(data) {
            // Check if able to get data from database
            if (data.data.success) {
                // Check which permissions the logged in user has
                if (data.data.police_permission === 'main' || data.data.police_permission === 'station') {
                    app.police_users = data.data.police_users; // Assign users from database to variable
                    app.loading = false; // Stop loading icon
                    app.accessDenied = false; // Show table
                    // Check if logged in user is an admin or moderator
                    if (data.data.police_permission === 'main') {
                        app.editAccess = true; // Show edit button
                        app.deleteUserAccess = true; // Show delete button
                        app.permissionAccess = true;
                        app.stationAccess = true;
                        app.mainAccess = true;
                        app.userAccess = false;
                        app.disabledOption = true;
                    } else if (data.data.police_permission === 'station') {
                        app.disabledOption = true;
                        app.editAccess = true; // Show edit button
                        app.deleteUserAccess = true; // Show delete button
                        app.permissionAccess = true;
                        app.userAccess = true;
                        app.mainAccess = false;
                        app.stationAccess = false;
                    }
                } else {
                    app.errorMsg = 'Insufficient Permissions'; // Reject edit and delete options
                    app.loading = false; // Stop loading icon
                }
            } else {
                app.errorMsg = data.data.message; // Set error message
                app.loading = false; // Stop loading icon
            }
        });
    }

    getUsers(); // Invoke function to get users from databases

    // Function: Show more results on page
    app.showMore = function(number) {
        app.showMoreError = false; // Clear error message
        // Run functio only if a valid number above zero
        if (number > 0) {
            app.limit = number; // Change ng-repeat filter to number requested by user
        } else {
            app.showMoreError = 'Please enter a valid number'; // Return error if number not valid
        }
    };

    // Function: Show all results on page
    app.showAll = function() {
        app.limit = undefined; // Clear ng-repeat limit
        app.showMoreError = false; // Clear error message
    };

    // Function: Delete a user
    app.deleteUser = function(police_username) {
       if (confirm('Are you sure you want to delete this?')) {
         // Run function to delete a user
         User.deleteUser(police_username).then(function(data) {
             // Check if able to delete user
             if (data.data.success) {
                 getUsers(); // Reset users on page
             } else {
                 app.showMoreError = data.data.message; // Set error message
             }
         });
       }
     };

    // Function: Perform a basic search function
    app.search = function(searchKeyword, number) {
        // Check if a search keyword was provided
        if (searchKeyword) {
            // Check if the search keyword actually exists
            if (searchKeyword.length > 0) {
                app.limit = 0; // Reset the limit number while processing
                $scope.searchFilter = searchKeyword; // Set the search filter to the word provided by the user
                app.limit = number; // Set the number displayed to the number entered by the user
            } else {
                $scope.searchFilter = undefined; // Remove any keywords from filter
                app.limit = 0; // Reset search limit
            }
        } else {
            $scope.searchFilter = undefined; // Reset search limit
            app.limit = 0; // Set search limit to zero
        }
    };

    // Function: Clear all fields
    app.clear = function() {
        $scope.number = 'Clear'; // Set the filter box to 'Clear'
        app.limit = 0; // Clear all results
        $scope.searchKeyword = undefined; // Clear the search word
        $scope.searchFilter = undefined; // Clear the search filter
        app.showMoreError = false; // Clear any errors
    };

})
// Controller: Used to edit users
.controller('editCtrl', function($scope, $routeParams, User, $timeout) {
    var app = this;
    User.getPolice($routeParams.id).then(function(data){
      if (data.data.success) {
          $scope.editName = data.data.police.police_name;
          $scope.editEmail = data.data.police.police_email;
          $scope.editContact = data.data.police.police_contact;
          $scope.editUsername = data.data.police.police_username;
          $scope.editAddress = data.data.police.police_address;
          $scope.editGender = data.data.police.police_gender;
          $scope.editRank = data.data.police.police_rank;
          $scope.editStation = data.data.police.police_station;
          $scope.editPermission = data.data.police.police_permission;
          $scope.showId = data.data.police._id;
        }
      });
       app.updatePolice = function(valid, editName, editEmail, editContact, editUsername,editAddress, editGender, editRank, editStation, editPermission){
          if(valid){
             var userObject = {};
             userObject._id = $scope.showId;
             userObject.police_name = $scope.editName;
             userObject.police_email = $scope.editEmail;
             userObject.police_contact = $scope.editContact
             userObject.police_username = $scope.editUsername;
             userObject.police_address = $scope.editAddress;
             userObject.police_gender = $scope.editGender;
             userObject.police_rank = $scope.editRank;
             userObject.police_station = document.getElementById('stationChoices').value;
             userObject.police_permission =$scope.editPermission;


            User.policeChanges(userObject).then(function(data){

            if (data.data.success) {
              $scope.alert = 'alert alert-success'; // Set class for message
              app.successMsg = data.data.message; // Set success message
              // Function: After two seconds, clear and re-enable
              $timeout(function() {
                  app.successMsg = false; // Clear success message
                  app.disabled = false; // Enable form for editing
              }, 2000);
            } else {
                $scope.alert = 'alert alert-danger'; // Set class for message
                app.errorMsg = data.data.message; // Clear any error messages

                // Function: After two seconds, clear and re-enable
                $timeout(function() {
                    app.errorMsg = false; // Clear success message
                    app.disabled = false; // Enable form for editing
                }, 2000);
            }
         });
        } else {
            $scope.alert = 'alert alert-danger'; // Set class for message
            app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
            app.disabled = false; // Enable form for editing

        }
      }
});
