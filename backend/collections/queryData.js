const { ObjectId } = require("mongodb");
const { getDB } = require("../db.js");

function insertOne(collectionName, data, callback) {
  const db = getDB();
  return db.collection(collectionName).insertOne(data, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result.insertedId);
    }
  });
}

function findOne(collectionName, query, callback) {
  const db = getDB();
  return db.collection(collectionName).findOne(query, callback);
}

function findMany(collectionName, query, callback) {
  const db = getDB();
  return db.collection(collectionName).find(query).toArray(callback);
}

function deleteOne(collectionName, query, callback) {
  const db = getDB();
  return db
    .collection(collectionName)
    .deleteOne({ _id: new ObjectId(query) }, (err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
}

function commentOperations(collectionName, postId, commentData, callback) {
  const db = getDB();
  return db
    .collection(collectionName)
    .updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: commentData } },
      callback
    );
}

function commentReplies(collectionName, commentId, replyData, callback) {
  const db = getDB();
  return db
    .collection(collectionName)
    .updateOne(
      { _id: new ObjectId(commentId) },
      { $push: { replies: replyData } },
      callback
    );
}

// function updateOne(collectionName, query, updateData, callback) {
//     const db = getDB();
//     return db.collection(collectionName).updateOne(query, { $set: updateData }, (err, result) => {
//         if (err) {
//             callback(err);
//         } else {
//             callback(null, result);
//         }
//     });
// }

module.exports = {
  insertOne,
  findOne,
  findMany,
  deleteOne,
  commentOperations,
  commentReplies,
};
