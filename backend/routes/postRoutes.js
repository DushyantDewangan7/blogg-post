const express = require("express");
const router = express.Router();
const {
  getPosts,
  insertData,
  deletePost,
  addComment,
  getComments,
//   getNestedComments,
} = require("../controllers/message.controller");

// ✅ Correct routes
router.get("/", getPosts);                      // GET /api/posts
router.post("/", insertData);                   // POST /api/posts
router.delete("/:id", deletePost);              // DELETE /api/posts/:id
router.post("/:id/comments", addComment);       // POST /api/posts/:id/comments
router.get("/:id/comments", getComments);       // GET /api/posts/:id/comments
// router.get("/comments/:id", getNestedComments); // GET /api/posts/comments/:id

module.exports = router;
