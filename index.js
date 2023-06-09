const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7is7xhq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const classesCollection = client.db("musicSchoolDb").collection("classes");
		const usersCollection = client.db("musicSchoolDb").collection("users");
		const selectCollection = client
			.db("musicSchoolDb")
			.collection("selectedClass");

		// save class in database
		app.post("/selectclass", async (req, res) => {
			const selectedClass = req.body;
			const query = {
				name: selectedClass.name,
				email: selectedClass.user.email,
			};
			const existingClass = await selectCollection.findOne(query);
			if (existingClass) {
				return res.send({ message: "This Class Already added to your list" });
			}
			const result = await selectCollection.insertOne(selectedClass);
			res.send(result);
		});

		// save user email and role to db
		app.post("/users", async (req, res) => {
			const user = req.body;
			const query = { email: user.email };
			const existingUser = await usersCollection.findOne(query);
			if (existingUser) {
				return res.send({ message: "User already Exists" });
			}
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		// classes related api

		app.get("/classes", async (req, res) => {
			const query = {};
			const options = {
				sort: { students: -1 },
			};
			const result = await classesCollection.find(query, options).toArray();
			res.send(result);
		});
		// selected classes api
		app.get("/mySelectedClass", async (req, res) => {
			const result = await selectCollection.find().toArray();
			res.send(result);
		});

		// top instructor classes
		app.get("/topInstructorClass", async (req, res) => {
			const query = {};
			const options = {
				sort: { students: -1 },
			};
			const result = await classesCollection.find(query, options).toArray();
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Music Book server is running");
});

app.listen(port, () => {
	console.log(`music school is running on port ${port}`);
});
