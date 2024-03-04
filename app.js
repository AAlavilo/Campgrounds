const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const mongoose = require("mongoose");
const methodOverride = require("method-override");


const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

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
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
    secret: "thisshouldbeapropersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Setting the expiration date to one week
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
    res.render("home");
});

app.all("*", (req, res, next) => {                      // "app.all" means that it will perform with every request. The "*" means every single path. But it will still only run 
    next(new ExpressError("Page Not Found", 404))       // if nothing else has matched first and there wasn't a response from any of them.
})                                                      // By using next() we can pass the error to the next middleware.

app.use((err, req, res, next) => {
    // Destructure from the error. In ExpressError-class we have the the message and statusCode as parameters in the constructor
    // We also put in some default values for the statusCode and the message
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Something Went Wrong";
    res.status(statusCode).render("error", { err });
    //res.send("Oh boy, Something went wrong")
})

app.listen(3000, () => {
    console.log.apply("Serving on port 3000!");
});