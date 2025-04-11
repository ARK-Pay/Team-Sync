import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const InspectPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  width: 300px;
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

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.active ? '#f5f5f5' : 'transparent'};
  border: none;
  border-bottom: ${props => props.active ? '2px solid #2196F3' : 'none'};
  cursor: pointer;
  font-size: 13px;
  font-weight: ${props => props.active ? '500' : 'normal'};
  color: ${props => props.active ? '#2196F3' : '#333'};
  flex: 1;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#f5f5f5' : '#f9f9f9'};
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const PropertySection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  text-transform: uppercase;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const PropertyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
`;

const PropertyLabel = styled.span`
  color: #333;
`;

const PropertyValue = styled.span`
  color: #666;
  font-family: 'Roboto Mono', monospace;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background-color: ${props => props.color};
  margin-right: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ColorProperty = styled.div`
  display: flex;
  align-items: center;
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
  color: #333;
`;

const CopyButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1976D2;
  }
`;

const ExportOptions = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const ExportOption = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  background-color: ${props => props.active ? '#2196F3' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
  
  &:hover {
    background-color: ${props => props.active ? '#1976D2' : '#e0e0e0'};
  }
`;

const RedlineOverlay = styled.div`
  position: absolute;
  pointer-events: none;
  z-index: 1000;
`;

const DimensionLabel = styled.div`
  background-color: #2196F3;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 10px;
  position: absolute;
  white-space: nowrap;
`;

interface InspectPanelProps {
  selectedObject: fabric.Object | null;
  canvas: fabric.Canvas | null;
  selectedObjects?: fabric.Object[];
  showRedlines: boolean;
  setShowRedlines?: (show: boolean) => void;
  onToggleRedlines?: () => void;
}

