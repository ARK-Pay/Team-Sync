const express = require("express");
require("dotenv").config();
const authenticate = require("../middlewares/authenticate"); // Ensure authentication
const {
    validateTaskCreation,
    createTask,
    viewTasksByProject,
    validateAddAssignee,
    addAssignee,
    validateEditDetails,
    editTaskDetails,
    deleteTask,
    getTasksCreatedByUser,
    getTasksAssignedToUser,
    getAssignedUsers
} = require('../middlewares/TaskMiddlewares');
const { Task } = require('../db/index'); // Import Task model from db

const router = express.Router();

// ✅ Create Task (with authentication)
router.post('/project/:project_id/create-task', authenticate, validateTaskCreation, createTask);

// ✅ View tasks by project
router.get('/project/:project_id/view-tasks', authenticate, viewTasksByProject);

// ✅ Get all tasks for a project (used by AssignedTasks component)
router.get('/project/:project_id/tasks', authenticate, viewTasksByProject);

// ✅ Assign a task
router.post('/:task_id/add-assignee', authenticate, validateAddAssignee, addAssignee);

// ✅ Alternative endpoint for adding assignees (doesn't rely on URL parameters)
router.post('/assign', authenticate, async (req, res) => {
    try {
        const { task_id, assignee_ids } = req.body;
        
        if (!task_id) {
            return res.status(400).json({ message: 'Task ID is required' });
        }
        
        if (!Array.isArray(assignee_ids) || assignee_ids.length === 0) {
            return res.status(400).json({ message: 'Assignee IDs are required and should be an array' });
        }
        
        console.log('Looking for task with ID:', task_id);
        
        // Try different methods to find the task
        let task = null;
        
        // Method 1: Try with the ID directly
        task = await Task.findOne({ id: task_id });
        
        // Method 2: Try with _id
        if (!task) {
            try {
                task = await Task.findById(task_id);
            } catch (err) {
                console.log('Error finding by _id:', err.message);
            }
        }
        
        // Method 3: Try with a custom query
        if (!task) {
            task = await Task.findOne({ 
                $or: [
                    { id: task_id },
                    { _id: task_id },
                    { id: task_id.toString() }
                ]
            });
        }
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Check if assignees exists and initialize if needed
        if (!task.assignees || !Array.isArray(task.assignees)) {
            task.assignees = [];
        }
        
        // Add only unique IDs that are not already in task.assignees
        const newAssignees = assignee_ids.filter(id => !task.assignees.includes(id));
        task.assignees.push(...newAssignees);
        
        task.updated_at = new Date(); // Update the `updated_at` field
        await task.save();
        
        return res.status(200).json({
            message: 'Assignee added successfully',
            task
        });
    } catch (error) {
        console.error('Error in custom assign endpoint:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// ✅ Edit task details
router.put('/:task_id/edit-details', authenticate, validateEditDetails, editTaskDetails);

// ✅ Delete a task
router.delete('/project/:project_id/delete-task', authenticate, deleteTask);

// ✅ Delete a task by task ID
router.delete('/:task_id', authenticate, async (req, res) => {
    try {
        const { task_id } = req.params;
        
        // Find and delete the task
        const task = await Task.findOne({ id: task_id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Save the project_id before deleting for statistics update
        const project_id = task.project_id;
        
        // Delete the task
        await Task.deleteOne({ id: task_id });
        
        // Update project statistics
        // This would ideally be a function to update task counts
        
        return res.status(200).json({
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// ✅ Get tasks created by user
router.get('/user/:userEmail/created-tasks', authenticate, getTasksCreatedByUser);

// ✅ Get tasks assigned to a user
router.get('/user/:user_id/assigned-tasks', authenticate, getTasksAssignedToUser);

// ✅ Get all users assigned to a task
router.get('/:task_id/assigned-users', authenticate, getAssignedUsers);

// Debug route - direct task creation test
router.get('/test-create-task/:project_id', async (req, res) => {
    try {
        const { project_id } = req.params;
        console.log('TEST: Creating test task for project', project_id);
        
        const testTask = new Task({
            project_id,
            title: 'Test Task ' + Date.now(),
            description: 'This is a test task created directly',
            deadline: new Date(Date.now() + 7*24*60*60*1000), // 1 week from now
            status: '0',
            priority: '1',
            creator_id: 'test@example.com',
            assignees: [],
            project_name: 'Test Project'
        });
        
        const savedTask = await testTask.save();
        console.log('TEST: Task saved successfully with ID:', savedTask.id);
        
        // Now try to fetch it
        const tasks = await Task.find({ project_id });
        console.log(`TEST: Found ${tasks.length} tasks for project ${project_id}`);
        
        return res.status(200).json({
            message: 'Test task created and fetched successfully',
            createdTask: savedTask,
            allTasks: tasks
        });
    } catch (error) {
        console.error('TEST ERROR:', error);
        return res.status(500).json({
            message: 'Test error: ' + error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
