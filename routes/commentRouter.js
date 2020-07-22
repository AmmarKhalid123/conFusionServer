const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Comments = require('../models/comments');

const commentsRouter = express.Router();

commentsRouter.use(bodyParser.json());

commentsRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Comments.find(req.query)
    .populate('author')
    .then((comments) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null){
        req.body.author = req.user._id // req.user contains user bcs of verifyUser
        Comments.create(req.body)
        .then((comment) => {
            Comments.findById(comment._id)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            })
            
        }, (err) => next(err))
        .catch((err) => next(err))
    }
    else {
        var err = new Error('Comment not found in req.body');
        err.status = 404;
        return next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operations not supported on /comments/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Comments.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

commentsRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .populate('author')
    .then((comment) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
    }, (err) => next(err))
    .catch((err) => next(err));   
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operations not supported on /comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (req.user._id.equals(comments.author)){
            if (comment != null) {
                req.body.author = req.user._id;
                Comments.findByIdAndUpdate(req.params.commentId, {
                    $set: req.body
                }, { new: true }) //new: true makes sure that updated comment is returned in .then
                .then((comment) => {
                    Comments.findById(comment._id)
                    .populate('author')
                    .then((comment) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(comment);
                    }) 
                }, err => { console.log(err)});
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found.');
                res.statusCode = 404;
                return next(err);
            }
        }
        else{
            err = new Error("You are not authorized to perform this operation!");
            res.statusCode = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then((comment) => {
        if (!comment){
            err = new Error('Comment ' + req.params.commentId + ' not found.');
            res.statusCode = 404;
            return next(err);
        }
        else if (req.user._id.equals(comments.author)){
                Comments.findByIdAndRemove(req.params.commentId)
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                }
                , err => next(err))
                .catch(err => next(err));   
        }
        else if (!req.user._id.equals(comments.author)){
            err = new Error("You are not authorized to perform this operation!");
            res.statusCode = 403;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = commentsRouter; 