const { MongoClient } = require("mongodb");

const is_hosted = process.env.IS_HOSTED || false;
const hostedURI =
    "mongodb+srv://theMongoAdmin:accidentalLoginSteps@cluster0.o7qbwyx.mongodb.net/";
const localURI = "mongodb://127.0.0.1/";

const database = new MongoClient(is_hosted ? hostedURI : localURI);

(async () => {
    try {
        await database.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
})();

module.exports = database;