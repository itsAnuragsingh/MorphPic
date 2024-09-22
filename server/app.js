const express = require('express');
const cors = require('cors');
const conversionRoutes = require('./routes/conversion');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use('/api/conversion', conversionRoutes);
app.get("/", (req,res)=>{
    res.send("Welcome to the file Conversion API");
})


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));