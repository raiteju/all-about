'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getComments, createComment, likeComment } from '@/lib/api';
import styles from '../../app/post/[slug]/page.module.css';

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false); // ADD THIS!

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(postId);
        const sorted = data.sort((a: any, b: any) => {
          if (a.parentId && !b.parentId) return 1;
          if (!a.parentId && b.parentId) return -1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        setComments(sorted);
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to comment.');
        return;
      }

      const newComment = await createComment(postId, content, token);
      setComments((prev) => [newComment, ...prev]);
      setContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyClick = (comment: any) => {
    setReplyToId(comment._id);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyToId) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to reply.');
        return;
      }

      const newReply = await createComment(postId, replyContent, token, replyToId);
      setComments((prev) => [newReply, ...prev]);
      setReplyContent('');
      setReplyToId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to like comments.');
        return;
      }
      const result = await likeComment(postId, commentId, token);
      setComments((prev) => prev.map((c: any) => 
        c._id === commentId ? { ...c, likesCount: result.likesCount, isLiked: result.isLiked } : c
      ));
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  const emojis = ['❤️', '😂', '👍', '🔥', '🎉', '😮', '😢', '🙏', '👏', '💯'];

  return (
    <div className={styles.commentsSection}>
      <h2 className={styles.commentsTitle}>Responses ({comments.length})</h2>
      
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div style={{ position: 'relative' }}>
          <textarea 
            className={styles.commentInput}
            placeholder="Add to discussion" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            style={{ position: 'absolute', right: '12px', bottom: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
          >
            😊
          </button>
          {showEmojiPicker && (
            <div style={{ position: 'absolute', right: '0', bottom: '50px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', zIndex: 20 }}>
              {emojis.map((emoji) => (
                <button key={emoji} type="button" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => { setContent(content + emoji); setShowEmojiPicker(false); }}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

        <div className={styles.commentButtons}>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={() => setContent('')}>
            Cancel
          </button>
        </div>
      </form>

      {isLoading ? (
        <p style={{ color: 'var(--text-gray)' }}>Loading comments...</p>
      ) : (
        <div>
          {comments.map((comment: any) => {
            const isReply = !!comment.parentId;
            return (
              <div key={comment._id} 
                className={styles.commentItem}
                style={{
                  backgroundColor: isReply ? '#f0f0f0' : 'transparent',
                  borderRadius: '8px',
                  padding: isReply ? '16px' : '16px 0',
                  marginLeft: isReply ? '40px' : '0px',
                  borderBottom: isReply ? 'none' : '1px solid #f0f0f0'
                }}
              >
                <div className={styles.commentHeader}>
                  <div className={styles.commentAuthorInfo}>
                    <Image 
                      src={comment.author?.avatar || 'https://i.pravatar.cc/150?img=5'} 
                      alt={comment.author?.firstName || 'User'} 
                      width={40} 
                      height={40} 
                      style={{ borderRadius: '50%' }} 
                    />
                    <span>{comment.author?.firstName || 'User'} {comment.author?.lastName || ''}</span>
                    <span className={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p style={{ marginBottom: '12px', color: '#374151', fontSize: '15px' }}>{comment.content}</p>
                
                <div className={styles.commentHeader}>
                  <button 
                    type="button"
                    onClick={(e) => handleCommentLike(comment._id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: comment.isLiked ? '#e0245e' : 'var(--text-gray)' }}
                  >
                    ❤️ {comment.likesCount || 0}
                  </button>
                  <button 
                    type="button" 
                    className={styles.commentReply} 
                    onClick={() => handleReplyClick(comment)}
                  >
                    💬 Reply
                  </button>
                </div>

                {/* REPLY FORM WITH EMOJI PICKER! */}
                {replyToId === comment._id && (
                  <form onSubmit={handleReplySubmit} style={{ marginTop: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <textarea 
                        className={styles.commentInput}
                        placeholder={`Reply to ${comment.author?.firstName || 'User'}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowReplyEmojiPicker(!showReplyEmojiPicker)} 
                        style={{ position: 'absolute', right: '12px', bottom: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                      >
                        😊
                      </button>
                      {showReplyEmojiPicker && (
                        <div style={{ position: 'absolute', right: '0', bottom: '50px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', zIndex: 20 }}>
                          {emojis.map((emoji) => (
                            <button key={emoji} type="button" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => { setReplyContent(replyContent + emoji); setShowReplyEmojiPicker(false); }}>
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.commentButtons}>
                      <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        Reply
                      </button>
                      <button type="button" className={styles.cancelBtn} onClick={() => setReplyToId(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}