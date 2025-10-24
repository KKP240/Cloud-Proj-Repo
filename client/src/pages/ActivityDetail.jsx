// client/src/pages/ActivityDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/ActivityDetail.css';

export default function ActivityDetail() {
  const { id } = useParams();
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  // Comment form state
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);
  // Submit new comment
  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/activities/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: commentContent })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommentError(data.error || 'Failed to post comment');
      } else {
        setCommentContent('');
        await fetchDetail();
      }
    } catch (e) {
      setCommentError(e.message || 'Network error');
    } finally {
      setCommentSubmitting(false);
    }
  }
  const [activeTab, setActiveTab] = useState('description');

  // Fetch activity details
  async function fetchDetail() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const res = await fetch(`/api/activities/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}) // Add Authorization header
        }
      });
      const data = await res.json().catch(() => ({}));

      console.log("Fetched data:", data); // Log response for debugging

      if (!res.ok) {
        setError(data.error || 'Failed to load activity');
      } else {
        setActivityData(data);
      }
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDetail(); }, [id]);

  // Register for activity
  async function doRegister() {
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/activities/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) await fetchDetail();
      else alert(data.error || 'Register failed');
    } catch {
      alert('Network error');
    } finally { setBusy(false); }
  }

  // Cancel registration
  async function doCancel() {
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/activities/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) await fetchDetail();
      else alert(data.error || 'Cancel failed');
    } catch {
      alert('Network error');
    } finally { setBusy(false); }
  }

  if (loading) return <div className="activity-detail-container">Loading...</div>;
  if (error) return <div className="activity-detail-container" style={{ color: 'red' }}>Error: {error}</div>;
  if (!activityData) return <div className="activity-detail-container">No data available</div>;

  const { activity, participantCount, isRegistered } = activityData;

  return (
    <div className="activity-detail-container">
      {/* Header */}
      {/* Header */}
<div className="activity-header" style={{ position: 'relative', overflow: 'hidden' }}>
  {activity.ActivityImages && activity.ActivityImages.length > 0 && (
    <img
      src={activity.ActivityImages[0].url}
      alt={activity.title}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scale(1.1)', 
      }}
    />
  )}

  {/* เนื้อหา */}
  <h1 className="activity-title" style={{ position: 'relative', zIndex: 1 }}>
    {activity.title}
  </h1>

  <div className="stats-row" style={{ position: 'relative', zIndex: 1 }}>
  <div className="stat-item">
    <span className="icon">👁️</span>
    <div>
      <div style={{ fontWeight: 'bold' }}>Total view</div>
      <div>n/a</div>
    </div>
  </div>

  <div className="stat-item">
    <span className="icon">👥</span>
    <div>
      <div style={{ fontWeight: 'bold' }}>Participant</div>
      <div>
        {participantCount}
        {activity.capacity ? ` / ${activity.capacity}` : ''}
      </div>
    </div>
  </div>

  {isRegistered ? (
    <button className="cancel-button" onClick={doCancel} disabled={busy}>
      Cancel Registration
    </button>
  ) : (
    <button
      className="participant-button"
      onClick={doRegister}
      disabled={busy || (activity.capacity && participantCount >= activity.capacity)}
    >
      Participant
    </button>
  )}
</div>
</div>
        {/* Tags */}
        <div className="tags-section2">
          <div className="tags-label">Tags for this Event</div>
          <div>
            {activity.Tags && activity.Tags.length
              ? activity.Tags.map(tag => <span key={tag.id} className="tag">{tag.name}</span>)
              : <span className="tag">No tags</span>
            }
          </div>
        </div>
      

      {/* Tabs */}
      <div className="tab-container">
        <div className="tab-header">
          {['description', 'image', 'post'].map(tab => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {/* Description Tab */}
          {activeTab === 'description' && (
            <div>
              <div className="event-details">
                <div>
                  <div className="detail-item">
                    <div className="detail-label">Location:</div>
                    <div className="detail-value">{activity.location || '-'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Country / Province:</div>
                    <div className="detail-value">{activity.country || '-'} / {activity.province || '-'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Capacity:</div>
                    <div className="detail-value">{activity.capacity || '-'}</div>
                  </div>
                </div>

                <div>
                  <div className="detail-item">
                    <div className="detail-label">Start Date:</div>
                    <div className="detail-value">
                      {activity.startDate ? (
                        (() => {
                          const d = new Date(activity.startDate);
                          const dateStr = d.toLocaleDateString();
                          const hour = d.getHours().toString().padStart(2, '0');
                          const min = d.getMinutes().toString().padStart(2, '0');
                          return `${dateStr}, ${hour}:${min}`;
                        })()
                      ) : '-'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">End Date:</div>
                    <div className="detail-value">
                      {activity.endDate ? (
                        (() => {
                          const d = new Date(activity.endDate);
                          const dateStr = d.toLocaleDateString();
                          const hour = d.getHours().toString().padStart(2, '0');
                          const min = d.getMinutes().toString().padStart(2, '0');
                          return `${dateStr}, ${hour}:${min}`;
                        })()
                      ) : '-'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Participants:</div>
                    <div className="detail-value">
                      <Link to={`/activities/${id}/participants`}>
                        View participant list ({participantCount} people)
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-item-1">
                <div className="detail-label">About this Event 🌟🌟🌟</div>
                <div className="detail-value">{activity.description || 'No description available'}</div>
              </div>
            </div>
          )}

          {/* Image Tab */}
          {activeTab === 'image' && (
            <div>
              <h3>Event Images</h3>
              {activity.ActivityImages && activity.ActivityImages.length ? (
                <div className="image-gallery">
                  {activity.ActivityImages.map(img => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={img.alt || activity.title}
                      className="image"
                    />
                  ))}
                </div>
              ) : (
                <div className="no-image">No images available</div>
              )}
            </div>
          )}

          {/* Post Tab */}
          {activeTab === 'post' && (
            <div>
              <h3>Comments</h3>
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <label htmlFor="comment-textarea" className="comment-label">Add a Comment</label>
                <textarea
                  id="comment-textarea"
                  className="comment-textarea"
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  disabled={commentSubmitting}
                />
                <button
                  type="submit"
                  className="comment-submit-btn"
                  disabled={commentSubmitting || !commentContent.trim()}
                >
                  {commentSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
                {commentError && <div className="comment-error">{commentError}</div>}
              </form>
              {activity.Comments && activity.Comments.length ? (
                activity.Comments.map(c => (
                  <div key={c.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">
                        {c.User && c.User.username
                          ? c.User.username
                          : c.User && c.User.firstName
                            ? c.User.firstName
                            : 'Guest'}
                      </span>
                      <span className="comment-date">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-content">{c.content}</div>
                  </div>
                ))
              ) : (
                <div>No comments yet</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
