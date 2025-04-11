import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiLink, FiCopy, FiCheck, FiMail, FiUsers, FiGlobe, FiLock, FiUser } from 'react-icons/fi';

const SharingContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    color: #333;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
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

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
`;

const LinkInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  margin-left: 8px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #2196F3;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  
  svg {
    margin-right: 4px;
  }
  
  &:hover {
    color: #1976D2;
  }
`;

const PermissionSelector = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const PermissionOption = styled.button<{ active: boolean }>`
  flex: 1;
  border: none;
  background-color: ${props => props.active ? '#e3f2fd' : 'white'};
  color: ${props => props.active ? '#2196F3' : '#666'};
  padding: 10px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
  
  svg {
    margin-bottom: 4px;
    font-size: 18px;
  }
  
  &:hover {
    background-color: ${props => props.active ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const InviteContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const InviteInput = styled.input`
  flex: 1;
  border: 1px solid #e0e0e0;
  border-right: none;
  border-radius: 4px 0 0 4px;
  padding: 8px 12px;
  outline: none;
  font-size: 14px;
  
  &:focus {
    border-color: #2196F3;
  }
`;

const InviteButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 16px;
  cursor: pointer;
  font-size: 14px;
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

const UserList = styled.div`
  margin-top: 20px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e3f2fd;
  color: #2196F3;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: 500;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #666;
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
`;

const UserSelect = styled.select`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  outline: none;
  
  &:focus {
    border-color: #2196F3;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #F44336;
  cursor: pointer;
  margin-left: 8px;
  font-size: 13px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AdvancedSettings = styled.div`
  margin-top: 30px;
`;

const AdvancedToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const AdvancedTitle = styled.div`
  font-size: 14px;
  color: #333;
`;

const AdvancedArrow = styled.div<{ expanded: boolean }>`
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.3s;
`;

const AdvancedContent = styled.div<{ expanded: boolean }>`
  padding: ${props => props.expanded ? '12px 0' : '0'};
  max-height: ${props => props.expanded ? '300px' : '0'};
  overflow: hidden;
  transition: all 0.3s;
`;

const ToggleOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ToggleLabel = styled.label`
  font-size: 14px;
  color: #333;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .3s;
    border-radius: 20px;
  }
  
  span:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
  }
  
  input:checked + span {
    background-color: #2196F3;
  }
  
  input:checked + span:before {
    transform: translateX(20px);
  }
`;

interface User {
  id: string;
  name: string;
  email: string;
  permission: 'view' | 'comment' | 'edit' | 'owner';
}

interface SharingPanelProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

const SharingPanel: React.FC<SharingPanelProps> = ({
  projectId,
  projectName,
  onClose
}) => {
  const [shareLink, setShareLink] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [publicPermission, setPublicPermission] = useState<'private' | 'view' | 'edit'>('private');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [invitePermission, setInvitePermission] = useState<'view' | 'comment' | 'edit'>('view');
  const [users, setUsers] = useState<User[]>([
    { id: 'u1', name: 'You', email: 'you@example.com', permission: 'owner' },
    { id: 'u2', name: 'John Doe', email: 'john@example.com', permission: 'edit' },
    { id: 'u3', name: 'Jane Smith', email: 'jane@example.com', permission: 'comment' }
  ]);
  
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [allowCopy, setAllowCopy] = useState<boolean>(true);
  const [allowDownload, setAllowDownload] = useState<boolean>(true);
  const [requireLogin, setRequireLogin] = useState<boolean>(false);
  
  // Generate share link on component mount
  useEffect(() => {
    const baseUrl = window.location.origin;
    setShareLink(`${baseUrl}/shared/${projectId}`);
  }, [projectId]);
  
  // Copy share link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };
  
  // Invite a user by email
  const inviteUser = () => {
    // Validate email
    if (!inviteEmail || !inviteEmail.includes('@')) return;
    
    const newUser: User = {
      id: `u${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      permission: invitePermission
    };
    
    setUsers(prev => [...prev, newUser]);
    setInviteEmail('');
    
    // In a real app, this would send an invitation email
    console.log(`Invited ${inviteEmail} with ${invitePermission} permission`);
  };
  
  // Update user permission
  const updateUserPermission = (userId: string, permission: 'view' | 'comment' | 'edit' | 'owner') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, permission } : user
    ));
  };
  
  // Remove a user
  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };
  
  // Update public access setting
  const updatePublicAccess = (access: 'private' | 'view' | 'edit') => {
    setPublicPermission(access);
    
    // Update share link with permission if not private
    const baseUrl = window.location.origin;
    if (access === 'private') {
      setShareLink(`${baseUrl}/shared/${projectId}`);
    } else {
      setShareLink(`${baseUrl}/shared/${projectId}?access=${access}`);
    }
  };
  
  return (
    <SharingContainer>
      <Header>
        <Title>Share "{projectName}"</Title>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </Header>
      
      <Content>
        <Section>
          <SectionTitle>Share Link</SectionTitle>
          <LinkContainer>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <LinkInput value={shareLink} readOnly />
            <CopyButton onClick={copyLinkToClipboard}>
              {linkCopied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
              {linkCopied ? 'Copied!' : 'Copy'}
            </CopyButton>
          </LinkContainer>
          
          <SectionTitle>Access</SectionTitle>
          <PermissionSelector>
            <PermissionOption 
              active={publicPermission === 'private'} 
              onClick={() => updatePublicAccess('private')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Private
            </PermissionOption>
            <PermissionOption 
              active={publicPermission === 'view'} 
              onClick={() => updatePublicAccess('view')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Anyone with link
              <small>can view</small>
            </PermissionOption>
            <PermissionOption 
              active={publicPermission === 'edit'} 
              onClick={() => updatePublicAccess('edit')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Anyone with link
              <small>can edit</small>
            </PermissionOption>
          </PermissionSelector>
        </Section>
        
        <Section>
          <SectionTitle>Invite People</SectionTitle>
          <InviteContainer>
            <InviteInput 
              type="email" 
              placeholder="Enter email address" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <InviteButton 
              onClick={inviteUser}
              disabled={!inviteEmail || !inviteEmail.includes('@')}
            >
              Invite
            </InviteButton>
          </InviteContainer>
          
          <UserSelect 
            value={invitePermission}
            onChange={(e) => setInvitePermission(e.target.value as 'view' | 'comment' | 'edit')}
            style={{ marginBottom: '20px' }}
          >
            <option value="view">Can view</option>
            <option value="comment">Can comment</option>
            <option value="edit">Can edit</option>
          </UserSelect>
          
          <UserList>
            {users.map(user => (
              <UserItem key={user.id}>
                <UserInfo>
                  <UserAvatar>
                    {user.name.charAt(0).toUpperCase()}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>{user.name} {user.permission === 'owner' && '(You)'}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </UserDetails>
                </UserInfo>
                <UserActions>
                  {user.permission === 'owner' ? (
                    <div style={{ fontSize: '13px', color: '#666' }}>Owner</div>
                  ) : (
                    <>
                      <UserSelect 
                        value={user.permission}
                        onChange={(e) => updateUserPermission(user.id, e.target.value as 'view' | 'comment' | 'edit' | 'owner')}
                      >
                        <option value="view">Can view</option>
                        <option value="comment">Can comment</option>
                        <option value="edit">Can edit</option>
                      </UserSelect>
                      <RemoveButton onClick={() => removeUser(user.id)}>
                        Remove
                      </RemoveButton>
                    </>
                  )}
                </UserActions>
              </UserItem>
            ))}
          </UserList>
        </Section>
        
        <AdvancedSettings>
          <AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
            <AdvancedTitle>Advanced Settings</AdvancedTitle>
            <AdvancedArrow expanded={showAdvanced}>▼</AdvancedArrow>
          </AdvancedToggle>
          
          <AdvancedContent expanded={showAdvanced}>
            <ToggleOption>
              <ToggleLabel>Allow viewers to copy content</ToggleLabel>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={allowCopy}
                  onChange={() => setAllowCopy(!allowCopy)}
                />
                <span></span>
              </Toggle>
            </ToggleOption>
            
            <ToggleOption>
              <ToggleLabel>Allow viewers to download assets</ToggleLabel>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={allowDownload}
                  onChange={() => setAllowDownload(!allowDownload)}
                />
                <span></span>
              </Toggle>
            </ToggleOption>
            
            <ToggleOption>
              <ToggleLabel>Require login to access</ToggleLabel>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={requireLogin}
                  onChange={() => setRequireLogin(!requireLogin)}
                />
                <span></span>
              </Toggle>
            </ToggleOption>
          </AdvancedContent>
        </AdvancedSettings>
      </Content>
    </SharingContainer>
  );
};

export default SharingPanel; 