const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {MongoClient} = require("mongodb");
const ejs = require("ejs");

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const client = new MongoClient(process.env.MONGODB_URI,{
    autoSelectFamily:false
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.set("view engine", "ejs");

async function connectToMongoDB(){
    try {
        await client.connect();
        console.log("Connect to mongodb successfully!");
        return client;
        
    } catch (error) {

        console.dir(error)
        
    }
}

connectToMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log("Running at port: " + PORT)
    })

})
