import * as mongodb from "mongodb";

async function addToDb(collectionName, object) {
  
  const uri = process.env.DB_URI;
  const client = new mongodb.MongoClient(uri);

  try {
    await client.connect();
    const mainDatabase = await client.db("MainDatabase");
    await mainDatabase.collection(collectionName).insertOne(object);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
};

export default addToDb;

