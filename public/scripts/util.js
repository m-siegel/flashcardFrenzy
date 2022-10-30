function Util() {
  const util = {};

  // TODO -- show message function: success, neutral, error

  util.redirect = function redirect(page) {
    window.location.replace(page + ".html");
  };

  util.checkAuthenticated = async function checkAuthenticated(
    redirectLocation,
    nextFunc,
    paramsForNext
  ) {
    const res = await fetch("/getAuthentication", { method: "POST" });
    if (res.authenticated) {
      nextFunc(paramsForNext);
    } else {
      // Redirect if logged in
      util.redirect(redirectLocation);
    }
  };

  util.checkNotAuthenticated = async function checkAuthenticated(
    redirectLocation,
    nextFunc,
    paramsForNext
  ) {
    const res = await fetch("/getAuthentication", { method: "POST" });
    if (!res.authenticated) {
      nextFunc(paramsForNext);
    } else {
      util.redirect(redirectLocation);
    }
  };

  return util;
}

export default Util();
