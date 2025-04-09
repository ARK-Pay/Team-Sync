// Team-Sync Example Project - Main Application
import { createTaskCard, updateTaskProgress } from './taskManager.js';

// Sample data for demonstration
const sampleTasks = [
  { id: 1, title: 'Design UI Components', assignee: 'John Doe', status: 'In Progress', progress: 60 },
  { id: 2, title: 'Implement API Integration', assignee: 'Jane Smith', status: 'Todo', progress: 0 },
  { id: 3, title: 'Write Documentation', assignee: 'Alex Johnson', status: 'Completed', progress: 100 }
];

// Initialize the application
function initApp() {
  console.log('Initializing Team-Sync Example Project...');
  
  // DOM elements
  const appContainer = document.getElementById('app');
  const tasksContainer = document.createElement('div');
  tasksContainer.className = 'container';
  
  // Create header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1>Team-Sync Project Tasks</h1>
    <p>A demonstration of the Monaco Editor with debugging capabilities</p>
  `;
  
  // Create task list
  const taskList = document.createElement('div');
  taskList.className = 'task-list';
  
  // Add new task button
  const addTaskBtn = document.createElement('button');
  addTaskBtn.className = 'btn btn-primary';
  addTaskBtn.textContent = 'Add New Task';
  addTaskBtn.addEventListener('click', () => addNewTask());
  
  // Append elements
  appContainer.appendChild(header);
  appContainer.appendChild(tasksContainer);
  tasksContainer.appendChild(taskList);
  tasksContainer.appendChild(addTaskBtn);
  
  // Render initial tasks
  renderTasks(taskList);
}

// Render all tasks
function renderTasks(container) {
  // This function can be used to set breakpoints for debugging
  container.innerHTML = '';
  
  // Create task cards
  sampleTasks.forEach(task => {
    const taskCard = createTaskCard(task);
    container.appendChild(taskCard);
    
    // Add event listener for progress update
    const progressBar = taskCard.querySelector('.progress-bar');
    progressBar.addEventListener('click', (e) => {
      // Calculate new progress based on click position
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const newProgress = Math.round((clickPosition / rect.width) * 100);
      
      // Update task progress
      updateTaskProgress(task.id, newProgress);
      
      // Update UI
      const progressValue = taskCard.querySelector('.progress-value');
      progressValue.textContent = `${newProgress}%`;
      progressBar.style.width = `${newProgress}%`;
      
      // Update task status based on progress
      const statusElement = taskCard.querySelector('.task-status');
      if (newProgress === 0) {
        task.status = 'Todo';
        statusElement.textContent = 'Todo';
        statusElement.className = 'task-status todo';
      } else if (newProgress === 100) {
        task.status = 'Completed';
        statusElement.textContent = 'Completed';
        statusElement.className = 'task-status completed';
      } else {
        task.status = 'In Progress';
        statusElement.textContent = 'In Progress';
        statusElement.className = 'task-status in-progress';
      }
    });
  });
}

// Add a new task
function addNewTask() {
  // This is a good function to test debugging with variables
  const newId = sampleTasks.length > 0 ? Math.max(...sampleTasks.map(t => t.id)) + 1 : 1;
  
  const newTask = {
    id: newId,
    title: `New Task ${newId}`,
    assignee: 'Unassigned',
    status: 'Todo',
    progress: 0
  };
  
  // Add to sample tasks
  sampleTasks.push(newTask);
  
  // Re-render tasks
  const taskList = document.querySelector('.task-list');
  renderTasks(taskList);
  
  // Log for debugging
  console.log('Added new task:', newTask);
  return newTask;
}

// Calculate team progress
function calculateTeamProgress() {
  // This function demonstrates more complex logic for debugging
  if (sampleTasks.length === 0) {
    return 0;
  }
  
  let totalProgress = 0;
  for (let i = 0; i < sampleTasks.length; i++) {
    totalProgress += sampleTasks[i].progress;
  }
  
  const averageProgress = totalProgress / sampleTasks.length;
  return Math.round(averageProgress);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions for testing
export { initApp, renderTasks, addNewTask, calculateTeamProgress };
