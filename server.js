const dotenv = require("dotenv");
const express = require("express");



dotenv.config();



const PORT = process.env.PORT || 4000;
const app = express();
const API_Routes = require('./routes');


app.use("/api",API_Routes);










app.listen(PORT, () => {
    console.log(`the server is up on ${PORT}`);
})