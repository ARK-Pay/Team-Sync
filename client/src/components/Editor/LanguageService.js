/**
 * Language Service for Monaco Editor
 * Provides IntelliSense features like code completion, hover information, etc.
 */
class LanguageService {
  constructor() {
    this.monaco = null;
    this.editor = null;
    this.languageProviders = {};
    this.initialized = false;
  }

  /**
   * Initialize the language service with Monaco instance
   * @param {Object} monaco - Monaco editor instance
   * @param {Object} editor - Editor instance
   */
  initialize(monaco, editor) {
    if (this.initialized) return;
    
    this.monaco = monaco;
    this.editor = editor;
    this.initialized = true;
    
    // Register language providers
    this.registerJavaScriptProvider();
    this.registerHTMLProvider();
    this.registerCSSProvider();
  }

  /**
   * Register JavaScript/TypeScript language provider
   */
  registerJavaScriptProvider() {
    if (!this.monaco) return;
    
    // JavaScript/TypeScript completions
    this.monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        
        // Basic JavaScript suggestions
        const suggestions = [
          {
            label: 'console.log',
            kind: this.monaco.languages.CompletionItemKind.Function,
            insertText: 'console.log($1);',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log to the console',
            range
          },
          {
            label: 'function',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function definition',
            range
          },
          {
            label: 'setTimeout',
            kind: this.monaco.languages.CompletionItemKind.Function,
            insertText: 'setTimeout(() => {\n\t${1}\n}, ${2:1000});',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Set a timeout',
            range
          },
          {
            label: 'import',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: 'import { ${2:module} } from \'${1:package}\';',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'ES6 import',
            range
          },
          {
            label: 'react-component',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: 'import React from \'react\';\n\nconst ${1:ComponentName} = () => {\n\treturn (\n\t\t<div>\n\t\t\t${2}\n\t\t</div>\n\t);\n};\n\nexport default ${1:ComponentName};',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React functional component',
            range
          },
          {
            label: 'useState',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialState});',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useState hook',
            range
          },
          {
            label: 'useEffect',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: 'useEffect(() => {\n\t${1}\n\treturn () => {\n\t\t${2}\n\t};\n}, [${3}]);',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'React useEffect hook',
            range
          }
        ];
        
        return { suggestions };
      }
    });
    
    // JavaScript/TypeScript hover provider
    this.monaco.languages.registerHoverProvider('javascript', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;
        
        const commonJsAPIs = {
          'console.log': 'Outputs a message to the web console.\n\n```javascript\nconsole.log(obj1 [, obj2, ..., objN]);\n```',
          'setTimeout': 'Sets a timer which executes a function once the timer expires.\n\n```javascript\nsetTimeout(function, milliseconds);\n```',
          'Promise': 'The Promise object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.',
          'async': 'The async function declaration defines an asynchronous function, which returns an AsyncFunction object.',
          'await': 'The await operator is used to wait for a Promise. It can only be used inside an async function.',
          'map': 'The map() method creates a new array populated with the results of calling a provided function on every element in the calling array.',
          'filter': 'The filter() method creates a new array with all elements that pass the test implemented by the provided function.',
          'reduce': 'The reduce() method executes a reducer function on each element of the array, resulting in a single output value.'
        };
        
        const reactAPIs = {
          'useState': 'React Hook that lets you add state to a functional component.\n\n```javascript\nconst [state, setState] = useState(initialState);\n```',
          'useEffect': 'React Hook that lets you synchronize a component with an external system.\n\n```javascript\nuseEffect(didUpdate, dependencies);\n```',
          'useContext': 'React Hook that lets you subscribe to React context without introducing nesting.\n\n```javascript\nconst value = useContext(MyContext);\n```',
          'useRef': 'React Hook that lets you reference a value that\'s not needed for rendering.\n\n```javascript\nconst refContainer = useRef(initialValue);\n```',
          'useMemo': 'React Hook that lets you cache the result of a calculation between re-renders.\n\n```javascript\nconst cachedValue = useMemo(calculateValue, dependencies);\n```'
        };
        
        const allAPIs = { ...commonJsAPIs, ...reactAPIs };
        const content = allAPIs[word.word];
        
        if (content) {
          return {
            contents: [
              { value: `**${word.word}**` },
              { value: content }
            ]
          };
        }
        
        return null;
      }
    });
  }

  /**
   * Register HTML language provider
   */
  registerHTMLProvider() {
    if (!this.monaco) return;
    
    // HTML completions
    this.monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        
        // Basic HTML suggestions
        const suggestions = [
          {
            label: 'div',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div>\n\t${1}\n</div>',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Div element',
            range
          },
          {
            label: 'span',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '<span>${1}</span>',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Span element',
            range
          },
          {
            label: 'a',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '<a href="${1:#}">${2:Link text}</a>',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Anchor element',
            range
          },
          {
            label: 'button',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '<button type="${1:button}">${2:Button text}</button>',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Button element',
            range
          },
          {
            label: 'input',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '<input type="${1:text}" name="${2:name}" placeholder="${3:placeholder}" />',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Input element',
            range
          },
          {
            label: 'form',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '<form action="${1:#}" method="${2:post}">\n\t${3}\n</form>',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Form element',
            range
          },
          {
            label: 'html5',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'HTML5 document template',
            range
          }
        ];
        
        return { suggestions };
      }
    });
  }

  /**
   * Register CSS language provider
   */
  registerCSSProvider() {
    if (!this.monaco) return;
    
    // CSS completions
    this.monaco.languages.registerCompletionItemProvider('css', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        
        // Basic CSS suggestions
        const suggestions = [
          {
            label: 'display',
            kind: this.monaco.languages.CompletionItemKind.Property,
            insertText: 'display: ${1:flex};',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'CSS display property',
            range
          },
          {
            label: 'flex',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: 'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Flexbox layout',
            range
          },
          {
            label: 'grid',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: 'display: grid;\ngrid-template-columns: ${1:repeat(3, 1fr)};\ngrid-gap: ${2:10px};',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'CSS Grid layout',
            range
          },
          {
            label: 'media',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '@media (max-width: ${1:768px}) {\n\t${2}\n}',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Media query',
            range
          },
          {
            label: 'animation',
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: '@keyframes ${1:animationName} {\n\t0% {\n\t\t${2}\n\t}\n\t100% {\n\t\t${3}\n\t}\n}\n\n.${4:element} {\n\tanimation: ${1:animationName} ${5:1s} ease-in-out infinite;\n}',
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'CSS Animation',
            range
          }
        ];
        
        return { suggestions };
      }
    });
  }
}

export default new LanguageService();