const InspectPanel: React.FC<InspectPanelProps> = ({
  selectedObject,
  canvas,
  selectedObjects = [],
  showRedlines,
  setShowRedlines,
  onToggleRedlines
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'code' | 'assets'>('properties');
  const [codeFormat, setCodeFormat] = useState<'css' | 'ios' | 'android'>('css');
  const [cssCode, setCssCode] = useState<string>('');
  const [iosCode, setIosCode] = useState<string>('');
  const [androidCode, setAndroidCode] = useState<string>('');

  useEffect(() => {
    if (selectedObject) {
      generateCssCode();
      generateIosCode();
      generateAndroidCode();
    }
  }, [selectedObject]);

  const generateCssCode = () => {
    if (!selectedObject) return;

    let css = '';
    
    // Basic properties
    css += '.selected-element {\n';
    
    // Position and size
    if (selectedObject.width !== undefined && selectedObject.height !== undefined) {
      css += `  width: ${Math.round(selectedObject.width)}px;\n`;
      css += `  height: ${Math.round(selectedObject.height)}px;\n`;
    }
    
    // Fill
    if (selectedObject.fill) {
      css += `  background-color: ${selectedObject.fill};\n`;
    }
    
    // Border
    if (selectedObject.stroke) {
      css += `  border: ${selectedObject.strokeWidth || 1}px solid ${selectedObject.stroke};\n`;
    }
    
    // Border radius
    if (selectedObject.type === 'rect' && (selectedObject as fabric.Rect).rx) {
      const rect = selectedObject as fabric.Rect;
      css += `  border-radius: ${rect.rx}px;\n`;
    }
    
    // Opacity
    if (selectedObject.opacity !== undefined && selectedObject.opacity !== 1) {
      css += `  opacity: ${selectedObject.opacity};\n`;
    }
    
    // Transform
    if (selectedObject.angle && selectedObject.angle !== 0) {
      css += `  transform: rotate(${selectedObject.angle}deg);\n`;
    }
    
    // Text specific properties
    if (selectedObject.type === 'textbox' || selectedObject.type === 'i-text') {
      const textObj = selectedObject as fabric.Textbox;
      
      if (textObj.fontFamily) {
        css += `  font-family: ${textObj.fontFamily};\n`;
      }
      
      if (textObj.fontSize) {
        css += `  font-size: ${textObj.fontSize}px;\n`;
      }
      
      if (textObj.fontWeight) {
        css += `  font-weight: ${textObj.fontWeight};\n`;
      }
      
      if (textObj.fontStyle) {
        css += `  font-style: ${textObj.fontStyle};\n`;
      }
      
      if (textObj.textAlign) {
        css += `  text-align: ${textObj.textAlign};\n`;
      }
      
      if (textObj.lineHeight) {
        css += `  line-height: ${textObj.lineHeight};\n`;
      }
    }
    
    css += '}';
    
    setCssCode(css);
  };

  const generateIosCode = () => {
    if (!selectedObject) return;

    let swift = '';
    
    swift += 'let view = UIView()\n';
    
    // Size
    if (selectedObject.width !== undefined && selectedObject.height !== undefined) {
      swift += `view.frame = CGRect(x: 0, y: 0, width: ${Math.round(selectedObject.width)}, height: ${Math.round(selectedObject.height)})\n`;
    }
    
    // Fill
    if (selectedObject.fill) {
      const color = selectedObject.fill.toString();
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      swift += `view.backgroundColor = UIColor(red: ${r.toFixed(2)}, green: ${g.toFixed(2)}, blue: ${b.toFixed(2)}, alpha: 1.0)\n`;
    }
    
    // Border
    if (selectedObject.stroke) {
      const color = selectedObject.stroke.toString();
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      swift += `view.layer.borderColor = UIColor(red: ${r.toFixed(2)}, green: ${g.toFixed(2)}, blue: ${b.toFixed(2)}, alpha: 1.0).cgColor\n`;
      swift += `view.layer.borderWidth = ${selectedObject.strokeWidth || 1}\n`;
    }
    
    // Border radius
    if (selectedObject.type === 'rect' && (selectedObject as fabric.Rect).rx) {
      const rect = selectedObject as fabric.Rect;
      swift += `view.layer.cornerRadius = ${rect.rx}\n`;
    }
    
    // Opacity
    if (selectedObject.opacity !== undefined && selectedObject.opacity !== 1) {
      swift += `view.alpha = ${selectedObject.opacity}\n`;
    }
    
    // Transform
    if (selectedObject.angle && selectedObject.angle !== 0) {
      swift += `view.transform = CGAffineTransform(rotationAngle: ${(selectedObject.angle * Math.PI / 180).toFixed(2)})\n`;
    }
    
    setIosCode(swift);
  };

  const generateAndroidCode = () => {
    if (!selectedObject) return;

    let xml = '';
    
    xml += '<View\n';
    xml += '    android:layout_width="';
    xml += selectedObject.width !== undefined ? `${Math.round(selectedObject.width)}dp"` : 'wrap_content"';
    xml += '\n';
    
    xml += '    android:layout_height="';
    xml += selectedObject.height !== undefined ? `${Math.round(selectedObject.height)}dp"` : 'wrap_content"';
    xml += '\n';
    
    // Fill
    if (selectedObject.fill) {
      xml += `    android:background="${selectedObject.fill}"\n`;
    }
    
    // Opacity
    if (selectedObject.opacity !== undefined && selectedObject.opacity !== 1) {
      xml += `    android:alpha="${selectedObject.opacity}"\n`;
    }
    
    // Text specific properties
    if (selectedObject.type === 'textbox' || selectedObject.type === 'i-text') {
      const textObj = selectedObject as fabric.Textbox;
      
      xml = xml.replace('<View', '<TextView');
      
      if (textObj.text) {
        xml += `    android:text="${textObj.text}"\n`;
      }
      
      if (textObj.fontSize) {
        xml += `    android:textSize="${textObj.fontSize}sp"\n`;
      }
      
      if (textObj.fontWeight === 'bold') {
        xml += '    android:textStyle="bold"\n';
      }
      
      if (textObj.textAlign) {
        let gravity = 'start';
        switch (textObj.textAlign) {
          case 'center':
            gravity = 'center';
            break;
          case 'right':
            gravity = 'end';
            break;
        }
        xml += `    android:gravity="${gravity}"\n`;
      }
      
      if (textObj.fill) {
        xml += `    android:textColor="${textObj.fill}"\n`;
      }
    }
    
    xml += '/>';
    
    setAndroidCode(xml);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!selectedObject) {
    return (
      <InspectPanelContainer>
        <PanelHeader>Inspect</PanelHeader>
        <PanelContent>
          <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
            Select an element to inspect
          </div>
        </PanelContent>
      </InspectPanelContainer>
    );
  }

  return (
    <InspectPanelContainer>
      <PanelHeader>
        Inspect
        <button 
          style={{
            background: showRedlines ? '#2196F3' : 'transparent',
            color: showRedlines ? 'white' : '#333',
            border: showRedlines ? 'none' : '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (setShowRedlines) {
              setShowRedlines(!showRedlines);
            } else if (onToggleRedlines) {
              onToggleRedlines();
            }
          }}
        >
          {showRedlines ? 'Hide Redlines' : 'Show Redlines'}
        </button>
      </PanelHeader>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'properties'} 
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </Tab>
        <Tab 
          active={activeTab === 'code'} 
          onClick={() => setActiveTab('code')}
        >
          Code
        </Tab>
        <Tab 
          active={activeTab === 'assets'} 
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </Tab>
      </TabContainer>
      
      <PanelContent>
        {activeTab === 'properties' && (
          <>
            <PropertySection>
              <SectionTitle>Dimensions</SectionTitle>
              <PropertyRow>
                <PropertyLabel>Width</PropertyLabel>
                <PropertyValue>{Math.round(selectedObject.width || 0)}px</PropertyValue>
              </PropertyRow>
              <PropertyRow>
                <PropertyLabel>Height</PropertyLabel>
                <PropertyValue>{Math.round(selectedObject.height || 0)}px</PropertyValue>
              </PropertyRow>
              {selectedObject.left !== undefined && selectedObject.top !== undefined && (
                <>
                  <PropertyRow>
                    <PropertyLabel>X</PropertyLabel>
                    <PropertyValue>{Math.round(selectedObject.left)}px</PropertyValue>
                  </PropertyRow>
                  <PropertyRow>
                    <PropertyLabel>Y</PropertyLabel>
                    <PropertyValue>{Math.round(selectedObject.top)}px</PropertyValue>
                  </PropertyRow>
                </>
              )}
              {selectedObject.angle !== undefined && selectedObject.angle !== 0 && (
                <PropertyRow>
                  <PropertyLabel>Rotation</PropertyLabel>
                  <PropertyValue>{Math.round(selectedObject.angle)}°</PropertyValue>
                </PropertyRow>
              )}
            </PropertySection>
            
            <PropertySection>
              <SectionTitle>Appearance</SectionTitle>
              {selectedObject.fill && (
                <PropertyRow>
                  <PropertyLabel>Fill</PropertyLabel>
                  <ColorProperty>
                    <ColorSwatch color={selectedObject.fill.toString()} />
                    <PropertyValue>{selectedObject.fill.toString().toUpperCase()}</PropertyValue>
                  </ColorProperty>
                </PropertyRow>
              )}
              {selectedObject.stroke && (
                <PropertyRow>
                  <PropertyLabel>Border</PropertyLabel>
                  <ColorProperty>
                    <ColorSwatch color={selectedObject.stroke.toString()} />
                    <PropertyValue>{selectedObject.stroke.toString().toUpperCase()}</PropertyValue>
                  </ColorProperty>
                </PropertyRow>
              )}
              {selectedObject.strokeWidth !== undefined && selectedObject.strokeWidth > 0 && (
                <PropertyRow>
                  <PropertyLabel>Border Width</PropertyLabel>
                  <PropertyValue>{selectedObject.strokeWidth}px</PropertyValue>
                </PropertyRow>
              )}
              {selectedObject.type === 'rect' && (selectedObject as fabric.Rect).rx && (
                <PropertyRow>
                  <PropertyLabel>Border Radius</PropertyLabel>
                  <PropertyValue>{(selectedObject as fabric.Rect).rx}px</PropertyValue>
                </PropertyRow>
              )}
              {selectedObject.opacity !== undefined && (
                <PropertyRow>
                  <PropertyLabel>Opacity</PropertyLabel>
                  <PropertyValue>{Math.round(selectedObject.opacity * 100)}%</PropertyValue>
                </PropertyRow>
              )}
            </PropertySection>
            
            {(selectedObject.type === 'textbox' || selectedObject.type === 'i-text') && (
              <PropertySection>
                <SectionTitle>Text</SectionTitle>
                {(selectedObject as fabric.Textbox).fontFamily && (
                  <PropertyRow>
                    <PropertyLabel>Font</PropertyLabel>
                    <PropertyValue>{(selectedObject as fabric.Textbox).fontFamily}</PropertyValue>
                  </PropertyRow>
                )}
                {(selectedObject as fabric.Textbox).fontSize && (
                  <PropertyRow>
                    <PropertyLabel>Size</PropertyLabel>
                    <PropertyValue>{(selectedObject as fabric.Textbox).fontSize}px</PropertyValue>
                  </PropertyRow>
                )}
                {(selectedObject as fabric.Textbox).fontWeight && (
                  <PropertyRow>
                    <PropertyLabel>Weight</PropertyLabel>
                    <PropertyValue>{(selectedObject as fabric.Textbox).fontWeight}</PropertyValue>
                  </PropertyRow>
                )}
                {(selectedObject as fabric.Textbox).textAlign && (
                  <PropertyRow>
                    <PropertyLabel>Alignment</PropertyLabel>
                    <PropertyValue>{(selectedObject as fabric.Textbox).textAlign}</PropertyValue>
                  </PropertyRow>
                )}
                {(selectedObject as fabric.Textbox).lineHeight && (
                  <PropertyRow>
                    <PropertyLabel>Line Height</PropertyLabel>
                    <PropertyValue>{(selectedObject as fabric.Textbox).lineHeight}</PropertyValue>
                  </PropertyRow>
                )}
              </PropertySection>
            )}
          </>
        )}
        
        {activeTab === 'code' && (
          <>
            <ExportOptions>
              <ExportOption 
                active={codeFormat === 'css'} 
                onClick={() => setCodeFormat('css')}
              >
                CSS
              </ExportOption>
              <ExportOption 
                active={codeFormat === 'ios'} 
                onClick={() => setCodeFormat('ios')}
              >
                iOS (Swift)
              </ExportOption>
              <ExportOption 
                active={codeFormat === 'android'} 
                onClick={() => setCodeFormat('android')}
              >
                Android
              </ExportOption>
            </ExportOptions>
            
            {codeFormat === 'css' && (
              <>
                <CodeBlock>{cssCode}</CodeBlock>
                <CopyButton onClick={() => copyToClipboard(cssCode)}>
                  Copy CSS
                </CopyButton>
              </>
            )}
            
            {codeFormat === 'ios' && (
              <>
                <CodeBlock>{iosCode}</CodeBlock>
                <CopyButton onClick={() => copyToClipboard(iosCode)}>
                  Copy Swift
                </CopyButton>
              </>
            )}
            
            {codeFormat === 'android' && (
              <>
                <CodeBlock>{androidCode}</CodeBlock>
                <CopyButton onClick={() => copyToClipboard(androidCode)}>
                  Copy XML
                </CopyButton>
              </>
            )}
          </>
        )}
        
        {activeTab === 'assets' && (
          <div>
            <PropertySection>
              <SectionTitle>Export</SectionTitle>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 8px 0' }}>
                  Export this element as an image
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={() => {
                      if (selectedObject && canvas) {
                        try {
                          const tempCanvas = new fabric.Canvas(document.createElement('canvas'), {
                            width: Math.round(selectedObject.width || 100) + 40,
                            height: Math.round(selectedObject.height || 100) + 40
                          });
                          
                          let exportObject;
                          
                          if (selectedObject.type === 'rect') {
                            const rect = selectedObject as fabric.Rect;
                            exportObject = new fabric.Rect({
                              width: rect.width,
                              height: rect.height,
                              fill: rect.fill,
                              stroke: rect.stroke,
                              strokeWidth: rect.strokeWidth,
                              rx: rect.rx,
                              ry: rect.ry,
                              left: 20,
                              top: 20
                            });
                          } else if (selectedObject.type === 'circle') {
                            const circle = selectedObject as fabric.Circle;
                            exportObject = new fabric.Circle({
                              radius: circle.radius,
                              fill: circle.fill,
                              stroke: circle.stroke,
                              strokeWidth: circle.strokeWidth,
                              left: 20,
                              top: 20
                            });
                          } else if (selectedObject.type === 'triangle') {
                            const triangle = selectedObject as fabric.Triangle;
                            exportObject = new fabric.Triangle({
                              width: triangle.width,
                              height: triangle.height,
                              fill: triangle.fill,
                              stroke: triangle.stroke,
                              strokeWidth: triangle.strokeWidth,
                              left: 20,
                              top: 20
                            });
                          } else if (selectedObject.type === 'textbox' || selectedObject.type === 'i-text') {
                            const text = selectedObject as fabric.Textbox;
                            exportObject = new fabric.Textbox(text.text || '', {
                              width: text.width,
                              fontSize: text.fontSize,
                              fontFamily: text.fontFamily,
                              fill: text.fill,
                              textAlign: text.textAlign,
                              left: 20,
                              top: 20
                            });
                          } else {
                            exportObject = new fabric.Rect({
                              width: selectedObject.width,
                              height: selectedObject.height,
                              fill: selectedObject.fill as string,
                              left: 20,
                              top: 20
                            });
                          }
                          
                          tempCanvas.add(exportObject);
                          tempCanvas.renderAll();
                          
                          const dataURL = tempCanvas.toDataURL({
                            format: 'png',
                            quality: 1,
                            multiplier: 1,
                            enableRetinaScaling: false
                          });
                          
                          const link = document.createElement('a');
                          link.download = 'element.png';
                          link.href = dataURL;
                          link.click();
                          
                          tempCanvas.dispose();
                        } catch (error) {
                          console.error('Error exporting object:', error);
                          alert('Failed to export the selected object. Please try again with a different object.');
                        }
                      }
                    }}
                  >
                    PNG
                  </button>
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={() => {
                      if (selectedObject && canvas) {
                        // For SVG export (simplified)
                        alert('SVG export would be implemented here');
                      }
                    }}
                  >
                    SVG
                  </button>
                </div>
              </div>
            </PropertySection>
          </div>
        )}
      </PanelContent>
    </InspectPanelContainer>
  );
};

export default InspectPanel;
