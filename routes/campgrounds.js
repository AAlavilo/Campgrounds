const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");


router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });  //pass through "campgrounds" so that we can render them
}));

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save(); //saves the new campground to the database
    req.flash("success", "Successfully made a new campground!");  //Here we use the key of "success" and after that display our message!
    res.redirect(`/campgrounds/${campground._id}`);  // redirects you to the newly created campground by using a string template literal
}));

router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    console.log(campground);
    if(!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground });
}));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground });
}));

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // here I use the spread-operator (...) to create a shallow copy of req.body.campground)
    // the copy has the same properties as the original but any changes I do to the copied object will have no impact on the original one.
    req.flash("success", "Successfully updated campground!")
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the campground!");
    res.redirect(`/campgrounds`);
}));

module.exports = router;