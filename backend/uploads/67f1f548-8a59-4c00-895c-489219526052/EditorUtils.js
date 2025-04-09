/**
 * Utility functions and configurations for Monaco Editor
 */

// Language detection based on file extension
export const detectLanguage = (filename) => {
  if (!filename) return 'plaintext';
  
  const extension = filename.split('.').pop().toLowerCase();
  
  const languageMap = {
    // JavaScript/TypeScript
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mjs: 'javascript',
    cjs: 'javascript',
    
    // Web
    html: 'html',
    htm: 'html',
    xhtml: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    svg: 'xml',
    
    // Data formats
    json: 'json',
    jsonc: 'jsonc',
    jsonl: 'jsonl',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    
    // Markdown/Documentation
    md: 'markdown',
    markdown: 'markdown',
    mdx: 'markdown',
    txt: 'plaintext',
    rst: 'restructuredtext',
    
    // Programming languages
    py: 'python',
    pyc: 'python',
    pyd: 'python',
    pyo: 'python',
    pyw: 'python',
    java: 'java',
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    hpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    cs: 'csharp',
    go: 'go',
    php: 'php',
    rb: 'ruby',
    rs: 'rust',
    swift: 'swift',
    kt: 'kotlin',
    kts: 'kotlin',
    dart: 'dart',
    lua: 'lua',
    
    // Shell/Scripts
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',
    bat: 'bat',
    cmd: 'bat',
    ps1: 'powershell',
    
    // Database
    sql: 'sql',
    mysql: 'sql',
    pgsql: 'sql',
    sqlite: 'sql',
    
    // Config files
    env: 'dotenv',
    gitignore: 'ignore',
    dockerignore: 'ignore',
    editorconfig: 'properties',
    
    // Other
    graphql: 'graphql',
    gql: 'graphql',
    r: 'r',
    dockerfile: 'dockerfile',
  };
  
  // Special case for files without extensions but with known names
  if (!extension || extension === filename.toLowerCase()) {
    const knownFiles = {
      dockerfile: 'dockerfile',
      jenkinsfile: 'groovy',
      makefile: 'makefile',
      gitignore: 'ignore',
      dockerignore: 'ignore',
      license: 'plaintext',
      readme: 'markdown',
    };
    
    const lowerFilename = filename.toLowerCase();
    if (knownFiles[lowerFilename]) {
      return knownFiles[lowerFilename];
    }
  }
  
  return languageMap[extension] || 'plaintext';
};

// Available themes
export const editorThemes = {
  light: 'vs',
  dark: 'vs-dark',
  highContrast: 'hc-black',
  teamSyncLight: 'teamSyncLight',
  teamSyncDark: 'teamSyncDark',
};

// Define custom themes
export const defineCustomThemes = (monaco) => {
  // Team Sync Light Theme
  monaco.editor.defineTheme('teamSyncLight', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#F5F5F5',
      'editor.foreground': '#333333',
      'editor.lineHighlightBackground': '#E0E0E0',
      'editorCursor.foreground': '#666666',
      'editorWhitespace.foreground': '#DDDDDD'
    }
  });
  
  // Team Sync Dark Theme
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
};

