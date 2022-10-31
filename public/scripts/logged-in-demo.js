import util from "./util.js";

function LoggedInDemo() {
  const loggedInDemo = {};

  loggedInDemo.setUpPage = async function () {
    await util.checkAuthenticated(
      "/login",
      // Calback for page setup if valid to show page
      loggedInDemo.renderPage,
      null
    );
  };

  loggedInDemo.renderPage = async function () {
    await loggedInDemo.setUpLogoutButtons();
    util.displayPageBody();
  };

  loggedInDemo.setUpLogoutButtons = async function () {
    const logoutButtons = document.querySelectorAll(".logoutButton");
    logoutButtons.forEach((btn) => {
      btn.addEventListener("click", async (evt) => {
        evt.preventDefault();
        let res;
        try {
          res = await fetch("/logoutUser", {
            method: "POST",
          });
          if (res.ok) {
            res = await res.json();
            if (res.success) {
              util.redirect("/login");
            } else {
              util.showNeutralMessage(res.msg);
            }
          }
        } catch (err) {
          util.showErrorMessage(err);
        }
      });
    });
  };

  return loggedInDemo;
}

export default LoggedInDemo();
