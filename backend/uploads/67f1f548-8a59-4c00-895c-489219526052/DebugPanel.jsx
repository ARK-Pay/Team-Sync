import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Play, Square, StepForward, CornerDownRight, CornerUpRight, FastForward } from 'lucide-react';
import DebugService from './DebugService';

/**
 * Debug Panel component for the Monaco Editor
 * Displays debugging controls, variables, and call stack
 */
const DebugPanel = ({ editor, monaco }) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [variables, setVariables] = useState({});
  const [callStack, setCallStack] = useState([]);
  const [breakpoints, setBreakpoints] = useState([]);
  const [expression, setExpression] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Initialize debug service
  useEffect(() => {
    if (!editor || !monaco) return;
    
    DebugService.initialize(monaco, editor);
    
    // Set up callbacks
    DebugService.setBreakpointChangeCallback((newBreakpoints) => {
      setBreakpoints(newBreakpoints);
    });
    
    DebugService.setDebugStateChangeCallback((state) => {
      setIsDebugging(state.isDebugging);
      setCurrentLine(state.currentLine);
      setVariables(state.variables);
      setCallStack(state.callStack);
    });
    
    // Add CSS for debug decorations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .debug-breakpoint {
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='4' fill='%23e51400'/%3E%3C/svg%3E") center center no-repeat;
      }
      .debug-current-line {
        background-color: rgba(255, 238, 0, 0.2);
      }
      .debug-current-line-glyph {
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M2 8l4-4v8L2 8z' fill='%23007acc'/%3E%3C/svg%3E") center center no-repeat;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [editor, monaco]);

  // Start debugging
  const handleStartDebugging = () => {
    DebugService.startDebugging();
  };

  // Stop debugging
  const handleStopDebugging = () => {
    DebugService.stopDebugging();
  };

  // Step over
  const handleStepOver = () => {
    DebugService.stepOver();
  };

  // Step into
  const handleStepInto = () => {
    DebugService.stepInto();
  };

  // Step out
  const handleStepOut = () => {
    DebugService.stepOut();
  };

  // Continue
  const handleContinue = () => {
    DebugService.continue();
  };

  // Evaluate expression
  const handleEvaluate = () => {
    if (!expression.trim()) return;
    
    const result = DebugService.evaluate(expression);
    setEvaluationResult(result);
  };

  return (
    <div className="debug-panel border-t dark:border-gray-700 p-2">
      <div className="debug-controls flex items-center space-x-2 mb-3">
        {!isDebugging ? (
          <button
            className="p-1 rounded bg-green-500 text-white flex items-center"
            onClick={handleStartDebugging}
            disabled={breakpoints.length === 0}
            title={breakpoints.length === 0 ? "Set breakpoints first" : "Start debugging"}
          >
            <Play size={16} />
            <span className="ml-1">Debug</span>
          </button>
        ) : (
          <>
            <button
              className="p-1 rounded bg-red-500 text-white flex items-center"
              onClick={handleStopDebugging}
              title="Stop debugging"
            >
              <Square size={16} />
              <span className="ml-1">Stop</span>
            </button>
            
            <button
              className="p-1 rounded bg-blue-500 text-white flex items-center"
              onClick={handleStepOver}
              title="Step over"
            >
              <StepForward size={16} />
            </button>
            
            <button
              className="p-1 rounded bg-blue-500 text-white flex items-center"
              onClick={handleStepInto}
              title="Step into"
            >
              <CornerDownRight size={16} />
            </button>
            
            <button
              className="p-1 rounded bg-blue-500 text-white flex items-center"
              onClick={handleStepOut}
              title="Step out"
            >
              <CornerUpRight size={16} />
            </button>
            
            <button
              className="p-1 rounded bg-green-500 text-white flex items-center"
              onClick={handleContinue}
              title="Continue"
            >
              <FastForward size={16} />
            </button>
          </>
        )}
        
        {currentLine && (
          <span className="text-sm ml-2">
            Line: {currentLine}
          </span>
        )}
      </div>
      
      {isDebugging && (
        <div className="debug-info grid grid-cols-2 gap-4">
          <div className="variables">
            <h4 className="text-sm font-semibold mb-1">Variables</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm h-32 overflow-auto">
              {Object.keys(variables).length === 0 ? (
                <div className="text-gray-500">No variables</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Name</th>
                      <th className="text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(variables).map(([name, value]) => (
                      <tr key={name}>
                        <td className="font-mono">{name}</td>
                        <td className="font-mono">{JSON.stringify(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div className="call-stack">
            <h4 className="text-sm font-semibold mb-1">Call Stack</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm h-32 overflow-auto">
              {callStack.length === 0 ? (
                <div className="text-gray-500">Empty call stack</div>
              ) : (
                <ul className="list-none">
                  {callStack.map((call, index) => (
                    <li key={index} className="mb-1">
                      <span className="font-mono">{call.name}</span>
                      <span className="text-gray-500 text-xs ml-2">line {call.line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="evaluate col-span-2">
            <h4 className="text-sm font-semibold mb-1">Evaluate Expression</h4>
            <div className="flex">
              <input
                type="text"
                className="flex-1 p-1 border rounded-l dark:bg-gray-700"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter expression (e.g., variable name)"
                onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
              />
              <button
                className="p-1 px-2 bg-blue-500 text-white rounded-r"
                onClick={handleEvaluate}
              >
                Evaluate
              </button>
            </div>
            {evaluationResult !== null && (
              <div className="mt-1 p-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                <pre className="font-mono whitespace-pre-wrap">{JSON.stringify(evaluationResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!isDebugging && (
        <div className="breakpoints">
          <h4 className="text-sm font-semibold mb-1">Breakpoints</h4>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm max-h-32 overflow-auto">
            {breakpoints.length === 0 ? (
              <div className="text-gray-500">No breakpoints set. Click in the gutter to add breakpoints.</div>
            ) : (
              <ul className="list-none">
                {breakpoints.map((line) => (
                  <li key={line} className="mb-1">
                    Line {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

DebugPanel.propTypes = {
  editor: PropTypes.object,
  monaco: PropTypes.object
};

export default DebugPanel;
