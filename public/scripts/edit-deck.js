/** Ilana-Mahmea */

import util from "./util.js";

function EditDeck() {
  const editDeck = {};

  editDeck.initiatedDeckCreation = false;

  editDeck.messageSpotElement = document.querySelector("#messageSpot");
  editDeck.modalMessageSpotElement =
    document.querySelector("#modalMessageSpot");

  editDeck.deck = {};

  editDeck.tabs = {};
  editDeck.tabs.deckSettingsTab = document.querySelector(
    "#nav-deckSettings-tab"
  );
  editDeck.tabs.cardsListTab = document.querySelector("#nav-cardsList-tab");

  // Deck setting elements
  editDeck.form = {};
  editDeck.form.form = document.querySelector("#deckSettingsForm");
  editDeck.form.nameElement = document.querySelector("#name");
  editDeck.form.visibilityRadiosElement =
    document.querySelector("#visibility-radios");
  editDeck.form.visibilityPublicElement =
    document.querySelector("#visibility-public");
  editDeck.form.visibilityPrivateElement = document.querySelector(
    "#visibility-private"
  );
  editDeck.form.deckTagsElement = document.querySelector("#deckTags");
  editDeck.form.tagsListElement = document.querySelector("#tagsList");
  editDeck.form.tagsListValues = [];
  editDeck.form.addTagBtnElement = document.querySelector("#addTagBtn");

  // Card list elements
  editDeck.cardListContent = document.querySelector("#cardsListContent");
  editDeck.cardsList = [];
  editDeck.cardsListSaveChanges = document.querySelector(
    "#cardsListSaveChanges"
  );
  editDeck.cardsListAddCard = document.querySelector("#cardsListAddCard");

  editDeck.newCardModal = {};
  editDeck.newCardModal.cardBtnCloseWithoutSaving = document.querySelector(
    "#cardBtnCloseWithoutSaving"
  );
  editDeck.newCardModal.cardsListContent =
    document.querySelector("#cardsListContent");
  editDeck.newCardModal.currCardAnswerList = [];

  editDeck.newCardModal.newCardForm = document.querySelector("#newCardForm");
  editDeck.newCardModal.addAnswerBtn = document.querySelector("#addAnswerBtn");
  editDeck.newCardModal.cardBtnSaveCard =
    document.querySelector("#cardBtnSaveCard");
  editDeck.newCardModal.cardAnswers = document.querySelector("#cardAnswers");
  editDeck.newCardModal.cardAnswersListJS = [];
  editDeck.newCardModal.answerList = document.querySelector("#answerDisplay");
  editDeck.newCardModal.prompt = document.querySelector("#prompt");
  editDeck.cardSaveButtonClickable = true;

  editDeck.setUpPage = async function () {
    await util.checkAuthenticated(
      "/index",
      // Callback for page setup if valid to show page
      editDeck.renderPage,
      null
    );
  };

  editDeck.renderPage = async function () {
    const gotDeck = await editDeck.loadDeck();
    util.displayPageBody();
    await editDeck.setUpLogoutButtons();
    if (gotDeck) {
      editDeck.fillDeckFormFromDeck();
      editDeck.setUpEditDeckForm();
      editDeck.setUpTabListeners();
      editDeck.setUpCardsListButtons();
    }
  };

  editDeck.unfreezeCardSaveButton = function () {
    setTimeout(() => {
      editDeck.cardSaveButtonClickable = true;
    }, 2000);
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
              util.addAlert(editDeck.messageSpotElement, "warning", res.msg);
            }
          }
        } catch (err) {
          util.addAlert(editDeck.messageSpotElement, "danger", err, "Error:");
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
                "",
                "Could not validate permission to access that deck."
              );
              setTimeout(util.redirect, 2000, "/my-library");
              return false;
            }
          } else {
            util.addAlert(
              editDeck.messageSpotElement,
              "warning",
              "",
              "Could not validate permission to access that deck."
            );
            setTimeout(util.redirect, 2000, "/my-library");
            return false;
          }
        }
      } catch (err) {
        util.addAlert(
          editDeck.messageSpotElement,
          "danger",
          err,
          "Error checking deck permissions: "
        );
        setTimeout(util.redirect, 2000, "/my-library");
        return false;
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
              "",
              "Could not get deck"
            );
            setTimeout(util.redirect, 2000, "/my-library");
            return false;
          }
        }
      } else {
        editDeck.deck.name = "";
        editDeck.deck.deck_tags = [];
        editDeck.deck.public = false;
        editDeck.deck.flashcards = [];
      }
      editDeck.cardsList = editDeck.deck.flashcards.slice();
      return true;
    } catch (err) {
      util.addAlert(
        editDeck.messageSpotElement,
        "danger",
        err,
        "Error getting the deck:"
      );
      setTimeout(util.redirect, 2000, "/my-library");
      return false;
    }
  };

  editDeck.fillDeckFormFromDeck = function () {
    if (editDeck.deck) {
      // name
      editDeck.form.nameElement.setAttribute(
        "value",
        editDeck.deck.name ? editDeck.deck.name : "Deck Name"
      );
      // visibility
      if (editDeck.deck.public) {
        editDeck.form.visibilityPublicElement.toggleAttribute("checked", true);
        editDeck.form.visibilityPrivateElement.toggleAttribute(
          "checked",
          false
        );
      } else {
        editDeck.form.visibilityPrivateElement.toggleAttribute("checked", true);
        editDeck.form.visibilityPublicElement.toggleAttribute("checked", false);
      }
      // deck tags
      // based on John's office hours 10/31/22
      editDeck.form.tagsListElement.innerHTML = "";
      editDeck.form.tagsListValues = [];
      editDeck.deck.deck_tags.forEach((t) => {
        if (t && t.length > 0) {
          editDeck.form.tagsListElement.appendChild(
            editDeck.getNewTagslistItemForDeck(t)
          );
        }
      });
    }
  };

  editDeck.getNewTagslistItemForDeck = function (tag) {
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.className = "btn-close";
    btn.setAttribute("aria-label", "Close");

    const item = document.createElement("li");
    item.className = "list-group-item list-group-item-action";

    item.innerText = `${tag} `;
    item.appendChild(btn);
    btn.addEventListener("click", () => {
      item.remove();
      editDeck.form.tagsListValues = editDeck.form.tagsListValues.filter(
        (v) => v !== tag
      );
    });
    editDeck.form.tagsListValues.push(tag);
    return item;
  };

  editDeck.setUpEditDeckForm = function () {
    editDeck.form.addTagBtnElement.addEventListener("click", (evt) => {
      evt.preventDefault();
      const val = editDeck.form.deckTagsElement.value;
      if (val && val.length > 0) {
        editDeck.form.tagsListElement.appendChild(
          editDeck.getNewTagslistItemForDeck(val)
        );
      }
    });

    editDeck.form.form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

      // clear past errors to make room for more
      editDeck.messageSpotElement.innerHTML = "";

      if (!editDeck.deck._id && !editDeck.initiatedDeckCreation) {
        try {
          editDeck.initiatedDeckCreation = true;
          const dbGetDeckRes = await fetch("/create-deck");

          if (dbGetDeckRes.ok) {
            const dbGetDeckResJSON = await dbGetDeckRes.json();

            if (dbGetDeckResJSON.success) {
              editDeck.deck = dbGetDeckResJSON.deck;
            } else {
              util.addAlert(
                editDeck.messageSpotElement,
                "warning",
                "",
                "Could not create deck."
              );
              setTimeout(util.redirect, 2000, "/my-library");
              return false;
            }
          }
        } catch (e) {
          util.addAlert(
            editDeck.messageSpotElement,
            "danger",
            e,
            "Error creating deck"
          );
          return false;
        }
      }

      // update deck name if needed
      try {
        if (
          editDeck.form.nameElement.value &&
          editDeck.form.nameElement.value !== editDeck.deck.name
        ) {
          let dbNameRes = await fetch("/update-deck-name", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              deckId: editDeck.deck._id,
              newName: editDeck.form.nameElement.value,
            }),
          });
          if (dbNameRes.ok) {
            dbNameRes = await dbNameRes.json();
            if (dbNameRes.success) {
              editDeck.deck.name = editDeck.form.nameElement.value;
              util.addAlert(
                editDeck.messageSpotElement,
                "success",
                "",
                "Saved name"
              );
            } else {
              util.addAlert(
                editDeck.messageSpotElement,
                "warning",
                "Couldn't update deck name"
              );
            }
          } else {
            util.addAlert(
              editDeck.messageSpotElement,
              "warning",
              "Couldn't update deck name"
            );
          }
        } else if (!editDeck.form.nameElement.value) {
          editDeck.form.nameElement.value = editDeck.deck.name;
          util.addAlert(
            editDeck.messageSpotElement,
            "warning",
            "The deck name must have at least one character"
          );
        }
      } catch (err) {
        util.addAlert(
          editDeck.messageSpotElement,
          "warning",
          "Error updating deck name:",
          err
        );
      }

      // udate deck visibility if needed
      try {
        if (
          (editDeck.form.visibilityPublicElement.checked &&
            !editDeck.deck.public) ||
          (editDeck.form.visibilityPrivateElement.checked &&
            editDeck.deck.public)
        ) {
          let dbPublicRes = await fetch("/update-deck-privacy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              deckId: editDeck.deck._id,
            }),
          });
          if (dbPublicRes.ok) {
            dbPublicRes = await dbPublicRes.json();
            if (dbPublicRes.success) {
              editDeck.deck.public = !editDeck.deck.public;
              util.addAlert(
                editDeck.messageSpotElement,
                "success",
                "",
                "Saved visibility"
              );
            } else {
              util.addAlert(
                editDeck.messageSpotElement,
                "warning",
                "Couldn't update deck privacy"
              );
            }
          } else {
            util.addAlert(
              editDeck.messageSpotElement,
              "warning",
              "Couldn't update deck privacy"
            );
          }
        }
      } catch (err) {
        util.addAlert(
          editDeck.messageSpotElement,
          "warning",
          "Error updating deck privacy:",
          err
        );
      }

      // update deck tags
      try {
        let dbTagsRes = await fetch("/update-deck-tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deckId: editDeck.deck._id,
            tagsArray: editDeck.form.tagsListValues.slice(),
          }),
        });
        if (dbTagsRes.ok) {
          dbTagsRes = await dbTagsRes.json();
          if (dbTagsRes.success) {
            editDeck.deck.deck_tags = editDeck.form.tagsListValues.slice(); // copy
            util.addAlert(
              editDeck.messageSpotElement,
              "success",
              "",
              "Saved tags"
            );
          } else {
            util.addAlert(
              editDeck.messageSpotElement,
              "warning",
              "Couldn't update deck tags"
            );
          }
        } else {
          util.addAlert(
            editDeck.messageSpotElement,
            "warning",
            "Couldn't update deck tags"
          );
        }
      } catch (err) {
        util.addAlert(
          editDeck.messageSpotElement,
          "warning",
          "Error updating deck tags:",
          err
        );
      }

      // rerender form in case anything couldn't be updated
      editDeck.fillDeckFormFromDeck();
    });
  };

  editDeck.setUpTabListeners = function () {
    editDeck.tabs.deckSettingsTab.addEventListener("click", () => {
      editDeck.fillDeckFormFromDeck();
    });
    editDeck.tabs.cardsListTab.addEventListener("click", () => {
      editDeck.renderCardsList();
    });
  };

  editDeck.renderCardsList = function () {
    editDeck.cardsList = [];
    editDeck.cardListContent.innerHTML = "";
    editDeck.cardsList = editDeck.deck.flashcards.slice();
    editDeck.deck.flashcards.forEach((c) => {
      editDeck.cardListContent.appendChild(editDeck.getCardListItem(c));
    });
  };

  editDeck.getCardListItem = function (card) {
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.className = "btn-close";
    btn.setAttribute("aria-label", "Close");

    const btnHolder = document.createElement("span");
    btnHolder.className = "col-sm-2";
    btnHolder.appendChild(btn);

    const element = document.createElement("div");
    element.className = "row cardListItem";
    //Formatting doesn't match prettier, but ESLint error otherwise
    element.innerHTML = `
    <span class="col-sm-5"><strong>Side A Prompt:</strong> ${
  card.sideA.prompt
} </span>
    <span class="col-sm-5"><strong>Side B Answer List:</strong> ${card.sideB.answer_list
    .map((b) => `${b}, `)
    .join("")}</span>
    `;
    element.appendChild(btnHolder);

    btn.addEventListener("click", () => {
      element.remove();
      editDeck.cardsList = editDeck.cardsList.filter((v) => v !== card);
    });
    return element;
  };

  editDeck.getNewCardAnswerItem = function (answer) {
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.className = "btn-close";
    btn.setAttribute("aria-label", "Close");

    const item = document.createElement("li");
    item.className = "list-group-item list-group-item-action";

    item.innerText = `${answer} `;
    item.appendChild(btn);
    btn.addEventListener("click", () => {
      item.remove();
      editDeck.newCardModal.cardAnswersListJS =
        editDeck.newCardModal.cardAnswersListJS.filter((v) => v !== answer);
    });
    editDeck.newCardModal.cardAnswersListJS.push(answer);
    return item;
  };

  editDeck.setUpCardsListButtons = function () {
    editDeck.cardsListSaveChanges.addEventListener("click", async (evt) => {
      evt.preventDefault();
      // update deck cards
      try {
        let dbCardsRes = await fetch("/update-deck-flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deckId: editDeck.deck._id,
            flashcardsArray: editDeck.cardsList.slice(),
          }),
        });
        if (dbCardsRes.ok) {
          dbCardsRes = await dbCardsRes.json();
          if (dbCardsRes.success) {
            editDeck.deck.flashcards = editDeck.cardsList.slice(); // copy
            util.addAlert(
              editDeck.messageSpotElement,
              "success",
              "",
              "Saved cards"
            );
          } else {
            util.addAlert(
              editDeck.messageSpotElement,
              "warning",
              "Couldn't update deck flashcards"
            );
          }
        } else {
          util.addAlert(
            editDeck.messageSpotElement,
            "warning",
            "Couldn't update deck flashcards"
          );
        }
      } catch (err) {
        util.addAlert(
          editDeck.messageSpotElement,
          "warning",
          "Error updating deck flashcards:",
          err
        );
      }
    });

    editDeck.newCardModal.addAnswerBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      editDeck.modalMessageSpotElement.innerHTML = "";
      const val = editDeck.newCardModal.cardAnswers.value;
      if (val && val.length > 0) {
        editDeck.newCardModal.answerList.appendChild(
          editDeck.getNewCardAnswerItem(val)
        );
        editDeck.newCardModal.cardAnswers.value = "";
      } else {
        util.addAlert(
          editDeck.modalMessageSpotElement,
          "warning",
          "Answer must be at least one character long."
        );
      }
    });

    editDeck.newCardModal.newCardForm.addEventListener(
      "submit",
      async (evt) => {
        evt.preventDefault();
        editDeck.modalMessageSpotElement.innerHTML = "";

        // clear past errors to make room for more
        editDeck.modalMessageSpotElement.innerHTML = "";

        if (!editDeck.cardSaveButtonClickable) {
          util.addAlert(
            editDeck.modalMessageSpotElement,
            "warning",
            "Please wait before saving again."
          );
          return;
        }
        editDeck.cardSaveButtonClickable = false;
        editDeck.unfreezeCardSaveButton();

        if (
          !(
            editDeck.newCardModal.prompt.value &&
            editDeck.newCardModal.prompt.value.length > 0
          )
        ) {
          util.addAlert(
            editDeck.modalMessageSpotElement,
            "warning",
            "Prompt must be at least one character long."
          );
          return;
        }
        if (!(editDeck.newCardModal.cardAnswersListJS.length > 0)) {
          util.addAlert(
            editDeck.modalMessageSpotElement,
            "warning",
            "Answer list must have at least one answer."
          );
          return;
        }

        const card = editDeck.createDefaultCard();
        card.sideA.prompt = editDeck.newCardModal.prompt.value;
        card.sideB.answer_list =
          editDeck.newCardModal.cardAnswersListJS.slice();
        editDeck.cardsList.push(card);

        try {
          let dbCardsRes = await fetch("/update-deck-flashcards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              deckId: editDeck.deck._id,
              flashcardsArray: editDeck.cardsList.slice(),
            }),
          });
          if (dbCardsRes.ok) {
            dbCardsRes = await dbCardsRes.json();
            if (dbCardsRes.success) {
              editDeck.deck.flashcards = editDeck.cardsList.slice(); // copy
              editDeck.cardListContent.appendChild(
                editDeck.getCardListItem(card)
              );
              editDeck.clearModalForm();
              util.addAlert(
                editDeck.modalMessageSpotElement,
                "success",
                "",
                "Added card"
              );
              return;
            } else {
              editDeck.cardsList = editDeck.deck.flashcards.slice();
              util.addAlert(
                editDeck.modalMessageSpotElement,
                "warning",
                "Couldn't update deck flashcards"
              );
              editDeck.clearModalForm();
              return;
            }
          } else {
            editDeck.cardsList = editDeck.deck.flashcards.slice();
            util.addAlert(
              editDeck.modalMessageSpotElement,
              "warning",
              "Couldn't update deck flashcards"
            );
            editDeck.clearModalForm();
            return;
          }
        } catch (err) {
          editDeck.cardsList = editDeck.deck.flashcards.slice();
          util.addAlert(
            editDeck.modalMessageSpotElement,
            "warning",
            "Error updating deck flashcards:",
            err
          );
          editDeck.clearModalForm();
        }
      }
    );

    editDeck.newCardModal.cardBtnCloseWithoutSaving.addEventListener(
      "click",
      () => {
        editDeck.clearModalForm();
      }
    );
  };

  editDeck.clearModalForm = function () {
    editDeck.newCardModal.cardAnswersListJS = [];
    editDeck.newCardModal.prompt.value = "";
    editDeck.newCardModal.answerList.innerHTML = "";
    editDeck.newCardModal.cardAnswers.value = "";
    editDeck.modalMessageSpotElement.innerHTML = "";
  };

  editDeck.createDefaultCard = function () {
    const card = {
      sideA: {
        prompt: "",
        answer_list: [],
        hint: "",
      },
      sideB: {
        prompt: "",
        answer_list: [],
        hint: "",
      },
      prompt_side: "sideA",
      tag: "",
      last_success: 1,
      success_rate: {},
      average_success_rate: {},
    };
    return card;
  };

  return editDeck;
}

export default EditDeck();
