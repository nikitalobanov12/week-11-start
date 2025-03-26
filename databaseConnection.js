const MongoClient = require("mongodb").MongoClient;
const is_hosted = process.env.IS_HOSTED || false;
const hostedURI =
"mongodb+srv://theMongoAdmin:accidentalLoginSteps@cluster0.4ulcc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const localURI = "mongodb://127.0.0.1/?authSource=admin&retryWrites=true&w=majority"
if (is_hosted) {
var database = new MongoClient(hostedURI,
 {useNewUrlParser: true, useUnifiedTopology: true});
}
else {
var database = new MongoClient(localURI,
 {useNewUrlParser: true, useUnifiedTopology: true});
}
module.exports = database;