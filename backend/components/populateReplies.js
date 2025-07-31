const {getDB} = require("../db.js");
const {ObjectId} = require("mongodb");

function populateReplies(commentId, callback) {
  const db = getDB();
  const commentsCollection = db.collection("comments");

  commentsCollection.findOne({_id: new ObjectId(commentId)}, (err, comment) => {
    if (err) return callback(err);
    if (!comment) return callback(null, null);

    const fullComment = {...comment, replies: []};

    // If no replies, return immediately
    if (!comment.replies || comment.replies.length === 0) {
      return callback(null, fullComment);
    }

    let processedCount = 0;
    const totalReplies = comment.replies.length;

    comment.replies.forEach((replyId) => {
      populateReplies(replyId, (err, nestedReply) => {
        if (!err && nestedReply) {
          fullComment.replies.push(nestedReply);
        }
        processedCount++;

        if (processedCount === totalReplies) {
          callback(null, fullComment);
        }
      });
    });
  });
}

module.exports = populateReplies;