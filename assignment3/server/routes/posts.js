const express = require('express');
const uuid = require('node-uuid');
const xss = require('xss');
const router = express.Router();
const postList = [];

function makePost(title, body, encodedImg) {
    if (!title || typeof title !== 'string' || !body || typeof body !== 'string' || (encodedImg && typeof encodedImg !== 'string')) {
        throw new Error('Invalid Argument(s)');
    }

    postList.push({
        id: uuid.v4(),
        title: title,
        body: xss(body),
        created: new Date(),
        encodedImg: encodedImg
    });
}

makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');
makePost('Post One', 'Post Body', '');
makePost('Post Two', 'Post Body', '');

router.get("/archive/:page", (req, res) => {
    const page = parseInt(req.params.page);
    const startIdx = page * 20;

    let ret = [];

    for (let i = startIdx ; i < postList.length ; i++) {
        ret.push(postList[i]);
    }

    res.json(ret);
});

router.get("/totalPages", (req, res) => {
    const total = Math.ceil(postList.length / 20);

    res.json({total: total});
});

router.get("/posts/:id", (req, res) => {
    const id = req.params.id;

    let post = postList.filter(x => x.id === id)[0];

    if (!post) {
        res.sendStatus(404);
    } else {
        res.json(post);
    }
});


router.post("/posts", (req, res) => {
    try {
        makePost(req.body.title, req.body.body, req.body.encodedImg);
        res.json({success: 'Added post!'});
    } catch(e) {
        res.status(500).json({error: e});
    }
});

// Capture any other uncoded routes and 404 them
router.use("/posts/*", (req, res) => {
    res.sendStatus(404);
});

router.use("/archive/*", (req, res) => {
    res.sendStatus(404);
});

module.exports = router;