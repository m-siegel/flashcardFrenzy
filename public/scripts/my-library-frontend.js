/** Armen Sarkisian */

import util from "./util.js";
import iconGenerator from "./deck-grid.js";

function MyLibrary() {
  const myLibrary = {};
  const messageSpot = document.querySelector("#messageSpot");

  myLibrary.setUpPage = async function () {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    if (!res.authenticated) {
      return util.redirect("/index");
    }
    util.renderPage();
    myLibrary.renderUserDecks();
  };

  myLibrary.renderUserDecks = async function () {
    const resObject = await (
      await fetch("get-user-deck-previews", { method: "GET" })
    ).json();
    if (resObject.success) {
      const deckPreviews = resObject.userDeckPreviews;
      for (let i = 0; i < deckPreviews.length; i++) {
        iconGenerator.generateDeckIcon(
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
        "Uh oh! Could not get the decks."
      );
    }
  };

  myLibrary.setModalEvents = function () {
    const duplicateConfirm = document.querySelector("#modalConfirmDuplicate");
    const deleteConfirm = document.querySelector("#modalConfirmDelete");
    const duplicateCancel = document.querySelector("#duplicateCancel");
    const deleteCancel = document.querySelector("#deleteCancel");
    duplicateConfirm.addEventListener("click", duplicateDeck);
    deleteConfirm.addEventListener("click", removeDeck);
    duplicateCancel.addEventListener("click", clearDeckId);
    deleteCancel.addEventListener("click", clearDeckId);
  };

  const clearDeckId = async function () {
    await fetch("set-current-deck", {
      method: "POST",
      body: { currentDeckId: null },
    });
  };

  const duplicateDeck = async function () {
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
    if (res.err) {
      console.error(res.err);
    } else {
      const deckToGenerate = res.deckToCopy;
      iconGenerator.generateDeckIcon(
        deckToGenerate.author,
        deckToGenerate.name,
        deckToGenerate.deck_tags,
        deckToGenerate._id
      );
    }
  };

  const removeDeck = async function () {
    const deckRes = await (
      await fetch("/getCurrentDeck", { method: "POST" })
    ).json();
    const deckId = deckRes.currentDeck;
    const res = await await fetch("/delete-user-from-deck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId: deckId }),
    });
    const res2 = await await fetch("/remove-deck-from-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId: deckId }),
    });
    iconGenerator.removeIcon(deckId);
    if (!res.ok || !res2.ok) {
      console.error("Error deleting the deck");
    }
  };

  return myLibrary;
}

export default MyLibrary();