// Common editor options presets
export const editorPresets = {
  basic: {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    folding: true,
    automaticLayout: true,
  },
  
  advanced: {
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    renderLineHighlight: 'all',
    suggestOnTriggerCharacters: true,
    formatOnPaste: true,
    formatOnType: true,
    automaticLayout: true,
    renderWhitespace: 'selection',
    renderControlCharacters: true,
    parameterHints: {
      enabled: true,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
  },
  
  readonly: {
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    folding: false,
    automaticLayout: true,
  }
};

// Configure Monaco for specific languages
export const configureLanguages = (monaco) => {
  // JavaScript/TypeScript configuration
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowJs: true,
    esModuleInterop: true,
    typeRoots: ["node_modules/@types"],
  });
  
  // Add basic React/JSX snippets
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        {
          label: 'react-component',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "import React from 'react';\n",
            "\n",
            "const ${1:ComponentName} = () => {\n",
            "  return (\n",
            "    <div>\n",
            "      ${2}\n",
            "    </div>\n",
            "  );\n",
            "};\n",
            "\n",
            "export default ${1:ComponentName};",
          ].join(''),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'React functional component',
        },
        {
          label: 'useState',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialState});",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'React useState hook',
        },
        {
          label: 'useEffect',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "useEffect(() => {\n",
            "  ${1}\n",
            "  return () => {\n",
            "    ${2}\n",
            "  };\n",
            "}, [${3}]);",
          ].join(''),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'React useEffect hook',
        },
      ];
      
      return { suggestions };
    },
  });
  
  // Add HTML snippets
  monaco.languages.registerCompletionItemProvider('html', {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        {
          label: 'html5',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "<!DOCTYPE html>\n",
            "<html lang=\"en\">\n",
            "<head>\n",
            "  <meta charset=\"UTF-8\">\n",
            "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n",
            "  <title>${1:Document}</title>\n",
            "</head>\n",
            "<body>\n",
            "  ${2}\n",
            "</body>\n",
            "</html>",
          ].join(''),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'HTML5 document template',
        },
      ];
      
      return { suggestions };
    },
  });
};

// Helper to create a model from content
export const createModel = (monaco, value, language, path) => {
  return monaco.editor.createModel(
    value,
    language,
    path ? monaco.Uri.parse(path) : undefined
  );
};

// Get file icon based on file extension
export const getFileIcon = (filename) => {
  if (!filename) return 'file';
  
  const extension = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    // JavaScript/TypeScript
    js: 'js',
    jsx: 'jsx',
    ts: 'ts',
    tsx: 'tsx',
    
    // Web
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    svg: 'svg',
    
    // Data formats
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    
    // Markdown/Documentation
    md: 'markdown',
    markdown: 'markdown',
    
    // Programming languages
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    php: 'php',
    rb: 'ruby',
    rs: 'rust',
    
    // Shell/Scripts
    sh: 'shell',
    bash: 'shell',
    
    // Database
    sql: 'database',
    
    // Other
    pdf: 'pdf',
    zip: 'zip',
    tar: 'zip',
    gz: 'zip',
    rar: 'zip',
    '7z': 'zip',
    exe: 'binary',
    dll: 'binary',
    so: 'binary',
    o: 'binary',
    a: 'binary',
    lib: 'binary',
    out: 'binary',
    img: 'image',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    bmp: 'image',
    ico: 'image',
    tif: 'image',
    tiff: 'image',
    mp3: 'audio',
    wav: 'audio',
    ogg: 'audio',
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    wmv: 'video',
    flv: 'video',
    mkv: 'video',
  };
  
  return iconMap[extension] || 'file';
};

// Format code based on language
export const formatCode = (editor, monaco) => {
  if (!editor) return;
  
  editor.getAction('editor.action.formatDocument').run();
};

// Get language server capabilities
export const getLanguageCapabilities = (language) => {
  const capabilities = {
    completion: false,
    hover: false,
    signatureHelp: false,
    definition: false,
    references: false,
    documentHighlight: false,
    documentSymbol: false,
    formatting: false,
    codeAction: false,
    codeLens: false,
    diagnostics: false,
  };
  
  // Languages with good support in Monaco
  const wellSupportedLanguages = [
    'javascript',
    'typescript',
    'html',
    'css',
    'json',
    'markdown'
  ];
  
  // Languages with basic support
  const basicSupportLanguages = [
    'python',
    'java',
    'c',
    'cpp',
    'csharp',
    'go',
    'php',
    'ruby',
    'rust',
    'sql'
  ];
  
  if (wellSupportedLanguages.includes(language)) {
    capabilities.completion = true;
    capabilities.hover = true;
    capabilities.signatureHelp = true;
    capabilities.definition = true;
    capabilities.references = true;
    capabilities.documentHighlight = true;
    capabilities.documentSymbol = true;
    capabilities.formatting = true;
    capabilities.diagnostics = true;
    
    if (['javascript', 'typescript'].includes(language)) {
      capabilities.codeAction = true;
      capabilities.codeLens = true;
    }
  } else if (basicSupportLanguages.includes(language)) {
    capabilities.completion = true;
    capabilities.hover = true;
    capabilities.formatting = true;
  }
  
  return capabilities;
};
