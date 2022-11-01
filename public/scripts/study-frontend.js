import renderPage from "./logged-in-demo.js";
import util from "./util.js";

function Study() {
  const study = {};
  const messageSpot = document.querySelector("#messageSpot");

  // study.getDeckId = function() {
  //   const url = new URLSearchParams(window.location.search);
  //   if (url.has("deckId")) {
  //     return url.get("deckId");    }
  //   else {
  //     return null;
  //   }
  // };
  // let currentDeckId = study.getDeckId();


  study.getFlashcards = async function () {
    const url = new URLSearchParams(window.location.search);
    let reqDeckId = null;
    if (url.has("deckId")) {
      reqDeckId = url.get("deckId");
      //flashcardDeckId = reqDeckId;
      console.log("the req deck id to send is: ", reqDeckId);
    } else {
      console.log("couldn't get the url...");
      //return false;
      // reqDeckId = flashcardDeckId;
      reqDeckId = "635db5f021884bfba4a8c3af";
    }
    // console.log("goping to send deck id:", reqDeckId);
    const flashcardRes = await (
      await fetch("/get-cards-in-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: "635db5f021884bfba4a8c3af" }),
      })
    ).json();
    const flashcards = flashcardRes.flashcards;
    // study.Flashcards = flashcards;
    return flashcards;
  };
  study.setUpPage = async function () {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    console.log("res is: ", res);
    if (!res.authenticated) {
      return util.redirect("/login");
    }
    renderPage.renderPage();
  };

  let flashcardCounter = 0;
  let currentFlashcardAnswers = [];
  study.startStudying = async function () {
    await study.showNextFlashcard();
  };

  study.showNextFlashcard = async function () {
    const flashcards = await study.getFlashcards();
    console.log("the flashcards array: ", flashcards);
    if (flashcardCounter >= flashcards.length) {
      return;
    }
    const promptDiv = document.querySelector(".card-title");
    const currentFlashcard = flashcards[flashcardCounter];
    promptDiv.innerHTML = currentFlashcard.sideA.prompt;
    currentFlashcardAnswers = currentFlashcard.sideB.answer_list;
    for (let answer in currentFlashcardAnswers) {
      answer = answer.toLowerCase();
    }
    flashcardCounter += 1;
    messageSpot.innerHTML = "";
  };


  // const setCards = async ()
  // Flashcards = await study.getFlashcards();

  study.configureFormSubmit = async function () {
    const submitForm = document.querySelector("#submitAnswerForm");
    //const submitButton = document.querySelector("#submitButton");
    console.log("did the query selector work?", submitForm);
    submitForm.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      //console.log("submit form", submitForm);
      // console.log("HELLO??");
      let FR = new FormData(submitForm);
      //let formResponse = Object.fromEntries(new FormData(submitForm).entries());
      // console.log("does it have answer?");
      // console.log(FR.has("answer"));
      // console.log(FR.get("answer"));
      const ans = FR.get("answer");
      let testAnswers = ["Stuck in the caves", "stuck in the caves"];

      const res = await (
        await fetch("/get-cards-in-deck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer: ans, correctAnswers: testAnswers}),
        })
      ).json();






      // const res = await (await fetch("/check-answer", {
      //   method: "POST",
      //   headers: { "Content-Type:": "application/json" },
      //   body: JSON.stringify(
      //     {answer: ans, correctAnswers: testAnswers}
      //   )
      // })).json();
      if (res.success) {
        util.addAlert(messageSpot, "success", "Correct! Great job!");
      } else {
        util.addAlert(messageSpot, "danger", "Nope! Sorry, wrong answer.");
      }
      study.showNextFlashcard();
    });
  };

  return study;
}

export default Study();
