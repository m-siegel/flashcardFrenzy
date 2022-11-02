/** By Armen Sarkisian */
import util from "./util.js";
function UserSettings() {
  const userSettings = {};
  const messageSpot = document.querySelector("#messageSpot");

  userSettings.configureFormSubmit = async function() {
    const submitForm = document.querySelector("#submitUsernameForm");
    submitForm.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      let FR = new FormData(submitForm);
      const submitUsername = FR.get("submitUsernameForm");
      const res = await (
        await fetch("/change-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newUsername: submitUsername}),
        })
      ).json();

      if (res.success) {
        util.addAlert(messageSpot, "success", `Successfully changed username to ${res.username}.`);
      } else {
        util.addAlert(messageSpot, "warning", res.msg);
      }

    });

  };

  userSettings.setDeleteEvent = async function() {
    const deleteButton = document.querySelector("#deleteButton");
    deleteButton.addEventListener("click", async () => {
      const res = await (
        await fetch("/delete-account", {
          method: "GET"
        })
      ).json();

      if (res.success) {
        util.addAlert(messageSpot, "success", "Sorry to see you go!");
        const res = await (
          await fetch("/logoutUser", {
            method: "POST"
          })
        ).json();
        if (!res.success) {
          util.addAlert(messageSpot, "warning", res.msg);
        }

        util.redirect("/index");
      } else {
        util.addAlert(messageSpot, "warning", "There was an error deleting your account. Maybe this is a sign that you should stay =)");
      }

    });

  };

  return userSettings;
}

export default UserSettings();