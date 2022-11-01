import util from "./util.js";

function EditDeck() {
  const editDeck = {};
  editDeck.messageSpotElement = document.querySelector("#messageSpot");
  editDeck.deck = null;

  editDeck.setUpPage = async function () {
    await util.checkAuthenticated(
      "/index",
      // Calback for page setup if valid to show page
      editDeck.renderPage,
      null
    );
  };

  editDeck.renderPage = async function () {
    await editDeck.loadDeck();
    await editDeck.setUpLogoutButtons();
    util.displayPageBody();
  };

  editDeck.setUpLogoutButtons = async function () {
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
              util.redirect("/index");
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

  editDeck.loadDeck = async function () {
    const urlSearchParams = new URLSearchParams(window.location.search);
    let deckId = null;
    if (urlSearchParams.has("deckId")) {
      deckId = urlSearchParams.get("deckId");
    }

    if (deckId) {
      try {
        // check if user has permission to access deck
        const dbDeckPermissionsRes = await fetch("/get-decks-in-user-library");

        if (dbDeckPermissionsRes.ok) {
          const dbDeckPermissionsResJSON = await dbDeckPermissionsRes.json();

          if (dbDeckPermissionsResJSON.success) {
            if (!dbDeckPermissionsResJSON.deckIds.includes(deckId)) {
              util.addAlert(
                editDeck.messageSpotElement,
                "warning",
                dbDeckPermissionsResJSON.msg,
                "Could not validate permission to access that deck."
              );
              // setTimeout(util.redirect("/my-library"), 2000);
              return;
            }
          } else {
            util.addAlert(
              editDeck.messageSpotElement,
              "warning",
              dbDeckPermissionsResJSON.msg,
              "Could not validate permission to access that deck."
            );
            // setTimeout(util.redirect("/my-library"), 2000);
            return;
          }
        }
      } catch (err) {
        util.addAlert(
          editDeck.messageSpotElement,
          "danger",
          err,
          "Error checking deck permissions: "
        );
        // setTimeout(util.redirect("/my-library"), 2000);
        return;
      }
    }

    // get or create deck
    try {
      if (deckId) {
        const dbGetDeckRes = await fetch("/get-deck-by-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deckId: deckId }),
        });

        if (dbGetDeckRes.ok) {
          const dbGetDeckResJSON = await dbGetDeckRes.json();

          if (dbGetDeckResJSON.success) {
            editDeck.deck = dbGetDeckResJSON.deck;
          } else {
            util.addAlert(
              editDeck.messageSpotElement,
              "warning",
              dbGetDeckResJSON.msg,
              "Could not get deck"
            );
            // setTimeout(util.redirect("/my-library"), 2000);
            return;
          }
        }
      } else {
        const dbGetDeckRes = await fetch("/create-deck");

        if (dbGetDeckRes.ok) {
          const dbGetDeckResJSON = await dbGetDeckRes.json();

          if (dbGetDeckResJSON.success) {
            editDeck.deck = dbGetDeckResJSON.deck;
          } else {
            util.addAlert(
              editDeck.messageSpotElement,
              "warning",
              dbGetDeckResJSON.msg,
              "Could not create deck."
            );
            // setTimeout(util.redirect("/my-library"), 2000);
            return;
          }
        }
      }
    } catch (err) {
      util.addAlert(
        editDeck.messageSpotElement,
        "danger",
        err,
        "Error getting the deck:"
      );
      // setTimeout(util.redirect("/my-library"), 2000);
      return;
    }
  };

  editDeck.fillFormFromDeck = function () {};

  return editDeck;
}

export default EditDeck();
