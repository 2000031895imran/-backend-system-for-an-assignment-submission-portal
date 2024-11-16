const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Assignment = require('../models/assignment');

// Register User
exports.registerUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role: 'User' });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Upload Assignment
exports.uploadAssignment = async (req, res) => {
    const { userId, task, admin } = req.body;
    try {
        const assignment = new Assignment({ userId, task, admin });
        await assignment.save();
        res.status(201).json({ message: 'Assignment uploaded successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};