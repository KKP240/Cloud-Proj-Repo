// client/src/pages/ActivityDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/ActivityDetail.css';


export default function ActivityDetail() {
    // Comment delete state
    const [commentDeleting, setCommentDeleting] = useState(null); // comment id
    const [commentDeleteError, setCommentDeleteError] = useState(null);

    // Delete comment handler
    async function handleDeleteComment(commentId) {
        if (!window.confirm('Delete this comment?')) return;
        setCommentDeleting(commentId);
        setCommentDeleteError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setCommentDeleteError(data.error || 'Failed to delete comment');
            } else {
                await fetchDetail();
            }
        } catch (e) {
            setCommentDeleteError(e.message || 'Network error');
        } finally {
            setCommentDeleting(null);
        }
    }
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
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/activitiesEdit/${id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                }
            );
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
        // Country/Province dropdowns
        const countries = {
            Thailand: [
                "Bangkok", "Chiang Mai", "Phuket", "Khon Kaen", "Chiang Rai", "Nakhon Ratchasima",
                "Chonburi", "Nakhon Si Thammarat", "Udon Thani", "Songkhla", "Surat Thani",
                "Nakhon Pathom", "Ayutthaya", "Pattani", "Lampang", "Loei", "Phitsanulok",
                "Ratchaburi", "Trang", "Ubon Ratchathani", "Kanchanaburi", "Sukhothai", "Phetchabun",
                "Phrae", "Nakhon Nayok", "Sakon Nakhon", "Chaiyaphum", "Mukdahan", "Chachoengsao",
                "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Singburi", "Suphan Buri",
                "Ang Thong", "Lopburi", "Pathum Thani", "Prachin Buri", "Phetchaburi", "Chumphon",
                "Ranong", "Surin", "Sisaket", "Yasothon", "Amnat Charoen", "Bueng Kan", "Nong Bua Lamphu",
                "Nong Khai", "Kalasin", "Khon Kaen", "Maha Sarakham", "Roi Et", "Saraburi", "Sing Buri",
                "Sukhothai", "Tak", "Uttaradit", "Phayao", "Phichit", "Phitsanulok", "Prachuap Khiri Khan",
                "Rayong", "Sa Kaeo", "Samut Sakhon", "Saraburi", "Satun", "Sing Buri", "Songkhla", "Sukhothai",
                "Suphan Buri", "Surat Thani", "Trat", "Ubon Ratchathani", "Udon Thani", "Yala"
            ],
            USA: [
                "New York", "California", "Texas", "Florida", "Illinois", "Pennsylvania", "Ohio", "Georgia",
                "North Carolina", "Michigan", "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts",
                "Tennessee", "Indiana", "Missouri", "Maryland", "Wisconsin", "Colorado", "Minnesota", "South Carolina",
                "Alabama", "Louisiana", "Kentucky", "Oregon", "Oklahoma", "Connecticut", "Iowa", "Mississippi",
                "Arkansas", "Kansas", "Utah", "Nevada", "New Mexico", "Nebraska", "West Virginia", "Idaho",
                "Hawaii", "New Hampshire", "Montana", "Rhode Island", "Delaware", "South Dakota", "North Dakota",
                "Alaska", "Vermont", "Wyoming"
            ],
            Japan: [
                "Tokyo", "Osaka", "Kyoto", "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima",
                "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Kanagawa", "Niigata", "Toyama", "Ishikawa",
                "Fukui", "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka",
                "Hyogo", "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima",
                "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima",
                "Okinawa"
            ],
            Canada: [
                "Ontario", "Quebec", "Nova Scotia", "New Brunswick", "Manitoba", "British Columbia", "Prince Edward Island",
                "Saskatchewan", "Alberta", "Newfoundland and Labrador"
            ],
            UK: [
                "England", "Scotland", "Wales", "Northern Ireland"
            ],
            Australia: [
                "New South Wales", "Victoria", "Queensland", "South Australia", "Western Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"
            ],
            Germany: [
                "Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Hesse", "Lower Saxony", "Saxony", "Rhineland-Palatinate", "Berlin", "Schleswig-Holstein", "Brandenburg",
                "Hesse", "Saxony-Anhalt", "Thuringia", "Mecklenburg-Vorpommern", "Bremen", "Hamburg", "Saarland"
            ],
            France: [
                "Île-de-France", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie", "Hauts-de-France", "Grand Est", "Bretagne", "Normandie",
                "Pays de la Loire", "Centre-Val de Loire", "Bourgogne-Franche-Comté", "Corse"
            ],
            Italy: [
                "Lazio", "Lombardy", "Campania", "Sicily", "Veneto", "Emilia-Romagna", "Piedmont", "Apulia", "Calabria", "Tuscany",
                "Sardinia", "Liguria", "Marche", "Abruzzo", "Trentino-Alto Adige/Südtirol", "Friuli Venezia Giulia", "Umbria", "Molise", "Basilicata", "Aosta Valley"
            ],
            Spain: [
                "Andalusia", "Catalonia", "Madrid", "Valencia", "Galicia", "Castile and León", "Basque Country", "Castilla-La Mancha", "Canary Islands", "Aragon",
                "Balearic Islands", "Extremadura", "Murcia", "Cantabria", "La Rioja", "Navarre", "Asturias", "Ceuta", "Melilla"
            ],
            China: [
                "Beijing", "Shanghai", "Tianjin", "Chongqing", "Guangdong", "Shandong", "Jiangsu", "Zhejiang", "Henan", "Sichuan",
                "Hunan", "Anhui", "Hubei", "Fujian", "Jiangxi", "Shanxi", "Liaoning", "Heilongjiang", "Hebei", "Hainan",
                "Guangxi", "Inner Mongolia", "Ningxia", "Xinjiang", "Tibet", "Qinghai", "Gansu", "Shaanxi", "Yunnan", "Guizhou",
                "Hainan", "Macau", "Hong Kong"
            ],
            India: [
                "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
                "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
                "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Lakshadweep", "Jammu and Kashmir"
            ]
        };
        const [provinceOptions, setProvinceOptions] = useState([]);
        useEffect(() => {
            if (activityData && activityData.activity) {
                // Extract time from startDate/endDate as HH:mm (24hr)
                function getTimeStr(dateStr) {
                  if (!dateStr) return '';
                  const d = new Date(dateStr);
                  const hour = d.getHours().toString().padStart(2, '0');
                  const min = d.getMinutes().toString().padStart(2, '0');
                  return `${hour}:${min}`;
                }
                let startDate = activityData.activity.startDate ? activityData.activity.startDate.slice(0, 10) : '';
                let startTime = getTimeStr(activityData.activity.startDate);
                let endDate = activityData.activity.endDate ? activityData.activity.endDate.slice(0, 10) : '';
                let endTime = getTimeStr(activityData.activity.endDate);
                setEditData({
                    title: activityData.activity.title || '',
                    tags: activityData.activity.Tags ? activityData.activity.Tags.map(t => t.name) : [],
                    location: activityData.activity.location || '',
                    country: activityData.activity.country || '',
                    province: activityData.activity.province || '',
                    capacity: activityData.activity.capacity || '',
                    startDate,
                    startTime,
                    endDate,
                    endTime,
                    description: activityData.activity.description || '',
                    images: activityData.activity.ActivityImages ? activityData.activity.ActivityImages.map(img => img.url) : []
                });
                setProvinceOptions(activityData.activity.country ? (countries[activityData.activity.country] || []) : []);
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
                setEditData(prev => {
                    let newData = { ...prev, [field]: value };
                    // If country changes, update province options and reset province
                    if (field === 'country') {
                        newData.province = '';
                        setProvinceOptions(countries[value] || []);
                    }
                    return newData;
                });
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
            // Combine date and time
            function combineDateTime(date, time) {
              if (!date) return null;
              if (time) return date + 'T' + time;
              return date.length === 10 ? date + 'T00:00:00' : date;
            }
            const normStart = combineDateTime(editData.startDate, editData.startTime);
            const normEnd = combineDateTime(editData.endDate, editData.endTime);
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
                    startDate: normStart,
                    endDate: normEnd,
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
                                                    <select
                                                        className="info-edit-input"
                                                        value={editData.country}
                                                        onChange={e => handleInputChange('country', e.target.value)}
                                                        style={{ marginRight: 8 }}
                                                    >
                                                        <option value="">-- Select Country --</option>
                                                        {Object.keys(countries).map((c, i) => (
                                                            <option key={i} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        className="info-edit-input"
                                                        value={editData.province}
                                                        onChange={e => handleInputChange('province', e.target.value)}
                                                        disabled={!editData.country}
                                                    >
                                                        <option value="">-- Select Province --</option>
                                                        {provinceOptions.map((p, i) => (
                                                            <option key={i} value={p}>{p}</option>
                                                        ))}
                                                    </select>
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
                                                <>
                                                    <input
                                                        type="date"
                                                        value={editData.startDate}
                                                        onChange={e => handleInputChange('startDate', e.target.value)}
                                                        className="date-input info-edit-input"
                                                        style={{ marginRight: 8 }}
                                                    />
                                                    <input
                                                        type="time"
                                                        value={editData.startTime}
                                                        onChange={e => handleInputChange('startTime', e.target.value)}
                                                        className="time-input info-edit-input"
                                                        step="60"
                                                    />
                                                </>
                                            ) : (
                                                activity.startDate ? (() => {
                                                    const d = new Date(activity.startDate);
                                                    const dateStr = d.toLocaleDateString();
                                                    const hour = d.getHours().toString().padStart(2, '0');
                                                    const min = d.getMinutes().toString().padStart(2, '0');
                                                    return `${dateStr}, ${hour}:${min}`;
                                                })() : '-'
                                            )}
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">End Date:</div>
                                        <div className="detail-value">
                                            {isEditing ? (
                                                <>
                                                    <input
                                                        type="date"
                                                        value={editData.endDate}
                                                        onChange={e => handleInputChange('endDate', e.target.value)}
                                                        className="date-input info-edit-input"
                                                        style={{ marginRight: 8 }}
                                                    />
                                                    <input
                                                        type="time"
                                                        value={editData.endTime}
                                                        onChange={e => handleInputChange('endTime', e.target.value)}
                                                        className="time-input info-edit-input"
                                                        step="60"
                                                    />
                                                </>
                                            ) : (
                                                activity.endDate ? (() => {
                                                    const d = new Date(activity.endDate);
                                                    const dateStr = d.toLocaleDateString();
                                                    const hour = d.getHours().toString().padStart(2, '0');
                                                    const min = d.getMinutes().toString().padStart(2, '0');
                                                    return `${dateStr}, ${hour}:${min}`;
                                                })() : '-'
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
                            {commentDeleteError && <div style={{ color: 'red', marginBottom: 8 }}>{commentDeleteError}</div>}
                            {activity.Comments && activity.Comments.length ? (
                                activity.Comments.map(c => (
                                    <div key={c.id} className="comment">
                                        <div className="comment-header">
                                            <span className="comment-author">
                                                {c.User
                                                    ? (c.User.username
                                                        ? c.User.username
                                                        : c.User.firstName
                                                            ? c.User.firstName
                                                            : 'Guest')
                                                    : 'Guest'}
                                            </span>
                                            <span className="comment-date">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </span>
                                            <button
                                                className="delete-comment-btn"
                                                onClick={() => handleDeleteComment(c.id)}
                                                disabled={commentDeleting === c.id}
                                            >
                                                {commentDeleting === c.id ? 'Deleting...' : (
                                                    <>
                                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                                                            <path d="M6 8V15C6 15.55 6.45 16 7 16H13C13.55 16 14 15.55 14 15V8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M9 11V13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M11 11V13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M4 6H16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M8 6V5C8 4.45 8.45 4 9 4H11C11.55 4 12 4.45 12 5V6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        <span>Delete</span>
                                                    </>
                                                )}
                                            </button>
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
