import util from "./util.js";

function LoginTest() {
  const loginTest = {};

  // TODO -- replace with util function
  loginTest.authenticatePage = async function () {
    let res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    if (!res.authenticated) {
      console.log("not auth");
      loginTest.setUpPage();
    } else {
      // Redirect if logged in
      console.log("auth");
      util.redirect("/my-library");
      // window.location.replace("/my-library.html");
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
        if (res.ok) {
          res = await res.json();
          if (res.success) {
            util.redirect("/my-library");
          } else {
            util.showNeutralMessage(res.msg);
          }
        }
      } catch (err) {
        util.showErrorMessage(err);
      }
    });
  };

  return loginTest;
}

export default LoginTest();
