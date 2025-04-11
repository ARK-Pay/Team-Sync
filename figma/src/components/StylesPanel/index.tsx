import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const StylesPanelContainer = styled.div`
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

const StylesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const ColorStyleItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background-color: ${props => props.color};
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.05);
  }
`;

const StyleName = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TextStyleItem = styled.div`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TextStylePreview = styled.div<{ 
  fontFamily: string; 
  fontSize: number; 
  fontWeight: number | string;
  fontStyle: string;
  textAlign: string;
  color: string;
}>`
  font-family: ${props => props.fontFamily};
  font-size: ${props => props.fontSize}px;
  font-weight: ${props => props.fontWeight};
  font-style: ${props => props.fontStyle};
  text-align: ${props => props.textAlign};
  color: ${props => props.color};
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TextStyleInfo = styled.div`
  font-size: 11px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const CreateStyleButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;
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

const StyleModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 400px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const ColorInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 4px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SaveButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #1976D2;
  }
`;

const Button = styled.button`
  background-color: #0d99ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0a84e1;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface ColorStyle {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  usageCount?: number;
  isGlobal: boolean;
}

interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle: string;
  textAlign: string;
  lineHeight?: number;
  letterSpacing?: number;
  color: string;
  createdAt: Date;
  usageCount?: number;
  isGlobal: boolean;
}

interface StylesPanelProps {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  onApplyStyle: (type: 'color' | 'text', style: ColorStyle | TextStyle) => void;
  onUpdateGlobalStyle: (type: 'color' | 'text', style: ColorStyle | TextStyle) => void;
}

const StylesPanel: React.FC<StylesPanelProps> = ({
  canvas,
  selectedObject,
  onApplyStyle,
  onUpdateGlobalStyle
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'text'>('color');
  const [colorStyles, setColorStyles] = useState<ColorStyle[]>([
    { id: 'color-1', name: 'Primary', color: '#2196F3', createdAt: new Date(), isGlobal: true },
    { id: 'color-2', name: 'Secondary', color: '#FF9800', createdAt: new Date(), isGlobal: true },
    { id: 'color-3', name: 'Success', color: '#4CAF50', createdAt: new Date(), isGlobal: true },
    { id: 'color-4', name: 'Warning', color: '#FFC107', createdAt: new Date(), isGlobal: true },
    { id: 'color-5', name: 'Error', color: '#F44336', createdAt: new Date(), isGlobal: true },
    { id: 'color-6', name: 'Dark', color: '#212121', createdAt: new Date(), isGlobal: true },
    { id: 'color-7', name: 'Light', color: '#FAFAFA', createdAt: new Date(), isGlobal: true }
  ]);
  
  const [textStyles, setTextStyles] = useState<TextStyle[]>([
    {
      id: 'text-1',
      name: 'Heading 1',
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.2,
      color: '#212121',
      createdAt: new Date(),
      isGlobal: true
    },
    {
      id: 'text-2',
      name: 'Heading 2',
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.3,
      color: '#212121',
      createdAt: new Date(),
      isGlobal: true
    },
    {
      id: 'text-3',
      name: 'Body',
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.5,
      color: '#333333',
      createdAt: new Date(),
      isGlobal: true
    },
    {
      id: 'text-4',
      name: 'Caption',
      fontFamily: 'Arial',
      fontSize: 12,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      lineHeight: 1.4,
      color: '#666666',
      createdAt: new Date(),
      isGlobal: true
    }
  ]);
  
  const [isCreatingStyle, setIsCreatingStyle] = useState(false);
  const [isEditingStyle, setIsEditingStyle] = useState(false);
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  
  // New state for style form
  const [newStyleName, setNewStyleName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#000000');
  const [newFontFamily, setNewFontFamily] = useState('Arial');
  const [newFontSize, setNewFontSize] = useState(16);
  const [newFontWeight, setNewFontWeight] = useState<string | number>('normal');
  const [newFontStyle, setNewFontStyle] = useState('normal');
  const [newTextAlign, setNewTextAlign] = useState('left');
  const [newLineHeight, setNewLineHeight] = useState<number>(1.5);
  const [newLetterSpacing, setNewLetterSpacing] = useState<number>(0);
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [isNewStyleGlobal, setIsNewStyleGlobal] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Extract style from selected object
  useEffect(() => {
    if (!selectedObject) return;
    
    if (activeTab === 'color') {
      if (selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'polygon') {
        setNewColorValue(selectedObject.fill as string || '#000000');
      }
    } else if (activeTab === 'text' && selectedObject.type === 'text') {
      setNewFontFamily(selectedObject.fontFamily || 'Arial');
      setNewFontSize(selectedObject.fontSize || 16);
      setNewFontWeight(selectedObject.fontWeight || 'normal');
      setNewFontStyle(selectedObject.fontStyle || 'normal');
      setNewTextAlign(selectedObject.textAlign || 'left');
      setNewLineHeight(selectedObject.lineHeight || 1.5);
      setNewLetterSpacing(selectedObject.charSpacing || 0);
      setNewTextColor(selectedObject.fill as string || '#000000');
    }
  }, [selectedObject, activeTab]);

  // Filter styles based on search query
  const filteredColorStyles = colorStyles.filter(style => 
    style.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTextStyles = textStyles.filter(style => 
    style.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create a new style
  const handleCreateStyle = () => {
    setIsCreatingStyle(true);
    setIsEditingStyle(false);
    setEditingStyleId(null);
    
    if (activeTab === 'color') {
      setNewStyleName('New Color Style');
      
      if (selectedObject) {
        if (selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'polygon') {
          setNewColorValue(selectedObject.fill as string || '#000000');
        }
      }
    } else {
      setNewStyleName('New Text Style');
      
      if (selectedObject && selectedObject.type === 'text') {
        setNewFontFamily(selectedObject.fontFamily || 'Arial');
        setNewFontSize(selectedObject.fontSize || 16);
        setNewFontWeight(selectedObject.fontWeight || 'normal');
        setNewFontStyle(selectedObject.fontStyle || 'normal');
        setNewTextAlign(selectedObject.textAlign || 'left');
        setNewLineHeight(selectedObject.lineHeight || 1.5);
        setNewLetterSpacing(selectedObject.charSpacing || 0);
        setNewTextColor(selectedObject.fill as string || '#000000');
      }
    }
  };

  // Edit an existing style
  const handleEditStyle = (type: 'color' | 'text', id: string) => {
    setIsCreatingStyle(false);
    setIsEditingStyle(true);
    setEditingStyleId(id);
    
    if (type === 'color') {
      const style = colorStyles.find(s => s.id === id);
      if (style) {
        setNewStyleName(style.name);
        setNewColorValue(style.color);
        setIsNewStyleGlobal(style.isGlobal);
      }
    } else {
      const style = textStyles.find(s => s.id === id);
      if (style) {
        setNewStyleName(style.name);
        setNewFontFamily(style.fontFamily);
        setNewFontSize(style.fontSize);
        setNewFontWeight(style.fontWeight);
        setNewFontStyle(style.fontStyle);
        setNewTextAlign(style.textAlign);
        setNewLineHeight(style.lineHeight || 1.5);
        setNewLetterSpacing(style.letterSpacing || 0);
        setNewTextColor(style.color);
        setIsNewStyleGlobal(style.isGlobal);
      }
    }
  };

  // Save the new or edited style
  const handleSaveStyle = () => {
    if (activeTab === 'color') {
      const newStyle: ColorStyle = {
        id: isEditingStyle && editingStyleId ? editingStyleId : `color-${Date.now()}`,
        name: newStyleName,
        color: newColorValue,
        createdAt: new Date(),
        isGlobal: isNewStyleGlobal
      };
      
      if (isEditingStyle && editingStyleId) {
        // Update existing style
        setColorStyles(prev => prev.map(style => 
          style.id === editingStyleId ? newStyle : style
        ));
        
        // If global style is being edited, update all objects that use it
        if (newStyle.isGlobal && canvas) {
          updateObjectsWithStyle('color', newStyle);
          onUpdateGlobalStyle('color', newStyle);
        }
      } else {
        // Add new style
        setColorStyles(prev => [...prev, newStyle]);
      }
    } else {
      const newStyle: TextStyle = {
        id: isEditingStyle && editingStyleId ? editingStyleId : `text-${Date.now()}`,
        name: newStyleName,
        fontFamily: newFontFamily,
        fontSize: newFontSize,
        fontWeight: newFontWeight,
        fontStyle: newFontStyle,
        textAlign: newTextAlign,
        lineHeight: newLineHeight,
        letterSpacing: newLetterSpacing,
        color: newTextColor,
        createdAt: new Date(),
        isGlobal: isNewStyleGlobal
      };
      
      if (isEditingStyle && editingStyleId) {
        // Update existing style
        setTextStyles(prev => prev.map(style => 
          style.id === editingStyleId ? newStyle : style
        ));
        
        // If global style is being edited, update all objects that use it
        if (newStyle.isGlobal && canvas) {
          updateObjectsWithStyle('text', newStyle);
          onUpdateGlobalStyle('text', newStyle);
        }
      } else {
        // Add new style
        setTextStyles(prev => [...prev, newStyle]);
      }
    }
    
    // Reset form
    setIsCreatingStyle(false);
    setIsEditingStyle(false);
    setEditingStyleId(null);
  };

  // Update all objects that use a specific style
  const updateObjectsWithStyle = (type: 'color' | 'text', style: ColorStyle | TextStyle) => {
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    
    objects.forEach(obj => {
      // Check if this object has this style applied
      if (type === 'color' && obj.styleId === style.id) {
        // Update color properties
        obj.set('fill', (style as ColorStyle).color);
        
        // For shapes with stroke using this color, update stroke too
        if (obj.strokeStyleId === style.id) {
          obj.set('stroke', (style as ColorStyle).color);
        }
      } else if (type === 'text' && obj.type === 'text' && obj.styleId === style.id) {
        // Update text properties
        const textStyle = style as TextStyle;
        obj.set({
          fontFamily: textStyle.fontFamily,
          fontSize: textStyle.fontSize,
          fontWeight: textStyle.fontWeight,
          fontStyle: textStyle.fontStyle,
          textAlign: textStyle.textAlign,
          lineHeight: textStyle.lineHeight,
          charSpacing: textStyle.letterSpacing,
          fill: textStyle.color
        });
      }
    });
    
    canvas.renderAll();
  };

  // Apply a color style to the selected object
  const handleApplyColorStyle = (style: ColorStyle) => {
    if (!selectedObject || !canvas) return;
    
    // Apply color to the object
    selectedObject.set({
      fill: style.color,
      // Store the style ID on the object for updates
      styleId: style.id
    });
    
    // For shapes, also apply to stroke if it's selected
    if (selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'polygon') {
      const isStrokeSelected = false; // This would be determined by your UI
      if (isStrokeSelected) {
        selectedObject.set({
          stroke: style.color,
          strokeStyleId: style.id
        });
      }
    }
    
    canvas.renderAll();
    
    // Increment usage count
    const updatedStyle = {...style, usageCount: (style.usageCount || 0) + 1};
    setColorStyles(prev => prev.map(s => s.id === style.id ? updatedStyle : s));
    
    // Notify parent
    onApplyStyle('color', updatedStyle);
  };

  // Apply a text style to the selected object
  const handleApplyTextStyle = (style: TextStyle) => {
    if (!selectedObject || selectedObject.type !== 'text' || !canvas) return;
    
    // Apply text style to the object
    selectedObject.set({
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textAlign: style.textAlign,
      lineHeight: style.lineHeight,
      charSpacing: style.letterSpacing,
      fill: style.color,
      // Store the style ID on the object for updates
      styleId: style.id
    });
    
    canvas.renderAll();
    
    // Increment usage count
    const updatedStyle = {...style, usageCount: (style.usageCount || 0) + 1};
    setTextStyles(prev => prev.map(s => s.id === style.id ? updatedStyle : s));
    
    // Notify parent
    onApplyStyle('text', updatedStyle);
  };

  // Delete a style
  const handleDeleteStyle = (type: 'color' | 'text', id: string) => {
    if (type === 'color') {
      setColorStyles(prev => prev.filter(style => style.id !== id));
    } else {
      setTextStyles(prev => prev.filter(style => style.id !== id));
    }
    
    // Also clean up any objects using this style
    if (canvas) {
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (obj.styleId === id) {
          obj.set('styleId', null);
        }
        if (obj.strokeStyleId === id) {
          obj.set('strokeStyleId', null);
        }
      });
      canvas.renderAll();
    }
  };

  return (
    <StylesPanelContainer>
      <PanelHeader>
        <div>Styles</div>
        <input 
          type="text"
          placeholder="Search styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '12px'
          }}
        />
      </PanelHeader>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'color'}
          onClick={() => setActiveTab('color')}
        >
          Colors
        </Tab>
        <Tab 
          active={activeTab === 'text'}
          onClick={() => setActiveTab('text')}
        >
          Text
        </Tab>
      </TabsContainer>
      
      <PanelContent>
        {isCreatingStyle || isEditingStyle ? (
          // Style creation/editing form
          <div>
            <ModalTitle>
              {isEditingStyle ? 'Edit Style' : 'Create Style'}
            </ModalTitle>
            
            <FormGroup>
              <Label>Name</Label>
              <Input 
                type="text"
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>
                <input 
                  type="checkbox" 
                  checked={isNewStyleGlobal}
                  onChange={(e) => setIsNewStyleGlobal(e.target.checked)}
                />
                Global Style (updates all instances)
              </Label>
            </FormGroup>
            
            {activeTab === 'color' ? (
              <FormGroup>
                <Label>Color</Label>
                <input 
                  type="color"
                  value={newColorValue}
                  onChange={(e) => setNewColorValue(e.target.value)}
                  style={{ width: '100%', height: '40px' }}
                />
              </FormGroup>
            ) : (
              <>
                <FormGroup>
                  <Label>Font Family</Label>
                  <Input 
                    type="text"
                    value={newFontFamily}
                    onChange={(e) => setNewFontFamily(e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Font Size</Label>
                  <Input 
                    type="number"
                    value={newFontSize}
                    onChange={(e) => setNewFontSize(Number(e.target.value))}
                    min="1"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Font Weight</Label>
                  <Input 
                    type="text"
                    value={newFontWeight}
                    onChange={(e) => setNewFontWeight(e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Font Style</Label>
                  <Input 
                    type="text"
                    value={newFontStyle}
                    onChange={(e) => setNewFontStyle(e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Text Align</Label>
                  <Input 
                    type="text"
                    value={newTextAlign}
                    onChange={(e) => setNewTextAlign(e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Line Height</Label>
                  <Input 
                    type="number"
                    value={newLineHeight}
                    onChange={(e) => setNewLineHeight(Number(e.target.value))}
                    min="0.1"
                    step="0.1"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Letter Spacing</Label>
                  <Input 
                    type="number"
                    value={newLetterSpacing}
                    onChange={(e) => setNewLetterSpacing(Number(e.target.value))}
                    step="1"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Text Color</Label>
                  <input 
                    type="color"
                    value={newTextColor}
                    onChange={(e) => setNewTextColor(e.target.value)}
                    style={{ width: '100%', height: '40px' }}
                  />
                </FormGroup>
              </>
            )}
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Button onClick={handleSaveStyle}>
                {isEditingStyle ? 'Update Style' : 'Create Style'}
              </Button>
              <Button 
                onClick={() => {
                  setIsCreatingStyle(false);
                  setIsEditingStyle(false);
                }}
                style={{ 
                  backgroundColor: '#e0e0e0', 
                  color: '#333' 
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'color' ? (
              filteredColorStyles.length > 0 ? (
                <>
                  <StylesGrid>
                    {filteredColorStyles.map(style => (
                      <ColorStyleItem key={style.id}>
                        <ColorSwatch 
                          color={style.color}
                          onClick={() => handleApplyColorStyle(style)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleEditStyle('color', style.id);
                          }}
                          title={`Click to apply, right-click to edit`}
                        >
                          {style.isGlobal && (
                            <span style={{ 
                              position: 'absolute', 
                              top: '-3px', 
                              right: '-3px',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}>
                              G
                            </span>
                          )}
                        </ColorSwatch>
                        <StyleName>{style.name}</StyleName>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          fontSize: '10px',
                          color: '#999',
                          width: '100%'
                        }}>
                          <span>{style.color}</span>
                          <button 
                            onClick={() => handleDeleteStyle('color', style.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#F44336',
                              fontSize: '10px',
                              padding: '0'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </ColorStyleItem>
                    ))}
                  </StylesGrid>
                </>
              ) : (
                <EmptyState>
                  <p>No color styles found</p>
                </EmptyState>
              )
            ) : (
              filteredTextStyles.length > 0 ? (
                <>
                  {filteredTextStyles.map(style => (
                    <TextStyleItem 
                      key={style.id}
                      onClick={() => handleApplyTextStyle(style)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleEditStyle('text', style.id);
                      }}
                    >
                      <TextStylePreview
                        fontFamily={style.fontFamily}
                        fontSize={style.fontSize}
                        fontWeight={style.fontWeight}
                        fontStyle={style.fontStyle}
                        textAlign={style.textAlign}
                        color={style.color}
                      >
                        {style.name}
                        {style.isGlobal && (
                          <span style={{ 
                            marginLeft: '5px',
                            fontSize: '10px',
                            backgroundColor: '#e3f2fd',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            color: '#2196F3'
                          }}>
                            Global
                          </span>
                        )}
                      </TextStylePreview>
                      <TextStyleInfo>
                        {style.fontFamily}, {style.fontSize}px, {style.lineHeight && `${style.lineHeight}x`}
                      </TextStyleInfo>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        marginTop: '4px'
                      }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStyle('text', style.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#F44336',
                            fontSize: '11px',
                            padding: '2px 4px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </TextStyleItem>
                  ))}
                </>
              ) : (
                <EmptyState>
                  <p>No text styles found</p>
                </EmptyState>
              )
            )}
            
            <CreateStyleButton onClick={handleCreateStyle}>
              Create New {activeTab === 'color' ? 'Color' : 'Text'} Style
            </CreateStyleButton>
          </>
        )}
      </PanelContent>
    </StylesPanelContainer>
  );
};

export default StylesPanel;
