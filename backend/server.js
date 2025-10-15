const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { connectToDatabase } = require('./dbconfig.js');

const app = express();

require('dotenv').config();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

const JWTSECRET = process.env.JWT_SECRET;


app.listen(3000, () => {
    console.log(`Server läuft unter Port 3000`);
})