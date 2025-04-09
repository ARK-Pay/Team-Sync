const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const authenticate = require('../middlewares/authenticate');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get the project ID from the URL
    const projectId = req.params.projectId || 'default-project';
    
    // Create directory structure if it doesn't exist
    const projectDir = path.join(__dirname, '../uploads', projectId);
    const userDir = req.body.directory ? path.join(projectDir, req.body.directory) : projectDir;
    
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Use original filename
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Helper function to get file info
const getFileInfo = (filePath, basePath) => {
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');
  const name = path.basename(filePath);
  
  return {
    name,
    path: relativePath || name, // If at root level, just use name
    isDirectory: stats.isDirectory(),
    size: stats.size,
    modified: stats.mtime
  };
};

// Helper function to read directory recursively
const readDirRecursive = (dirPath, basePath, maxDepth = 3, currentDepth = 0) => {
  if (currentDepth > maxDepth) return [];
  
  const items = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const fileInfo = getFileInfo(fullPath, basePath);
    
    if (entry.isDirectory()) {
      // Only include children if we're not at max depth
      if (currentDepth < maxDepth) {
        fileInfo.children = readDirRecursive(fullPath, basePath, maxDepth, currentDepth + 1);
      } else {
        fileInfo.children = []; // Empty array to indicate it has children but they're not loaded
      }
    }
    
    items.push(fileInfo);
  }
  
  return items;
};

// List files in a project directory
router.get('/list/:projectId', authenticate, (req, res) => {
  try {
    const projectId = req.params.projectId;
    const dir = req.query.dir || '';
    
    // Sanitize directory path to prevent directory traversal
    const sanitizedDir = path.normalize(dir).replace(/^(\.\.(\/|\\|$))+/, '');
    const projectDir = path.join(__dirname, '../uploads', projectId);
    const targetDir = path.join(projectDir, sanitizedDir);
    
    // Check if directory exists
    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Directory not found' 
      });
    }
    
    // Read directory contents
    const files = readDirRecursive(targetDir, projectDir);
    
    res.json({
      success: true,
      currentDir: sanitizedDir,
      files: files
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list files: ' + error.message 
    });
  }
});

// Get file content
router.get('/content/:projectId', authenticate, (req, res) => {
  try {
    const projectId = req.params.projectId;
    const filePath = req.query.path || '';
    
    // Sanitize file path to prevent directory traversal
    const sanitizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(__dirname, '../uploads', projectId, sanitizedPath);
    
    // Check if file exists and is not a directory
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    // Read file content
    const content = fs.readFileSync(fullPath, 'utf8');
    
    res.json({
      success: true,
      content: content
    });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to read file: ' + error.message 
    });
  }
});

// Save file content
router.put('/save/:projectId', authenticate, (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'File path and content are required' 
      });
    }
    
    // Sanitize file path to prevent directory traversal
    const sanitizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(__dirname, '../uploads', projectId, sanitizedPath);
    
    // Create directory if it doesn't exist
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write file content
    fs.writeFileSync(fullPath, content, 'utf8');
    
    res.json({
      success: true,
      message: 'File saved successfully'
    });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save file: ' + error.message 
    });
  }
});

// Upload a single file
router.post('/upload/:projectId', authenticate, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: req.file.originalname,
        path: req.body.directory ? `${req.body.directory}/${req.file.originalname}` : req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload file: ' + error.message 
    });
  }
});

