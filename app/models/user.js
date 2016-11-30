var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

// -- Data Model Definition.
var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  userName: String,
  password: String
});

// -- Check if a user is already connected.
UserSchema.statics.checkForUsername = function(username, callback) {
  this.find({userName: username}, function(err, result) {
    if(result.length > 0) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

// -- Password Hashing
UserSchema.pre('save', function(next) {
  var user = this;

  if(!user.isModified('password')) return next();

  // Generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// -- Password verification
UserSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return callback();
    callback(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
