import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const EmbedContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const EmbedHeader = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
`;

const EmbedContent = styled.div`
  padding: 16px;
`;

const EmbedPreview = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
`;

const EmbedCodeContainer = styled.div`
  margin-top: 16px;
`;

const EmbedCode = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: none;
`;

const OptionGroup = styled.div`
  margin-bottom: 16px;
`;

const OptionLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
`;

const OptionSelect = styled.select`
  width: 100%;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0 8px;
`;

const CopyButton = styled.button`
  background-color: #0066ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    background-color: #0052cc;
  }
`;

interface DesignEmbedProps {
  canvas: fabric.Canvas | null;
  projectId: string;
}

const DesignEmbed: React.FC<DesignEmbedProps> = ({ canvas, projectId }) => {
  const [embedMode, setEmbedMode] = useState<'view-only' | 'interactive'>('view-only');
  const [embedSize, setEmbedSize] = useState<'small' | 'medium' | 'large' | 'responsive'>('medium');
  const [embedCode, setEmbedCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  
  // Generate embed code based on options
  useEffect(() => {
    if (!projectId) return;
    
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed/${projectId}?mode=${embedMode}`;
    
    let width = '100%';
    let height = '450px';
    
    switch (embedSize) {
      case 'small':
        width = '400px';
        height = '300px';
        break;
      case 'medium':
        width = '600px';
        height = '450px';
        break;
      case 'large':
        width = '800px';
        height = '600px';
        break;
      case 'responsive':
        width = '100%';
        height = '0';
        break;
    }
    
    const responsiveStyle = embedSize === 'responsive' 
      ? 'style="position: relative; padding-bottom: 75%; height: 0; overflow: hidden;"' 
      : '';
    
    const iframeStyle = embedSize === 'responsive'
      ? 'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;"'
      : '';
    
    const code = `<div ${responsiveStyle}>
  <iframe 
    src="${embedUrl}" 
    width="${width}" 
    height="${height}"
    frameborder="0"
    allowfullscreen
    ${iframeStyle}
  ></iframe>
</div>`;
    
    setEmbedCode(code);
  }, [projectId, embedMode, embedSize]);
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <EmbedContainer>
      <EmbedHeader>Design Preview Embed</EmbedHeader>
      <EmbedContent>
        <OptionGroup>
          <OptionLabel>Embed Mode</OptionLabel>
          <OptionSelect 
            value={embedMode}
            onChange={(e) => setEmbedMode(e.target.value as 'view-only' | 'interactive')}
          >
            <option value="view-only">View Only</option>
            <option value="interactive">Interactive</option>
          </OptionSelect>
        </OptionGroup>
        
        <OptionGroup>
          <OptionLabel>Size</OptionLabel>
          <OptionSelect
            value={embedSize}
            onChange={(e) => setEmbedSize(e.target.value as 'small' | 'medium' | 'large' | 'responsive')}
          >
            <option value="small">Small (400×300)</option>
            <option value="medium">Medium (600×450)</option>
            <option value="large">Large (800×600)</option>
            <option value="responsive">Responsive</option>
          </OptionSelect>
        </OptionGroup>
        
        <EmbedPreview>
          <p>Your design will appear here when embedded.</p>
        </EmbedPreview>
        
        <EmbedCodeContainer>
          <OptionLabel>Embed Code</OptionLabel>
          <EmbedCode 
            value={embedCode}
            readOnly
          />
          <CopyButton onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Code'}
          </CopyButton>
        </EmbedCodeContainer>
      </EmbedContent>
    </EmbedContainer>
  );
};

export default DesignEmbed;
