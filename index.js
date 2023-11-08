const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dospc0a.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)


        const jobsCollection = client.db('jobsWorld').collection('AllJobs');
        const appliedJobCollection = client.db('jobsWorld').collection('AppliedJobs');


        // all jobs api
        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/jobs', async (req, res) => {
            const jobs = req.body;
            console.log(jobs)
            const result = await jobsCollection.insertOne(jobs);
            res.send(result);
        })




        // applied jobs apis
        app.get('/appliedJobs', async(req,res)=>{
            const result = await appliedJobCollection.find().toArray();
            res.send(result)
        })


        app.post('/appliedJobs', async (req, res) => {
            const appliedJobs = req.body;
            console.log(appliedJobs)
            const result = await appliedJobCollection.insertOne(appliedJobs);
            res.send(result);
        })



        // update jobs api
        app.patch('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = {_id: new ObjectId(id)};
            const updatedInfo = req.body;
            const info = {
                $set: {
                    name: updatedInfo.name,
                    email: updatedInfo.email,
                    photo: updatedInfo.photo,
                    description: updatedInfo.description,
                    deadline: updatedInfo.deadline,
                    category: updatedInfo.category,
                    title: updatedInfo.title,
                    salary_range: updatedInfo.salary_range,
                    date: updatedInfo.date,
                    applicants: updatedInfo.applicants
                }
            }
            const result = await jobsCollection.updateOne(filter, info);
            res.send(result)

        })



        // delete a job
        app.delete('/jobs/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await jobsCollection.deleteOne(query);
            res.send(result)
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`Jobs world server is running on port :${port}`)
})





