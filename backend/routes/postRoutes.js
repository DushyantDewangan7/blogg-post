const express = require("express");
const router = express.Router();
const {
  getPosts,
  insertData,
  deletePost,
  addComment,
  getComments,
    // getNestedComments,
} = require("../controllers/message.controller");


router.get("/posts", getPosts);
router.post("/posts", insertData);
router.delete("/posts/:id", deletePost);
router.post("/posts/:id/comments", addComment);
router.get("/posts/:id/comments", getComments);
// router.get("/comments/:id", getNestedComments);     


module.exports = router;
