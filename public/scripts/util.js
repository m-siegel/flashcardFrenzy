function Util() {
  const util = {};

  // TODO -- show message function: success, neutral, error

  util.redirect = function redirect(page) {
    window.location.replace(page + ".html");
  };

  util.checkAuthenticated = async function (
    redirectLocation,
    nextFunc,
    paramsForNext
  ) {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    if (res.authenticated) {
      nextFunc(paramsForNext);
    } else {
      // Redirect if logged in
      util.redirect(redirectLocation);
    }
  };

  util.checkNotAuthenticated = async function (
    redirectLocation,
    nextFunc,
    paramsForNext
  ) {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
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
