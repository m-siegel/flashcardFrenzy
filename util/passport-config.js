/*Ilana-Mahmea Siegel*/
// Source: https://www.youtube.com/watch?v=-RCnNyD0L-s
import bcrypt from "bcrypt";
import pl from "passport-local";
const LocalStrategy = pl.Strategy;

/**
 * Initializes passport object so that users can be authenticated and serialized using passport
 * @param {module} passport: passport module to configure
 * @param {function} getUserByUsername: function to get user object by username
 * @param {function} getUserById: function to get user object by ID
 * User object is expected to have password and _id fields
*/
function initialize(passport, getUserByUsername, getUserById) {
  // Confirms that username and password parameters match username and password (with hashing) in database
  const authenticateUser = async (username, password, done) => {
    const invalidCredMsg = "Invalid username or password.";
    const res = await getUserByUsername(username);

    if (!res.success) {
      return done(null, false, { message: invalidCredMsg });
    }

    try {
      if (await bcrypt.compare(password, res.user.password)) {
        return done(null, res.user);
      } else {
        return done(null, false, { message: invalidCredMsg });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "username" }, authenticateUser)
  );
  //This will be stored in session.passport.user
  passport.serializeUser((user, done) => {
    return done(null, user._id.toString());
  });
  passport.deserializeUser((user_id, done) => {
    return done(null, getUserById(user_id));
  });
}

export default initialize;
