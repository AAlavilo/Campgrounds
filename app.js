const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./schemas")
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); //pass in the query string you want to use, in this case "_method"

const validateCampground = (req, res, next) => {
    
    const { error } = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg.error.details, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });  //pass through "campgrounds" so that we can render them
});

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    
    const campground = new Campground(req.body.campground);
    await campground.save(); //saves the new campground to the database
    res.redirect(`/campgrounds/${campground._id}`);  // redirects you to the newly created campground by using a string template literal
}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews");
    res.render("campgrounds/show", { campground });
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // here I use the spread-operator (...) to create a shallow copy of req.body.campground)
    // the copy has the same properties as the original but any changes I do to the copied object will have no impact on the original one.
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
});

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all("*", (req, res, next) => {                      // "app.all" means that it will perform with every request. The "*" means every single path. But it will still only run 
    next(new ExpressError("Page Not Found", 404))       // if nothing else has matched first and there wasn't a response from any of them.
})                                                      // By using next() we can pass the error to the next middleware.

app.use((err, req, res, next) => {
    // Destructure from the error. In ExpressError-class we have the the message and statusCode as parameters in the constructor
    // We also put in some default values for the statusCode and the message
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Something Went Wrong";
    res.status(statusCode).render("error", { err });
    res.send("Oh boy, Something went wrong")
})

app.listen(3000, () => {
    console.log.apply("Serving on port 3000!");
});