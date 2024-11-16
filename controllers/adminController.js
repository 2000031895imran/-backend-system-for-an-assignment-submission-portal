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