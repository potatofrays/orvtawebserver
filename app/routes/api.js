var police_user = require('../models/user'); // Import User Model
var models = require('../models/police_reports'); // Import Report Model
var account_reset = require('../models/accountReset');
var jwt = require('jsonwebtoken'); // Import JWT Package
var secret = 'harrypotter'; // Create custom secret for use in JWT
var nodemailer = require('nodemailer'); // Import Nodemailer Package
var sgTransport = require('nodemailer-sendgrid-transport'); // Import Nodemailer Sengrid Transport Package

module.exports = function(router) {
    // Nodemailer options (use with g-mail or SMTP)
    var client = nodemailer.createTransport({
        service: 'Zoho',
        auth: {
            user: 'orvtiateam@zoho.com', // Your email address
            pass: 'orvt1ate@m' // Your password
        },
        tls: { rejectUnauthorized: false }
    });
    // var client = nodemailer.createTransport(sgTransport(options)); // Use if using sendgrid configuration
    // End Sendgrid Configuration Settings
    // Route to register new users
    router.post('/police_users', function(req, res) {
        var user = new police_user(); // Create new User object
        user.police_username = req.body.police_username; // Save username from request to User object
        user.police_password = req.body.police_password; // Save password from request to User object
        user.police_email = req.body.police_email; // Save email from request to User object
        user.police_name = req.body.police_name; // Save name from request to User object
        user.police_contact = req.body.police_contact; // Save contact number from request to User object
        user.police_station = req.body.police_station; // Save station from request to User object
        user.police_permission = req.body.police_permission;
        user.police_gender = req.body.police_gender; // Save gender from request to User object
        user.police_rank = req.body.police_rank; // Save rank from request to User object
        user.police_address = req.body.police_address;

        user.temporarytoken = jwt.sign({ police_username: user.police_username, police_email: user.police_email }, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail

        // Check if request is valid and not empty or null
        if (req.body.police_username === null || req.body.police_username === '' || req.body.police_password === null || req.body.police_password === '' || req.body.police_email === null || req.body.police_email === ''
        || req.body.police_name === null || req.body.police_name === ''|| req.body.police_contact === null || req.body.police_contact === '' || req.body.police_station === null
        || req.body.police_station === '' || req.body.police_gender === null || req.body.police_gender === '' || req.body.police_rank === null || req.body.police_rank === '' || req.body.police_permission === null || req.body.police_permission === ''
        || req.body.police_address === null || req.body.police_address === '') {
            res.json({ success: false, message: 'Ensure all data were provided' });
        } else {
            // Save new user to database
            user.save(function(err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors !== null) {
                        if (err.errors.police_name) {
                            res.json({ success: false, message: err.errors.police_name.message }); // Display error in validation (name)
                        } else if (err.errors.police_email) {
                            res.json({ success: false, message: err.errors.police_email.message }); // Display error in validation (email)
                        } else if (err.errors.police_username) {
                            res.json({ success: false, message: err.errors.police_username.message }); // Display error in validation (username)
                        } else if (err.errors.police_password) {
                            res.json({ success: false, message: err.errors.police_password.message }); // Display error in validation (password)
                        } else if (err.errors.police_contact) {
                            res.json({ success: false, message: err.errors.police_contact.message }); // Display error in validation (password)
                        } else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                            if (err.errmsg[61] == "u") {
                                res.json({ success: false, message: 'That username is already taken' }); // Display error if username already taken
                            } else if (err.errmsg[61] == "e") {
                                res.json({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
                            }
                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {
                    res.json({ success: true, message: 'Police account registered.' }); // Send success message back to controller/request

                }
            });
        }
    });
    // Route to check if username chosen on registration page is taken
    router.post('/checkusername', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That username is already taken' }); // If user is returned, then username is taken
                } else {
                    res.json({ success: true, message: 'Valid username' }); // If user is not returned, then username is not taken
                }
            }
        });
    });
    // Route to check if e-mail chosen on registration page is taken
    router.post('/checkemail', function(req, res) {
        police_user.findOne({ police_email: req.body.police_email }).select('police_email').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That e-mail is already taken' }); // If user is returned, then e-mail is taken
                } else {
                    res.json({ success: true, message: 'Valid e-mail' }); // If user is not returned, then e-mail is not taken
                }
            }
        });
    });
    // Route for user logins
    router.post('/authenticate', function(req, res) {
        var loginUser = (req.body.police_username); // Ensure username is checked in lowercase against database
        police_user.findOne({ police_username: loginUser }).select('police_name police_email police_username police_password police_station police_permission').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if user is found in the database (based on username)
                if (!user) {
                    res.json({ success: false, message: 'Username not found' }); // Username not found in database
                } else if (user) {
                    // Check if user does exist, then compare password provided by user
                    if (!req.body.police_password){
                      res.json({ success: false, message: 'No password provided' }); // Password and Station was not provided
                    } else {
                        var validPassword = user.comparePassword(req.body.police_password); // Check if password matches password provided by user
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
                        } else {
                          if (user.police_permission === 'user'){
                              res.json({ success: false, message: 'You must be an admin to login.' }); // Password does not match password in database
                          } else if (user.police_permission === 'main' && user.police_station !== 'Lingayen'){
                                res.json({ success: false, message: 'Your station must be Lingayen.' }); // Password does not match password in database
                          } else {
                            var token = jwt.sign({ police_name: user.police_name, police_username: user.police_username, police_email: user.police_email, police_station: user.police_station, police_permission: user.police_permission  }, secret, { expiresIn: '24h' }); // Logged in: Give user token
                            res.json({ success: true, message: 'User authenticated', token: token }); // Return token in JSON object to controller
                          }
                        }
                    }
                }
            }
        });
    });
    // Route to send user's username to e-mail
    router.get('/resetusername/:police_email', function(req, res) {
        police_user.findOne({ police_email: req.params.police_email }).select('police_email police_name police_username').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: err }); // Error if cannot connect
            } else {
                if (!user) {
                    res.json({ success: false, message: 'E-mail was not found' }); // Return error if e-mail cannot be found in database
                } else {
                    // If e-mail found in database, create e-mail object
                    var email = {
                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                        to: user.police_email,
                        subject: 'Android Username Request',
                        text: 'Hello ' + user.police_name + ', You recently requested your username. Please save it in your files: ' + user.police_username,
                        html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>You recently requested your username. Please save it in your files: ' + user.police_username
                    };

                    // Function to send e-mail to user
                    client.sendMail(email, function(err, info) {
                        if (err) {
                            console.log(err); // If error in sending e-mail, log to console/terminal
                        } else {
                            console.log(info); // Log confirmation to console
                        }
                    });
                    res.json({ success: true, message: 'Username has been sent to e-mail! ' }); // Return success message once e-mail has been sent
                }
            }
        });
    });
    // Route to send reset link to the user
    router.put('/resetpassword', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username police_email resettoken police_name').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Username was not found' }); // Return error if username is not found in database
                } else {
                    user.resettoken = jwt.sign({ police_username: user.police_username, police_email: user.police_email }, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail
                    // Save token to user in database
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err }); // Return error if cannot connect
                        } else {
                            // Create e-mail object to send to user
                            var email = {
                                from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                to: user.police_email,
                                subject: 'Reset Password Request',
                                text: 'Hello ' + user.police_name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://orvtawebserver.herokuapp.com/reset/' + user.resettoken,
                                html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://orvtawebserver.herokuapp.com/reset/' + user.resettoken + '">http://orvtawebserver.herokuapp.com/reset/</a>'
                            };
                            // Function to send e-mail to the user
                            client.sendMail(email, function(err, info) {
                                if (err) {
                                    console.log(err); // If error with sending e-mail, log to console/terminal
                                } else {
                                    console.log(info); // Log success message to console
                                    console.log('sent to: ' + user.email); // Log e-mail
                                }
                            });
                            res.json({ success: true, message: 'Please check your e-mail for password reset link' }); // Return success message
                        }
                    });
                }
            }
        });
    });
    // Route to verify user's e-mail activation link
    router.get('/resetpassword/:token', function(req, res) {
        police_user.findOne({ resettoken: req.params.token }).select().exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                var token = req.params.token; // Save user's token from parameters to variable
                // Function to verify token
                jwt.verify(token, secret, function(err, decoded) {
                    if (err) {
                        res.json({ success: false, message: 'Password link has expired' }); // Token has expired or is invalid
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'Password link has expired' }); // Token is valid but not no user has that token anymore
                        } else {
                            res.json({ success: true, user: user }); // Return user object to controller
                        }
                    }
                });
            }
        });
    });
    // Save user's new password to database
    router.put('/savepassword', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username police_email police_name police_password resettoken').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (req.body.police_password === null || req.body.police_password === '') {
                    res.json({ success: false, message: 'Password not provided' });
                } else {
                    user.police_password = req.body.police_password; // Save user's new password to the user object
                    user.resettoken = false; // Clear user's resettoken
                    // Save user's new data
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            // Create e-mail object to send to user
                            var email = {
                                from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                to: user.police_email,
                                subject: 'Password Recently Reset',
                                text: 'Hello ' + user.police_name + ', This e-mail is to notify you that your password was recently reset at localhost.com',
                                html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at localhost.com'
                            };
                            // Function to send e-mail to the user
                            client.sendMail(email, function(err, info) {
                                if (err) console.log(err); // If error with sending e-mail, log to console/terminal
                            });
                            res.json({ success: true, message: 'Password has been reset!' }); // Return success message
                        }
                    });
                }
            }
        });
    });
    // Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

        // Check if token is valid and not expired
        if (token) {
            // Function to verify token
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
                } else {
                    req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
                    next(); // Required to leave middleware
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
        }
    });
    // Route to get the currently logged in user
    router.post('/me', function(req, res) {
        res.send(req.decoded); // Return the token acquired from middleware
    });
    // Route to provide the user with a new token to renew session
    router.get('/renewToken/:police_username', function(req, res) {
        police_user.findOne({ police_username: req.params.police_username }).select('police_username police_email').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if username was found in database
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); // Return error
                } else {
                    var newToken = jwt.sign({ police_username: user.police_username, email: user.police_email,  }, secret, { expiresIn: '24h' }); // Give user a new token
                    res.json({ success: true, token: newToken }); // Return newToken in JSON object to controller
                }
            }
        });
    });
    // Route to get the current user's permission level
    router.get('/permission', function(req, res) {
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if username was found in database
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); // Return an error
                } else {
                    res.json({ success: true, police_permission: user.police_permission }); // Return the user's permission
                }
            }
        });
    });
    // Route to get all users for management page
    router.get('/management', function(req, res) {
        police_user.find({}, function(err, police_users) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in user was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === "Lingayen") {
                                // Check if users were retrieved from database
                              if (!police_users) {
                                  res.json({ success: false, message: 'Users not found' }); // Return error
                              } else {
                                police_user.find({ police_permission: { $ne: 'main'}}, function(err, police_users){

                                    res.json({ success: true, police_users: police_users, police_permission: mainUser.police_permission, police_station: mainUser.police_station }); // Return
                                  });
                                }
                            } else if (mainUser.police_permission === 'station'){
                              // Check if users were retrieved from database
                              if (!police_users) {
                                  res.json({ success: false, message: 'Users not found' }); // Return error
                              } else {
                                police_user.find({ police_station: req.decoded.police_station, police_permission: 'user'}, function(err, police_users) {
                                  res.json({ success: true, police_users: police_users, police_permission: mainUser.police_permission, police_station: mainUser.police_station }); // Return users, along with current user's permission
                                });
                              }
                            }  else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });

    });
    // Route to delete a user
    router.delete('/management/:police_username', function(req, res) {
        var deletedUser = req.params.police_username; // Assign the username from request parameters to a variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if current user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if curent user has admin access
                    if (mainUser.police_permission !== 'main' && mainUser.police_permission !== 'station') {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    } else {
                        // Fine the user that needs to be deleted
                        police_user.findOneAndRemove({ police_username: deletedUser }, function(err, user) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'orvtiadeveloper@zoho.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                res.json({ success: true }); // Return success status
                            }
                        });
                    }
                }
            }
        });
    });
    router.get('/edit2/:id', function(req, res){
       police_user.findById(req.params.id, function(err, police){
           if(err){
               res.json(500, err);
           } else {
               res.json({success: true, police: police});
           }
       })
    });
    router.put('/edit2', function(req,res){
      police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
        if (mainUser.police_permission === 'station' || mainUser.police_permission === 'main'){
          if (req.body.police_name || req.body.police_email || req.body.police_username || req.body.police_contact
          || req.body.police_address || req.body.police_gender || req.body.police_rank ||  req.body.police_station || req.body.police_permission){
          police_user.findById(req.body._id, function(err, police){
              if (err){
                  res.json(500, err);
              } else {
                if (req.body.police_permission === 'user'){
                   if (police.police_permission === 'station' || police.police_permission === 'main'){
                     if (mainUser.police_permission !== 'main'){
                        res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                     } else {
                       police.police_station = req.body.police_station;
                       police.police_name = req.body.police_name;
                       police.police_email = req.body. police_email;
                       police.police_username = req.body.police_username;
                       police.police_contact = req.body.police_contact;
                       police.police_address = req.body.police_address;
                       police.police_gender = req.body.police_gender;
                       police.police_rank = req.body.police_rank;
                       police.police_permission = req.body.police_permission;
                       police.save(function(err){
                         if (err) {
                           res.json(500, err);
                         } else {
                           res.json({success: true, message: 'Updated', police: police});
                         }
                       });
                     }
                   } else {
                     police.police_station = req.body.police_station;
                     police.police_name = req.body.police_name;
                     police.police_email = req.body. police_email;
                     police.police_username = req.body.police_username;
                     police.police_contact = req.body.police_contact;
                     police.police_address = req.body.police_address;
                     police.police_gender = req.body.police_gender;
                     police.police_rank = req.body.police_rank;
                     police.police_permission = req.body.police_permission;
                     police.save(function(err){
                       if (err) {
                         res.json(500, err);
                       } else {
                         res.json({success: true, message: 'Updated', police: police});
                       }
                     });
                   }
                 } else if (req.body.police_permission === 'station'){
                   if (police.police_permission === 'user'){
                     if (mainUser.police_permission !== 'main'){
                        res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                     } else {
                       police.police_station = req.body.police_station;
                       police.police_name = req.body.police_name;
                       police.police_email = req.body. police_email;
                       police.police_username = req.body.police_username;
                       police.police_contact = req.body.police_contact;
                       police.police_address = req.body.police_address;
                       police.police_gender = req.body.police_gender;
                       police.police_rank = req.body.police_rank;
                       police.police_permission = req.body.police_permission;
                       police.save(function(err){
                         if (err) {
                           res.json(500, err);
                         } else {
                           res.json({success: true, message: 'Updated', police: police});
                         }
                       });
                     }
                  } else {
                    police.police_station = req.body.police_station;
                    police.police_name = req.body.police_name;
                    police.police_email = req.body. police_email;
                    police.police_username = req.body.police_username;
                    police.police_contact = req.body.police_contact;
                    police.police_address = req.body.police_address;
                    police.police_gender = req.body.police_gender;
                    police.police_rank = req.body.police_rank;
                    police.police_permission = req.body.police_permission;
                    police.save(function(err){
                      if (err) {
                        res.json(500, err);
                      } else {
                        res.json({success: true, message: 'Updated', police: police});
                      }
                    });
                  }
                 } else if (req.body.police_permission === 'main'){
                   if (mainUser.police_permission === 'main'){
                     police.police_station = req.body.police_station;
                     police.police_name = req.body.police_name;
                     police.police_email = req.body. police_email;
                     police.police_username = req.body.police_username;
                     police.police_contact = req.body.police_contact;
                     police.police_address = req.body.police_address;
                     police.police_gender = req.body.police_gender;
                     police.police_rank = req.body.police_rank;
                     police.police_permission = req.body.police_permission;
                     police.save(function(err){
                       if (err) {
                         res.json(500, err);
                       } else {
                         res.json({success: true, message: 'Updated', police: police});
                       }
                     });
                   } else {
                      res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                   }
                 } else {
                    res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                 }
              }
            });
          } else {
            res.json({success: false, message: 'No Update'});
          }
        } else {
          res.json({success: false, message: 'Insufficient Permission Lol'});
        }
     });
    });
    router.get('/findReport', function(req,res){
     models.Police_Report.find({})
     .populate({path:"people_involved_id", model:"People_Involved"})
     .populate({path:"vehicle_id", model:"Vehicle_Involved"})
     .exec(function(err, police_reports){

         if (err) {
             res.json(500,err);
         }else{
             police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                 if (err) {
                     // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                 var email = {
                     from: 'ORVTIA Team Staff, orvtiaquestion@gmail.com',
                     to: 'orvtiateam@gmail.com',
                     subject: 'Error Logged',
                     text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                     html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                 };
                 // Function to send e-mail to myself
                 client.sendMail(email, function(err, info) {
                     if (err) {
                         console.log(err); // If error with sending e-mail, log to console/terminal
                     } else {
                         console.log(info); // Log success message to console if sent
                         console.log(user.email); // Display e-mail that it was sent to
                     }
                 });
                 res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                 } else {
                     // Check if logged in report was found in database
                     if (!mainUser) {
                         res.json({ success: false, message: 'No user found' }); // Return error
                     } else {
                         // Check if user has editing/deleting privileges
                         if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                             // Check if users were retrieved from database
                             if (!police_reports) {
                                 res.json({ success: false, message: 'No report found' }); // Return error
                             } else {
                               models.Police_Report.find({ $and: [{report_credibility: { $ne: 'Fraud'}}, {report_credibility: { $ne: 'Pending'}}]})
                               .populate({path:"people_involved_id", model:"People_Involved"})
                               .populate({path:"vehicle_id", model:"Vehicle_Involved"})
                               .exec(function(err,police_reports){
                               if (err) {
                                        res.json(500,err);
                                } else {
                                   res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                               }
                           });

                             }
                         } else if (mainUser.police_permission === 'station' && mainUser.police_station === req.decoded.police_station){
                             if (!police_reports) {
                                 res.json({ success: false, message: 'No report found' }); // Return error
                             } else {
                                 models.Police_Report.find({address_municipality: req.decoded.police_station, $and: [{report_credibility: { $ne: 'Fraud'}}, {report_credibility: { $ne: 'Pending'}}]})
                                 .populate({path:"people_involved_id", model:"People_Involved"})
                                 .populate({path:"vehicle_id", model:"Vehicle_Involved"})
                                 .exec(function(err,police_reports){
                                 if (err) {
                                          res.json(500,err);
                                  } else {
                                     res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                 }
                             });
                             }

                         } else {
                             res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                         }
                     }
                 }
             });
         }
     });
    });
    router.get('/editReport2/:id', function(req, res){
      models.Police_Report.findById(req.params.id, function(err,report){
          if(err){
              res.json(500,err);
          } else {
              res.json({success: true, report: report});
          }
      });
    });
    router.put('/editReport2', function(req,res){
      if(req.body.accident_type || req.body.accident_cause || req.body.address_thoroughfare
      || req.body.address_municipality || req.body.address_province || req.body){
      models.Police_Report.findById(req.body._id, function(err, report){
        if (err) {
          res.json(500, err);
        } else {
          report.committed_at = req.body.committed_at;
          report.accident_type = req.body.accident_type;
          report.accident_cause = req.body.accident_cause;
          report.address_thoroughfare = req.body.address_thoroughfare;
          report.address_municipality = req.body.address_municipality;
          report.address_province = req.body.address_province;
          report.save(function(err){
            if (err) {
                 res.json(500, err);
             } else {
                res.json({success: true, message: 'Updated', report: report});
             }
           });
          }
       });
      }
    });
    router.get('/editReport/:id', function(req, res){
      models.Police_Report.findById(req.params.id, function(err,report){
          if(err){
              res.json(500,err);
          }else{
              res.json({success: true, report: report});
          }
      });
    });
    router.put('/editReport', function(req,res){
      if(req.body.accident_type || req.body.accident_cause || req.body.address_thoroughfare
      || req.body.address_municipality || req.body.address_province || req.body.report_credibility || req.body.police_username || req.body.onDuty || req.body.police_reported_at){
      models.Police_Report.findById(req.body._id, function(err, report){
        if (err) {
          res.json(500, err);
        } else {
          report.committed_at = req.body.committed_at;
          report.accident_type = req.body.accident_type;
          report.accident_cause = req.body.accident_cause;
          report.address_thoroughfare = req.body.address_thoroughfare;
          report.address_municipality = req.body.address_municipality;
          report.address_province = req.body.address_province;
          report.report_credibility = req.body.report_credibility;
          report.police_username = req.body.police_username;
          report.onDuty = req.body.onDuty;
          report.police_reported_at = req.body.police_reported_at;
          report.save(function(err){
            if (err) {
                 res.json(500, err);
             } else {
                res.json({success: true, message: 'Updated', report: report});
             }
           });
          }
       });
      }
    });
    router.put('/addPeople', function(req,res){
        if(req.body.people_involved_age || req.body.people_involved_name || req.body.people_involved_gender || req.body.people_involved_citizenship
        || req.body.people_involved_violation || req.body.people_involved_status || req.body.people_involved_type){
        models.Police_Report.findById(req.body._id, function(err, people){
            var addPep = new models.People_Involved();
            addPep.people_involved_age = req.body.people_involved_age;
            addPep.people_involved_name = req.body.people_involved_name;
            addPep.people_involved_gender = req.body.people_involved_gender;
            addPep.people_involved_citizenship = req.body.people_involved_citizenship;
            addPep.people_involved_violation = req.body.people_involved_violation;
            addPep.people_involved_status = req.body.people_involved_status;
            addPep.people_involved_type = req.body.people_involved_type;
            addPep.save();
            if(err){
                 res.json(500, err);
             } else if (people){
                people.people_involved_id.push(addPep);
                people.save();
                res.json({success:true, message: 'Sa wakas'});
             }
          });
        }
    });
    router.put('/addVehicle', function(req,res){
        if(req.body.vehicle_platenumber || req.body.vehicle_brand || req.body.vehicle_involved_type || req.body.vehicle_model || req.body.vehicle_driver){
        models.Police_Report.findById(req.body._id, function(err, vehicle){
            var addVehicle = new models.Vehicle_Involved();
            addVehicle.vehicle_platenumber = req.body.vehicle_platenumber;
            addVehicle.vehicle_brand = req.body.vehicle_brand;
            addVehicle.vehicle_involved_type = req.body.vehicle_involved_type;
            addVehicle.vehicle_model = req.body.vehicle_model;
            addVehicle.vehicle_driver = req.body.vehicle_driver;
            addVehicle.save();
              if(err){
                   res.json(500, err);
               } else if (vehicle){
                  vehicle.vehicle_id.push(addVehicle);
                  vehicle.save();
                  res.json({success:true, message: 'Added Successfully'});
               }
          });
        }
    });
    router.get('/editPeopleInvolved/:id', function(req, res){
     models.People_Involved.findById(req.params.id, function(err, people) {
          if(err){
              res.json(500,err);
          }else{
              res.json({success: true, people: people});
          }
      });
    });
    router.put('/editPeopleInvolved', function(req,res){
      if(req.body.people_involved_age || req.body.people_involved_name || req.body.people_involved_gender || req.body.people_involved_citizenship
      || req.body.people_involved_violation || req.body.people_involved_status || req.body.people_involved_type){
      models.People_Involved.findById(req.body._id, function(err, people){
        if (err) {
          res.json(500, err);
        } else {
          people.people_involved_name = req.body.people_involved_name;
          people.people_involved_age = req.body.people_involved_age;
          people.people_involved_gender = req.body.people_involved_gender;
          people.people_involved_citizenship = req.body.people_involved_citizenship;
          people.people_involved_violation = req.body.people_involved_violation;
          people.people_involved_status = req.body.people_involved_status;
          people.people_involved_type = req.body.people_involved_type;
          people.save(function(err){
            if (err) {
                 res.json(500, err);
             } else {
                res.json({success: true, message: 'Updated', people: people});
             }
           });
          }
       });
      }
    });
    router.get('/editVehicle/:id', function(req, res){
     models.Vehicle_Involved.findById(req.params.id, function(err, vehicle) {
          if(err){
              res.json(500,err);
          }else{
              res.json({success: true, vehicle: vehicle});
          }
      });
    });
    router.put('/editVehicle', function(req,res){
          if(req.body.vehicle_platenumber || req.body.vehicle_brand || req.body.vehicle_involved_type || req.body.vehicle_model){
        models.Vehicle_Involved.findById(req.body._id, function(err, vehicle){
          if (err) {
            res.json(500, err);
          } else {
            vehicle.vehicle_platenumber = req.body.vehicle_platenumber;
            vehicle.vehicle_brand = req.body.vehicle_brand;
            vehicle.vehicle_model = req.body.vehicle_model;
            vehicle.vehicle_involved_type = req.body.vehicle_involved_type;
            vehicle.vehicle_driver = req.body.vehicle_driver;
            vehicle.save(function(err){
              if (err) {
                   res.json(500, err);
               } else {
                  res.json({success: true, message: 'Updated', vehicle: vehicle});
               }
             });
            }
         });
        }
      });
    // Route to get all report for management page
    router.get('/citizenReportManagement', function(req, res) {
        models.Police_Report.find({}, function(err, police_reports) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in report was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                                // Check if users were retrieved from database
                                if (!police_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  models.Police_Report.find({ $or: [{report_credibility: 'Fraud'}, {report_credibility: 'Pending'}] }, function(err, police_reports) {
                                    res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });

                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === req.decoded.police_station){
                                if (!police_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  models.Police_Report.find({ address_municipality: req.decoded.police_station, $or: [{report_credibility: 'Fraud'}, {report_credibility: 'Pending'}] }, function(err, police_reports) {
                                    res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });
    });
    // Route to get the report that needs to be edited
    // Route to get all report for management page
    router.get('/resetRequestManagement', function(req, res) {
        account_reset.find({}, function(err, account_resets) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in report was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                                // Check if users were retrieved from database
                                if (!account_resets) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                    res.json({ success: true, account_resets: account_resets, police_permission: mainUser.police_permission }); // Return users, along with current user's permission
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === req.decoded.police_station){
                                if (!account_resets) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  account_reset.find({ station: req.decoded.police_station }, function(err, account_resets) {
                                    res.json({ success: true, account_resets: account_resets, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });
    });
    // Route to delete a user
    router.delete('/resetRequestManagement/:station', function(req, res) {
        var deletedRequest = req.params.station; // Assign the username from request parameters to a variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if current user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if curent user has admin access
                    if (mainUser.police_permission !== 'main' && mainUser.police_permission !== 'station') {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    } else {
                        // Fine the user that needs to be deleted
                        account_reset.findOneAndRemove({ station: deletedRequest }, function(err, acc) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'orvtiadeveloper@zoho.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                res.json({ success: true }); // Return success status
                            }
                        });
                    }
                }
            }
        });
    });

    router.get('/fraud', function(req,res){
    police_user.findOne({police_username: req.decoded.police_username}, function(err, permission){
       if (err) {
           res.json(500,err);
       } else {
           if (!permission) {
               res.json('No user found');
           } else {
               if (permission.police_permission === "main" && permission.police_station === req.decoded.police_station){
                  models.Police_Report.find({report_credibility:"Fraud"},function(err, fraud){
                       if (err) {
                           res.json(500, err);
                       }else{
                           res.json({success:true, fraud:fraud});
                       }
                    })
               } else if(permission.police_permission === "station" && permission.police_station === req.decoded.police_station){
                    models.Police_Report.find({report_credibility:"Fraud", address_municipality: req.decoded.police_station},function(err, fraud){
                       if (err) {
                           res.json(500, err);
                       }else{
                           res.json({success:true, fraud:fraud});
                       }
                   })
                 }
             }
         }
     })
   });
  //all factual
  router.get('/factual', function(req,res){
     police_user.findOne({police_username: req.decoded.police_username}, function(err, permission){
       if (err) {
           res.json(500,err);
       } else {
           if (!permission) {
               res.json('No user found');
           } else {
               if(permission.police_permission === "main" && permission.police_station === req.decoded.police_station){
                  models.Police_Report.find({report_credibility:"Factual"},function(err, factual){
                     if (err) {
                         res.json(500, err);
                     }else{
                         res.json({success:true, factual:factual});
                     }
                 })
               } else if(permission.police_permission === "station" && permission.police_station === req.decoded.police_station){
                  models.Police_Report.find({report_credibility:"Factual", address_municipality: req.decoded.police_station},function(err, factual){
                     if (err) {
                         res.json(500, err);
                     } else{
                         res.json({success:true, factual:factual});
                     }
                  })
               }
            }
         }
     })
   });

   //all station
   router.get('/station', function(req, res){
    police_user.findOne({police_username: req.decoded.police_username}, function(err, permission){
       if (err) {
           res.json(500,err);
       } else {
           if (!permission) {
               res.json('No user found');
           } else {
               if(permission.police_permission === "main" && permission.police_station === req.decoded.police_station){
                 models.Police_Report.aggregate(
                     [
                         {//$first,$sum,$push -->$group
                             "$group":{
                                 "_id":"$address_municipality",//expression what to count
                                 "address_municipality":{"$first": "$address_municipality"},//first level
                                 "count":{"$sum": 1}//counts what is in the expression
                             }
                         },
                             {"$group":{
                                 "_id":"$id",//don't remove
                                 "counts":{
                                     "$push":{//$what to display
                                         "address_municipality":"$address_municipality",
                                         "number":"$count"
                                     }
                                 }
                             }
                         }
                         ]
                     ).exec(function(err, station){
                     if(err){
                         res.json(500, err);
                     }else if(station){
                         res.json({success:true, station: station});
                     }
                 })
               } else if(permission.police_permission === "station" && permission.police_station === req.decoded.police_station){
                  models.Police_Report.aggregate(
                     [
                         { $match: {address_municipality: req.decoded.police_station} },

                         {//$first,$sum,$push -->$group
                             "$group":{
                                 "_id":"$address_municipality",//expression what to count
                                 "address_municipality":{"$first": "$address_municipality"},//first level
                                 "count":{"$sum": 1}//counts what is in the expression
                             }
                         },
                             {"$group":{
                                 "_id":"$id",//don't remove
                                 "counts":{
                                     "$push":{//$what to display
                                         "address_municipality":"$address_municipality",
                                         "number":"$count"
                                     }
                                 }
                             }
                         }
                         ]
                       ).exec(function(err, station){
                       if(err){
                           res.json(500, err);
                       }else if(station){
                           res.json({success:true, station: station});
                       }
                   })
                 }
             }
         }
     })
   });
   //all accident type
   router.get('/accidentType', function(req, res){
    police_user.findOne({police_username: req.decoded.police_username}, function(err, permission){
       if (err) {
           res.json(500,err);
       } else{
           if (!permission) {
               res.json('No user found');
           } else {
            if(permission.police_permission === "main" && permission.police_station === req.decoded.police_station){
                  models.Police_Report.aggregate(
                     [
                         {//$first,$sum,$push -->$group
                           "$group":{
                             "_id":"$accident_type",//expression what to count
                             "accident_type":{"$first": "$accident_type"},//first level
                             "count":{"$sum": 1}//counts what is in the expression
                           }
                         },
                         {"$group":{
                           "_id":"$id",//don't remove
                           "counts":{
                             "$push":{//$what to display
                               "accident_type":"$accident_type",
                               "number":"$count"
                             }
                           }
                         }
                       }
                     ]
                    )
                   .exec(function(err, type){
                     if(err){
                         res.json(500, err);
                     }else if(type){
                         res.json({success:true, type});
                     }
                 })
               }else if(permission.police_permission === "station" && permission.police_station === req.decoded.police_station){
                  models.Police_Report.aggregate(
                         [
                           { $match: {address_municipality: req.decoded.police_station} },

                           {//$first,$sum,$push -->$group
                                 "$group":{
                                     "_id":"$accident_type",//expression what to count
                                     "accident_type":{"$first": "$accident_type"},//first level
                                     "count":{"$sum": 1}//counts what is in the expression
                                 }
                               },
                                 {"$group":{
                                     "_id":"$id",//don't remove
                                     "counts":{
                                         "$push":{//$what to display
                                             "accident_type":"$accident_type",
                                             "number":"$count"
                                         }
                                     }
                                 }
                               }
                         ]
                       )
                     .exec(function(err, type){
                       if(err){
                           res.json(500, err);
                       }else if(type){
                           res.json({success:true, type});
                       }
                   })
                 }
             }
         }
     })
   })


    //all accident cause
   router.get('/accidentCause', function(req, res){
       police_user.findOne({police_username: req.decoded.police_username}, function(err, permission){
       if (err) {
           res.json(500,err);
       } else{
           if (!permission) {
               res.json('No user found');
           } else{
               if(permission.police_permission === "main" && permission.police_station === req.decoded.police_station){
                       models.Police_Report.aggregate(
                           [
                               {//$first,$sum,$push -->$group
                                   "$group":{
                                       "_id":"$accident_cause",//expression what to count
                                       "accident_cause":{"$first": "$accident_cause"},//first level
                                       "count":{"$sum": 1}//counts what is in the expression
                                   }
                               },
                                   {"$group":{
                                       "_id":"$id",//don't remove
                                       "counts":{
                                           "$push":{//$what to display
                                               "accident_cause":"$accident_cause",
                                               "number":"$count"
                                           }
                                       }
                                   }
                               }
                           ]
                       )
                      .exec(function(err, cause){
                     if(err){
                         res.json(500, err);
                     }else if(cause){
                         res.json({success:true, cause});
                     }
                 })
               } else if(permission.police_permission === "station" && permission.police_station === req.decoded.police_station){
                   models.Police_Report.aggregate(
                           [

                               { $match: {address_municipality: req.decoded.police_station} },

                               {//$first,$sum,$push -->$group
                                   "$group":{
                                       "_id":"$accident_cause",//expression what to count
                                       "accident_cause":{"$first": "$accident_cause"},//first level
                                       "count":{"$sum": 1}//counts what is in the expression
                                   }
                               },
                                   {"$group":{
                                       "_id":"$id",//don't remove
                                       "counts":{
                                           "$push":{//$what to display
                                               "accident_cause":"$accident_cause",
                                               "number":"$count"
                                           }
                                       }
                                   }
                               }
                           ]
                       )
                      .exec(function(err, cause){
                         if(err){
                             res.json(500, err);
                         }else if(cause){
                             res.json({success:true, cause});
                         }
                     })
                 }
             }
         }
     })
   });
   //all vehicle type
   router.get('/vehicleType', function(req, res){
       police_user.findOne({police_username: req.decoded.police_username}, function(err, permission){
       if (err) {
           res.json(500,err);
       }else{
           if (!permission) {
               res.json('No user found');
           }else{
               if(permission.police_permission === "main" && permission.police_station === req.decoded.police_station){
                       models.Police_Report.aggregate(
                       [

                         {$unwind:"$vehicle_id" },
                          {$lookup:{ from:"vehicle_involveds",
                          localField:"vehicle_id",
                          foreignField:"_id",as:"ref"}
                          }, {$group:{_id:"$ref.vehicle_involved_type",
                          count:{$sum:1}}},{$unwind:"$_id"}
                      ]
                    )
                   .exec(function(err, vehicleType){
                     if(err){
                         res.json(500, err);
                     }else if(vehicleType){
                         res.json({success:true, vehicleType});
                     }
                 })
               }else if(permission.police_permission === "station" && permission.police_station === req.decoded.police_station){
                    models.Police_Report.aggregate(
                       [
                         {$match:{ address_municipality: req.decoded.police_station} },
                         {$unwind:"$vehicle_id" },
                          {$lookup:{ from:"vehicle_involveds",
                          localField:"vehicle_id",
                          foreignField:"_id",as:"ref"}
                          }, {$group:{_id:"$ref.vehicle_involved_type",
                          count:{$sum:1}}},{$unwind:"$_id"}
                        ]
                       )
                       .exec(function(err, vehicleType){
                       if(err){
                           res.json(500, err);
                       }else if(vehicleType){
                           res.json({success:true, vehicleType});
                       }
                   })
               }
           }
       }
   })
 });

   //all violation
   router.get('/violation', function(req, res){
    police_user.findOne({police_username: req.decoded.police_username}, function(err, permission){
       if (err) {
           res.json(500,err);
       } else {
           if (!permission) {
               res.json('No user found');
           } else {
               if (permission.police_permission === "main" && permission.police_station === req.decoded.police_station) {
                    models.Police_Report.aggregate(
                         [
                           {$unwind:"$people_involved_id" },
                            {$lookup:{ from:"people_involveds",
                            localField:"people_involved_id",
                            foreignField:"_id",as:"ref"}
                            }, {$group:{_id:"$ref.people_involved_violation",
                            count:{$sum:1}}},{$unwind:"$_id"}
                         ]
                       )
                       .exec(function(err, violation){
                       if(err){
                           res.json(500, err);
                       } else if(violation){
                           res.json({success:true, violation});
                       }
                   })
               } else if(permission.police_permission === "station" && permission.police_station === req.decoded.police_station){
                   models.Police_Report.aggregate(
                         [
                           {$match:{ address_municipality: req.decoded.police_station} },
                           {$unwind:"$people_involved_id" },
                            {$lookup:{ from:"people_involveds",
                            localField:"people_involved_id",
                            foreignField:"_id",as:"ref"}
                            }, {$group:{_id:"$ref.people_involved_violation",
                            count:{$sum:1}}},{$unwind:"$_id"}
                         ]
                       )
                       .exec(function(err, violation){
                       if(err){
                           res.json(500, err);
                       }else if(violation){
                           res.json({success:true, violation});
                       }
                   })
                 }
             }
         }
     })
   });

    router.post('/violations', function(req, res) {
        var vio = new models.Violation(); // Create new User object
        vio.violation_committed = req.body.violation_committed; // Save username from request to User object

        // Check if request is valid and not empty or null
        if (req.body.violation_committed === null || req.body.violation_committed === '') {
            res.json({ success: false, message: 'Ensure all data were provided' });
        } else {
            // Save new user to database
            vio.save(function(err) {
                if (err) {

                } else {
                    res.json({ success: true, message: 'Violation Added.' }); // Send success message back to controller/request

                }
            });
        }
    });
    router.get('/violationdataManagement', function(req, res) {
        models.Violation.find({}, function(err, violations) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in report was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                                // Check if users were retrieved from database
                                if (!violations) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                    res.json({ success: true, violations: violations, police_permission: mainUser.police_permission, police_station: mainUser.police_station});
                                }
                            } else if (mainUser.police_permission === 'station') {
                              if (!violations) {
                                  res.json({ success: false, message: 'No report found' }); // Return error
                              } else {
                                  res.json({ success: true, violations: violations, police_permission: mainUser.police_permission, police_station: mainUser.police_station});
                              }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });
    });
    router.get('/stationdataManagement', function(req, res) {
        models.Station.find({}, function(err, stations) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in report was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                                // Check if users were retrieved from database
                                if (!stations) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                    res.json({ success: true, stations: stations, police_permission: mainUser.police_permission, police_station: mainUser.police_station});
                                }
                            } else if (mainUser.police_permission === 'station') {
                              if (!stations) {
                                  res.json({ success: false, message: 'No report found' }); // Return error
                              } else {
                                  models.Station.find({ station_municipality: req.decoded.police_station}, function(err, stations) {
                                    res.json({ success: true, stations: stations, police_permission: mainUser.police_permission, police_station: mainUser.police_station});
                                  });
                              }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });
    });
    router.post('/stations', function(req, res) {
        var station = new models.Station(); // Create new User object
        station.station_municipality = req.body.station_municipality; // Save username from request to User object

        // Check if request is valid and not empty or null
        if (req.body.station_municipality === null || req.body.station_municipality === '') {
            res.json({ success: false, message: 'Ensure all data were provided' });
        } else {
            // Save new user to database
            station.save(function(err) {
                if (err) {

                } else {
                    res.json({ success: true, message: 'Station Added.' }); // Send success message back to controller/request

                }
            });
        }
    });
    router.post('/vehicles', function(req, res) {
        var vehic = new models.Vehicle(); // Create new User object
        vehic.vehicle_type = req.body.vehicle_type; // Save username from request to User object

        // Check if request is valid and not empty or null
        if (req.body.vehicle_type === null || req.body.vehicle_type === '') {
            res.json({ success: false, message: 'Ensure all data were provided' });
        } else {
            // Save new user to database
            vehic.save(function(err) {
                if (err) {

                } else {
                    res.json({ success: true, message: 'Violation Added.' }); // Send success message back to controller/request

                }
            });
        }
    });
    router.get('/vehicledataManagement', function(req, res) {
        models.Vehicle.find({}, function(err, vehicles) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in report was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                           if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                                // Check if users were retrieved from database
                                if (!vehicles) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                    res.json({ success: true, vehicles: vehicles, police_permission: mainUser.police_permission, police_station: mainUser.police_station});
                                }
                            } else if (mainUser.police_permission === 'station') {
                              if (!vehicles) {
                                  res.json({ success: false, message: 'No report found' }); // Return error
                              } else {
                                  res.json({ success: true, vehicles: vehicles, police_permission: mainUser.police_permission, police_station: mainUser.police_station});
                              }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });
    });
    // Route to delete a user
    router.delete('/violationdataManagement/:violation_committed', function(req, res) {
        var deletedViolation = req.params.violation_committed; // Assign the username from request parameters to a variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if current user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if curent user has admin access
                    if (mainUser.police_permission !== 'main' && mainUser.police_permission !== 'station') {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    } else {
                        // Fine the user that needs to be deleted
                        models.Violation.findOneAndRemove({ violation_committed: deletedViolation }, function(err, violation) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'orvtiadeveloper@zoho.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                res.json({ success: true }); // Return success status
                            }
                        });
                    }
                }
            }
        });
    });
    router.delete('/vehicledataManagement/:vehicle_type', function(req, res) {
        var deletedVehicle = req.params.vehicle_type; // Assign the username from request parameters to a variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if current user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if curent user has admin access
                    if (mainUser.police_permission !== 'main' && mainUser.police_permission !== 'station') {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    } else {
                        // Fine the user that needs to be deleted
                        models.Vehicle.findOneAndRemove({ vehicle_type: deletedVehicle }, function(err, violation) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'orvtiadeveloper@zoho.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                res.json({ success: true }); // Return success status
                            }
                        });
                    }
                }
            }
        });
    });
    router.get('/editVehicleType/:id', function(req, res){
     models.Vehicle.findById(req.params.id, function(err, vehicle) {
          if(err){
              res.json(500,err);
          }else{
              res.json({success: true, vehicle: vehicle});
          }
      });
    });
    router.put('/editVehicleType', function(req,res){
          if(req.body.vehicle_type){
        models.Vehicle.findById(req.body._id, function(err, vehicle){
          if (err) {
            res.json(500, err);
          } else {
            vehicle.vehicle_type = req.body.vehicle_type;
            vehicle.save(function(err){
              if (err) {
                   res.json(500, err);
               } else {
                  res.json({success: true, message: 'Updated', vehicle: vehicle});
               }
             });
            }
         });
        }
      });
      router.get('/editViolation/:id', function(req, res){
       models.Violation.findById(req.params.id, function(err, violation) {
            if(err){
                res.json(500,err);
            }else{
                res.json({success: true, violation: violation});
            }
        });
      });
      router.put('/editViolation', function(req,res){
            if(req.body.violation_committed){
          models.Violation.findById(req.body._id, function(err, violation){
            if (err) {
              res.json(500, err);
            } else {
              violation.violation_committed = req.body.violation_committed;
              violation.save(function(err){
                if (err) {
                     res.json(500, err);
                 } else {
                    res.json({success: true, message: 'Updated', violation: violation});
                 }
               });
              }
           });
          }
        });
        router.get('/editStation/:id', function(req, res){
         models.Station.findById(req.params.id, function(err, station) {
              if(err){
                  res.json(500,err);
              }else{
                  res.json({success: true, station: station});
              }
          });
        });
        router.put('/editStation', function(req,res){
              if(req.body.station_municipality){
            models.Station.findById(req.body._id, function(err, station){
              if (err) {
                res.json(500, err);
              } else {
                station.station_municipality = req.body.station_municipality;
                station.save(function(err){
                  if (err) {
                       res.json(500, err);
                   } else {
                      res.json({success: true, message: 'Updated', station: station});
                   }
                 });
                }
             });
            }
          });

    return router; // Return the router object to server
};
