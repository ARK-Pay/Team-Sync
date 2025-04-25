import { createSlice } from "@reduxjs/toolkit";

// Initial state for the editor
const initialState = {
  openFiles: [], // List of open files/tabs
  activeFileId: null, // Currently active file ID
  fileContents: {}, // Cache for file contents
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    // Open a file and make it active
    openFile: (state, action) => {
      const { id, path, name, content, language } = action.payload;
      
      // Check if file is already open
      const existingFileIndex = state.openFiles.findIndex(file => file.path === path);
      
      if (existingFileIndex !== -1) {
        // File already open, just make it active
        state.activeFileId = state.openFiles[existingFileIndex].id;
      } else {
        // Add new file to open files
        const newFile = {
          id: id || `file-${Date.now()}`,
          path,
          name,
          language: language || 'plaintext',
        };
        
        state.openFiles.push(newFile);
        state.activeFileId = newFile.id;
        
        // Store content in cache
        if (content !== undefined) {
          state.fileContents[newFile.id] = content;
        }
      }
    },
    
    // Close a file
    closeFile: (state, action) => {
      const fileId = action.payload;
      const fileIndex = state.openFiles.findIndex(file => file.id === fileId);
      
      if (fileIndex !== -1) {
        // Remove file from open files
        state.openFiles.splice(fileIndex, 1);
        
        // Remove content from cache
        delete state.fileContents[fileId];
        
        // If we closed the active file, make another file active
        if (state.activeFileId === fileId) {
          if (state.openFiles.length > 0) {
            // Select the file that was next to the closed one, or the first file
            const newIndex = Math.min(fileIndex, state.openFiles.length - 1);
            state.activeFileId = state.openFiles[newIndex].id;
          } else {
            state.activeFileId = null;
          }
        }
      }
    },
    
    // Set the active file
    setActiveFile: (state, action) => {
      const fileId = action.payload;
      if (state.openFiles.some(file => file.id === fileId)) {
        state.activeFileId = fileId;
      }
    },
    
    // Update content for a file
    updateFileContent: (state, action) => {
      const { id, content } = action.payload;
      if (state.fileContents[id] !== undefined) {
        state.fileContents[id] = content;
      }
    },

    // Rename a file
    renameFile: (state, action) => {
      const { id, newName, newLanguage } = action.payload;
      const file = state.openFiles.find(file => file.id === id);
      
      if (file) {
        file.name = newName;
        if (newLanguage) {
          file.language = newLanguage;
        }
      }
    },
  },
});

// Export actions
export const { 
  openFile, 
  closeFile, 
  setActiveFile, 
  updateFileContent, 
  renameFile
} = editorSlice.actions;

// Export selectors
export const selectOpenFiles = (state) => state.editor.openFiles;
export const selectActiveFileId = (state) => state.editor.activeFileId;
export const selectActiveFile = (state) => {
  const activeId = state.editor.activeFileId;
  return activeId ? state.editor.openFiles.find(file => file.id === activeId) : null;
};
export const selectFileContent = (state, fileId) => state.editor.fileContents[fileId];
export const selectActiveFileContent = (state) => {
  const activeId = state.editor.activeFileId;
  return activeId ? state.editor.fileContents[activeId] : null;
};

export default editorSlice.reducer; 