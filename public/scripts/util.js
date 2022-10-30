function Util() {
  const util = {};

  // TODO -- show message function: success, neutral, error

  // TODO -- not working
  util.redirect = function redirect(page) {
    window.location.replace(page + ".html");
  };

  // TODO -- check
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

  // TODO -- check
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

  util.getUsername = async function () {
    return await (await fetch("/getUsername", { method: "POST" })).json();
  };

  util.getUserId = async function () {
    return await (await fetch("/getUserId", { method: "POST" })).json();
  };

  util.getCurrentDeck = async function () {
    return await (await fetch("/getCurrentDeck", { method: "POST" })).json();
  };

  return util;
}

export default Util();
