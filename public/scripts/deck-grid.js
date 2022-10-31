/*Entire file by Armen Sarkisian*/

function IconGenerator() {
  const iconGenerator = {};
  const deckGrid = document.querySelector("#deckGrid");
  const setClass = (element, className) => {
    element.setAttribute("class", className);
  };
  const setHref = (element, hrefName) => {
    element.setAttribute("href", hrefName);
  };

  iconGenerator.generateDeckIcon = function(author, name, deckTags, id) {
    const div = document.createElement("div");
    const p = document.createElement("p");
    const nav = document.createElement("ul");
    const dropdownArrow = document.createElement("li");
    const options = document.createElement("a");
    const menu = document.createElement("ul");
    const editDeck = document.createElement("li");
    const editLink = document.createElement("a");
    const deleteDeck = document.createElement("li");
    const deleteLink = document.createElement("a");
    const duplicateDeck = document.createElement("li");
    const duplicateLink = document.createElement("a");
    const shareDeck = document.createElement("li");
    const settingsLink = document.createElement("a");
    const divider = document.createElement("li");
    const line = document.createElement("hr");
    const studyDeck = document.createElement("li");
    const studyLink = document.createElement("a");
    setClass(div, "col-sm-4 deckIcon");
    setClass(p, "iconText");
    setClass(nav, "nav nav-pills");
    setClass(dropdownArrow, "nav-item dropdown");
    setClass(options, "nav-link dropdown-toggle");
    options.setAttribute("data-bs-toggle", "dropdown");
    options.setAttribute("role", "button");
    options.setAttribute("aria-expanded", "false");
    menu.setAttribute("id", id);
    setHref(options, "#");
    const dropdownItems = [editLink, deleteLink, duplicateLink, settingsLink];
    setHref(editLink, "./edit-deck.html");
    setHref(settingsLink, "./edit-deck.html");

    for (let item of dropdownItems) {
      setClass(item, "dropdown-item deckOption");
    }
    setClass(menu, "dropdown-menu");
    setClass(line, "dropdown-divider");
    setClass(studyLink, "dropdown-item startStudyButton");
    setHref(studyLink, "#");

    options.innerHTML = "Options";
    editLink.innerHTML = "Edit";
    deleteLink.innerHTML = "Delete";
    duplicateLink.innerHTML = "Duplicate";
    settingsLink.innerHTML = "Settings";
    studyLink.innerHTML = "Start Study Session";
    //TODO - get individual deck tags, not the whole array
    p.innerHTML = `${name}<br /><br />${author}<br /><br />${deckTags}`;
    deckGrid.appendChild(div);
    div.appendChild(p);
    
    p.appendChild(nav);
    nav.appendChild(dropdownArrow);
    dropdownArrow.appendChild(options);
    
    dropdownArrow.appendChild(menu);
    menu.appendChild(editDeck);
    editDeck.appendChild(editLink);
    menu.appendChild(deleteDeck);
    deleteDeck.appendChild(deleteLink);
    menu.appendChild(duplicateDeck);
    duplicateDeck.appendChild(duplicateLink);
    menu.appendChild(shareDeck);
    shareDeck.appendChild(settingsLink);
    menu.appendChild(divider);
    divider.appendChild(line);
    menu.appendChild(studyDeck);
    studyDeck.appendChild(studyLink);

  };


  return iconGenerator;
}






/*generateDeckIcon("Armen", "Spanish Verbs", "80%");
generateDeckIcon("Mea", "Physics", "84%");
generateDeckIcon("Tim", "Football", "83%");
*/

export default IconGenerator();