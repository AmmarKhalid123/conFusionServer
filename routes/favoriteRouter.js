const express = require('express');
const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favRouter = express.Router();

favRouter.use(bodyParser.json());

favRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('favorites')
    .then((favts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    const userFavts = [];

    Favorites.findOne({user: req.user._id})
    .then((favts) => {
        if (favts === null) {
            req.body.favorites.forEach((favorite) => {
                userFavts.push(favorite._id); //not checking if favts already exist since here favorites are being created
            });
            Favorites.create({user: req.user._id, favorites: userFavts})
            .then((favt) => {
                console.log("Favt created: ", favt);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favt);
            }, (err) => next(err))
            .catch((err) => next(err))
        }
        else {
            var change = false;
            req.body.favorites.forEach((favorite) => {
                console.log(favts.favorites.indexOf(favorite._id))
                if (favts.favorites.indexOf(favorite._id) === -1) {
                    favts.favorites.push(favorite._id);
                    change = true;
                }
            });
            favts.save()
                .then((favt) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favt);
                }, (err) => next(err))
                .catch(err => next(err));
        }
    });
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})

favRouter.route('/:dishId')
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favts) => {
        if (favts === null) {
            Favorites.create({user: req.user._id, favorites: [req.params.dishId]})
            .then((favt) => {
                console.log("Favt created: ", favt);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favt);
            }, (err) => next(err))
            .catch((err) => next(err))
        }
        else {
            if (favts.favorites.indexOf(req.params.dishId) === -1) {
                favts.favorites.push(req.params.dishId);
            };
            favts.save()
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            })
            .catch(err => next(err));
        }
        
    });
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    Favorites.findOne({user: req.user._id})
    .then((favts) => {
        const index = favts.favorites.indexOf(req.params.dishId);
        if (index > -1) {
            favts.favorites.splice(index, 1);
        };
        favts.save()
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        })
        .catch(err => next(err));
    });
});

module.exports = favRouter;