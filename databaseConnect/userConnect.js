const db = [
  { name: "Bob", _id: 1 },
  { name: "Joe", _id: 2 },
];

export async function getUserByUsername(username) {
  return db.find((user) => user.userName === username);
}

export async function getUserById(id) {
  return db.find((user) => user._id === id);
}

export async function addUser(userObj) {
  db.push({ name: userObj.first_name, _id: db.length + 1 });
  // add to database
}
