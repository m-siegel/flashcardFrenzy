// Source: https://www.youtube.com/watch?v=-RCnNyD0L-s
export function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/welcome/login");
}

export function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/home/my-library");
}
