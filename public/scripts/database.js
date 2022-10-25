/*This is the same code as devFilesToDelete/mongoConnect. Marking this file for deletion.*/

require("dotenv").config();
const {MongoClient} = require("mongodb");


async function main() {
  
  const uri = process.env.DB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = client.db("mainDatabase");
    const usersCollection = mainDatabase.collection("Users");
    console.log(`The user collection: ${usersCollection}`);
    await listDatabases(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};


main().catch(console.error);



async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  console.log("Databases");
  databasesList.databases.forEach(db => {
    console.log(`_ ${db.name}`);
  });
}


/*async function addUserTest(user, client) {
  const user = {name: "Armen12", email: "a@rmen.com"};
  const usersDB = "User";


}
*/