import util from "./util.js";
// import iconGenerator from "./deck-grid.js";

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
                util.redirect("/my-library");
              } else {
                util.addAlert(msgSpot, "warning", res.msg, "Login Failed");
              }
            }
          } catch (err) {
            util.addAlert(msgSpot, "danger", err, "ERROR:");
          }
        });
        //iconGenerator.generateDeckIcon("Armen", "Spanish", "Verbs");
        // const userId = await util.getUserId().user;
        // const userDeckPreviews = await deckConnect.getDecksInLibraryPreviews("635db5ce21884bfba4a8c3ab");
        // for (let deck in userDeckPreviews) {
        //   console.log("Deck object: ", deck);
        //   iconGenerator.generateDeckIcon(deck.author, deck.name, deck.deck_tags);
        // }
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
