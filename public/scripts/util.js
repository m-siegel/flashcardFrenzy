/** Ilana-Mahmea */

function Util() {
  const util = {};

  /**
   * Appends a Bootstrap dismissable alert to the parameter parentElement. Color is determined by
   * the alertType parameter and content by the msgHeader and msgBody parameters.
   * @param {HTML element} parentElement   The parent element in which to place this alert.
   * @param {string} alertType   One of: primary, secondary, success, danger, warning, info, light or dark.
   * @param {string} msgBody   The main message body.
   * @param {string} msgHeader   The message header (if any) to be emphasized.
   */
  util.addAlert = function (
    parentElement,
    alertType = "warning",
    msgBody = "",
    msgHeader = ""
  ) {
    const newAlert = document.createElement("div");
    newAlert.innerHTML = util.getNewAlert(alertType, msgBody, msgHeader);
    parentElement.append(newAlert);
  };

  /**
   * Returns the HTML for a Bootstrap dismissable alert of the parameter type (danger, warning, etc.),
   * with the parameter header (in bold) and body.
   * @param {string} alertType   One of: primary, secondary, success, danger, warning, info, light or dark.
   * @param {string} msgBody   The main message body.
   * @param {string} msgHeader   The message header (if any) to be emphasized.
   * @returns {string}   The HTML for a Bootstrap dismissable alert.
   */
  util.getNewAlert = function (alertType, msgBody, msgHeader) {
    const alert = `<div class="alert alert-${alertType} alert-dismissible fade show" role="alert">
    <strong>${msgHeader}</strong> ${msgBody}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    return alert;
  };

  /**
   * Switches the window's location to the parameter page.html.
   * From John's office hours.
   * @param {string} page   New location without .html extension.
   */
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

  /** Sets the page's body to display */
  util.displayPageBody = function () {
    const body = document.querySelector("body");
    body.style.display = "block";
  };

  /** Armen */

  return util;
}

export default Util();
