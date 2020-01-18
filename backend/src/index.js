const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const routes = require('./routes');

const app = express();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);

app.use(express.json());
app.use(routes);

app.listen(process.env.PORT);