var mongoose = require("mongoose"),
    Campground= require("./models/campground"),
    Comment = require("./models/comment");
    
var data = [
    {
        name: "Cloud", 
        image: "https://images.pexels.com/photos/14287/pexels-photo-14287.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        description: "cuocuocuocuocuo"
    },
    {
        name: "Apple", 
        image: "https://images.pexels.com/photos/6714/light-forest-trees-morning.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
        description: "cuocuocuocuocuo"
    },
     {
        name: "Orange", 
        image: "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        description: "cuocuocuocuocuo"
    },
];
    

function seedDB() {
    //Remove all campgrounds
    Campground.remove({}, function(err) {
         if (err) {
             console.log(err);
        } else {
            console.log("removed!!");
            //add a few campground
            data.forEach(function(seed) {
                Campground.create(seed, function(err, campground){
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("added one campgrounds!!");
                        //add create a comment
                        Comment.create(
                            {
                                text: "This is a greatttttttt place, I love it so much!",
                                author: "baichi"
                            }, function(err, comment) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    campground.comments.push(comment);
                                    campground.save();
                                    console.log("Comment created!!");
                                }
                            });
                    }
                });
            })
        }
    });
}

module.exports = seedDB;