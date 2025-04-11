import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as fabric from 'fabric';

const CommentingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
`;

const CommentMarker = styled.div<{ active: boolean }>`
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: ${props => props.active ? '#2196F3' : '#FFC107'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -50%);
  transition: background-color 0.2s, transform 0.2s;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const CommentPanel = styled.div<{ visible: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  width: 320px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 200;
  transform: translateX(${props => props.visible ? '0' : '100%'});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
`;

const PanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const CommentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const CommentItem = styled.div<{ active: boolean }>`
  padding: 12px;
  border-radius: 8px;
  background-color: ${props => props.active ? '#e3f2fd' : '#f5f5f5'};
  margin-bottom: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#e3f2fd' : '#eeeeee'};
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const CommentTime = styled.div`
  font-size: 12px;
  color: #999;
`;

const CommentContent = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
`;

const CommentActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CommentButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
`;

const ReplyButton = styled(CommentButton)`
  color: #2196F3;
  
  &:hover {
    background-color: #e3f2fd;
    color: #1976D2;
  }
`;

const ResolveButton = styled(CommentButton)<{ resolved: boolean }>`
  color: ${props => props.resolved ? '#4CAF50' : '#666'};
  
  &:hover {
    background-color: ${props => props.resolved ? '#E8F5E9' : '#e0e0e0'};
    color: ${props => props.resolved ? '#388E3C' : '#333'};
  }
`;

const RepliesList = styled.div`
  margin-top: 12px;
  margin-left: 16px;
  border-left: 2px solid #e0e0e0;
  padding-left: 12px;
`;

const ReplyItem = styled.div`
  padding: 8px 0;
`;

const ReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ReplyAuthor = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 13px;
`;

const ReplyTime = styled.div`
  font-size: 11px;
  color: #999;
`;

const ReplyContent = styled.div`
  font-size: 13px;
  color: #333;
`;

const CommentInput = styled.div`
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const SubmitButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  float: right;
  
  &:hover {
    background-color: #1976D2;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }
`;

const CommentModeToggle = styled.button<{ active: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: ${props => props.active ? '#2196F3' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? '#2196F3' : '#e0e0e0'};
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background-color: ${props => props.active ? '#1976D2' : '#f5f5f5'};
  }
`;

interface Reply {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: number;
  mentions: string[]; // Array of user IDs that are mentioned
}

interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  position: { x: number; y: number };
  objectId?: string;
  timestamp: number;
  resolved: boolean;
  replies: Reply[];
  mentions: string[]; // Array of user IDs that are mentioned
}

interface CommentingModeProps {
  canvas: fabric.Canvas | null;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  currentUser: {
    id: string;
    name: string;
  };
  collaborators?: {
    id: string;
    name: string;
  }[];
}

const CommentingMode: React.FC<CommentingModeProps> = ({
  canvas,
  isActive,
  setIsActive,
  currentUser,
  collaborators = []
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentPosition, setNewCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [showMentionsSuggestions, setShowMentionsSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Load comments from localStorage on mount
  useEffect(() => {
    const savedComments = localStorage.getItem('figmaCloneComments');
    
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (error) {
        console.error('Failed to parse saved comments:', error);
      }
    }
  }, []);
  
  // Save comments to localStorage when they change
  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem('figmaCloneComments', JSON.stringify(comments));
    }
  }, [comments]);
  
  // Filter comments based on selected filter
  useEffect(() => {
    if (filter === 'all') {
      setFilteredComments(comments);
    } else if (filter === 'resolved') {
      setFilteredComments(comments.filter(comment => comment.resolved));
    } else if (filter === 'unresolved') {
      setFilteredComments(comments.filter(comment => !comment.resolved));
    }
  }, [comments, filter]);
  
  // Highlight object when hovering over its comment
  useEffect(() => {
    if (!canvas || !hoveredCommentId) return;
    
    const comment = comments.find(c => c.id === hoveredCommentId);
    if (!comment || !comment.objectId) return;
    
    const object = canvas.getObjects().find(obj => obj.id === comment.objectId);
    if (!object) return;
    
    // Store original state
    const originalOpacity = object.opacity || 1;
    
    // Highlight the object
    object.set('opacity', 0.5);
    canvas.renderAll();
    
    // Restore original state when hover ends
    return () => {
      if (object) {
        object.set('opacity', originalOpacity);
        canvas.renderAll();
      }
    };
  }, [canvas, hoveredCommentId, comments]);
  
  // Set up canvas click handler when commenting mode is active
  useEffect(() => {
    if (!canvas || !isActive) return;
    
    const handleCanvasClick = (options: fabric.TEvent<MouseEvent>) => {
      if (!isActive) return;
      
      // Get click position
      const pointer = canvas.getPointer(options.e);
      
      // Check if we clicked on an object
      const clickedObject = canvas.findTarget(options.e);
      
      // Create a new comment
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        author: currentUser.name,
        authorId: currentUser.id,
        content: '',
        position: { x: pointer.x, y: pointer.y },
        objectId: clickedObject ? (clickedObject as any)._id || undefined : undefined,
        timestamp: Date.now(),
        resolved: false,
        replies: [],
        mentions: []
      };
      
      // Add the comment
      setComments(prev => [...prev, newComment]);
      
      // Set as active comment
      setActiveComment(newComment.id);
      
      // Show the panel
      setShowPanel(true);
    };
    
    // Add event listener
    canvas.on('mouse:down', handleCanvasClick as any);
    
    return () => {
      canvas.off('mouse:down', handleCanvasClick as any);
    };
  }, [canvas, isActive, currentUser]);
  
  // Toggle commenting mode
  const toggleCommentingMode = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setShowPanel(true);
    }
  };
  
  // Add a new comment
  const addComment = () => {
    if (!newCommentText.trim()) return;
    
    setComments(prev => prev.map(comment => 
      comment.id === activeComment
        ? { ...comment, content: newCommentText }
        : comment
    ));
    
    setNewCommentText('');
  };
  
  // Add a reply to a comment
  const addReply = (commentId: string) => {
    if (!replyText.trim()) return;
    
    const newReply: Reply = {
      id: `reply-${Date.now()}`,
      author: currentUser.name,
      authorId: currentUser.id,
      content: replyText,
      timestamp: Date.now(),
      mentions: []
    };
    
    setComments(prev => prev.map(comment => 
      comment.id === commentId
        ? { 
            ...comment, 
            replies: [...comment.replies, newReply] 
          }
        : comment
    ));
    
    setReplyText('');
    setReplyingTo(null);
  };
  
  // Toggle resolve status of a comment
  const toggleResolve = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId
        ? { ...comment, resolved: !comment.resolved }
        : comment
    ));
  };
  
  // Delete a comment
  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    if (activeComment === commentId) {
      setActiveComment(null);
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <>
      <CommentModeToggle 
        active={isActive}
        onClick={toggleCommentingMode}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        {isActive ? 'Exit Comment Mode' : 'Comment Mode'}
      </CommentModeToggle>
      
      <CommentingContainer ref={containerRef}>
        {comments.map((comment, index) => (
          <CommentMarker 
            key={comment.id}
            style={{ 
              left: `${comment.position.x}px`, 
              top: `${comment.position.y}px` 
            }}
            active={activeComment === comment.id}
            onClick={() => {
              setActiveComment(comment.id);
              setShowPanel(true);
            }}
          >
            {index + 1}
          </CommentMarker>
        ))}
      </CommentingContainer>
      
      <CommentPanel visible={showPanel}>
        <PanelHeader>
          <PanelTitle>Comments</PanelTitle>
          <CloseButton onClick={() => setShowPanel(false)}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </CloseButton>
        </PanelHeader>
        
        <CommentsList>
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
              <p>No comments yet.</p>
              <p>Click on the canvas in comment mode to add a comment.</p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <CommentItem 
                key={comment.id}
                active={activeComment === comment.id}
                onClick={() => setActiveComment(comment.id)}
              >
                <CommentHeader>
                  <CommentAuthor>{comment.author}</CommentAuthor>
                  <CommentTime>{formatTime(comment.timestamp)}</CommentTime>
                </CommentHeader>
                
                {comment.content ? (
                  <CommentContent>{comment.content}</CommentContent>
                ) : (
                  activeComment === comment.id && (
                    <TextArea 
                      placeholder="Add a comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      autoFocus
                    />
                  )
                )}
                
                {comment.content && (
                  <CommentActions>
                    <div>
                      <ReplyButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyingTo(replyingTo === comment.id ? null : comment.id);
                        }}
                      >
                        Reply
                      </ReplyButton>
                      <ResolveButton 
                        resolved={comment.resolved}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleResolve(comment.id);
                        }}
                      >
                        {comment.resolved ? 'Resolved' : 'Resolve'}
                      </ResolveButton>
                    </div>
                    {comment.authorId === currentUser.id && (
                      <CommentButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteComment(comment.id);
                        }}
                      >
                        Delete
                      </CommentButton>
                    )}
                  </CommentActions>
                )}
                
                {comment.replies.length > 0 && (
                  <RepliesList>
                    {comment.replies.map(reply => (
                      <ReplyItem key={reply.id}>
                        <ReplyHeader>
                          <ReplyAuthor>{reply.author}</ReplyAuthor>
                          <ReplyTime>{formatTime(reply.timestamp)}</ReplyTime>
                        </ReplyHeader>
                        <ReplyContent>{reply.content}</ReplyContent>
                      </ReplyItem>
                    ))}
                  </RepliesList>
                )}
                
                {replyingTo === comment.id && (
                  <div style={{ marginTop: '12px' }}>
                    <TextArea 
                      placeholder="Add a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      autoFocus
                    />
                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                      <CommentButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyingTo(null);
                        }}
                        style={{ marginRight: '8px' }}
                      >
                        Cancel
                      </CommentButton>
                      <SubmitButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          addReply(comment.id);
                        }}
                        disabled={!replyText.trim()}
                      >
                        Reply
                      </SubmitButton>
                    </div>
                  </div>
                )}
                
                {activeComment === comment.id && !comment.content && (
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <SubmitButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        addComment();
                      }}
                      disabled={!newCommentText.trim()}
                    >
                      Add Comment
                    </SubmitButton>
                  </div>
                )}
              </CommentItem>
            ))
          )}
        </CommentsList>
      </CommentPanel>
    </>
  );
};

export default CommentingMode;
