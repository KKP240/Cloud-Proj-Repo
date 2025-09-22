// client/src/pages/ActivityDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/ActivityDetail.css';


export default function ActivityDetail() {
    const { id } = useParams();
    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Fetch activity details
    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await fetch(`/api/activitiesEdit/${id}`);
            const data = await res.json().catch(() => ({}));

            console.log("Fetched data:", data); // 👈 ดูข้อมูลที่ดึงมา

            if (!res.ok) setError(data.error || 'Failed to load activity');
            else setActivityData(data);
        } catch (e) {
            setError(e.message || 'Network error');
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => { fetchDetail(); }, [id]);
    useEffect(() => {
        if (activityData && activityData.activity) {
            setEditData({
                title: activityData.activity.title || '',
                tags: activityData.activity.Tags ? activityData.activity.Tags.map(t => t.name) : [],
                location: activityData.activity.location || '',
                country: activityData.activity.country || '',
                province: activityData.activity.province || '',
                capacity: activityData.activity.capacity || '',
                startDate: activityData.activity.startDate ? activityData.activity.startDate.slice(0, 10) : '',
                endDate: activityData.activity.endDate ? activityData.activity.endDate.slice(0, 10) : '',
                description: activityData.activity.description || '',
                images: activityData.activity.ActivityImages ? activityData.activity.ActivityImages.map(img => img.url) : []
            });
        }
    }, [activityData]);
    // Image edit handlers
    const handleImageChange = (idx, value) => {
        setEditData(prev => {
            const images = [...(prev.images || [])];
            images[idx] = value;
            return { ...prev, images };
        });
    };
    const handleAddImage = () => {
        setEditData(prev => {
            const images = [...(prev.images || [])];
            images.push('');
            return { ...prev, images };
        });
    };
    const handleRemoveImage = (idx) => {
        setEditData(prev => {
            const images = [...(prev.images || [])];
            images.splice(idx, 1);
            return { ...prev, images };
        });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setSaveError(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({
            title: activityData.activity.title || '',
            tags: activityData.activity.Tags ? activityData.activity.Tags.map(t => t.name) : [],
            location: activityData.activity.location || '',
            country: activityData.activity.country || '',
            province: activityData.activity.province || '',
            capacity: activityData.activity.capacity || '',
            startDate: activityData.activity.startDate ? activityData.activity.startDate.slice(0, 10) : '',
            endDate: activityData.activity.endDate ? activityData.activity.endDate.slice(0, 10) : '',
            description: activityData.activity.description || ''
        });
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleTagChange = (idx, value) => {
        setEditData(prev => {
            const tags = [...(prev.tags || [])];
            tags[idx] = value;
            return { ...prev, tags };
        });
    };

    const handleAddTag = () => {
        setEditData(prev => {
            const tags = [...(prev.tags || [])];
            tags.push('');
            return { ...prev, tags };
        });
    };

    const handleRemoveTag = (idx) => {
        setEditData(prev => {
            const tags = [...(prev.tags || [])];
            tags.splice(idx, 1);
            return { ...prev, tags };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/activities/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: 'Bearer ' + token } : {})
                },
                body: JSON.stringify({
                    title: editData.title,
                    tags: editData.tags,
                    location: editData.location,
                    country: editData.country,
                    province: editData.province,
                    capacity: editData.capacity,
                    startDate: editData.startDate,
                    endDate: editData.endDate,
                    description: editData.description,
                    images: editData.images
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setSaveError(data.error || 'Save failed');
            } else {
                setIsEditing(false);
                fetchDetail();
            }
        } catch (e) {
            setSaveError(e.message || 'Network error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="activity-detail-container">Loading...</div>;
    if (error) return <div className="activity-detail-container" style={{ color: 'red' }}>Error: {error}</div>;
    if (!activityData) return <div className="activity-detail-container">No data available</div>;

    const { activity, participantCount} = activityData;


    return (
        <div className="activity-detail-container">
            {/* Header */}
            <div className="activity-header activity-header-rel">
                {activity.ActivityImages && activity.ActivityImages.length > 0 && (
                    <img
                        src={activity.ActivityImages[0].url}
                        alt={activity.title}
                        className="activity-header-bgimg"
                    />
                )}
                <h1 className="activity-title activity-title-rel">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editData.title}
                            onChange={e => handleInputChange('title', e.target.value)}
                            className="title-edit-input"
                        />
                    ) : (
                        activity.title
                    )}
                </h1>
                <div className="stats-row stats-row-rel">
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
                </div>
            </div>
            {/* Tags */}
            <div className="tags-section2">
                <div className="tags-label">Tags for this Event</div>
                <div>
                    {isEditing ? (
                        <div className="tags-edit-row">
                            {editData.tags && editData.tags.map((tag, idx) => (
                                <span key={idx} className="tag-edit-item">
                                    <input
                                        type="text"
                                        value={tag}
                                        onChange={e => handleTagChange(idx, e.target.value)}
                                        className="info-edit-input tag-edit-input"
                                    />
                                    <button onClick={() => handleRemoveTag(idx)} className="tag-remove-btn">X</button>
                                </span>
                            ))}
                            <button onClick={handleAddTag} className="tag-add-btn">+ Add Tag</button>
                        </div>
                    ) : (
                        activity.Tags && activity.Tags.length
                            ? activity.Tags.map(tag => <span key={tag.id} className="tag">{tag.name}</span>)
                            : <span className="tag">No tags</span>
                    )}
                </div>
            </div>
            {/* Tabs */}
            <div className="tab-container">
                <div className="tab-header">
                    {['description', 'image', 'post'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-button${activeTab === tab ? ' active' : ''}`}
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
                                        <div className="detail-value">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editData.location}
                                                    onChange={e => handleInputChange('location', e.target.value)}
                                                    className="info-edit-input"
                                                />
                                            ) : (
                                                activity.location || '-'
                                            )}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Country / Province:</div>
                                        <div className="detail-value">
                                            {isEditing ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={editData.country}
                                                        onChange={e => handleInputChange('country', e.target.value)}
                                                        className="info-edit-input"
                                                        placeholder="Country"
                                                        style={{ marginRight: 8 }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editData.province}
                                                        onChange={e => handleInputChange('province', e.target.value)}
                                                        className="info-edit-input"
                                                        placeholder="Province"
                                                    />
                                                </>
                                            ) : (
                                                `${activity.country || '-'} / ${activity.province || '-'}`
                                            )}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Capacity:</div>
                                        <div className="detail-value">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editData.capacity}
                                                    onChange={e => handleInputChange('capacity', e.target.value)}
                                                    min="0"
                                                    className="info-edit-input"
                                                />
                                            ) : (
                                                activity.capacity
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="detail-item">
                                        <div className="detail-label">Start Date:</div>
                                        <div className="detail-value">
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editData.startDate}
                                                    onChange={e => handleInputChange('startDate', e.target.value)}
                                                    className="date-input info-edit-input"
                                                />
                                            ) : (
                                                activity.startDate ? new Date(activity.startDate).toLocaleString() : '-'
                                            )}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">End Date:</div>
                                        <div className="detail-value">
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    value={editData.endDate}
                                                    onChange={e => handleInputChange('endDate', e.target.value)}
                                                    className="date-input info-edit-input"
                                                />
                                            ) : (
                                                activity.endDate ? new Date(activity.endDate).toLocaleString() : '-'
                                            )}
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
                                <div className="detail-value about-detail-value">
                                    {isEditing ? (
                                        <textarea
                                            value={editData.description}
                                            onChange={e => handleInputChange('description', e.target.value)}
                                            className="about-edit-input"
                                        />
                                    ) : (
                                        activity.description || 'No description available'
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Tab */}
                    {activeTab === 'image' && (
                        <div>
                            <h3>Event Images</h3>
                            {isEditing ? (
                                <div>
                                    {(editData.images && editData.images.length > 0) ? (
                                        <div className="image-gallery">
                                            {editData.images.map((url, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                                    <input
                                                        type="text"
                                                        value={url}
                                                        onChange={e => handleImageChange(idx, e.target.value)}
                                                        className="info-edit-input"
                                                        placeholder="Image URL"
                                                        style={{ flex: 1, marginRight: 8 }}
                                                    />
                                                    {url && <img src={url} alt="preview" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6, marginRight: 8 }} />}
                                                    <button onClick={() => handleRemoveImage(idx)} className="tag-remove-btn">X</button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-image">No images available</div>
                                    )}
                                    <button onClick={handleAddImage} className="tag-add-btn" style={{ marginTop: 8 }}>+ Add Image</button>
                                </div>
                            ) : (
                                activity.ActivityImages && activity.ActivityImages.length ? (
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
                                )
                            )}
                        </div>
                    )}

                    {/* Post Tab */}
                    {activeTab === 'post' && (
                        <div>
                            <h3>Comments</h3>
                            {activity.Comments && activity.Comments.length ? (
                                activity.Comments.map(c => (
                                    <div key={c.id} className="comment">
                                        <div className="comment-header">
                                            <span className="comment-author">
                                                {c.User ? (c.User.firstName || c.User.username) : 'Guest'}
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
                <div className="edit-btn-row">
                    {isEditing ? (
                        <>
                            <button className="btn-secondary" onClick={handleCancelEdit} disabled={saving}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                            {saveError && <span style={{ color: 'red', marginLeft: 12 }}>{saveError}</span>}
                        </>
                    ) : (
                        <button className="btn-primary edit-btn" onClick={handleEditClick}>Edit Activity</button>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
}
