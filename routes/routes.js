const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Task } = require('../models/schema');
const router = express.Router();

// Registration Endpoint
router.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            // If the username exists, send an error response
            return res.status(400).send({ message: 'Username is already taken' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).send({ message: 'Error registering user', error: err.message });
    }
});

// Login Endpoint
router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.send({ message: 'Login successful', token });
});

// Middleware for Authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send({ message: 'Access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).send({ message: 'Invalid token' });
    }
};

// Task CRUD Endpoints
router.get('/api/tasks', authenticate, async (req, res) => {
    const task = await Task.findOne({ userId: req.userId });
    res.send(task || { tasks: [] });
});

router.post('/api/tasks', authenticate, async (req, res) => {
    const { task } = req.body;
    const taskWithId = { id: new mongoose.Types.ObjectId().toString(), text: task };
    let taskList = await Task.findOne({ userId: req.userId });

    if (!taskList) {
        taskList = new Task({ userId: req.userId, tasks: [taskWithId] });
    } else {
        taskList.tasks.push(taskWithId);
    }

    await taskList.save();
    res.send(taskList);
});

router.delete('/api/tasks', authenticate, async (req, res) => {
    const { id } = req.body;
    const taskList = await Task.findOne({ userId: req.userId });

    if (!taskList) return res.status(404).send({ message: 'Task list not found' });

    taskList.tasks = taskList.tasks.filter(task => task.id !== id);
    await taskList.save();
    res.send(taskList);
});

module.exports = { router };