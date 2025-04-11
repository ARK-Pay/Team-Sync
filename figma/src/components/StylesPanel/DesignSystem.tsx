import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiCopy, FiEye, FiGrid, FiType, FiDroplet, FiBox, FiLayers } from 'react-icons/fi';

// Styled components for the Design System
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-left: 1px solid var(--neutral-200);
  width: 300px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--neutral-200);
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--neutral-900);
  margin: 0;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--neutral-200);
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  font-size: 13px;
  color: ${props => props.active ? 'var(--primary-500)' : 'var(--neutral-600)'};
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-500)' : 'transparent'};
  background-color: ${props => props.active ? 'var(--primary-50)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-600)' : 'var(--neutral-900)'};
    background-color: ${props => props.active ? 'var(--primary-100)' : 'var(--neutral-50)'};
  }
  
  svg {
    width: 16px;
    height: 16px;
    margin-right: 6px;
    vertical-align: text-bottom;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const SectionTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: var(--neutral-700);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: var(--neutral-600);
  
  &:hover {
    background-color: var(--neutral-100);
    color: var(--neutral-900);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 24px;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 100%;
  aspect-ratio: 1;
  background-color: ${props => props.color};
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  border: 1px solid var(--neutral-200);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SwatchName = styled.div`
  font-size: 11px;
  color: var(--neutral-700);
  text-align: center;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TextStyleItem = styled.div`
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--neutral-200);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-300);
    background-color: var(--neutral-50);
  }
`;

const TextStylePreview = styled.div<{ 
  fontSize: string; 
  fontWeight: string; 
  fontFamily: string;
  lineHeight: string;
}>`
  font-size: ${props => props.fontSize};
  font-weight: ${props => props.fontWeight};
  font-family: ${props => props.fontFamily};
  line-height: ${props => props.lineHeight};
  color: var(--neutral-900);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TextStyleMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--neutral-500);
`;

const EffectItem = styled.div`
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--neutral-200);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-300);
    background-color: var(--neutral-50);
  }
`;

const EffectPreview = styled.div<{ shadow: string }>`
  height: 40px;
  border-radius: 4px;
  background-color: white;
  box-shadow: ${props => props.shadow};
  margin-bottom: 8px;
`;

const EffectName = styled.div`
  font-size: 12px;
  color: var(--neutral-700);
`;

const EffectValue = styled.div`
  font-size: 11px;
  color: var(--neutral-500);
  font-family: monospace;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GridItem = styled.div`
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--neutral-200);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-300);
    background-color: var(--neutral-50);
  }
`;

const GridPreview = styled.div`
  height: 40px;
  border-radius: 4px;
  background-color: white;
  position: relative;
  margin-bottom: 8px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(to right, var(--neutral-200) 1px, transparent 1px),
                      linear-gradient(to bottom, var(--neutral-200) 1px, transparent 1px);
    background-size: 8px 8px;
  }
`;

const GridName = styled.div`
  font-size: 12px;
  color: var(--neutral-700);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  
  svg {
    width: 24px;
    height: 24px;
    color: var(--neutral-400);
  }
`;

const EmptyStateTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-700);
  margin: 0 0 8px 0;
`;

const EmptyStateText = styled.p`
  font-size: 13px;
  color: var(--neutral-500);
  margin: 0 0 16px 0;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--primary-500);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-600);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Types for design system items
interface ColorStyle {
  id: string;
  name: string;
  value: string;
}

interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}

interface EffectStyle {
  id: string;
  name: string;
  type: 'shadow' | 'blur';
  value: string;
}

interface GridStyle {
  id: string;
  name: string;
  columns: number;
  gutter: number;
  margin: number;
}

interface DesignSystemProps {
  onApplyStyle: (type: string, style: any) => void;
  onCreateStyle: (type: string) => void;
}

