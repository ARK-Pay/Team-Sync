// API to assign task
router.post('/assign', authenticateToken, async (req, res) => {
  try {
    const { task_id, assignee_ids } = req.body;
    console.log('Task assignment request received:', { task_id, assignee_ids });

    if (!task_id) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    if (!assignee_ids || (Array.isArray(assignee_ids) && assignee_ids.length === 0)) {
      return res.status(400).json({ message: 'Assignee IDs are required' });
    }

    // First, verify the task exists
    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    console.log('Found task:', task);

    // Process each assignee ID/email
    const uniqueAssignees = Array.isArray(assignee_ids) ? [...new Set(assignee_ids)] : [assignee_ids];
    const processedAssignees = [];
    const errors = [];

    for (const identifier of uniqueAssignees) {
      try {
        let user;
        
        // Check if the identifier looks like an email
        if (typeof identifier === 'string' && identifier.includes('@')) {
          user = await User.findOne({ email: identifier });
          console.log('Looking up user by email:', identifier, !!user);
        } else {
          // Try to find by ID
          user = await User.findById(identifier);
          console.log('Looking up user by ID:', identifier, !!user);
        }

        if (user) {
          // Add to assignees list if not already there
          if (!task.assignees.includes(user._id.toString())) {
            task.assignees.push(user._id);
            processedAssignees.push({
              id: user._id,
              name: user.name,
              email: user.email
            });
          } else {
            console.log('User already assigned:', user.email || user._id);
          }
        } else {
          console.log('User not found for identifier:', identifier);
          errors.push(`User not found for identifier: ${identifier}`);
        }
      } catch (error) {
        console.error('Error processing assignee:', identifier, error);
        errors.push(`Error processing: ${identifier}`);
      }
    }

    // Save the task if we processed at least one assignee
    if (processedAssignees.length > 0) {
      await task.save();
      console.log('Task updated with assignees:', task.assignees);
      
      return res.status(200).json({
        message: 'Task assignees updated successfully',
        task,
        assignees: processedAssignees,
        errors: errors.length > 0 ? errors : undefined
      });
    } else if (errors.length > 0) {
      return res.status(400).json({
        message: 'Failed to add any assignees',
        errors
      });
    } else {
      return res.status(400).json({
        message: 'No valid assignees provided'
      });
    }
  } catch (error) {
    console.error('Error in task assignment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}); 