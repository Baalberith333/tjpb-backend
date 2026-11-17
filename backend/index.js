const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");
const ejs = require("ejs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const client = new MongoClient(process.env.MONGODB_URI,{
    autoSelectFamily:false
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,"..","frontend")));

app.set("view engine", "ejs");
app.set("views", "./views");

async function connectToMongoDB(){
    try {
        await client.connect();
        console.log("Connect to mongodb successfully!");
        return client;
        
    } catch (error) {

        console.dir(error)
        
    }
}

const db = client.db("tjpb_data");

app.post("/api/cases", async (req,res) => {

    try {
        
        const newCase = req.body;
    
        await db.collection("cases").insertOne(newCase);

        res.status(201).json(
            {
                message : "Case created successfully!",
                case: newCase
            }
        );

    } catch (error) {

        console.error("Internal server error: ", error)

        res.status(500).json({message: "Error adding case!"})  
    }

})

app.put("/api/updateCase/:id", async (req, res) => {

    try {
        
        
        const id = req.params.id;
        const updateId = new ObjectId(id);
        
        const {number, type, date, subject, deadLine, status, responsible} = req.body;
        
        if (!number || !type || !date || !subject || !deadLine || !status || !responsible) {
            
        console.log("At least one field must be filled up! ")
        
    }

    const updatedCase = {
        number, 
        type,
        date, 
        subject, 
        deadLine, 
        status, 
        responsible
    }
    
    const updated = await db.collection("cases").updateOne(
        {_id: updateId},
        {$set: updatedCase}
);
    
    if (updated.matchedCount === 0) {
        
        return res.status(404).send({
            message: "Case not found!",
            updated: updated.matchedCount
        }) 
    }
    
    res.status(201).json({
        message: "Updated successfully!",
        updated: updated
    })

} catch (error) {
    console.log("Error: Server error!", error)
    res.status(500).json({
        message: "Server Error: Try later!"
    })
}

})

app.get("/", async (req,res) => {

    try {
        
        const response = await db.collection("cases").find().toArray();
    
        res.render("index", {caseList: response});

    } catch (error) {
        
        console.error("Error fetching caseList!",error)
        res.status(500).json({
            message: "Server error: Try later!"
        })
    }

})

app.get("/api/getCases", async (req,res) => {

    try {
        
        const cases = await db.collection("cases").find().toArray();
    
        res.status(200).json(
            {
                message: "Cases fetched successfully!",
                response: cases
    
            }
        )

        return cases;

    } catch (error) {
        
        console.log("Error fetching cases", error);
        res.status(500).json({message: "Internal server error!"})
    }


})

app.delete("/api/deleteCase/:id", async (req,res) => {

    try {
        
        const id = req.params.id;
        const caseId = new ObjectId(id);
        
        const deleteCase = await db.collection("cases").deleteOne({_id: caseId});
        
    if (deleteCase.deletedCount === 0) {
        console.log("Not Found!")
        return res.status(404).json({message: "Error: case not found!"})
    
    }
    
    res.status(200).json({
        
        message: "Case deleted successfully!",
        deleted: deleteCase.deletedCount
    })

} catch (error) {
    
    console.error("Error: Server Error!", error)
    res.status(500).json({message: "Server internal error!"})
}

})

connectToMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log("Running at port: " + PORT)
    })

})
