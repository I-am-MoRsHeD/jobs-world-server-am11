const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dospc0a.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// middlewares
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    // console.log('token in the middleware', token);
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    jwt.verify(token, process.env.TOKEN, (err, decoced) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized access' });
        }
        req.user = decoced;
        next();
    })
}



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)


        const jobsCollection = client.db('jobsWorld').collection('AllJobs');
        const appliedJobCollection = client.db('jobsWorld').collection('AppliedJobs');


        // auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '1h' });

            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                })
                .send({ success: true });
        })

        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('logging out user', user);
            res
                .clearCookie('token', {
                    maxAge: 0
                })
                .send({ success: true });
        })



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
        app.get('/appliedJobs', verifyToken, async (req, res) => {
            const tokenOwner = req?.query?.email;
            const currentUser = req?.user?.email;
            if (currentUser !== tokenOwner) {
                return res.status(403).send({ message: 'forbidden access' });
            }
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
            const filter = { _id: new ObjectId(id) };
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
        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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





