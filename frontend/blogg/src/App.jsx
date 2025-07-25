import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {
  const URL = "http://localhost:3000";
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    author: "",
  });
  const [commentsByPost, setCommentsByPost] = useState({});
  const [newComments, setNewComments] = useState({});
  const [replyingTo, setReplyingTo] = useState({});

  useEffect(() => {
    axios
      .get(`${URL}/posts`)
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Fetch posts failed", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPost = () => {
    axios
      .post(`${URL}/posts`, newPost)
      .then((res) => {
        setPosts((prev) => [...prev, res.data]);
        setNewPost({ title: "", content: "", author: "" });
      })
      .catch((err) => console.error("Post add failed", err));
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`${URL}/post/${postId}/comments`);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Fetch comments failed", err);
    }
  };

  const handleReplyChange = (commentId, field, value) => {
    setNewComments((prev) => ({
      ...prev,
      [commentId]: {
        ...(prev[commentId] || {}),
        [field]: value,
      },
    }));
  };

  const submitComment = async (postId, parentCommentId = null) => {
    const key = parentCommentId || postId;
    const comment = newComments[key];
    if (!comment?.text || !comment?.author) return;

    try {
      await axios.post(`${URL}/posts/${postId}/comments`, {
        text: comment.text,
        author: comment.author,
        parentCommentId,
      });
      await fetchComments(postId);
      setNewComments((prev) => ({
        ...prev,
        [key]: { text: "", author: "" },
      }));
    } catch (err) {
      console.error("Comment submit failed", err);
    }
  };

  const renderReplies = (comments, postId, level = 0) => {
    return comments.map((comment) => (
      <div key={comment._id} style={{ marginLeft: level * 20, marginTop: 10 }}>
        <strong>{comment.author}:</strong> {comment.text}
        <div className="mt-1">
          <button
            className="btn btn-link btn-sm p-0"
            onClick={() =>
              setReplyingTo((prev) => ({
                ...prev,
                [comment._id]: !prev[comment._id],
              }))
            }
          >
            Reply
          </button>
        </div>

        {replyingTo[comment._id] && (
          <div className="mt-2 mb-2">
            <input
              type="text"
              placeholder="Your name"
              className="form-control form-control-sm mb-1"
              value={newComments[comment._id]?.author || ""}
              onChange={(e) =>
                handleReplyChange(comment._id, "author", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Your reply"
              className="form-control form-control-sm mb-1"
              value={newComments[comment._id]?.text || ""}
              onChange={(e) =>
                handleReplyChange(comment._id, "text", e.target.value)
              }
            />
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => submitComment(postId, comment._id)}
            >
              Submit
            </button>
          </div>
        )}

        {comment.replies?.length > 0 &&
          renderReplies(comment.replies, postId, level + 1)}
      </div>
    ));
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            My Blog
          </a>
        </div>
      </nav>

      <div className="container">
        <h2>Add New Post</h2>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={newPost.title}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            name="content"
            className="form-control"
            value={newPost.content}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Author</label>
          <input
            type="text"
            name="author"
            className="form-control"
            value={newPost.author}
            onChange={handleInputChange}
          />
        </div>
        <button className="btn btn-primary mb-4" onClick={handleAddPost}>
          Add Post
        </button>

        <h3>All Posts</h3>
        {posts.map((post) => (
          <div key={post._id} className="card mb-3">
            <div className="card-body">
              <h5>{post.title}</h5>
              <p>{post.content}</p>
              <p>
                <small>Author: {post.author}</small>
              </p>

              {commentsByPost[post._id] ? (
                commentsByPost[post._id].length > 0 ? (
                  renderReplies(commentsByPost[post._id], post._id)
                ) : (
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      className="form-control form-control-sm mb-1"
                      value={newComments[post._id]?.author || ""}
                      onChange={(e) =>
                        handleReplyChange(post._id, "author", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Your comment"
                      className="form-control form-control-sm mb-1"
                      value={newComments[post._id]?.text || ""}
                      onChange={(e) =>
                        handleReplyChange(post._id, "text", e.target.value)
                      }
                    />
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => submitComment(post._id)}
                    >
                      Submit
                    </button>
                  </div>
                )
              ) : null}

              <div className="d-flex justify-content-between align-items-center mt-3">
                {!commentsByPost[post._id] && (
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => fetchComments(post._id)}
                  >
                    Load Comments
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (window.confirm("Delete this post?")) {
                      axios
                        .delete(`${URL}/posts/${post._id}`)
                        .then(() =>
                          setPosts((prev) =>
                            prev.filter((p) => p._id !== post._id)
                          )
                        );
                    }
                  }}
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
