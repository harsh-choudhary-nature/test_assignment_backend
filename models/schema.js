const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tasks: [
        {
            id: { type: String, required: true }, // Unique identifier
            text: { type: String, required: true } // Task content
        }
    ],
});
const Task = mongoose.model('Task', taskSchema);

module.exports = {userSchema, taskSchema, User, Task};