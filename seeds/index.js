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
    for(let i = 0; i < 300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "65e8463c1437155ad186111f",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laboriosam consequuntur molestiae enim hic deleniti corporis ut praesentium, fuga sit veritatis cum fugiat ratione dolor. Id, reprehenderit nobis! Laborum, minus cum!",
            price,
            geometry: { 
              type: "Point",
              coordinates: [
                cities[random1000].longitude, 
                cities[random1000].latitude
              ]
            },
            images: [
                {
                  url: 'https://res-console.cloudinary.com/dep2mr3ja/media_explorer_thumbnails/845173663d65e8f5e4009c2b9128995e/detailed',
                  filename: 'YelpCamp/rggh6xllvee2toqsd1g6',
                },
                {
                  url: 'https://res-console.cloudinary.com/dep2mr3ja/media_explorer_thumbnails/feab7b6b6b15d0b0ae30916a71e51e93/detailed',
                  filename: 'YelpCamp/anppf9i8tckkckejktz1',
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