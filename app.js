require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const router = require("./routes");

const port = process.env.SERVER_PORT || 3000;

app.use(bodyParser.json());
app.use("/", router);

app.listen(port);