const DesignSystem: React.FC<DesignSystemProps> = ({
  onApplyStyle,
  onCreateStyle
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'effects' | 'grid'>('colors');
  
  // Mock data for design system items
  const colorStyles: ColorStyle[] = [
    { id: '1', name: 'Primary', value: '#4361ee' },
    { id: '2', name: 'Secondary', value: '#3f37c9' },
    { id: '3', name: 'Accent', value: '#4cc9f0' },
    { id: '4', name: 'Success', value: '#4ade80' },
    { id: '5', name: 'Warning', value: '#fbbf24' },
    { id: '6', name: 'Error', value: '#f87171' },
    { id: '7', name: 'Gray 100', value: '#f3f4f6' },
    { id: '8', name: 'Gray 200', value: '#e5e7eb' }
  ];
  
  const textStyles: TextStyle[] = [
    { 
      id: '1', 
      name: 'Heading 1', 
      fontFamily: 'Inter, sans-serif', 
      fontSize: '32px', 
      fontWeight: '700', 
      lineHeight: '1.2', 
      letterSpacing: '-0.01em' 
    },
    { 
      id: '2', 
      name: 'Heading 2', 
      fontFamily: 'Inter, sans-serif', 
      fontSize: '24px', 
      fontWeight: '600', 
      lineHeight: '1.3', 
      letterSpacing: '-0.01em' 
    },
    { 
      id: '3', 
      name: 'Body', 
      fontFamily: 'Inter, sans-serif', 
      fontSize: '16px', 
      fontWeight: '400', 
      lineHeight: '1.5', 
      letterSpacing: 'normal' 
    }
  ];
  
  const effectStyles: EffectStyle[] = [
    { 
      id: '1', 
      name: 'Shadow SM', 
      type: 'shadow', 
      value: '0 1px 2px rgba(0, 0, 0, 0.05)' 
    },
    { 
      id: '2', 
      name: 'Shadow MD', 
      type: 'shadow', 
      value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
    },
    { 
      id: '3', 
      name: 'Shadow LG', 
      type: 'shadow', 
      value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
    }
  ];
  
  const gridStyles: GridStyle[] = [
    { id: '1', name: '12 Column Grid', columns: 12, gutter: 16, margin: 24 },
    { id: '2', name: '8 Column Grid', columns: 8, gutter: 24, margin: 32 }
  ];
  
  return (
    <Container>
      <Header>
        <Title>Design System</Title>
      </Header>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'colors'} 
          onClick={() => setActiveTab('colors')}
        >
          <FiDroplet />
          Colors
        </Tab>
        <Tab 
          active={activeTab === 'typography'} 
          onClick={() => setActiveTab('typography')}
        >
          <FiType />
          Typography
        </Tab>
        <Tab 
          active={activeTab === 'effects'} 
          onClick={() => setActiveTab('effects')}
        >
          <FiLayers />
          Effects
        </Tab>
        <Tab 
          active={activeTab === 'grid'} 
          onClick={() => setActiveTab('grid')}
        >
          <FiGrid />
          Grid
        </Tab>
      </TabsContainer>
      
      <Content>
        {activeTab === 'colors' && (
          <>
            <SectionTitle>
              Color Styles
              <AddButton onClick={() => onCreateStyle('color')}>
                <FiPlus />
              </AddButton>
            </SectionTitle>
            
            {colorStyles.length > 0 ? (
              <Grid>
                {colorStyles.map(color => (
                  <div key={color.id} onClick={() => onApplyStyle('color', color)}>
                    <ColorSwatch color={color.value} />
                    <SwatchName>{color.name}</SwatchName>
                  </div>
                ))}
              </Grid>
            ) : (
              <EmptyState>
                <EmptyStateIcon>
                  <FiDroplet />
                </EmptyStateIcon>
                <EmptyStateTitle>No color styles yet</EmptyStateTitle>
                <EmptyStateText>
                  Create color styles to maintain consistency across your designs
                </EmptyStateText>
                <CreateButton onClick={() => onCreateStyle('color')}>
                  <FiPlus />
                  Create Color Style
                </CreateButton>
              </EmptyState>
            )}
          </>
        )}
        
        {activeTab === 'typography' && (
          <>
            <SectionTitle>
              Text Styles
              <AddButton onClick={() => onCreateStyle('text')}>
                <FiPlus />
              </AddButton>
            </SectionTitle>
            
            {textStyles.length > 0 ? (
              <>
                {textStyles.map(style => (
                  <TextStyleItem 
                    key={style.id}
                    onClick={() => onApplyStyle('text', style)}
                  >
                    <TextStylePreview
                      fontSize={style.fontSize}
                      fontWeight={style.fontWeight}
                      fontFamily={style.fontFamily}
                      lineHeight={style.lineHeight}
                    >
                      {style.name}
                    </TextStylePreview>
                    <TextStyleMeta>
                      <span>{style.fontFamily}</span>
                      <span>{style.fontSize}/{style.lineHeight}</span>
                    </TextStyleMeta>
                  </TextStyleItem>
                ))}
              </>
            ) : (
              <EmptyState>
                <EmptyStateIcon>
                  <FiType />
                </EmptyStateIcon>
                <EmptyStateTitle>No text styles yet</EmptyStateTitle>
                <EmptyStateText>
                  Create text styles to maintain consistent typography
                </EmptyStateText>
                <CreateButton onClick={() => onCreateStyle('text')}>
                  <FiPlus />
                  Create Text Style
                </CreateButton>
              </EmptyState>
            )}
          </>
        )}
        
        {activeTab === 'effects' && (
          <>
            <SectionTitle>
              Effect Styles
              <AddButton onClick={() => onCreateStyle('effect')}>
                <FiPlus />
              </AddButton>
            </SectionTitle>
            
            {effectStyles.length > 0 ? (
              <>
                {effectStyles.map(effect => (
                  <EffectItem 
                    key={effect.id}
                    onClick={() => onApplyStyle('effect', effect)}
                  >
                    <EffectPreview shadow={effect.value} />
                    <EffectName>{effect.name}</EffectName>
                    <EffectValue>{effect.value}</EffectValue>
                  </EffectItem>
                ))}
              </>
            ) : (
              <EmptyState>
                <EmptyStateIcon>
                  <FiLayers />
                </EmptyStateIcon>
                <EmptyStateTitle>No effect styles yet</EmptyStateTitle>
                <EmptyStateText>
                  Create effect styles like shadows and blurs
                </EmptyStateText>
                <CreateButton onClick={() => onCreateStyle('effect')}>
                  <FiPlus />
                  Create Effect Style
                </CreateButton>
              </EmptyState>
            )}
          </>
        )}
        
        {activeTab === 'grid' && (
          <>
            <SectionTitle>
              Grid Styles
              <AddButton onClick={() => onCreateStyle('grid')}>
                <FiPlus />
              </AddButton>
            </SectionTitle>
            
            {gridStyles.length > 0 ? (
              <>
                {gridStyles.map(grid => (
                  <GridItem 
                    key={grid.id}
                    onClick={() => onApplyStyle('grid', grid)}
                  >
                    <GridPreview />
                    <GridName>{grid.name}</GridName>
                    <EffectValue>
                      {grid.columns} columns, {grid.gutter}px gutter, {grid.margin}px margin
                    </EffectValue>
                  </GridItem>
                ))}
              </>
            ) : (
              <EmptyState>
                <EmptyStateIcon>
                  <FiGrid />
                </EmptyStateIcon>
                <EmptyStateTitle>No grid styles yet</EmptyStateTitle>
                <EmptyStateText>
                  Create grid styles for consistent layouts
                </EmptyStateText>
                <CreateButton onClick={() => onCreateStyle('grid')}>
                  <FiPlus />
                  Create Grid Style
                </CreateButton>
              </EmptyState>
            )}
          </>
        )}
      </Content>
    </Container>
  );
};

export default DesignSystem;
