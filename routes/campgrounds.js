var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
router.get("/campgrounds", function(req, res) {
     //console.log(req);
   Campground.find({}, function(err, allCampgrounds){
       if(err) {
           console.log(err);
       } else {
           res.render("campgrounds/index", {campgrounds: allCampgrounds});
       }
   });
});

router.post("/campgrounds", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCamp = {name: name, price: price, image: image, description: desc, author: author};
    Campground.create(newCamp, function(err, newlyCreated){
        if(err) {
            console.log(err);
        } else {
            req.flash("success", "campground created!");
            res.redirect("/campgrounds");
        }
    });
});

router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new.ejs");
});

router.get("/campgrounds/:id", function(req, res) {
    //find campground with id
    //show campgrounds 
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCamp){
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCamp});
        }
    });
});

//Edit campground route
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCamp){
        if(err) {
            console.log(err);
        } else {
            res.render("campgrounds/edit", {campground: foundCamp});
        }
    });
});

//Update campground route
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership ,function(req, res){
    //find and update
    Campground.findByIdAndUpdate(req.params.id, req.body.campground ,function(err, updatedCamp){
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "campground updated!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//delete
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
       if(err) {
           console.log(err);
       } else {
           req.flash("success", "campground deleted!");
           res.redirect("/campgrounds");
       }
    });
});


module.exports = router;