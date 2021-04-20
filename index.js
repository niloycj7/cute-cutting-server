const express = require("express")
const app = express()
const cors = require("cors")
const ObjectId = require("mongodb").ObjectId
const port = process.env.PORT || 4000
const fs = require("fs-extra")
const fileupload = require("express-fileupload")
require("dotenv").config()
app.use(cors())
app.use(express.json())
app.use(fileupload())
app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

const MongoClient = require("mongodb").MongoClient
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qc8ha.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
client.connect((err) => {
    const Reviews = client.db("cute-cutting").collection("reviews")
    const Services = client.db("cute-cutting").collection("services")
    const Orders = client.db("cute-cutting").collection("orders")
    const Users = client.db("cute-cutting").collection("users")

    app.get("/services", (req, res) => {
        Services.find().toArray((err, docs) => res.send(docs))
    })
    app.post("/add-a-service", (req, res) => {
        const newServiceData = req.body
        Services.insertOne(newServiceData).then((result) =>
            res.json(result.insertedCount > 0)
        )
    })
    app.get("/reviews", (req, res) => {
        Reviews.find().toArray((err, docs) => res.send(docs))
    })
    app.get("/deleteService/:id", (req, res) => {
        console.log(req.params.id)
        Services.deleteOne({ _id: ObjectId(req.params.id) }).then((result) =>
            res.send(result.deletedCount > 0)
        )
    })
    app.post("/addReview", (req, res) => {
        const review = req.body
        Reviews.insertOne(review).then((result) =>
            res.json(result.insertedCount > 0)
        )
    })
    app.get("/orders", (req, res) => {
        Orders.find().toArray((err, docs) => res.send(docs))
    })
    app.post("/changeStatus", (req, res) => {
        const info = req.body
        Orders.updateOne(
            { email: info.email },
            { $set: { status: info.status } }
        ).then((result) => res.send(result.modifiedCount > 0))
    })
    app.get("/addUser", (req, res) => {
        const email = req.query.email
        const admin = req.query.admin
        let user = { email }
        Users.find({ email: email }).toArray((err, docs) => {
            if (docs.length === 0) {
                if (admin) {
                    user.role = "admin"
                    Users.insertOne(user).then((result) => res.send(result))
                } else {
                    user.role = "user"
                    Users.insertOne(user).then((result) => res.send(result))
                }
            } else {
                res.send(docs[0])
            }
        })
    })
    app.post("/addOrder", (req, res) => {
        const order = req.body
        Orders.insertOne(order).then((result) =>
            res.json(result.insertedCount > 0)
        )
    })
})
