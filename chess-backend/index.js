const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
require('dotenv').config();
const app=express();
const PORT=process.env.PORT;
const MONGODB_URI=process.env.MONGODB_URI;
app.use(express.json());
app.use(cors({
    origin:"*"
}))

app.listen(PORT,()=>{
    console.log('Server is running on port 5000');
})

mongoose
.connect(MONGODB_URI)
.then(()=>{
    console.log('Connected to DB');
})
.catch((er)=>{
    console.log('Error while connecting to DB');
})
    
