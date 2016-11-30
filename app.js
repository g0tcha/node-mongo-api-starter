// Global variables.
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var port = process.env.PORT || 3000;

// Models.
var User = require('./app/models/user');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// MongoDB connection.
let dataBaseURL = 'mongodb://127.0.0.1:27017/saycheese';
mongoose.connect(dataBaseURL, function(err) {
  if(err) throw err;
  console.log('Successfully connected to MongoDB');
});

// ---------------------------
// -------- ROUTER -----------
// ---------------------------
let router = express.Router();
app.use('/api', router);

router.get('/', function(req, res) {
  res.json({message: 'API OK', statusCode: 200});
});

// Users.
// -- Login.
router.route('/user/login')
  .get(function(req, res) {
    User.findOne({userName: req.headers.username}, function(err, user) {
      if(err) {
        res.send(err);
      }

      user.comparePassword(req.headers.password, function(err, isMatch) {
        // -- Authentifcation failed.
        if(err) {
          res.json({message: 'Authentication failed.', 'statusCode': 1002});
        } else {
          if(isMatch) res.json(user);
          else res.json({message: 'Authentication failed.', 'statusCode': 1002});
        }
      });
    });
  });
// -- Create user.
router.route('/user')
  .post(function(req, res) {
    let body = req.body;

    // Check if user with same username already exists.
    User.checkForUsername(body.userName, function(already) {
      if(already) {
        res.json({message: 'Username already used.', 'statusCode': 1001});
      } else {
        let user = new User();
        user.firstName = body.firstName;
        user.lastName = body.lastName;
        user.userName = body.userName;
        user.password = body.password;

        user.save(function(err) {
          if(err) {
            res.send(err);
          }
          res.json({message: 'New user successfully created.', statusCode: 1000});
        })
      }
    });
  });

app.listen(port);
console.log('Server listening on port ' + port);
