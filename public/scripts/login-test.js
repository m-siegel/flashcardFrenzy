import util from "./util.js";

function LoginTest() {
  const loginTest = {};

  loginTest.setUpPage = async function () {
    await util.checkNotAuthenticated(
      "/logged-in-demo",

      // Calback for page setup if valid to show page
      async function () {
        // set up login form listener
        const form = document.querySelector("form");
        const msgSpot = document.querySelector("#messageSpot");
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
                util.redirect("/logged-in-demo");
              } else {
                util.addAlert(msgSpot, "warning", res.msg, "Login Failed");
              }
            }
          } catch (err) {
            util.addAlert(msgSpot, "danger", err, "ERROR:");
          }
        });
      },

      null
    );
  };

  // loginTest.authenticatePage = async function () {
  //   await util.checkNotAuthenticated(
  //     "/logged-in-demo",
  //     loginTest.setUpPage,
  //     null
  //   );
  // };

  // loginTest.setUpPage = function () {
  //   // set up login form listener
  //   const form = document.querySelector("form");
  //   form.addEventListener("submit", async (evt) => {
  //     evt.preventDefault();
  //     let res;
  //     try {
  //       res = await fetch("/loginUser", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(
  //           Object.fromEntries(new FormData(form).entries())
  //         ),
  //       });
  //       if (res.ok) {
  //         res = await res.json();
  //         if (res.success) {
  //           util.redirect("/logged-in-demo");
  //         } else {
  //           util.showNeutralMessage(res.msg);
  //         }
  //       }
  //     } catch (err) {
  //       util.showErrorMessage(err);
  //     }
  //   });
  // };

  return loginTest;
}

export default LoginTest();
