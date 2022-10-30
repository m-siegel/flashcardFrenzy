import util from "./util.js";

function LoggedInDemo() {
  const loggedInDemo = {};

  loggedInDemo.setUpPage = async function () {
    await util.checkAuthenticated(
      "/login",

      // Calback for page setup if valid to show page
      async function () {
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
      },

      null
    );
  };

  // loggedInDemo.authenticatePage = async function () {
  //   await util.checkAuthenticated("/login", loggedInDemo.setUpPage, null);
  // };

  // loggedInDemo.setUpPage = function () {
  //   const form = document.querySelector(".logoutButton");
  //   form.addEventListener("click", async (evt) => {
  //     evt.preventDefault();
  //     let res;
  //     try {
  //       res = await fetch("/logoutUser", {
  //         method: "POST",
  //       });
  //       if (res.ok) {
  //         res = await res.json();
  //         if (res.success) {
  //           util.redirect("/login");
  //         } else {
  //           util.showNeutralMessage(res.msg);
  //         }
  //       }
  //     } catch (err) {
  //       util.showErrorMessage(err);
  //     }
  //   });
  // };

  return loggedInDemo;
}

export default LoggedInDemo();
