const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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
			console.log(selectedClass);
			// const query = {
			// 	name: selectedClass.name,
			// 	email: selectedClass.user.email,
			// [TO DO]
			// };
			// const existingClass = await selectCollection.findOne(query);
			// if (existingClass) {
			// 	return res.send({ message: "This Class Already added to your list" });
			// }
			const result = await selectCollection.insertOne(selectedClass);
			res.send(result);
		});

		// search user by email
		app.get("/dashboard/:email", async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const result = await usersCollection.findOne(query);
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

		// make api for instructor class base on email
		app.get(`/dashboard/myClasses/:email`, async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const result = await classesCollection.find(query).toArray();
			res.send(result);
		});

		//handle update

		app.put("/dashboard/myClasses/:id", async (req, res) => {
			const id = req.params.id;
			const updateData = req.body;
			const filter = { _id: new ObjectId(id) };
			const options = { upsert: true };
			const updatedClass = {
				$set: {
					classname: updateData.classname,
					available_seats: updateData.available_seats,
					students: updateData.students,
					dur: updateData.dur,
					price: updateData.price,
				},
			};
			// update status
			// app.put("/dashboard/myClasses/:id", async (req, res) => {
			// 	const id = req.params.id;
			// 	const updatedStatus = req.body;
			// 	console.log(id, updatedStatus);
			// });

			const result = await classesCollection.updateOne(
				filter,
				updatedClass,
				options
			);
			res.send(result);

			console.log(updateData);
		});
		// add class to server api
		app.post("/addAClass", async (req, res) => {
			const classData = req.body;
			const result = await classesCollection.insertOne(classData);
			res.send(result);
		});
		// class selected api
		app.get("/dashboard/myClasses/editClass/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await classesCollection.findOne(query);
			res.send(result);
		});

		// classes management for admin api
		app.get("/manageClasses", async (req, res) => {
			const result = await classesCollection.find().toArray();
			res.send(result);
		});

		// to do
		app.put("/dashboard/myClasses", async (req, res) => {
			const id = req.params.id;
			const data = req.body;
			console.log(data);
		});
		// classes related api
		app.get("/instructors", async (req, res) => {
			const query = {};
			const filter = {
				role: "ins",
			};
			const result = await usersCollection.find(filter).toArray();
			res.send(result);
		});

		app.get("/classes", async (req, res) => {
			const query = {};
			const options = {
				sort: { students: -1 },
			};
			const result = await classesCollection
				.find(query, options)
				.limit(6)
				.toArray();
			res.send(result);
		});
		// selected classes api
		app.get("/mySelectedClass/:email", async (req, res) => {
			const email = req.params.email;
			const query = { userEmail: email };
			const result = await selectCollection.find(query).toArray();
			res.send(result);
		});

		// all classes api
		app.get("/classes", async (req, res) => {
			const result = await classesCollection.find().toArray();
			res.send(result);
		});

		// top instructor classes
		app.get("/topInstructorClass", async (req, res) => {
			const query = {};
			const options = {
				sort: { students: -1 },
			};
			const result = await classesCollection
				.find(query, options)
				.limit(6)
				.toArray();
			res.send(result);
		});
		// delete items api
		app.delete("/myselectedclass/:id", async (req, res) => {
			const id = req.params.id;
			console.log(id);
			const query = { _id: new ObjectId(id) };
			const result = await selectCollection.deleteOne(query);
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
