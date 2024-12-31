require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { router } = require('./routes/routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', router);

// Database Connection
mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    // console.log('Connected to MongoDB')
    app.listen(process.env.PORT, ()=>{/*console.log("ok")*/});
}).catch(err => console.error('Could not connect to MongoDB:', err));

