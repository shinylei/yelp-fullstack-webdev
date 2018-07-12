var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//=========================================
//settings for uploading files
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dlehxaepu', 
  api_key: '754166444915815', 
  api_secret: 'exFqHHhjrd5CdeDkw-zm1RhJXZk'
});
//=========================================

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

router.post("/campgrounds", middleware.isLoggedIn, upload.single('image'), function(req, res){
    // //get data from form and add to campgrounds array
    // var name = req.body.name;
    // var price = req.body.price;
    // var desc = req.body.description;
    // var image = req.body.image;
    // var author = {
    //     id: req.user._id,
    //     username: req.user.username
    // };
    
    // var newCamp = {name: name, price: price, image: image, description: desc, author: author};
    // Campground.create(newCamp, function(err, newlyCreated){
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         req.flash("success", "campground created!");
    //         res.redirect("/campgrounds");
    //     }
    // });
    
    
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }
        Campground.create(req.body.campground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
        });
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