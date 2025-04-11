import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiMessageSquare, FiX, FiPlus, FiCheck, FiTrash2, FiEdit2, FiCornerUpRight } from 'react-icons/fi';
import * as fabricJS from 'fabric';

// Styled components for the commenting system
const CommentContainer = styled.div`
  position: absolute;
  z-index: 1000;
  pointer-events: none;
`;

const CommentMarker = styled.div<{ isSelected: boolean; isResolved: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.isResolved ? 'var(--neutral-400)' : 'var(--primary-500)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: auto;
  border: 2px solid white;
  opacity: ${props => props.isResolved ? 0.7 : 1};
  transform: ${props => props.isSelected ? 'scale(1.1)' : 'scale(1)'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: ${props => props.isResolved ? 'var(--neutral-500)' : 'var(--primary-600)'};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const CommentPanel = styled.div<{ isVisible: boolean }>`
  position: absolute;
  width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  pointer-events: auto;
  transform: ${props => props.isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)'};
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: all 0.2s ease;
  z-index: 1001;
  max-height: 400px;
  display: flex;
  flex-direction: column;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--neutral-200);
  background-color: var(--neutral-50);
`;

const CommentTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-900);
  margin: 0;
`;

const CommentThreadContainer = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  max-height: 300px;
`;

const CommentItem = styled.div<{ isReply?: boolean }>`
  margin-bottom: 16px;
  padding-left: ${props => props.isReply ? '16px' : '0'};
  border-left: ${props => props.isReply ? '2px solid var(--neutral-200)' : 'none'};
`;

const CommentHeader2 = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const CommentAuthor = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--neutral-900);
`;

const CommentTime = styled.div`
  font-size: 12px;
  color: var(--neutral-500);
  margin-left: 8px;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
`;

const CommentAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: var(--neutral-500);
  
  &:hover {
    background-color: var(--neutral-100);
    color: var(--neutral-700);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const CommentContent = styled.div`
  font-size: 13px;
  color: var(--neutral-800);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CommentReplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--primary-500);
  margin-top: 4px;
  padding: 2px 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--primary-50);
    color: var(--primary-600);
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const CommentInput = styled.div`
  padding: 12px 16px;
  border-top: 1px solid var(--neutral-200);
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--neutral-300);
  font-size: 13px;
  resize: none;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-400);
  }
  
  &::placeholder {
    color: var(--neutral-400);
  }
`;

const CommentInputActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const CommentButton = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  background-color: ${props => props.primary ? 'var(--primary-500)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--neutral-700)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--neutral-300)'};
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary-600)' : 'var(--neutral-100)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ResolveButton = styled.button<{ isResolved: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  background-color: ${props => props.isResolved ? 'var(--neutral-100)' : 'var(--green-50)'};
  color: ${props => props.isResolved ? 'var(--neutral-700)' : 'var(--green-600)'};
  border: 1px solid ${props => props.isResolved ? 'var(--neutral-300)' : 'var(--green-200)'};
  
  &:hover {
    background-color: ${props => props.isResolved ? 'var(--neutral-200)' : 'var(--green-100)'};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

// Types for the commenting system
interface CommentUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

interface CommentReply {
  id: string;
  author: CommentUser;
  content: string;
  timestamp: Date;
}

interface Comment {
  id: string;
  author: CommentUser;
  content: string;
  position: { x: number; y: number };
  timestamp: Date;
  replies: CommentReply[];
  isResolved: boolean;
}

interface CommentingSystemProps {
  canvas: fabricJS.Canvas | null;
  canvasContainer: HTMLElement | null;
  currentUser: CommentUser;
  isCommentingMode: boolean;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'replies'>) => void;
  onAddReply: (commentId: string, reply: Omit<CommentReply, 'id'>) => void;
  onResolveComment: (commentId: string, isResolved: boolean) => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
}

const CommentingSystem: React.FC<CommentingSystemProps> = ({
  canvas,
  canvasContainer,
  currentUser,
  isCommentingMode,
  comments,
  onAddComment,
  onAddReply,
  onResolveComment,
  onDeleteComment,
  onDeleteReply
}) => {
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [newCommentPosition, setNewCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const commentPanelRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking on the canvas to add a new comment
  useEffect(() => {
    if (!canvas || !canvasContainer || !isCommentingMode) return;
    
    const handleCanvasClick = (e: MouseEvent) => {
      if (!isCommentingMode) return;
      
      // Don't add a comment if clicking on an existing comment marker
      if ((e.target as HTMLElement).closest('.comment-marker')) return;
      
      const rect = canvasContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setNewCommentPosition({ x, y });
      setIsAddingComment(true);
      setSelectedCommentId(null);
    };
    
    canvasContainer.addEventListener('click', handleCanvasClick);
    
    return () => {
      canvasContainer.removeEventListener('click', handleCanvasClick);
    };
  }, [canvas, canvasContainer, isCommentingMode]);
  
  // Close comment panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        commentPanelRef.current && 
        !commentPanelRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('.comment-marker')
      ) {
        setSelectedCommentId(null);
        if (!isAddingComment) {
          setNewCommentPosition(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingComment]);
  
  const handleSubmitComment = () => {
    if (!newCommentPosition || !newCommentContent.trim()) return;
    
    onAddComment({
      author: currentUser,
      content: newCommentContent,
      position: newCommentPosition,
      timestamp: new Date(),
      isResolved: false
    });
    
    setNewCommentContent('');
    setIsAddingComment(false);
    setNewCommentPosition(null);
  };
  
  const handleSubmitReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    
    onAddReply(commentId, {
      author: currentUser,
      content: replyContent,
      timestamp: new Date()
    });
    
    setReplyContent('');
    setIsReplying(false);
  };
  
  const handleCancelComment = () => {
    setNewCommentContent('');
    setIsAddingComment(false);
    setNewCommentPosition(null);
  };
  
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  const getCommentPanelPosition = (comment: Comment) => {
    if (!canvasContainer) return { left: 0, top: 0 };
    
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;
    
    // Position panel to the right of the marker by default
    let left = comment.position.x + 30;
    let top = comment.position.y - 20;
    
    // Check if panel would go off the right edge
    if (left + 280 > containerWidth) {
      left = comment.position.x - 280 - 10; // Position to the left
    }
    
    // Check if panel would go off the bottom edge
    if (top + 300 > containerHeight) {
      top = containerHeight - 300 - 20;
    }
    
    // Ensure panel doesn't go off the top
    if (top < 10) {
      top = 10;
    }
    
    return { left, top };
  };
  
  return (
    <>
      {/* Existing comments */}
      {comments.map(comment => (
        <CommentContainer 
          key={comment.id} 
          style={{ left: comment.position.x, top: comment.position.y }}
        >
          <CommentMarker 
            className="comment-marker"
            isSelected={selectedCommentId === comment.id}
            isResolved={comment.isResolved}
            onClick={() => setSelectedCommentId(selectedCommentId === comment.id ? null : comment.id)}
          >
            <FiMessageSquare />
          </CommentMarker>
          
          {selectedCommentId === comment.id && (
            <CommentPanel 
              ref={commentPanelRef}
              isVisible={selectedCommentId === comment.id}
              style={getCommentPanelPosition(comment)}
            >
              <CommentHeader>
                <CommentTitle>Comment Thread</CommentTitle>
                <CommentAction onClick={() => setSelectedCommentId(null)}>
                  <FiX />
                </CommentAction>
              </CommentHeader>
              
              <CommentThreadContainer>
                {/* Main comment */}
                <CommentItem>
                  <CommentHeader2>
                    <CommentAuthor>{comment.author.name}</CommentAuthor>
                    <CommentTime>{formatTimestamp(comment.timestamp)}</CommentTime>
                    <CommentActions>
                      <CommentAction title="Edit Comment">
                        <FiEdit2 />
                      </CommentAction>
                      <CommentAction 
                        title="Delete Comment"
                        onClick={() => onDeleteComment(comment.id)}
                      >
                        <FiTrash2 />
                      </CommentAction>
                    </CommentActions>
                  </CommentHeader2>
                  <CommentContent>{comment.content}</CommentContent>
                  <CommentReplyButton onClick={() => setIsReplying(true)}>
                    <FiCornerUpRight />
                    Reply
                  </CommentReplyButton>
                </CommentItem>
                
                {/* Replies */}
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} isReply>
                    <CommentHeader2>
                      <CommentAuthor>{reply.author.name}</CommentAuthor>
                      <CommentTime>{formatTimestamp(reply.timestamp)}</CommentTime>
                      <CommentActions>
                        <CommentAction 
                          title="Delete Reply"
                          onClick={() => onDeleteReply(comment.id, reply.id)}
                        >
                          <FiTrash2 />
                        </CommentAction>
                      </CommentActions>
                    </CommentHeader2>
                    <CommentContent>{reply.content}</CommentContent>
                  </CommentItem>
                ))}
              </CommentThreadContainer>
              
              {isReplying ? (
                <CommentInput>
                  <CommentTextarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  />
                  <CommentInputActions>
                    <CommentButton onClick={() => setIsReplying(false)}>
                      Cancel
                    </CommentButton>
                    <CommentButton 
                      primary 
                      disabled={!replyContent.trim()}
                      onClick={() => handleSubmitReply(comment.id)}
                    >
                      <FiCornerUpRight />
                      Reply
                    </CommentButton>
                  </CommentInputActions>
                </CommentInput>
              ) : (
                <CommentInputActions style={{ padding: '12px 16px' }}>
                  <ResolveButton 
                    isResolved={comment.isResolved}
                    onClick={() => onResolveComment(comment.id, !comment.isResolved)}
                  >
                    <FiCheck />
                    {comment.isResolved ? 'Reopen' : 'Resolve'}
                  </ResolveButton>
                </CommentInputActions>
              )}
            </CommentPanel>
          )}
        </CommentContainer>
      ))}
      
      {/* New comment being added */}
      {isCommentingMode && newCommentPosition && (
        <CommentContainer 
          style={{ left: newCommentPosition.x, top: newCommentPosition.y }}
        >
          <CommentMarker 
            className="comment-marker"
            isSelected={true}
            isResolved={false}
          >
            <FiPlus />
          </CommentMarker>
          
          <CommentPanel 
            ref={commentPanelRef}
            isVisible={isAddingComment}
            style={getCommentPanelPosition({ 
              id: 'new', 
              author: currentUser, 
              content: '', 
              position: newCommentPosition, 
              timestamp: new Date(), 
              replies: [],
              isResolved: false
            })}
          >
            <CommentHeader>
              <CommentTitle>New Comment</CommentTitle>
              <CommentAction onClick={handleCancelComment}>
                <FiX />
              </CommentAction>
            </CommentHeader>
            
            <CommentInput>
              <CommentTextarea
                placeholder="Add your comment..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                autoFocus
              />
              <CommentInputActions>
                <CommentButton onClick={handleCancelComment}>
                  Cancel
                </CommentButton>
                <CommentButton 
                  primary 
                  disabled={!newCommentContent.trim()}
                  onClick={handleSubmitComment}
                >
                  <FiMessageSquare />
                  Comment
                </CommentButton>
              </CommentInputActions>
            </CommentInput>
          </CommentPanel>
        </CommentContainer>
      )}
    </>
  );
};

export default CommentingSystem;
