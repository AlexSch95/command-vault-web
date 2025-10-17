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

app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        if (username === undefined || password === undefined) {
            return res.status(400).json({
                success: false,
                message: "USERNAME_OR_PASSWORD_UNDEFINED"
            });
        }

        const db = await connectToDatabase();
        const [existingUser] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        await db.end();

        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: "USER_NOT_FOUND"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser[0].password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "INVALID_PASSWORD"
            });
        }

        const tokenExpiry = rememberMe ? '14d' : '1h';
        const cookieMaxAge = rememberMe ? 14 * 24 * 60 * 60 * 1000 : 3600000;
        const token = jwt.sign({ userId: existingUser[0].user_id }, JWTSECRET, { expiresIn: tokenExpiry });
        res
            .status(200)
            .cookie('token', token, { httpOnly: true, maxAge: cookieMaxAge })
            .json({
                success: true,
                message: "LOGIN_SUCCESS"
            });
    } catch (error) {
        console.error('Fehler in Route /api/auth/login:', error);
        res.status(500).json({
                success: false,
                message: "INTERNAL_SERVER_ERROR"
            });
    }
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (username === undefined || password === undefined || email === undefined) {
            return res.status(400).json({
                success: false,
                message: "USERNAME_OR_PASSWORD_OR_EMAIL_UNDEFINED"
            });
        }
        const db = await connectToDatabase();
        const [existingUser] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            await db.end();
            return res.status(409).json({
                success: false,
                message: "USERNAME_ALREADY_EXISTS"
            });
        }
        const [existingEmail] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            await db.end();
            return res.status(409).json({
                success: false,
                message: "EMAIL_ALREADY_EXISTS"
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await db.execute('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)', [username, passwordHash, email]);
        await db.end();
        res.status(201).json({
            success: true,
            message: "USER_CREATED",
            username: username
        });
    } catch (error) {
        console.error('Fehler in Route /api/auth/register:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.get("/api/categories/all", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [categories] = await db.execute('SELECT * FROM categories ORDER BY category_name ASC');
        res.status(200).json(categories);
    } catch (error) {
        console.error('Fehler beim Abrufen der Kategorien:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Kategorien' });
    }
});

app.post("/api/categories/new", async (req, res) => {
    const { category_name, category_color } = req.body;
    try {
        const db = await connectToDatabase();
        await db.execute('INSERT INTO categories (category_name, category_color, user_id) VALUES (?, ?, 1)', [category_name, category_color]);
        res
            .status(201)
            .json({
                success: true,
                message: "CATEGORY_ADDED"
            });
    } catch (error) {
        console.error('Fehler beim Hinzufügen der Kategorie:', error);
        res
            .status(500)
            .json({
                success: false,
                message: "INTERNAL_SERVER_ERROR"
            });
    }
});

app.listen(3000, () => {
    console.log(`Server läuft unter Port 3000`);
})
