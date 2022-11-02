/** By Ilana-Mahmea*/

import util from "./util.js";

function Index() {
  const index = {};

  index.messageSpotElement = document.querySelector("#messageSpot");

  index.setUpPage = async function () {
    await util.checkNotAuthenticated("/my-library", index.renderPage, null);
  };

  index.renderPage = async function () {
    index.setUpLoginForm();
    index.setUpRegisterForm();
    util.displayPageBody();
  };

  index.setUpLoginForm = function () {
    // set up login form listener
    const form = document.querySelector("#loginForm");
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      // Clear past messages
      index.messageSpotElement.innerHTML = "";
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
            util.addAlert(
              index.messageSpotElement,
              "warning",
              res.msg,
              "Login Failed"
            );
          }
        }
      } catch (err) {
        util.addAlert(index.messageSpotElement, "danger", err, "ERROR:");
      }
    });
  };

  index.setUpRegisterForm = function () {
    // set up login form listener
    const form = document.querySelector("#registerForm");
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      // Clear past messages
      index.messageSpotElement.innerHTML = "";
      let res;
      let formResponses = Object.fromEntries(new FormData(form).entries());
      try {
        res = await fetch("/registerUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: formResponses.register_first_name,
            last_name: formResponses.register_last_name,
            username: formResponses.register_username,
            password: formResponses.register_password,
          }),
        });
        if (res.ok) {
          res = await res.json();
          if (res.success) {
            util.addAlert(index.messageSpotElement, "success", res.msg);

            // Show login form instead of register form
            document
              .querySelector("#pills-login")
              .classList.add("active", "show");
            document
              .querySelector("#pills-register")
              .classList.remove("active", "show");
            document
              .querySelector("#tab-login")
              .classList.add("active", "show");
            document
              .querySelector("#tab-register")
              .classList.remove("active", "show");
          } else {
            util.addAlert(
              index.messageSpotElement,
              "warning",
              res.msg,
              "Registration Failed"
            );
          }
        }
      } catch (err) {
        util.addAlert(index.messageSpotElement, "danger", err, "ERROR:");
      }
    });
  };

  return index;
}

export default Index();
