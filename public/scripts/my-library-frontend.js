import util from "./util.js";
import iconGenerator from "./deck-grid.js";
import renderPage from "./logged-in-demo.js";

function MyLibrary() {
  const myLibrary = {};


  myLibrary.setUpPage = async function () {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    console.log("res is: ", res);
    if (!res.authenticated) {
      return util.redirect("/login");
    }
    renderPage.renderPage();
    myLibrary.renderUserDecks();
    //myLibrary.setDeckOptionClickEvents();
    //util.displayPageBody();
  };

  myLibrary.renderUserDecks = async function () {
    //const res = await fetch("/my-library", {method: "GET"});
    //if (res.success) {
    const deckPreviews = await (
      await fetch("get-user-deck-previews", { method: "GET" })
    ).json();
    console.log("the deck previews type: ", typeof deckPreviews);
    console.log("the deck previews:", deckPreviews);
    for (let i = 0; i < deckPreviews.length; i++) {
      iconGenerator.generateDeckIcon(
        deckPreviews[i].author,
        deckPreviews[i].name,
        deckPreviews[i].deck_tags,
        deckPreviews[i]._id
      );
      console.log(deckPreviews[i]);
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
    const res = await (await fetch("/duplicate-deck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId: deckId }),
    })).json();
    const deckToGenerate = res.duplicateDeck.deck;
    console.log(deckToGenerate);
    iconGenerator
      .generateDeckIcon(deckToGenerate.author, deckToGenerate.name, deckToGenerate.deck_tags, deckToGenerate._id);
    if (!res.ok) {
      console.error("Failed to duplicate deck");
      //TODO - get error from res object
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

    //const res = await (await fetch("/delete-deck", {method: "POST", body: JSON.stringify({deckId: myLibrary.deckId})})).json();
    // console.log("the current deck id is:", iconGenerator.currentDeckId);
    //iconGenerator.removeIcon(iconGenerator.currentDeckId);
    // if (! res.ok) {
    //   console.error("Error deleting the deck.");
    //TODO - proper error handling here?
    // }
  };

  // myLibrary.setDeckOptionClickEvents = function(){
  //   const deckMenuOptions = document.getElementsByClassName(".deckOption");
  //   console.log("DECKMENU OPTIONS!", deckMenuOptions);
  //   if (deckMenuOptions.length === 0) {
  //     return;
  //   }
  //   //const deckId = deckMenuOptions[0].parentNode().getAttribute("id");
  //   for (let button in deckMenuOptions) {
  //     console.log("button:", button);
  //     let deckId = button.parentNode().getAttribute("id");
  //     console.log("debug logging deck ID:");
  //     button.addEventListener("click", () => {
  //       myLibrary.currentDeckId = deckId;
  //       console.log(`Deck ID is now ${myLibrary.currentDeckId}`);
  //     });
  //     // button.addEventListener("click", async () => {
  //     //   const res = await fetch("/save-current-deck", {method: "POST", body: JSON.stringify(deckId)});
  //     //   if (! res.ok) {
  //     //     //TODO: error handling. what's the correct way here?
  //     //     console.error("Failed to save deck");
  //     //   }
  //     // });
  //   }
  // };

  return myLibrary;
}

export default MyLibrary();
