import util from "./util.js";

function LoginTest() {
  const loginTest = {};

  // TODO -- replace with util function
  loginTest.authenticatePage = async function () {
    const res = await fetch("/getAuthentication", { method: "POST" });
    if (!res.authenticated) {
      loginTest.setUpPage();
    } else {
      // Redirect if logged in
      util.redirect("/my-library");
    }
  };

  loginTest.setUpPage = function () {
    // set up login form listener
    const form = document.querySelector("form");
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      let res;
      try {
        res = await fetch("/loginUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            Object.fromEntries(new FormData(form).entries())
          ),
        });
        if (res.success) {
          util.redirect("/my-library");
        } else {
          util.showNeutralMessage(res.msg);
        }
      } catch (err) {
        util.showErrorMessage(err);
      }
    });
  };

  return loginTest;
}

export default LoginTest();
