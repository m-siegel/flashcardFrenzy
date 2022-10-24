// Source: https://www.youtube.com/watch?v=-RCnNyD0L-s
import bcrypt from "bcrypt";
import pl from "passport-local";
const LocalStrategy = pl.Strategy;

function initialize(passport, getUserByUsername, getUserById) {
  const authenticateUser = async (username, password, done) => {
    const invalidCredMsg = "Invalid username or password.";
    const user = getUserByUsername(username);
    if (user == null) {
      return done(null, false, { message: invalidCredMsg });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
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
  passport.serializeUser((user, done) => {
    return done(null, user.user_id);
  });
  passport.deserializeUser((user_id, done) => {
    return done(null, getUserById(user_id));
  });
}

export default initialize;
