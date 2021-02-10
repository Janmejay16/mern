const db = require('../models/Models')
const routes = require('express').Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');


const accessTokenSecret = "youcannerverevereventhinkofcrackingthiscozitsmejjshastri@16042001"

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

routes.get('/', (req,res) => {
    res.status(200).json({
        message: 'Routes Working Good!'
    })
})

// Get Users, Posts
routes.get('/users', authenticateJWT, (req,res) => {
    db.User.find({}).then(users => {
        res.json(users)
    }).catch(err => {
        res.json(err)
    })
})

routes.get('/posts', authenticateJWT, (req,res) => {
    db.Post.find({}).then(posts => {
        res.json(posts)
    }).catch(err => {
        res.json(err)
    })
})

routes.get('/comments/:id', authenticateJWT, (req,res) => {
    const result=[]
    const pushComments = item => {
        result.push(item.text)
        return Promise.resolve("ok")
    }
    const asyncFunc = async item => {
        return pushComments(item)
    }

    const getData = async () => {
        db.Post.findById(req.params.id)
        .then(posts => {
            return Promise.all(posts.comments.map(item => 
                db.Comment.findById(item)
                .then(comment => {
                    asyncFunc(comment)
                })
            ))
        })
    }

    getData().then(data => {
        setTimeout(() => {
            res.send(result)
        },1000)
    })
})


// Create Users, Posts
routes.post('/users/register', (req,res) => {
    db.User.exists({email: req.body.email}, (err,user) => {
        if(!user) {

            bcrypt.hash(req.body.password, 10, (err, hash) => {
                console.log(hash)
                var newUser = new db.User({
                    username: req.body.username,
                    password: hash,
                    email: req.body.email,
                    phone: req.body.phone
                })
                newUser.save((err, user) => {
                    if(err) return res.json(err)
                    res.status(201).json({
                        message: "User Registered Succesfully!",
                        user: user._id,
                        username: user.username
                    })
                })
            })
        }
        else return res.send({message: "Email Already Registered!"})
    })
})

routes.post('/users/login', (req,res) => {
    db.User.exists({email: req.body.email}, (err,user) => {
        if(user) {
            db.User.findOne({email: req.body.email}, (err,userfound) => {
                if(userfound) {
                    bcrypt.compare(req.body.password,userfound.password, (err, match) => {
                        if(err) return res.send(err)

                        else if(match) {
                            // console.log(accessTokenSecret)
                            const accessToken = jwt.sign({ username: userfound.username,  email: userfound.email}, accessTokenSecret);

                            return res.send({
                                message: userfound.email+" Logged in!",
                                token: accessToken
                            })
                        }

                        else return res.send({message: "Incorrect Password for "+userfound.email})
                    })
                }
                else return res.send({message: "Email not Registered!"})
            })
        }
    })
})


routes.post('/posts/:id', (req,res) => {

    db.User.findById(req.params.id)
    .then (user => {
        var newPost = new db.Post({
            description: req.body.description,
            username: user.username
        })
        newPost.save((err, post) => {
            if(!err) {
                return db.User.findOneAndUpdate(
                        {_id: req.params.id },
                        {$push : {posts : newPost._id}},
                        {new: true}
                )
                .then(updatedUser => {
                    res.json(201,{
                        user : updatedUser,
                        post: post
                    })
                })
                .catch(err => {
                    res.json(err)
                })
            }
        })
    })
})


routes.post('/comments/:id', (req,res) => {
    
    db.Post.findById(req.params.id)
    .then (post => {
        var newComment = new db.Comment({
            text: req.body.text,
            username: post.username
        })
        newComment.save((err, comment) => {
            if(!err) {
                return db.Post.findOneAndUpdate(
                        {_id: req.params.id },
                        {$push : {comments : newComment._id}},
                        {new: true}
                )
                .then(updatedPost => {
                    res.json(201,{
                        post : updatedPost,
                        comment: comment
                    })
                })
                .catch(err => {
                    res.json(err)
                })
            }
        })
    })
})

module.exports = routes;