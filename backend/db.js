const { MongoClient } = require("mongodb");
const mongoURI = "mongodb://localhost:27017";
const client = new MongoClient(mongoURI, { useUnifiedTopology: true });

let _db;

function connectToDB(callback) {
  client.connect((err) => {
    if (err) return callback(err);
    _db = client.db("blogDB");
    console.log("Connected to MongoDB");
    callback();
  });
}

function getDB() {
  if (!_db) throw new Error("Database not initialized!");
  return _db;
}
// function connectToDB() {
//   return new Promise((resolve, reject) => {
//     client.connect((err) => {
//       if (err) return reject(err);
//       _db = client.db("blogDB");
//       console.log("Connected to MongoDB");
//       resolve();
//     });
//   });
// }

// function getDB() {
//   if (!_db) throw new Error("Database not initialized!");
//   return _db;
// }
module.exports = { connectToDB, getDB };
