// const connectToMongo = require('./db');
// const express = require('express');
// const cors = require('cors');
// const Post = require('./models/user.model'); 
// const mongoose = require('mongoose');


// // const app = express();
// const PORT = process.env.PORT || 3000;

// connectToMongo();
// app.use(express.json());
// app.use(cors());

// app.post('/addpost', async (req, res) => {
//     try {
//         const { title, content, author } = req.body;
//         console.log(title, content, author);

//         const post = new Post({ title, content, author }); 
//         await post.save(); 

//         res.status(201).send("Post has been added");
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Server Error");
//     }
// });

// app.get('/posts', async (req, res) => {
//     try {
//         const posts = await Post.find(); 
//         res.status(200).json(posts);    
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Server Error");
//     }
// });

// app.delete('/deletepost/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         await Post.findByIdAndDelete(id); 
//         res.status(200).send("Post has been deleted");
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send("Server Error");
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
