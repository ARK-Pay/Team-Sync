import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const ConverterContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  background-color: ${props => props.active ? '#fff' : '#f5f5f5'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#2196F3' : 'transparent'};
  color: ${props => props.active ? '#2196F3' : '#666'};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#fff' : '#eee'};
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
`;

const OptionGroup = styled.div`
  margin-bottom: 16px;
`;

const OptionLabel = styled.label`
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const Button = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1976D2;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }
`;

const PreviewContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  input {
    margin-right: 8px;
  }
`;

interface ExportSetting {
  target: 'html-css' | 'react' | 'nextjs';
  responsive: boolean;
  cssFramework: 'none' | 'bootstrap' | 'tailwind';
  includeAnimations: boolean;
  optimizeAssets: boolean;
  createComponents: boolean;
  includeResponsiveBreakpoints: boolean;
}

interface TemplateConverterProps {
  canvas: fabric.Canvas | null;
}

const TemplateConverter: React.FC<TemplateConverterProps> = ({ canvas }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'preview' | 'code'>('settings');
  const [exportSettings, setExportSettings] = useState<ExportSetting>({
    target: 'html-css',
    responsive: true,
    cssFramework: 'none',
    includeAnimations: true,
    optimizeAssets: true,
    createComponents: true,
    includeResponsiveBreakpoints: true
  });
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<{html: string, css: string, js: string}>({
    html: '',
    css: '',
    js: ''
  });
  const [isConverting, setIsConverting] = useState(false);
  const [integrationOptions, setIntegrationOptions] = useState<string[]>([
    'Locofy', 'TeleportHQ', 'Anima', 'HTML.to.Design'
  ]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  
  // Update a setting
  const updateSetting = (key: keyof ExportSetting, value: any) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Generate code from the canvas
  const generateCode = () => {
    if (!canvas) return;
    
    setIsConverting(true);
    
    setTimeout(() => {
      // Mock code generation process
      const htmlCode = generateHtmlFromCanvas(canvas, exportSettings);
      const cssCode = generateCssFromCanvas(canvas, exportSettings);
      const jsCode = generateJsFromCanvas(canvas, exportSettings);
      
      setGeneratedCode({
        html: htmlCode,
        css: cssCode,
        js: jsCode
      });
      
      // Create preview HTML
      const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Template</title>
    <style>
      ${cssCode}
    </style>
</head>
<body>
    ${htmlCode}
    <script>
      ${jsCode}
    </script>
</body>
</html>
      `;
      
      setPreviewHtml(fullHtml);
      setIsConverting(false);
      setActiveTab('preview');
    }, 1500);
  };
  
  // Generate HTML code from canvas objects
  const generateHtmlFromCanvas = (canvas: fabric.Canvas, settings: ExportSetting): string => {
    const objects = canvas.getObjects();
    let html = '';
    
    if (settings.target === 'html-css') {
      html += '<div class="container">\n';
      
      objects.forEach((obj, index) => {
        if (obj.type === 'rect') {
          html += `  <div class="box box-${index}" id="box-${index}"></div>\n`;
        } else if (obj.type === 'circle') {
          html += `  <div class="circle circle-${index}" id="circle-${index}"></div>\n`;
        } else if (obj.type === 'text') {
          const text = obj as fabric.Text;
          const content = text.text || '';
          
          if (text.fontSize && text.fontSize > 24) {
            html += `  <h1 class="text text-${index}" id="text-${index}">${content}</h1>\n`;
          } else {
            html += `  <p class="text text-${index}" id="text-${index}">${content}</p>\n`;
          }
        } else if (obj.type === 'image') {
          html += `  <img src="img/image-${index}.png" class="image image-${index}" id="image-${index}" alt="Image ${index}" />\n`;
        } else if (obj.type === 'group') {
          html += `  <div class="group group-${index}" id="group-${index}">
    <!-- Group contents would be placed here -->
  </div>\n`;
        }
      });
      
      html += '</div>';
    } else if (settings.target === 'react') {
      html = `import React from 'react';
import './style.css';

function ConvertedTemplate() {
  return (
    <div className="container">
`;
      
      objects.forEach((obj, index) => {
        if (obj.type === 'rect') {
          html += `      <div className="box box-${index}" id="box-${index}"></div>\n`;
        } else if (obj.type === 'circle') {
          html += `      <div className="circle circle-${index}" id="circle-${index}"></div>\n`;
        } else if (obj.type === 'text') {
          const text = obj as fabric.Text;
          const content = text.text || '';
          
          if (text.fontSize && text.fontSize > 24) {
            html += `      <h1 className="text text-${index}" id="text-${index}">${content}</h1>\n`;
          } else {
            html += `      <p className="text text-${index}" id="text-${index}">${content}</p>\n`;
          }
        } else if (obj.type === 'image') {
          html += `      <img src="img/image-${index}.png" className="image image-${index}" id="image-${index}" alt="Image ${index}" />\n`;
        } else if (obj.type === 'group') {
          html += `      <div className="group group-${index}" id="group-${index}">
        {/* Group contents would be placed here */}
      </div>\n`;
        }
      });
      
      html += `    </div>
  );
}

export default ConvertedTemplate;`;
    }
    
    return html;
  };
  
  // Generate CSS from canvas objects
  const generateCssFromCanvas = (canvas: fabric.Canvas, settings: ExportSetting): string => {
    const objects = canvas.getObjects();
    let css = '';
    
    if (settings.cssFramework === 'none') {
      css += `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
}

.container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
${settings.responsive ? '  overflow: hidden;\n' : ''}
}\n\n`;
      
      objects.forEach((obj, index) => {
        const left = obj.left || 0;
        const top = obj.top || 0;
        const width = obj.width ? obj.width * (obj.scaleX || 1) : 0;
        const height = obj.height ? obj.height * (obj.scaleY || 1) : 0;
        const fill = obj.fill || '#000000';
        
        if (obj.type === 'rect') {
          css += `.box-${index} {
  position: absolute;
  left: ${left}px;
  top: ${top}px;
  width: ${width}px;
  height: ${height}px;
  background-color: ${fill};
${settings.responsive ? `  @media (max-width: 768px) {
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    margin-bottom: 20px;
  }\n` : ''}
}\n\n`;
        } else if (obj.type === 'circle') {
          css += `.circle-${index} {
  position: absolute;
  left: ${left}px;
  top: ${top}px;
  width: ${width}px;
  height: ${height}px;
  border-radius: 50%;
  background-color: ${fill};
${settings.responsive ? `  @media (max-width: 768px) {
    position: relative;
    left: 0;
    top: 0;
    margin: 0 auto;
    margin-bottom: 20px;
  }\n` : ''}
}\n\n`;
        } else if (obj.type === 'text') {
          const text = obj as fabric.Text;
          css += `.text-${index} {
  position: absolute;
  left: ${left}px;
  top: ${top}px;
  font-family: ${text.fontFamily || 'Arial'};
  font-size: ${text.fontSize || 16}px;
  color: ${fill};
  ${text.fontWeight ? `font-weight: ${text.fontWeight};\n` : ''}
  ${text.fontStyle ? `font-style: ${text.fontStyle};\n` : ''}
${settings.responsive ? `  @media (max-width: 768px) {
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
  }\n` : ''}
}\n\n`;
        } else if (obj.type === 'image') {
          css += `.image-${index} {
  position: absolute;
  left: ${left}px;
  top: ${top}px;
  width: ${width}px;
  height: ${height}px;
  object-fit: cover;
${settings.responsive ? `  @media (max-width: 768px) {
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    margin-bottom: 20px;
  }\n` : ''}
}\n\n`;
        } else if (obj.type === 'group') {
          css += `.group-${index} {
  position: absolute;
  left: ${left}px;
  top: ${top}px;
  width: ${width}px;
  height: ${height}px;
${settings.responsive ? `  @media (max-width: 768px) {
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    margin-bottom: 20px;
  }\n` : ''}
}\n\n`;
        }
      });
    } else if (settings.cssFramework === 'bootstrap') {
      // Bootstrap specific CSS would go here
      css = `/* Bootstrap specific overrides */`;
    } else if (settings.cssFramework === 'tailwind') {
      // Tailwind specific CSS would go here
      css = `/* Tailwind specific overrides */`;
    }
    
    return css;
  };
  
  // Generate JS from canvas objects
  const generateJsFromCanvas = (canvas: fabric.Canvas, settings: ExportSetting): string => {
    let js = '';
    
    if (settings.includeAnimations) {
      js = `// Simple animation for elements
document.addEventListener('DOMContentLoaded', function() {
  // Animate elements on page load
  const elements = document.querySelectorAll('.container > *');
  
  elements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 100 * index);
  });
});
`;
    }
    
    return js;
  };
  
  const downloadCode = () => {
    // Create a blob with all code
    const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Template</title>
    <style>
${generatedCode.css}
    </style>
</head>
<body>
${generatedCode.html}
    <script>
${generatedCode.js}
    </script>
</body>
</html>`;
    
    const blob = new Blob([fullCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-template.html';
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  };
  
  const downloadAsZip = () => {
    // In a real implementation, this would use a library like JSZip to create
    // a proper zip file with multiple files (HTML, CSS, JS, assets)
    alert('In a production version, this would download a zip file with all necessary files.');
  };
  
  return (
    <ConverterContainer>
      <PanelHeader>Template to Website Converter</PanelHeader>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </Tab>
        <Tab 
          active={activeTab === 'preview'}
          onClick={() => setActiveTab('preview')}
          disabled={!previewHtml}
        >
          Preview
        </Tab>
        <Tab 
          active={activeTab === 'code'}
          onClick={() => setActiveTab('code')}
          disabled={!generatedCode.html}
        >
          Code
        </Tab>
      </TabsContainer>
      
      <PanelContent>
        {activeTab === 'settings' && (
          <>
            <Section>
              <SectionTitle>Export Settings</SectionTitle>
              
              <OptionGroup>
                <OptionLabel>Target Platform</OptionLabel>
                <Select 
                  value={exportSettings.target}
                  onChange={(e) => updateSetting('target', e.target.value)}
                >
                  <option value="html-css">HTML/CSS</option>
                  <option value="react">React</option>
                  <option value="nextjs">Next.js</option>
                </Select>
              </OptionGroup>
              
              <OptionGroup>
                <OptionLabel>CSS Framework</OptionLabel>
                <Select 
                  value={exportSettings.cssFramework}
                  onChange={(e) => updateSetting('cssFramework', e.target.value)}
                >
                  <option value="none">None (Plain CSS)</option>
                  <option value="bootstrap">Bootstrap</option>
                  <option value="tailwind">Tailwind CSS</option>
                </Select>
              </OptionGroup>
              
              <CheckboxGroup>
                <input 
                  type="checkbox"
                  checked={exportSettings.responsive}
                  onChange={(e) => updateSetting('responsive', e.target.checked)}
                  id="responsive"
                />
                <OptionLabel htmlFor="responsive">Responsive Design</OptionLabel>
              </CheckboxGroup>
              
              <CheckboxGroup>
                <input 
                  type="checkbox"
                  checked={exportSettings.includeAnimations}
                  onChange={(e) => updateSetting('includeAnimations', e.target.checked)}
                  id="includeAnimations"
                />
                <OptionLabel htmlFor="includeAnimations">Include Animations</OptionLabel>
              </CheckboxGroup>
              
              <CheckboxGroup>
                <input 
                  type="checkbox"
                  checked={exportSettings.optimizeAssets}
                  onChange={(e) => updateSetting('optimizeAssets', e.target.checked)}
                  id="optimizeAssets"
                />
                <OptionLabel htmlFor="optimizeAssets">Optimize Assets</OptionLabel>
              </CheckboxGroup>
              
              <CheckboxGroup>
                <input 
                  type="checkbox"
                  checked={exportSettings.createComponents}
                  onChange={(e) => updateSetting('createComponents', e.target.checked)}
                  id="createComponents"
                />
                <OptionLabel htmlFor="createComponents">Create Reusable Components</OptionLabel>
              </CheckboxGroup>
            </Section>
            
            <Section>
              <SectionTitle>Integration Services</SectionTitle>
              <OptionGroup>
                <OptionLabel>Use Integration Service</OptionLabel>
                <Select 
                  value={selectedIntegration}
                  onChange={(e) => setSelectedIntegration(e.target.value)}
                >
                  <option value="">None (Generate Locally)</option>
                  {integrationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
                {selectedIntegration && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    This will send your design to {selectedIntegration} for processing.
                  </div>
                )}
              </OptionGroup>
            </Section>
            
            <Button 
              onClick={generateCode}
              disabled={isConverting}
            >
              {isConverting ? 'Converting...' : 'Generate Website Code'}
            </Button>
          </>
        )}
        
        {activeTab === 'preview' && previewHtml && (
          <>
            <Section>
              <SectionTitle>Preview</SectionTitle>
              <PreviewContainer>
                <iframe 
                  srcDoc={previewHtml}
                  style={{ 
                    width: '100%', 
                    height: '400px', 
                    border: 'none',
                    resize: 'vertical',
                    overflow: 'auto'
                  }}
                  title="Preview"
                />
              </PreviewContainer>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Button onClick={downloadCode}>
                  Download HTML
                </Button>
                <Button 
                  onClick={downloadAsZip}
                  style={{ backgroundColor: '#4CAF50' }}
                >
                  Download as Project
                </Button>
              </div>
            </Section>
          </>
        )}
        
        {activeTab === 'code' && generatedCode.html && (
          <>
            <Section>
              <SectionTitle>HTML</SectionTitle>
              <CodeBlock>{generatedCode.html}</CodeBlock>
            </Section>
            
            <Section>
              <SectionTitle>CSS</SectionTitle>
              <CodeBlock>{generatedCode.css}</CodeBlock>
            </Section>
            
            {generatedCode.js && (
              <Section>
                <SectionTitle>JavaScript</SectionTitle>
                <CodeBlock>{generatedCode.js}</CodeBlock>
              </Section>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={downloadCode}>
                Download Files
              </Button>
              <Button 
                onClick={() => {
                  const el = document.createElement('textarea');
                  el.value = generatedCode.html;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand('copy');
                  document.body.removeChild(el);
                  alert('HTML copied to clipboard!');
                }}
                style={{ backgroundColor: '#FF9800' }}
              >
                Copy HTML
              </Button>
              <Button 
                onClick={() => {
                  const el = document.createElement('textarea');
                  el.value = generatedCode.css;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand('copy');
                  document.body.removeChild(el);
                  alert('CSS copied to clipboard!');
                }}
                style={{ backgroundColor: '#FF9800' }}
              >
                Copy CSS
              </Button>
            </div>
          </>
        )}
      </PanelContent>
    </ConverterContainer>
  );
};

export default TemplateConverter; 