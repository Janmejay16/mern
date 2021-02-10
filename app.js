const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const app = express()

mongoose.connect("mongodb+srv://mongodb:mongodb@socialblog.ki6pv.mongodb.net/blog?retryWrites=true&w=majority", {
  useNewUrlParser: "true",
})
mongoose.connection.on("error", err => {
  console.log("err", err)
})
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected")
})

app.use(bodyParser());
// Routes 
const routes = require('./routes/Routes');
app.use('/', routes);

const PORT = 3000
app.listen(PORT, () => {
  console.log(`app is listening to PORT ${PORT}`)
})