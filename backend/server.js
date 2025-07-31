// const express = require("express");
// const cors = require("cors");
// const { MongoClient } = require("mongodb");
// const { ObjectId } = require("mongodb");
// const app = express();
// const PORT = process.env.PORT || 3000;
// const mongoURI = "mongodb://localhost:27017";
// const client = new MongoClient(mongoURI);
// const router = require("./routes/postRoutes.js"); 

// // let db;

// app.use(cors());
// app.use(express.json());
// app.use("/api", router);


// // Connect to MongoDB

// function run() {
//   client.connect((err) => {
//     if (err) {
//       console.error("Error connecting to MongoDB:", err);
//       return;
//     }
//     console.log("Connected to MongoDB");
//     db = client.db("blogDB");
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   });
// }
// run();

// const hello = function dkd(){
//   console.log("Hello World");
// }
// console.log(hello());

// function getNestedComments(commentId) {
//   return db.collection("comments").findOne({ _id: commentId })
//     .then(comment => {
//       if (!comment) return null;

//       const fullComment = { ...comment, replies: [] };

//       if (!comment.replies || comment.replies.length === 0) {
//         return fullComment;
//       }
//       const replyPromises = comment.replies.map(replyId =>
//         getNestedComments(replyId).then(reply => reply || null)
//       );
//       return Promise.all(replyPromises)
//         .then(replies => {
//           fullComment.replies = replies.filter(reply => reply !== null);
//           return fullComment;
//         });
//     })
//     .catch(error => {
//       console.error("Error fetching comments:", error);
//       throw error;
//     });
// }

// const { ObjectId } = require("mongodb");

// function getNestedComments(commentId, callback) {
//   db.collection("comments").findOne(
//     { _id: commentId },
//     function (err, comment) {
//       if (err) return callback(err);
//       if (!comment) return callback(null, null);

//       const fullComment = { ...comment, replies: [] };

//       if (!comment.replies || comment.replies.length === 0) {
//         return callback(null, fullComment);
//       }

//       let processedCount = 0;
//       const totalReplies = comment.replies.length;

//       comment.replies.forEach((replyId) => {
//         getNestedComments(replyId, (err, reply) => {
//           if (err) reply = null;
//           if (reply) fullComment.replies.push(reply);

//           processedCount++;
//           if (processedCount === totalReplies) {
//             callback(null, fullComment);
//           }
//         });
//       });
//     }
//   );
// }

// // app.get("/posts", function (req, res) {
// //   console.log("Fetching posts...");
// //   const posts = db.collection("posts").find({ title: "why you have to reload" }).toArray();
// //   console.log("Posts fetched successfully", posts.length);
// //   res.json(posts);
// //   // (err, posts) => {
// //   //   console.log("Posts fetched successfully", posts.length);
// //   //   if (err) {
// //   //     console.error("Error fetching posts:", err);
// //   //     return res.status(500).json({ message: err.message });
// //   //   }

// //   //   console.log("Posts fetched successfully", posts.length);
// //   //   res.send(200).json(posts);
// //   // });
// // });
// app.get("/posts", function (req, res) {
//   db.collection("posts")
//     .find({})
//     .toArray(function (err, posts) {
//       if (err) {
//         console.error("Error fetching posts:", err);
//         return res.status(500).json({ message: err.message });
//       }

//       console.log("Posts fetched successfully", posts.length);
//       res.json(posts);
//     });
// });

// app.post("/posts", (req, res) => {
//   const { title, content, author } = req.body;
//   const post = {
//     title,
//     content,
//     author,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     comments: [],
//   };

//   const result = db.collection("posts").insertOne(post, function (err, result) {
//     if (err) return res.status(400).json({ message: err.message });
//     res.status(201).json(result.ops ? result.ops[0] : post);
//   });
// });

// app.delete("/posts/:id", (req, res) => {
//   db.collection("posts").deleteOne(
//     { _id: new ObjectId(req.params.id) },
//     (err) => {
//       if (err) res.status(500).json({ message: err.message });
//       console.log("Post deleted successfully");
//     }
//   );
// });

// app.post("/posts/:id/comments", (req, res) => {
//   try {
//     const { text, author, parentCommentId } = req.body;
//     const postId = req.params.id;

