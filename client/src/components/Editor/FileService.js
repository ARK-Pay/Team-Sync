import axios from 'axios';

/**
 * Service for handling file operations with the backend
 */
class FileService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/filesystem';
    // Use a default project ID if none is found in localStorage
    this.projectId = localStorage.getItem('project_id') || 'default-project';
    
    // For debugging
    console.log('FileService initialized with projectId:', this.projectId);
  }
  
  /**
   * Gets the current authentication token from localStorage
   * @returns {string} - The authentication token
   */
  getToken() {
    return localStorage.getItem('token') || '';
  }

  /**
   * Get the list of files and directories for the current project
   * @param {string} dir - The directory path to list
   * @returns {Promise<Array>} - List of files and directories
   */
  async listFiles(dir = '') {
    try {
      console.log('Listing files for project:', this.projectId, 'in directory:', dir);
      
      // Set a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await axios.get(`${this.baseUrl}/list/${this.projectId}`, {
        params: { dir },
        headers: { 'authorization': this.getToken() },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Files response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error listing files:', error);
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The server took too long to respond.');
      }
      throw error;
    }
  }

  /**
   * Get the content of a file
   * @param {string} path - The file path
   * @returns {Promise<string>} - The file content
   */
  async getFileContent(path) {
    try {
      const response = await axios.get(`${this.baseUrl}/content/${this.projectId}`, {
        params: { path },
        headers: { 'authorization': this.getToken() }
      });
      return response.data.content;
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  }

  /**
   * Save file content to the server
   * @param {string} path - The file path
   * @param {string} content - The file content
   * @returns {Promise<Object>} - Response from the server
   */
  async saveFile(path, content) {
    try {
      const response = await axios.put(`${this.baseUrl}/save/${this.projectId}`, {
        path,
        content
      }, {
        headers: { 'authorization': this.getToken() }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  /**
   * Create a new directory
   * @param {string} path - The directory path
   * @returns {Promise<Object>} - Response from the server
   */
  async createDirectory(path) {
    try {
      const response = await axios.post(`${this.baseUrl}/mkdir/${this.projectId}`, {
        path
      }, {
        headers: { 'authorization': this.getToken() }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  }

  /**
   * Delete a file or directory
   * @param {string} path - The path to delete
   * @param {boolean} isDirectory - Whether the item is a directory
   * @returns {Promise<Object>} - Response from the server
   */
  async deleteItem(path, isDirectory) {
    try {
      const response = await axios.delete(`${this.baseUrl}/${this.projectId}`, {
        data: { path, isDirectory },
        headers: { 'authorization': this.getToken() }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  /**
   * Rename a file or directory
   * @param {string} oldPath - The current path
   * @param {string} newPath - The new path
   * @returns {Promise<Object>} - Response from the server
   */
  async renameItem(oldPath, newPath) {
    try {
      const response = await axios.put(`${this.baseUrl}/rename/${this.projectId}`, {
        oldPath,
        newPath
      }, {
        headers: { 'authorization': this.getToken() }
      });
      return response.data;
    } catch (error) {
      console.error('Error renaming item:', error);
      throw error;
    }
  }

  /**
   * Upload a file to the server
   * @param {File} file - The file to upload
   * @param {string} directory - The directory to upload to
   * @returns {Promise<Object>} - Response from the server
   */
  async uploadFile(file, directory = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);
      
      const response = await axios.post(`${this.baseUrl}/upload/${this.projectId}`, formData, {
        headers: { 
          'authorization': this.getToken(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files to the server (including folder structure)
   * @param {FileList} files - The files to upload
   * @param {string} directory - The base directory to upload to
   * @returns {Promise<Object>} - Response from the server
   */
  async uploadMultipleFiles(files, directory = '') {
    try {
      // Process files in batches to avoid overwhelming the server
      const batchSize = 5;
      const totalFiles = files.length;
      let uploadedCount = 0;
      let results = [];
      
      console.log(`Starting upload of ${totalFiles} files in batches of ${batchSize}`);
      
      // Process files in batches
      for (let i = 0; i < totalFiles; i += batchSize) {
        const batch = Array.from(files).slice(i, i + batchSize);
        const formData = new FormData();
        
        // Append files from this batch
        batch.forEach(file => {
          // Get the relative path of the file within the folder
          const relativePath = file.webkitRelativePath || file.name;
          formData.append('files', file);
          formData.append('filePaths', relativePath);
        });
        
        formData.append('directory', directory);
        
        const response = await axios.post(`${this.baseUrl}/upload-multiple/${this.projectId}`, formData, {
          headers: { 
            'authorization': this.getToken(),
            'Content-Type': 'multipart/form-data'
          }
        });
        
        uploadedCount += batch.length;
        console.log(`Uploaded ${uploadedCount}/${totalFiles} files`);
        
        if (response.data && response.data.files) {
          results = [...results, ...response.data.files];
        }
      }
      
      return {
        success: true,
        message: `${uploadedCount} files uploaded successfully`,
        files: results
      };
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }
}

export default FileService;
