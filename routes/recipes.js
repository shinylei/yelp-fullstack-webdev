var express = require("express");
var router = express.Router();
var Recipe = require("../models/recipe");
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

router.get("/recipes", function(req, res) {
     //console.log(req);
   Recipe.find({}, function(err, allRecipes){
       if(err) {
           console.log(err);
       } else {
           res.render("recipes/index", {recipes: allRecipes});
       }
   });
});

router.post("/recipes", middleware.isLoggedIn, upload.single('image'), function(req, res){
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
    
    console.log(req.file);
    cloudinary.uploader.upload(req.file.path, function(result) {
        
        // add cloudinary url for the image to the recipe object under image property
        req.body.recipe.image = result.secure_url;
        // add author to recipe
        req.body.recipe.author = {
            id: req.user._id,
            username: req.user.username
        }
       Recipe.create(req.body.recipe, function(err, recipe) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/recipes/' + recipe.id);
        });
    });
});

router.get("/recipes/new", middleware.isLoggedIn, function(req, res){
    res.render("recipes/new.ejs");
});

router.get("/recipes/:id", function(req, res) {
    //find recipe with id
    //show recipes 
    Recipe.findById(req.params.id).populate("comments").exec(function(err, foundRec){
        if (err) {
            console.log(err);
        } else {
            res.render("recipes/show", {recipe: foundRec});
        }
    });
});

//Edit recipe route
router.get("/recipes/:id/edit", middleware.checkRecipeOwnership, function(req, res) {
    Recipe.findById(req.params.id, function(err, foundRec){
        if(err) {
            console.log(err);
        } else {
            res.render("recipes/edit", {recipe: foundRec});
        }
    });
});

//Update recipe route
router.put("/recipes/:id", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findByIdAndUpdate(req.params.id, req.body.recipe ,function(err, updatedRec){
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "recipe updated!");
            res.redirect("/recipes/" + req.params.id);
        }
    });

});

//delete
router.delete("/recipes/:id", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findByIdAndRemove(req.params.id, function(err){
       if(err) {
           console.log(err);
       } else {
           req.flash("success", "recipe deleted!");
           res.redirect("/recipes");
       }
    });
});


module.exports = router;