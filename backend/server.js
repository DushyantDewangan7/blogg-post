const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Post = require('./models/post.model');
const Comment = require('./models/comment.model');
const app = express();
const PORT = process.env.PORT || 3000;


const mongoURI = 'mongodb://localhost:27017/blogDB';


const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log(' Connected to MongoDB');
    } catch (error) {
        console.error(' Error connecting to MongoDB:', error.message);
    }
};

connectToMongo();


app.use(cors());
app.use(express.json());


const populateReplies = async (commentDoc) => {
  const comment = commentDoc.toObject();
  comment.replies = await Promise.all(
    commentDoc.replies.map(async (replyId) => {
      const reply = await Comment.findById(replyId);
      if (!reply) return null;
      return await populateReplies(reply);
    })
  );
  return comment;
};


// const postSchema = new mongoose.Schema({
//     title: String,
//     content: String,
//     author: String,
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     updatedAt: Date,
//     comments: [
//         {
//             text: String,
//             author: String,
//             createdAt: {
//                 type: Date,
//                 default: Date.now
//             }
//         }
//     ]
// });

// const Post = mongoose.model('Post', postSchema);




app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post('/posts', async (req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post('/posts/:id/comments', async (req, res) => {
    try {
        const { text, author,parentCommentId } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = new Comment({
            text,
            author            
        })

        if(parentCommentId){
            const parent = await Comment.findById(parentCommentId);
            if(!parent){
                return res.status(404).json({ message: 'Parent comment not found' });
            }
            newComment.parentComment = parent._id;
            await newComment.save();
            parent.replies.push(newComment._id);
            await parent.save();
        }else{
            await newComment.save();
            post.comments.push(newComment._id);
            await post.save();
        }
        

        res.status(201).json({ message: 'Comment added', comment: newComment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.get('/post/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const fullNestedComments = await Promise.all(
      post.comments.map((comment) => populateReplies(comment))
    );

    res.json(fullNestedComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
});
