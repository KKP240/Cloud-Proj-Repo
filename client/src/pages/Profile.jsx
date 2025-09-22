// client/src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { getCurrentUser, updateProfile } from "../services/api";
import img12 from "../img/Profile.webp";
import "../css/Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [profileImage, setProfileImage] = useState(img12);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // สำหรับแก้ไขโปรไฟล์
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(true);

  // โหลดข้อมูล user
  const loadUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // decode JWT payload
      const payload = JSON.parse(atob(token.split(".")[1]));

      // fallback จาก JWT
      const userFromToken = {
        id: payload.sub || "-",
        email: payload.email || "-",
        username: payload.username || "-",
        firstName: payload.firstname || "-",
        lastName: payload.lastname || "-",
      };

      try {
        const response = await getCurrentUser();
        const backendUser = response.user || response;
        
        // fallback: ใช้ JWT payload ถ้า /me ไม่ส่ง field
        const finalUser = {
          id: backendUser.id || userFromToken.id,
          email: backendUser.email || userFromToken.email,
          username: backendUser.username || userFromToken.username,
          firstName: backendUser.firstName || userFromToken.firstName,
          lastName: backendUser.lastName || userFromToken.lastName,
        };

        setUser(finalUser);
        setEditData(finalUser);
      } catch (apiError) {
        // ถ้า API ล้มเหลว ใช้ข้อมูลจาก JWT
        setUser(userFromToken);
        setEditData(userFromToken);
      }
    } catch (e) {
      setErr(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // ฟังก์ชันสำหรับการเปลี่ยนรูปภาพ
  const handleImageClick = () => {
    setImageUrl("");
    setShowImageModal(true);
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      const img = new Image();
      img.onload = () => {
        setProfileImage(imageUrl);
        setShowImageModal(false);
        setImageUrl("");
      };
      img.onerror = () => {
        alert("ไม่สามารถโหลดรูปภาพจาก URL นี้ได้ กรุณาตรวจสอบ URL อีกครั้ง");
      };
      img.src = imageUrl;
    }
  };

  const handleModalClose = () => {
    setShowImageModal(false);
    setImageUrl("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleImageUrlSubmit();
    }
    if (e.key === 'Escape') {
      handleModalClose();
    }
  };

  // ฟังก์ชันสำหรับแก้ไขโปรไฟล์
  const handleEditClick = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(user);
    setSaveError(null);
  };

  const handleSaveProfile = async () => {
  // ตรวจสอบว่ามีช่องว่างหรือ email ไม่ถูกต้อง
  if (!editData.username || !editData.firstName || !editData.lastName || !editData.email) {
    setSaveError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    return;
  }
  if (!isEmailValid) {
    setSaveError("กรุณากรอกอีเมลให้ถูกต้องก่อนบันทึก");
    return;
  }

  setSaving(true);
  setSaveError(null);

  try {
    const response = await updateProfile({
      firstName: editData.firstName,
      lastName: editData.lastName,
      username: editData.username,
      email: editData.email
    });

    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    window.location.reload();

    setUser(response.user);
    setEditData(response.user);
    setIsEditing(false);

  } catch (error) {
    setSaveError(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    console.error('Save profile error:', error);
  } finally {
    setSaving(false);
  }
};


  const handleInputChange = (field, value) => {
  // ถ้า field เป็น email ให้ตรวจสอบความถูกต้อง
  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(value));
  }

  setEditData(prev => ({ ...prev, [field]: value }));
};

  if (loading) 
    return (
      <div className="profile-container">
        <div className="loading-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-info">
            <div className="skeleton-line long"></div>
            <div className="skeleton-line medium"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line medium"></div>
          </div>
        </div>
      </div>
    );
  
  if (err)
    return (
      <div className="profile-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{err}</p>
          <button onClick={() => loadUser()}>Try Again</button>
        </div>
      </div>
    );

  return (
    <>
      <div className="profile-container">
        <div className="profile-card">
          {/* Header Section */}
          <div className="profile-header">
            <div className="profile-avatar-wrapper" onClick={handleImageClick}>
              <img 
                src={profileImage} 
                alt="Profile" 
                className="profile-avatar clickable" 
                onError={() => setProfileImage(img12)}
              />
              <div className="avatar-ring"></div>
              <div className="avatar-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>เปลี่ยนรูป</span>
              </div>
            </div>
            <div className="profile-name">
              <h1>{user.firstName || "User"} {user.lastName || ""}</h1>
              <p className="profile-subtitle">@{user.username || "username"}</p>
            </div>
          </div>

          {/* Error Message */}
          {saveError && (
            <div style={{ 
              background: '#fee', 
              color: '#c33', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #fcc'
            }}>
              {saveError}
            </div>
          )}

          {/* Info Grid */}
          <div className="profile-info-grid">
            <div className="info-card">
              <div className="info-icon">👤</div>
              <div className="info-content">
                <div className="info-row">
                  <span className="info-label">Username</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.username || ""}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="info-edit-input"
                    />
                  ) : (
                    <span className="info-value">{user.username || "Not provided"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">🎯</div>
              <div className="info-content">
                <div className="info-row">
                  <span className="info-label">First Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName || ""}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="info-edit-input"
                    />
                  ) : (
                    <span className="info-value">{user.firstName || "Not provided"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📝</div>
              <div className="info-content">
                <div className="info-row">
                  <span className="info-label">Last Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName || ""}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="info-edit-input"
                    />
                  ) : (
                    <span className="info-value">{user.lastName || "Not provided"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="info-card">
  <div className="info-icon">✉️</div>
  <div className="info-content">
    <div className="info-row">
      <span className="info-label">Email</span>
      {isEditing ? (
        <>
          <input
            type="email"
            value={editData.email || ""}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`info-edit-input ${!isEmailValid ? 'invalid' : ''}`}
          />
          {!isEmailValid && (
            <span style={{ color: 'red', fontSize: '0.85rem' }}>
              กรุณากรอกอีเมลให้ถูกต้อง
            </span>
          )}
        </>
      ) : (
        <span className="info-value">{user.email || "Not provided"}</span>
      )}
    </div>
  </div>
</div>

          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button 
                  className="btn-secondary" 
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <span>Cancel</span>
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  {!saving && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={handleEditClick}>
                <span>Edit Profile</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image URL Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>เปลี่ยนรูปโปรไฟล์</h3>
              <button className="modal-close" onClick={handleModalClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="imageUrl">URL รูปภาพ:</label>
              <input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
              />
              <p className="modal-hint">กรุณาใส่ URL ของรูปภาพที่ต้องการใช้</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleModalClose}>
                ยกเลิก
              </button>
              <button className="btn-confirm" onClick={handleImageUrlSubmit}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}