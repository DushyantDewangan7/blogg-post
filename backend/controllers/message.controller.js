const { ObjectId } = require("mongodb");
const { getDB } = require("../db.js");
const getNestedComments = require("../components/populateReplies.js");
const {
  insertOne,
  findOne,
  findMany,
  deleteOne,
  commentOperations,
  commentReplies,
} = require("../collections/queryData.js");
// function getNestedComments(commentId, callback) {
//   const db = getDB();

//   const commentsCollection = db.collection("comments");

//   commentsCollection.findOne({ _id: new ObjectId(commentId) }, (err, comment) => {
//     if (err) return callback(err);
//     if (!comment) return callback(null, null);

//     const fullComment = { ...comment, replies: [] };

//     // If no replies, return immediately
//     if (!comment.replies || comment.replies.length === 0) {
//       return callback(null, fullComment);
//     }

//     let processedCount = 0;
//     const totalReplies = comment.replies.length;

//     comment.replies.forEach((replyId) => {
//       getNestedComments(replyId, (err, nestedReply) => {
//         if (!err && nestedReply) {
//           fullComment.replies.push(nestedReply);
//         }
//         processedCount++;

//         if (processedCount === totalReplies) {
//           callback(null, fullComment);
//         }
//       });
//     });
//   });
// }

function insertData(req, res) {
  const db = getDB();
  const { title, content, author } = req.body;
  const post = {
    title,
    content,
    author,
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
  };
  if (!title || !content || !author) {
    return res.status(400).json({ message: "All fields are required" });
  }

  insertOne("posts", post, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ ...post, _id: result });
  });

  //  db.collection("posts").insertOne(post, (err, result) => {
  //   if (err) return res.status(400).json({ message: err.message });
  //   res.status(201).json({ ...post, _id: result.insertedId });
  // });
  // console.log("Post inserted:", postData);
}

function getPosts(req, res) {
  console.log("Fetching posts...");
  // const db = require("../db.js").getDB();
  const db = getDB();
  // db.collection("posts")
  //   .find({})
  //   .toArray((err, posts) => {
  //     if (err) return res.status(500).json({ message: err.message });
  //     res.json(posts);
  //   })
  findMany("posts", {}, (err, posts) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(posts);
  });
  // console.log("Posts fetched:", posts);
}

function deletePost(req, res) {
  const db = getDB();
  // db.collection("posts").deleteOne({ _id: new ObjectId(req.params.id) }, (err) => {
  //   if (err) return res.status(500).json({ message: err.message });
  //   res.json({ message: "Post deleted" });
  // });

  deleteOne("posts", req.params.id, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Post deleted" });
  });
}

function addComment(req, res) {
  const db = getDB();
  const { text, author, parentCommentId } = req.body;
  const postId = req.params.id;

  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  // const postsCollection = db.collection("posts");
  // const commentsCollection = db.collection("comments");

  // postsCollection.findOne({ _id: new ObjectId(postId) }, (err, post) => {
  //   if (err) return res.status(500).json({ message: err.message });
  //   if (!post) return res.status(404).json({ message: "Post not found" });

  findOne("posts", { _id: new ObjectId(postId) }, (err, post) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!post) return res.status(404).json({ message: "Post not found" });
    const newComment = {
      text,
      author,
      parentComment: parentCommentId ? new ObjectId(parentCommentId) : null,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // commentsCollection.insertOne(newComment, (err, result) => {
    //   if (err) return res.status(500).json({ message: err.message });
    //   const newCommentId = result.insertedId;

    //   if (parentCommentId) {
    //     commentsCollection.updateOne(
    //       { _id: new ObjectId(parentCommentId) },
    //       { $push: { replies: newCommentId } },
    //       (err) => {
    //         if (err) return res.status(500).json({ message: err.message });
    //         res.status(201).json({ ...newComment, _id: newCommentId });
    //       }
    //     );
    //   } else {
    //     postsCollection.updateOne(
    //       { _id: new ObjectId(postId) },
    //       { $push: { comments: newCommentId } },
    //       (err) => {
    //         if (err) return res.status(500).json({ message: err.message });
    //         res.status(201).json({ ...newComment, _id: newCommentId });
    //       }
    //     );
    //   }
    // });
    insertOne("comments", newComment, (err, newCommentId) => {
      if (err) return res.status(500).json({ message: err.message });

      if (parentCommentId) {
        commentReplies("comments", parentCommentId, newCommentId, (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.status(201).json({ ...newComment, _id: newCommentId });
        });
      } else {
        commentOperations("posts", postId, newCommentId, (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.status(201).json({ ...newComment, _id: newCommentId });
        });
      }
    });
  });
}

function getComments(req, res) {
  const db = getDB();
  const postId = req.params.id;

  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  findOne("posts", { _id: new ObjectId(postId) }, (err, post) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.comments || post.comments.length === 0) {
      return res.status(200).json([]);
    }

    const nestedResults = [];
    let processedCount = 0;

    post.comments.forEach((commentId) => {
      getNestedComments(commentId, (err, fullComment) => {
        if (!err && fullComment) nestedResults.push(fullComment);
        processedCount++;

        if (processedCount === post.comments.length) {
          res.status(200).json(nestedResults);
        }
      });
    });
  });

  // const postsCollection = db.collection("posts");
  // console.log("Fetching comments for post:", postId);
  // const commentsCollection = db.collection("comments");
  // console.log(commentsCollection, "comments");

  // postsCollection.findOne({ _id: new ObjectId(postId) }, (err, post) => {
  //   if (err) return res.status(500).json({ message: err.message });
  //   if (!post) return res.status(404).json({ message: "Post not found" });

  //   commentsCollection
  //     .find({ _id: { $in: post.comments || [] } })
  //     .toArray((err, topLevelComments) => {
  //       if (err) return res.status(500).json({ message: err.message });
  //       if (topLevelComments.length === 0) return res.status(200).json([]);

  //       const nestedResults = [];
  //       let processedCount = 0;

  //       topLevelComments.forEach((comment) => {
  //         getNestedComments(comment._id, (err, fullComment) => {
  //           if (!err && fullComment) nestedResults.push(fullComment);
  //           processedCount++;

  //           if (processedCount === topLevelComments.length) {
  //             res.status(200).json(nestedResults);
  //           }
  //         });
  //       });
  //     });
  // });
}

module.exports = {
  insertData,
  getPosts,
  deletePost,
  addComment,
  getComments,
  getNestedComments,
};
