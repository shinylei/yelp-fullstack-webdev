//===================
// Comments Routes
//===================
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn,function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

router.post("/campgrounds/:id/comments", middleware.isLoggedIn,function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
       if(err) {
           console.log(err);
           res.redirect("/campgrounds");
       } else {
           Comment.create(req.body.comment, function(err, comment) {
               if(err) {
                   console.log(err);
               } else {
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success", "comment created!");
                   res.redirect("/campgrounds/" + campground._id);
               }
           });
       }
    });
});

//edit comment
router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
    
});

router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err) {
            console.log(err);
        } else{
            req.flash("success", "comment updated!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//delete comments
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) {
            console.log(err);
        } else {
            req.flash("success", "comment deleted!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;