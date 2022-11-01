import renderPage from "./logged-in-demo.js";
import util from "./util.js";

function Study() {
  const study = {};
  study.setUpPage = async function () {
    const res = await (
      await fetch("/getAuthentication", { method: "POST" })
    ).json();
    console.log("res is: ", res);
    if (!res.authenticated) {
      return util.redirect("/login");
    }
    renderPage.renderPage();
    study.startStudying();
    //myLibrary.setDeckOptionClickEvents();
    //util.displayPageBody();
  };

  study.startStudying = function() {

  };


  study.showNextFlashcard = function() {

  };












  return study;
}

export default Study();