//     console.log("Requested Post ID:", postId);

//     if (!ObjectId.isValid(postId)) {
//       return res.status(400).json({ message: "Invalid post ID" });
//     }
//     const postsCollection = db.collection("posts");
//     const commentsCollection = db.collection("comments");

//     postsCollection.findOne(
//       { _id: new ObjectId(postId) },
//       function (err, post) {
//         if (err) return res.status(500).json({ message: err.message });
//         if (!post) return res.status(404).json({ message: "Post not found" });

//         const newComment = {
//           text,
//           author,
//           parentComment: parentCommentId ? new ObjectId(parentCommentId) : null,
//           replies: [],
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         };
//         commentsCollection.insertOne(newComment, (err, result) => {
//           if (err) return res.status(500).json({ message: err.message });
//           const commentId = result.insertedId;
//           if (parentCommentId) {
//             commentsCollection.updateOne(
//               { _id: new ObjectId(parentCommentId) },
//               { $push: { replies: commentId } },
//               () =>
//                 res
//                   .status(201)
//                   .json({
//                     message: "Comment added successfully",
//                     ...newComment,
//                     _id: commentId,
//                   })
//             );
//           } else {
//             postsCollection.updateOne(
//               { _id: new ObjectId(postId) },
//               { $push: { comments: commentId } },
//               (err) => {
//                 if (err) return res.status(500).json({ message: err.message });
//                 res.status(201).json({ ...newComment, _id: commentId });
//               }
//             );
//           }
//         });
//       }
//     );
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get("/posts/:id/comments", (req, res) => {
//   const postId = req.params.id;
//   if (!ObjectId.isValid(postId)) {
//     return res.status(400).json({ message: "Invalid post ID" });
//   }
//   const postsCollection = db.collection("posts");
//   const commentsCollection = db.collection("comments");
//   postsCollection.findOne({ _id: new ObjectId(postId) }, function (err, post) {
//     if (err) return res.status(500).json({ message: err.message });
//     if (!post) return res.status(404).json({ message: "Post not found" });
//     commentsCollection
//       .find({ _id: { $in: post.comments || [] } })
//       .toArray((err, topLevelComments) => {
//         if (err) return res.status(500).json({ message: err.message });

//         let processedCount = 0;
//         const nestedresults = [];
//         if (topLevelComments.length === 0) return res.status(200).json([]);
//         topLevelComments.forEach((comment) => {
//           getNestedComments(comment._id, (err, fullComment) => {
//             if (err) {
//               console.error("Error fetching nested comment:", err);
//               return res.status(500).json({ message: err.message });
//             }
//             nestedresults.push(fullComment);
//             processedCount++;
//             if (processedCount === topLevelComments.length) {
//               res.status(200).json(nestedresults);
//             }
//           });
//         });

//         // res.status(200).json(topLevelComments);
//       });
//   });
// });
// const express = require("express");
// const cors = require("cors");
// const { MongoClient } = require("mongodb");

// const {
//   insertData,
//   getPosts,
//   deletePost,
//   addComment,
//   getComments,
//   getNestedComments,
// } = require("./controllers/message.controller.js");

// const express = require("express");
// const cors = require("cors");
// const { MongoClient } = require("mongodb");

// const express = require("express");
// const { MongoClient } = require("mongodb");
// const cors = require("cors");
// const { setDB } = require("./db.js");  // Import setter

// const app = express();
// const PORT = process.env.PORT || 3000;
// const mongoURI = "mongodb://localhost:27017";
// const client = new MongoClient(mongoURI);

// app.use(cors());
// app.use(express.json());

// client.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MongoDB:", err);
//     return;
//   }
//   console.log("Connected to MongoDB");

//   // Set the database globally
//   setDB(client.db("blogDB"));

//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// });
const express = require("express");
const cors = require("cors");
const { connectToDB } = require("./db");
const postRoutes = require("./routes/postRoutes.js");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

connectToDB((err) => {
  if (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

app.use("/", postRoutes);


// app.get("/posts", getPosts);
// app.post("/posts", insertData);
// app.delete("/posts/:id", deletePost);
// app.post("/posts/:id/comments", addComment);
// app.get("/posts/:id/comments", getComments);
// app.get("/comments/:id", getNestedComments);
