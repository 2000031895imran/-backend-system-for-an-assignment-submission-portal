Step 1: Environment Setup
1. Install Node.js and MongoDB
Ensure you have Node.js and MongoDB installed. You can download them from:

![image](https://github.com/user-attachments/assets/2ddd1287-79f9-435b-90d9-8cb97e4a21c8)

Node.js
MongoDB
2. Create a New Node.js Project
Run the following commands:

bash
Copy code
mkdir assignment-portal
cd assignment-portal
npm init -y
3. Install Required Dependencies
bash
Copy code
npm install express mongoose bcryptjs jsonwebtoken body-parser dotenv
npm install --save-dev nodemon
Step 2: Create Project Structure
Organize your project into a modular structure:
![image](https://github.com/user-attachments/assets/f6cf567d-ef26-4775-862a-13ff0344e7d9)

bash
Copy code
assignment-portal/
├── controllers/
│   ├── adminController.js
│   ├── userController.js
├── models/
│   ├── assignment.js
│   ├── user.js
├── routes/
│   ├── adminRoutes.js
│   ├── userRoutes.js
├── middlewares/
│   └── authMiddleware.js
├── .env
├── app.js
├── package.json
├── README.md
Step 3: Configure MongoDB Connection
In app.js
Set up the Express app and MongoDB connection:

javascript
Copy code
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
In .env
Add your MongoDB connection string:

bash
Copy code
MONGO_URI=mongodb://localhost:27017/assignmentPortal
JWT_SECRET=your_secret_key
Step 4: Define Models
1. User Model (models/user.js)
javascript
Copy code
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['User', 'Admin'], required: true }
});

module.exports = mongoose.model('User', userSchema);
2. Assignment Model (models/assignment.js)
javascript
Copy code
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    task: { type: String, required: true },
    admin: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
Step 5: Implement Controllers
1. User Controller (controllers/userController.js)
Handle user registration, login, and assignment upload:

javascript
Copy code
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
2. Admin Controller (controllers/adminController.js)
Handle admin assignment review:

javascript
Copy code
const Assignment = require('../models/assignment');

// Get Assignments
exports.getAssignments = async (req, res) => {
    const admin = req.user.id;
    try {
        const assignments = await Assignment.find({ admin });
        res.json(assignments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Accept Assignment
exports.acceptAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        assignment.status = 'Accepted';
        await assignment.save();
        res.json({ message: 'Assignment accepted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Reject Assignment
exports.rejectAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        assignment.status = 'Rejected';
        await assignment.save();
        res.json({ message: 'Assignment rejected' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
Step 6: Add Middleware
Authentication Middleware (middlewares/authMiddleware.js)
javascript
Copy code
const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
Step 7: Define Routes
User Routes (routes/userRoutes.js)
javascript
Copy code
const express = require('express');
const { registerUser, loginUser, uploadAssignment } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/upload', uploadAssignment);

module.exports = router;
Admin Routes (routes/adminRoutes.js)
javascript
Copy code
const express = require('express');
const { getAssignments, acceptAssignment, rejectAssignment } = require('../controllers/adminController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/assignments', getAssignments);
router.post('/assignments/:id/accept', acceptAssignment);
router.post('/assignments/:id/reject', rejectAssignment);

module.exports = router;
Step 8: Run and Test
Start the server:

bash
Copy code
npm run dev
