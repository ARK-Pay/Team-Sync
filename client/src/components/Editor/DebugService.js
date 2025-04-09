/**
 * Debug Service for Monaco Editor
 * Provides basic debugging capabilities for JavaScript code
 */
class DebugService {
  constructor() {
    this.monaco = null;
    this.editor = null;
    this.decorations = [];
    this.breakpoints = new Set();
    this.isDebugging = false;
    this.currentExecutionLine = null;
    this.variables = {};
    this.callStack = [];
    this.initialized = false;
    this.onBreakpointChange = null;
    this.onDebugStateChange = null;
  }

  /**
   * Initialize the debug service with Monaco instance
   * @param {Object} monaco - Monaco editor instance
   * @param {Object} editor - Editor instance
   */
  initialize(monaco, editor) {
    if (this.initialized) return;
    
    this.monaco = monaco;
    this.editor = editor;
    this.initialized = true;
    
    // Add event listener for gutter clicks to set breakpoints
    this.editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        this.toggleBreakpoint(e.target.position.lineNumber);
      }
    });
  }

  /**
   * Set callback for breakpoint changes
   * @param {Function} callback - Function to call when breakpoints change
   */
  setBreakpointChangeCallback(callback) {
    this.onBreakpointChange = callback;
  }

  /**
   * Set callback for debug state changes
   * @param {Function} callback - Function to call when debug state changes
   */
  setDebugStateChangeCallback(callback) {
    this.onDebugStateChange = callback;
  }

  /**
   * Toggle a breakpoint at the specified line
   * @param {number} lineNumber - Line number to toggle breakpoint at
   */
  toggleBreakpoint(lineNumber) {
    if (!this.editor || !this.monaco) return;
    
    if (this.breakpoints.has(lineNumber)) {
      this.breakpoints.delete(lineNumber);
    } else {
      this.breakpoints.add(lineNumber);
    }
    
    this.updateBreakpointDecorations();
    
    if (this.onBreakpointChange) {
      this.onBreakpointChange(Array.from(this.breakpoints));
    }
  }

  /**
   * Update the breakpoint decorations in the editor
   */
  updateBreakpointDecorations() {
    if (!this.editor || !this.monaco) return;
    
    const model = this.editor.getModel();
    if (!model) return;
    
    const breakpointDecorations = Array.from(this.breakpoints).map(lineNumber => ({
      range: new this.monaco.Range(lineNumber, 1, lineNumber, 1),
      options: {
        isWholeLine: false,
        glyphMarginClassName: 'debug-breakpoint',
        glyphMarginHoverMessage: { value: 'Breakpoint' }
      }
    }));
    
    // Add current execution line decoration if debugging
    const decorations = [...breakpointDecorations];
    if (this.isDebugging && this.currentExecutionLine) {
      decorations.push({
        range: new this.monaco.Range(this.currentExecutionLine, 1, this.currentExecutionLine, 1),
        options: {
          isWholeLine: true,
          className: 'debug-current-line',
          glyphMarginClassName: 'debug-current-line-glyph'
        }
      });
    }
    
    this.decorations = this.editor.deltaDecorations(this.decorations, decorations);
  }

  /**
   * Start debugging the current code
   */
  startDebugging() {
    if (!this.editor || this.isDebugging) return;
    
    this.isDebugging = true;
    this.variables = {};
    this.callStack = [];
    this.currentExecutionLine = null;
    
    // Prepare code for debugging (in a real implementation, this would involve
    // instrumenting the code or connecting to a real debugger)
    const code = this.editor.getValue();
    
    // For this simplified implementation, we'll just simulate debugging
    // by highlighting the first breakpoint
    const firstBreakpoint = Math.min(...Array.from(this.breakpoints));
    if (firstBreakpoint !== Infinity) {
      this.currentExecutionLine = firstBreakpoint;
      
      // Simulate some variables at this breakpoint
      this.variables = {
        'i': 0,
        'count': 10,
        'message': 'Debugging started'
      };
      
      // Simulate call stack
      this.callStack = [
        { name: 'anonymous', line: firstBreakpoint },
        { name: 'main', line: 1 }
      ];
    }
    
    this.updateBreakpointDecorations();
    
    if (this.onDebugStateChange) {
      this.onDebugStateChange({
        isDebugging: this.isDebugging,
        currentLine: this.currentExecutionLine,
        variables: this.variables,
        callStack: this.callStack
      });
    }
  }

  /**
   * Stop debugging
   */
  stopDebugging() {
    if (!this.isDebugging) return;
    
    this.isDebugging = false;
    this.currentExecutionLine = null;
    this.variables = {};
    this.callStack = [];
    
    this.updateBreakpointDecorations();
    
    if (this.onDebugStateChange) {
      this.onDebugStateChange({
        isDebugging: this.isDebugging,
        currentLine: null,
        variables: {},
        callStack: []
      });
    }
  }

  /**
   * Step to the next line in debugging
   */
  stepOver() {
    if (!this.isDebugging || !this.currentExecutionLine) return;
    
    // In a real implementation, this would execute the current line and stop at the next line
    // For this simplified version, we'll just move to the next line or next breakpoint
    
    const model = this.editor.getModel();
    const lineCount = model.getLineCount();
    
    // Find the next line or breakpoint
    let nextLine = this.currentExecutionLine + 1;
    
    // Update variables for simulation
    if (nextLine % 3 === 0) {
      this.variables['i'] = (this.variables['i'] || 0) + 1;
      this.variables['message'] = `Stepped to line ${nextLine}`;
    }
    
    // Update call stack for simulation
    if (nextLine % 5 === 0) {
      if (this.callStack.length > 2) {
        this.callStack.pop();
      } else {
        this.callStack.push({ name: `function_${nextLine}`, line: nextLine });
      }
    }
    
    // Check if we've reached the end of the file
    if (nextLine > lineCount) {
      this.stopDebugging();
      return;
    }
    
    this.currentExecutionLine = nextLine;
    this.updateBreakpointDecorations();
    
    if (this.onDebugStateChange) {
      this.onDebugStateChange({
        isDebugging: this.isDebugging,
        currentLine: this.currentExecutionLine,
        variables: this.variables,
        callStack: this.callStack
      });
    }
  }

  /**
   * Step into a function during debugging
   */
  stepInto() {
    // In a real implementation, this would step into a function call
    // For this simplified version, it behaves the same as stepOver
    this.stepOver();
  }

  /**
   * Step out of the current function during debugging
   */
  stepOut() {
    if (!this.isDebugging || !this.currentExecutionLine) return;
    
    // In a real implementation, this would execute until the current function returns
    // For this simplified version, we'll just jump ahead a few lines
    
    const model = this.editor.getModel();
    const lineCount = model.getLineCount();
    
    let nextLine = this.currentExecutionLine + 5;
    
    // Update variables for simulation
    this.variables['i'] = (this.variables['i'] || 0) + 5;
    this.variables['message'] = `Stepped out to line ${nextLine}`;
    
    // Update call stack for simulation
    if (this.callStack.length > 1) {
      this.callStack.pop();
    }
    
    // Check if we've reached the end of the file
    if (nextLine > lineCount) {
      this.stopDebugging();
      return;
    }
    
    this.currentExecutionLine = nextLine;
    this.updateBreakpointDecorations();
    
    if (this.onDebugStateChange) {
      this.onDebugStateChange({
        isDebugging: this.isDebugging,
        currentLine: this.currentExecutionLine,
        variables: this.variables,
        callStack: this.callStack
      });
    }
  }

  /**
   * Continue execution until the next breakpoint
   */
  continue() {
    if (!this.isDebugging || !this.currentExecutionLine) return;
    
    // In a real implementation, this would continue execution until the next breakpoint
    // For this simplified version, we'll just jump to the next breakpoint or end debugging
    
    const model = this.editor.getModel();
    const lineCount = model.getLineCount();
    
    // Find the next breakpoint after the current line
    const nextBreakpoints = Array.from(this.breakpoints)
      .filter(line => line > this.currentExecutionLine)
      .sort((a, b) => a - b);
    
    if (nextBreakpoints.length > 0) {
      this.currentExecutionLine = nextBreakpoints[0];
      
      // Update variables for simulation
      this.variables['i'] = nextBreakpoints[0] - this.currentExecutionLine;
      this.variables['message'] = `Continued to breakpoint at line ${nextBreakpoints[0]}`;
      
      this.updateBreakpointDecorations();
      
      if (this.onDebugStateChange) {
        this.onDebugStateChange({
          isDebugging: this.isDebugging,
          currentLine: this.currentExecutionLine,
          variables: this.variables,
          callStack: this.callStack
        });
      }
    } else {
      // No more breakpoints, end debugging
      this.stopDebugging();
    }
  }

  /**
   * Evaluate an expression in the current debug context
   * @param {string} expression - Expression to evaluate
   * @returns {any} - Result of the evaluation
   */
  evaluate(expression) {
    if (!this.isDebugging) return null;
    
    // In a real implementation, this would evaluate the expression in the current context
    // For this simplified version, we'll just do a simple variable lookup or return a mock value
    
    try {
      // Check if the expression is a simple variable name that exists in our variables
      if (this.variables.hasOwnProperty(expression)) {
        return this.variables[expression];
      }
      
      // For demo purposes, return a mock value for certain expressions
      if (expression.includes('+')) {
        return 'Result of addition: 42';
      } else if (expression.includes('(')) {
        return 'Result of function call: { success: true }';
      } else {
        return 'Expression not found in current context';
      }
    } catch (error) {
      return `Error evaluating expression: ${error.message}`;
    }
  }
}

export default new DebugService();
