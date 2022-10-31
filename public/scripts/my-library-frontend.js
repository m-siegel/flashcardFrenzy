import util from "./util.js";
// import deckConnect from "../../deckConnect.js";
import iconGenerator from "./deck-grid.js";

function MyLibrary() {
  const myLibrary = {};

  myLibrary.setUpPage = async function() {
    const res = await (await fetch("/getAuthentication", {method: "POST"})).json();
    console.log("res is: ", res);
    if (!res.authenticated) {
      return util.redirect("/login");
    }
    myLibrary.renderUserDecks();
    myLibrary.setDeckOptionClickEvents();

  };


  myLibrary.renderUserDecks = async function() {
    //const res = await fetch("/my-library", {method: "GET"});
    //if (res.success) {
    const deckPreviews = await (await fetch("get-user-deck-previews", {method: "GET"})).json();
    console.log("the deck previews type: ", typeof(deckPreviews));
    console.log("the deck previews:", deckPreviews);
    for (let i = 0; i < deckPreviews.length; i++) {
      iconGenerator
        .generateDeckIcon(deckPreviews[i].author, deckPreviews[i].name, deckPreviews[i].deck_tags, deckPreviews[i]._id);
      console.log(deckPreviews[i]);

    }
  };


  myLibrary.setDeckOptionClickEvents = async function(){
    const deckMenuOptions = document.querySelectorAll(".dropdown-item deckOption");
    if (deckMenuOptions.length === 0) {
      return;
    }
    const deckId = deckMenuOptions[0].parentNode().getAttribute("id");
    for (let button in deckMenuOptions) {
      button.addEventListener("click", async () => {
        const res = await fetch("/save-current-deck", {method: "POST", body: JSON.stringify(deckId)});
        if (! res.ok) {
          //TODO: error handling. what's the correct way here?
          console.error("Failed to save deck");
        }
      });
    }
  };
    

  





  return myLibrary;
}


export default MyLibrary();