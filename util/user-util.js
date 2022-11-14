/*Armen Sarkisian and Ilana-Mahmea Siegel (pair programming) */
import bcrypt from "bcrypt";
import { addUser, getUserByUsername } from "../databaseConnect/userConnect.js";

/*A function comment will be helpful*/
export async function createUser(first, last, username, rawPassword) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  // make obj
  const user = {
    first_name: first,
    last_name: last,
    username: username,
    password: hashedPassword,
    decks_in_library: [],
    num_decks_created: 0,
    decks_created: [], // deckIds
    num_decks_shared: 0, //for future versions
    active_streak: 0, //for future versions
    recently_studied: [], //for future versions
  };

  return user;
}

/*A function comment will be helpful*/
export async function createAndAddUser(first, last, username, rawPassword) {
  const user = await createUser(first, last, username, rawPassword);
  await addUser(user);
  return user;
}

export async function availableUsername(username) {
  if (!(await getUserByUsername(username)).success) {
    return true;
  } else {
    return false;
  }
}
