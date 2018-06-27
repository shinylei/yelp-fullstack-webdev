var Campground = require("../models/campground");
var Comment = require("../models/comment");
// all the middle wares
var middlewareObj = {};

middlewareObj.checkCommentOwnership = function (req, res, next) {
    //check user logged in?
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err) {
                req.flash("error", "Campground not found!");
                console.log(err);
            } else {
                //does user own the cmpgrounds
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission");
                    res.redirect("back");
                }
            }
        });
    } else{
        req.flash("error", "Please Log In first");
        res.redirect("/login");
    }
}

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    //check user logged in?
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCamp){
            if(err) {
                req.flash("error", "Not found")
                console.log(err);
            } else {
                //does user own the cmpgrounds
                if (foundCamp.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission")
                    res.redirect("back");
                }
            }
        });
    } else{
        req.flash("error", "Please Login First!!");
        res.redirect("/login");
    }
};
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login First!!");
    res.redirect("/login");
};
module.exports = middlewareObj;