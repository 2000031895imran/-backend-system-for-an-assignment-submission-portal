require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));