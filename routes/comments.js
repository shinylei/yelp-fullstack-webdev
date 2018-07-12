//===================
// Comments Routes
//===================
var express = require("express");
var router = express.Router();
var Recipe = require("../models/recipe");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/recipes/:id/comments/new", middleware.isLoggedIn,function(req, res) {
    Recipe.findById(req.params.id, function(err, recipe) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {recipe: recipe});
        }
    });
});

router.post("/recipes/:id/comments", middleware.isLoggedIn,function(req, res) {
    Recipe.findById(req.params.id, function(err, recipe) {
       if(err) {
           console.log(err);
           res.redirect("/recipes");
       } else {
           Comment.create(req.body.comment, function(err, comment) {
               if(err) {
                   console.log(err);
               } else {
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   recipe.comments.push(comment);
                   recipe.save();
                   req.flash("success", "comment created!");
                   res.redirect("/recipes/" + recipe._id);
               }
           });
       }
    });
});

//edit comment
router.get("/recipes/:id/comments/:comment_id/edit",middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/edit", {recipe_id: req.params.id, comment: foundComment});
        }
    });
    
});

router.put("/recipes/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err) {
            console.log(err);
        } else{
            req.flash("success", "comment updated!");
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

//delete comments
router.delete("/recipes/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) {
            console.log(err);
        } else {
            req.flash("success", "comment deleted!");
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

module.exports = router;