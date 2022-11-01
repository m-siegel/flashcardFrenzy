import util from "./util.js";

function EditDeck() {
  const editDeck = {};

  editDeck.messageSpotElement = document.querySelector("#messageSpot");

  editDeck.deck = null;

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
    util.displayPageBody();
    await editDeck.setUpLogoutButtons();
    editDeck.fillDeckFormFromDeck();
    editDeck.setUpEditDeckForm();
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

  return editDeck;
}

export default EditDeck();
