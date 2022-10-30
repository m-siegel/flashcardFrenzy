import util from "./util.js";

function LoggedInDemo() {
  const loggedInDemo = {};

  loggedInDemo.authenticatePage = async function () {
    let res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    if (res.authenticated) {
      console.log("auth");
      loggedInDemo.setUpPage();
    } else {
      // Redirect if logged in
      console.log("not auth");
      util.redirect("/login");
    }
  };

  loggedInDemo.setUpPage = function () {
    const form = document.querySelector(".logoutButton");
    form.addEventListener("click", async (evt) => {
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
  };

  return loggedInDemo;
}

export default LoggedInDemo();
