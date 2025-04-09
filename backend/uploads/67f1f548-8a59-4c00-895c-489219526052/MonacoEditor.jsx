import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';
import LanguageService from './LanguageService';

/**
 * A configurable Monaco Editor component for code editing
 * 
 * @param {Object} props - Component props
 * @param {string} props.language - The language for syntax highlighting (e.g., 'javascript', 'typescript', 'html')
 * @param {string} props.value - The initial value/content of the editor
 * @param {function} props.onChange - Callback function when editor content changes
 * @param {string} props.theme - The editor theme ('vs', 'vs-dark', or 'hc-black')
 * @param {Object} props.options - Additional Monaco editor options
 * @param {string} props.height - The height of the editor
 * @param {string} props.width - The width of the editor
 * @param {function} props.onMount - Callback function when editor is mounted
 */
const MonacoEditor = ({
  language = 'javascript',
  value = '',
  onChange,
  theme = 'vs-dark',
  options = {},
  height = '500px',
  width = '100%',
  onMount,
}) => {
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Default editor options
  const defaultOptions = {
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    renderLineHighlight: 'all',
    suggestOnTriggerCharacters: true,
    formatOnPaste: true,
    formatOnType: true,
  };

  // Merge default options with user-provided options
  const editorOptions = { ...defaultOptions, ...options };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Initialize language service for IntelliSense
    LanguageService.initialize(monaco, editor);
    
    // Call user-provided onMount callback if available
    if (onMount) {
      onMount(editor, monaco);
    }
    
    // Configure editor settings
    configureEditor(monaco);
  };

  // Configure editor settings
  const configureEditor = (monaco) => {
    // Add custom themes
    monaco.editor.defineTheme('teamSyncDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2A2A2A',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#3B3B3B'
      }
    });
    
    monaco.editor.defineTheme('teamSyncLight', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#333333',
        'editor.lineHighlightBackground': '#F0F0F0',
        'editorCursor.foreground': '#333333',
        'editorWhitespace.foreground': '#DDDDDD'
      }
    });
    
    // Configure TypeScript/JavaScript settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    
    // Add TypeScript definitions for better IntelliSense
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
      interface Console {
        log(message?: any, ...optionalParams: any[]): void;
        info(message?: any, ...optionalParams: any[]): void;
        warn(message?: any, ...optionalParams: any[]): void;
        error(message?: any, ...optionalParams: any[]): void;
        debug(message?: any, ...optionalParams: any[]): void;
      }
      declare var console: Console;
      
      interface Document {
        getElementById(elementId: string): HTMLElement | null;
        querySelector(selectors: string): Element | null;
        querySelectorAll(selectors: string): NodeListOf<Element>;
      }
      declare var document: Document;
      
      interface Window {
        document: Document;
        console: Console;
        localStorage: Storage;
        sessionStorage: Storage;
      }
      declare var window: Window;
      `,
      'ts:browser.d.ts'
    );
    
    // Add React definitions
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
      declare namespace React {
        interface Component {
          render(): JSX.Element | null;
        }
        
        function useState<T>(initialState: T | (() => T)): [T, (newState: T) => void];
        function useEffect(effect: () => (void | (() => void)), deps?: any[]): void;
        function useRef<T>(initialValue: T): { current: T };
        function useMemo<T>(factory: () => T, deps: any[]): T;
        function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
      }
      
      declare namespace JSX {
        interface Element {}
        interface IntrinsicElements {
          [elemName: string]: any;
        }
      }
      
      declare module "react" {
        export = React;
      }
      `,
      'ts:react.d.ts'
    );
  };

  // Handle content change
  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="monaco-editor-container" style={{ height, width }}>
      <Editor
        height={height}
        width={width}
        language={language}
        value={value}
        theme={theme}
        options={editorOptions}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={<div>Loading editor...</div>}
      />
    </div>
  );
};

MonacoEditor.propTypes = {
  language: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  theme: PropTypes.string,
  options: PropTypes.object,
  height: PropTypes.string,
  width: PropTypes.string,
  onMount: PropTypes.func,
};

export default MonacoEditor;
