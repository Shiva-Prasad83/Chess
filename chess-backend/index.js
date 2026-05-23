const express = require('express');
const { authRouter } = require('./routes/auth.router.js');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors({
    origin: "*"
}))
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRouter);
app.listen(PORT, () => {
    console.log('Server is running on port 5000');
})

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to DB');
    })
    .catch((er) => {
        console.log('Error while connecting to DB');
    })

