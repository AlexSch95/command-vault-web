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

function authTokenMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "NO_TOKEN_PROVIDED" });  
    }
    try {
        const decoded = jwt.verify(token, JWTSECRET);
        req.userName = decoded.userName;
        req.userId = decoded.userId;
        next();

    } catch (error) {
        console.error('Token Überprüfungsfehler:', error);
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            res.clearCookie('token');
            return res.status(403).json({ success: false, message: "INVALID_TOKEN" });
        }
    }
}

app.get("/api/auth/verify", authTokenMiddleware, async (req, res) => {
    try {
        res.status(200).json({ success: true, message: "TOKEN_VALID"});
    } catch (error) {
        console.error('Fehler in Route /api/auth/verify:', error);
        res.status(400).json({ success: false, message: "INTERNAL_SERVER_ERROR" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        if (username === undefined || password === undefined) {
            return res.status(400).json({
                success: false,
                message: "UNDEFINED_REQUEST"
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
        const token = jwt.sign({ 
            userId: existingUser[0].user_id, 
            userName: existingUser[0].username 
        }, JWTSECRET, { expiresIn: tokenExpiry });

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

app.post("/api/auth/logout", authTokenMiddleware, async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ success: true, message: "LOGOUT_SUCCESS" });
    } catch (error) {
        console.error('Fehler in Route /api/auth/logout:', error);
        res.status(500).json({ success: false, message: "INTERNAL_SERVER_ERROR" });
    }
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (username === undefined || password === undefined || email === undefined) {
            return res.status(400).json({
                success: false,
                message: "UNDEFINED_REQUEST"
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

app.get("/api/categories/all", authTokenMiddleware, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [categories] = await db.execute('SELECT * FROM categories WHERE user_id = ? ORDER BY category_name ASC', [req.userId]);
        res.status(200).json({success: true, message: "CATEGORIES_LOADED", data: categories});
    } catch (error) {
        console.error('Fehler beim Abrufen der Kategorien:', error);
        res.status(500).json({ success: false, message: "INTERNAL_SERVER_ERROR" });
    }
});

app.post("/api/categories/new", authTokenMiddleware, async (req, res) => {
    const { category_name, category_color } = req.body;
    try {
        const db = await connectToDatabase();
        await db.execute('INSERT INTO categories (category_name, category_color, user_id) VALUES (?, ?, ?)', [category_name, category_color, req.userId]);
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

app.delete("/api/categories/delete/:categoryId", authTokenMiddleware, async (req, res) => {
    const { categoryId } = req.params;
    try {
        const db = await connectToDatabase();
        await db.execute('DELETE FROM categories WHERE category_id = ? AND user_id = ?', [categoryId, req.userId]);
        res.status(200).json({
            success: true,
            message: "CATEGORY_DELETED"
        });
    } catch (error) {
        console.error('Fehler beim Löschen der Kategorie:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.post("/api/commands/add", authTokenMiddleware, async (req, res) => {
    const { category_id, cmd_title, cmd, cmd_description, cmd_source } = req.body;
    try {
        const db = await connectToDatabase();
        await db.execute('INSERT INTO commands (category_id, cmd_title, cmd, cmd_description, cmd_source, user_id) VALUES (?, ?, ?, ?, ?, ?)', [category_id, cmd_title, cmd, cmd_description, cmd_source, req.userId]);
        await db.end();
        res.status(201).json({
            success: true,
            message: "COMMAND_ADDED"
        });
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Befehls:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.get("/api/commands/all", authTokenMiddleware, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [commands] = await db.execute(`
                            SELECT 
                                c.cmd_id,
                                c.cmd_title,
                                c.cmd,
                                c.cmd_description,
                                c.cmd_source,
                                c.created_at,
                                cat.category_name,
                                cat.category_color,
                                cat.category_id,
                                c.modified,
                                c.last_modified,
                                c.trash_bin,
                                GREATEST(c.last_modified, c.created_at) as latest_date
                            FROM commands c
                            JOIN categories cat ON c.category_id = cat.category_id
                            WHERE c.user_id = ? AND c.trash_bin = 0
                            ORDER BY latest_date DESC`, 
                            [req.userId]);
        await db.end();
        res.status(200).json({
            success: true,
            message: "COMMANDS_LOADED",
            data: commands
        });
    } catch (error) {
        console.error('Fehler beim Laden der Befehle:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.post("/api/commands/update/:cmdId", authTokenMiddleware, async (req, res) => {
    const { cmdId } = req.params;
    const { category_id, cmd_title, cmd, cmd_description, cmd_source } = req.body;
    try {
        const db = await connectToDatabase();
        await db.execute('UPDATE commands SET category_id = ?, cmd_title = ?, cmd = ?, cmd_description = ?, cmd_source = ?, modified = 1, last_modified = NOW() WHERE cmd_id = ? AND user_id = ?', [category_id, cmd_title, cmd, cmd_description, cmd_source, cmdId, req.userId]);
        await db.end();
        res.status(200).json({
            success: true,
            message: "COMMAND_UPDATED"
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Befehls:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.post("/api/commands/move-to-trash/:cmdId", authTokenMiddleware, async (req, res) => {
    const { cmdId } = req.params;
    try {
        const db = await connectToDatabase();
        await db.execute('UPDATE commands SET trash_bin = 1 WHERE cmd_id = ? AND user_id = ?', [cmdId, req.userId]);
        await db.end();
        res.status(200).json({
            success: true,
            message: "COMMAND_MOVED_TO_TRASH"
        });
    } catch (error) {
        console.error('Fehler beim Verschieben des Befehls in den Papierkorb:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.delete("/api/commands/delete/:cmdId", authTokenMiddleware, async (req, res) => {
    const { cmdId } = req.params;
    try {
        const db = await connectToDatabase();
        await db.execute('DELETE FROM commands WHERE cmd_id = ? AND user_id = ? AND trash_bin = 1', [cmdId, req.userId]);
        await db.end();
        res.status(200).json({
            success: true,
            message: "COMMAND_DELETED"
        });
    } catch (error) {
        console.error('Fehler beim Löschen des Befehls:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.get("/api/commands/trash", authTokenMiddleware, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [commands] = await db.execute(`
                        SELECT 
                            c.cmd_id,
                            c.user_id,
                            c.category_id,
                            cat.category_name,
                            cat.category_color,
                            c.cmd,
                            c.last_modified as deleted_at
                        FROM commands c
                        JOIN categories cat ON c.category_id = cat.category_id
                        WHERE c.user_id = ? AND c.trash_bin = 1
                        ORDER BY c.last_modified DESC
                    `, [req.userId]);
        await db.end();
        res.status(200).json({
            success: true,
            message: "TRASH_LOADED",
            data: commands
        });
    } catch (error) {
        console.error('Fehler beim Laden der gelöschten Befehle:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.post("/api/commands/trash/restore/:cmdId", authTokenMiddleware, async (req, res) => {
    const { cmdId } = req.params;
    try {
        const db = await connectToDatabase();
        await db.execute('UPDATE commands SET trash_bin = 0 WHERE cmd_id = ? AND user_id = ?', [cmdId, req.userId]);
        await db.end();
        res.status(200).json({
            success: true,
            message: "COMMAND_RESTORED"
        });
    } catch (error) {
        console.error('Fehler beim Wiederherstellen des Befehls:', error);
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR"
        });
    }
});

app.listen(3000, () => {
    console.log(`Server läuft unter Port 3000`);
})
