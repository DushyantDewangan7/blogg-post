// db.js
let db = null;

function setDB(database) {
  db = database;
}

function getDB() {
  if (!db) throw new Error("Database not initialized yet!");
  return db;
}

module.exports = { setDB, getDB };