// Upload multiple files (for folder upload)
router.post('/upload-multiple/:projectId', authenticate, (req, res) => {
  try {
    // Create a custom storage configuration for this request
    const projectId = req.params.projectId || 'default-project';
    const baseDir = path.join(__dirname, '../uploads', projectId);
    
    // Create base directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    // Use multer with custom settings for this request
    const customStorage = multer.diskStorage({
      destination: function (req, file, cb) {
        // Get the directory from the file path
        let filePath = file.originalname;
        
        // Check if we have a relative path for this file
        const filePathIndex = req.body.filePaths ? 
          Array.isArray(req.body.filePaths) ? 
            req.body.filePaths.findIndex(p => p.endsWith(file.originalname)) : 
            req.body.filePaths.endsWith(file.originalname) ? 0 : -1 
          : -1;
        
        if (filePathIndex !== -1) {
          filePath = Array.isArray(req.body.filePaths) ? 
            req.body.filePaths[filePathIndex] : 
            req.body.filePaths;
        }
        
        // Extract directory from the path
        const directory = path.dirname(filePath);
        const targetDir = directory === '.' ? 
          path.join(baseDir, req.body.directory || '') : 
          path.join(baseDir, req.body.directory || '', directory);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        cb(null, targetDir);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      }
    });
    
    const upload = multer({ storage: customStorage }).array('files');
    
    upload(req, res, function(err) {
      if (err) {
        console.error('Error in multer upload:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload files: ' + err.message 
        });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No files uploaded' 
        });
      }
      
      // Get relative paths for uploaded files
      const uploadedFiles = req.files.map(file => {
        // Get the path relative to the project directory
        const relativePath = path.relative(
          path.join(__dirname, '../uploads', projectId),
          file.path
        ).replace(/\\/g, '/');
        
        return {
          name: file.originalname,
          path: relativePath,
          size: file.size
        };
      });
      
      res.json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        files: uploadedFiles
      });
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload files: ' + error.message 
    });
  }
});

// Create a new directory
router.post('/mkdir/:projectId', authenticate, (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { path: dirPath } = req.body;
    
    if (!dirPath) {
      return res.status(400).json({ 
        success: false, 
        message: 'Directory path is required' 
      });
    }
    
    // Sanitize directory path to prevent directory traversal
    const sanitizedPath = path.normalize(dirPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(__dirname, '../uploads', projectId, sanitizedPath);
    
    // Check if directory already exists
    if (fs.existsSync(fullPath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Directory already exists' 
      });
    }
    
    // Create directory
    fs.mkdirSync(fullPath, { recursive: true });
    
    res.json({
      success: true,
      message: 'Directory created successfully',
      path: sanitizedPath
    });
  } catch (error) {
    console.error('Error creating directory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create directory: ' + error.message 
    });
  }
});

// Delete a file or directory
router.delete('/:projectId', authenticate, (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { path: itemPath, isDirectory } = req.body;
    
    if (!itemPath) {
      return res.status(400).json({ 
        success: false, 
        message: 'Path is required' 
      });
    }
    
    // Sanitize path to prevent directory traversal
    const sanitizedPath = path.normalize(itemPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(__dirname, '../uploads', projectId, sanitizedPath);
    
    // Check if item exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    // Delete item
    if (isDirectory) {
      fs.rmdirSync(fullPath, { recursive: true });
    } else {
      fs.unlinkSync(fullPath);
    }
    
    res.json({
      success: true,
      message: `${isDirectory ? 'Directory' : 'File'} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete item: ' + error.message 
    });
  }
});

// Rename a file or directory
router.put('/rename/:projectId', authenticate, (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { oldPath, newPath } = req.body;
    
    if (!oldPath || !newPath) {
      return res.status(400).json({ 
        success: false, 
        message: 'Old path and new path are required' 
      });
    }
    
    // Sanitize paths to prevent directory traversal
    const sanitizedOldPath = path.normalize(oldPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const sanitizedNewPath = path.normalize(newPath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    const fullOldPath = path.join(__dirname, '../uploads', projectId, sanitizedOldPath);
    const fullNewPath = path.join(__dirname, '../uploads', projectId, sanitizedNewPath);
    
    // Check if source exists
    if (!fs.existsSync(fullOldPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Source item not found' 
      });
    }
    
    // Check if destination already exists
    if (fs.existsSync(fullNewPath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Destination already exists' 
      });
    }
    
    // Create directory for destination if needed
    const destDir = path.dirname(fullNewPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Rename item
    fs.renameSync(fullOldPath, fullNewPath);
    
    res.json({
      success: true,
      message: 'Item renamed successfully',
      oldPath: sanitizedOldPath,
      newPath: sanitizedNewPath
    });
  } catch (error) {
    console.error('Error renaming item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to rename item: ' + error.message 
    });
  }
});

module.exports = router;
