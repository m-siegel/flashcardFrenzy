// import renderPage from "./logged-in-demo.js";
import util from "./util.js";

function Study() {
  const study = {};
  const messageSpot = document.querySelector("#messageSpot");

  study.getFlashcards = async function () {
    const url = new URLSearchParams(window.location.search);
    let reqDeckId = null;
    if (url.has("deckId")) {
      reqDeckId = url.get("deckId");
    } else {
      console.error("Failed to get the Deck ID from URL");
      return false;
    }
    const flashcardRes = await (
      await fetch("/get-cards-in-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: reqDeckId }),
      })
    ).json();
    const flashcards = flashcardRes.flashcards;
    return flashcards;
  };

  study.setUpPage = async function () {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    console.log("res is: ", res);
    if (!res.authenticated) {
      return util.redirect("/index");
    }
    util.renderPage();
  };

  let flashcardCounter = 0;
  let currentFlashcardAnswers = [];
  study.startStudying = async function () {
    await study.showNextFlashcard();
  };

  study.showNextFlashcard = async function () {
    console.log("Current flashcard counter: ", flashcardCounter);
    const flashcards = await study.getFlashcards();
    if (flashcardCounter >= flashcards.length) {
      util.addAlert(messageSpot, "success", "Wow! You made it through the whole deck. Congratulations!");
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
  };


  study.configureFormSubmit = async function () {
    const submitForm = document.querySelector("#submitAnswerForm");
    console.log("did the query selector work?", submitForm);
    submitForm.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      messageSpot.innerHTML = "";
      let FR = new FormData(submitForm);
      const ans = FR.get("answer");
      const res = await (
        await fetch("/check-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer: ans, correctAnswers: currentFlashcardAnswers}),
        })
      ).json();

      if (res.success) {
        util.addAlert(messageSpot, "success", "Correct! Great job!");
        study.showNextFlashcard();
      } else {
        util.addAlert(messageSpot, "danger", "Nope! Sorry, wrong answer.");
      }
    });
  };

  return study;
}

export default Study();
