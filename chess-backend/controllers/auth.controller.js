const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Game } = require('../models/game.model');
require('dotenv').config();
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Fill all details' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const user = new User({ name, email, passwordHash });
        const savedUser = await user.save();
        if (!savedUser) {
            return res.status(500).json({ message: "Error while saving the user" });
        }
        return res.status(201).json({ message: "Signup Successful" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Fill all details' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        //For Every User Who Logs in, one accessToken and one refreshToken is created
        // and stored in the cookies

        const accessToken = jwt.sign({ sub: user._id, role: user.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" })

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000
        })

        const refreshToken = jwt.sign({ sub: user._id, role: user.role, type: "refresh" },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/auth/refresh',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({ message: 'OK' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const logout = (req, res) => {

    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000
        })
        res.clearCookie('refreshToken', {
            httpOnly: true,
            path: '/auth/refresh',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        //console.log(req.cookies, "Request.cookies");
        return res.status(200).json({ message: 'OK' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const fetchMe = (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({ user });
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(400).json({ message: "refreshToken Not Found" });
        }
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (payload.type != 'refresh') {
            return res.status(400).json({ message: "refreshToken type is not refresh" });
        }
        const id = payload.sub;
        const user = await User.findById(id);
        if (!user) {
            res.clearCookie(refreshToken, {
                httpOnly: true,
                path: '/auth/refresh',
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            return res.status(400).json({ message: "Invalid refreshToken . User not found!!" });
        }
        const accessToken = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000
        })
        return res.status(201).json({ message: "OK" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = { signup, login, logout, fetchMe, refresh };