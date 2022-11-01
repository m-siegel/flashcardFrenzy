import util from "./util.js";

function EditDeck() {
  const editDeck = {};
  let deck = null;

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
    if (!urlSearchParams.has("deckId")) {
      // deck = await get deck with route
    } else {
      // deck = await make deck with route
    }
  };

  editDeck.fillFormFromDeck = function () {};

  return editDeck;
}

export default EditDeck();
