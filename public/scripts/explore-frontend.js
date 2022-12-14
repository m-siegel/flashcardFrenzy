/*By Armen Sarkisian*/

import iconGenerator from "./deck-grid.js";
import util from "./util.js";

function Explore() {
  const explore = {};
  const messageSpot = document.querySelector("#messageSpot");

  explore.setUpPage = async function () {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    if (!res.authenticated) {
      return util.redirect("/index");
    }
    await util.renderPage();
    await explore.renderPublicDecks();
  };

  explore.renderPublicDecks = async function () {
    const resObject = await (
      await fetch("get-public-deck-previews", { method: "GET" })
    ).json();
    if (resObject.success) {
      const deckPreviews = resObject.publicDeckPreviews;
      for (let i = 0; i < deckPreviews.length; i++) {
        iconGenerator.generatePublicDeckIcon(
          deckPreviews[i].author,
          deckPreviews[i].name,
          deckPreviews[i].deck_tags,
          deckPreviews[i]._id
        );
      }
    } else {
      util.addAlert(
        messageSpot,
        "warning",
        resObject.err,
        "Uh oh! Could not get the decks"
      );
    }
  };

  const clearDeckId = async function () {
    await fetch("set-current-deck", {
      method: "POST",
      body: { currentDeckId: null },
    });
  };

  const duplicateDeck = async function () {
    util.addAlert(messageSpot, "warning", "Duplicating deck...");
    const deckRes = await (
      await fetch("/getCurrentDeck", { method: "POST" })
    ).json();
    const deckId = deckRes.currentDeck;
    const res = await (
      await fetch("/duplicate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: deckId }),
      })
    ).json();
    if (!res.success) {
      console.error("Failed to duplicate deck");
    } else {
      util.addAlert(
        messageSpot,
        "success",
        "Successfully duplicated deck. Redirecting."
      );
      setTimeout(() => {
        window.location.replace(
          `./edit-deck.html?deckId=${res.deckToCopy._id}`
        );
      }, 2000);
    }
  };

  explore.setModalEvents = function () {
    const duplicateConfirm = document.querySelector("#modalConfirmDuplicate");
    const duplicateCancel = document.querySelector("#duplicateCancel");
    duplicateConfirm.addEventListener("click", duplicateDeck);
    duplicateCancel.addEventListener("click", clearDeckId);
  };

  return explore;
}

export default Explore();
