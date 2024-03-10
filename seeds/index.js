const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

// pick a random number multiplied by the length of the array, floor it and then access it of the array. We pass in the array and return a random element from the array.
const sample = array => array[Math.floor(Math.random() * array.length)];  

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "65e8463c1437155ad186111f",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laboriosam consequuntur molestiae enim hic deleniti corporis ut praesentium, fuga sit veritatis cum fugiat ratione dolor. Id, reprehenderit nobis! Laborum, minus cum!",
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dep2mr3ja/image/upload/v1709977291/YelpCamp/ur5oi0udb2jmpohprg0h.jpg',
                  filename: 'YelpCamp/ur5oi0udb2jmpohprg0h',
                },
                {
                  url: 'https://res.cloudinary.com/dep2mr3ja/image/upload/v1709977294/YelpCamp/g2sx2sm56bhaenglzrlv.jpg',
                  filename: 'YelpCamp/g2sx2sm56bhaenglzrlv',
                }
              ]
        })
        await camp.save();
    }
}

// seedDB() returns a promise because it is an async function
seedDB().then(() => {
    mongoose.connection.close();
});