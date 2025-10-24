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
  const [imageLoading, setImageLoading] = useState(false); // สำหรับโหลดรูป

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

      // --- นี่คือส่วนที่แก้ไข ---
      // ลบการ decode JWT ด้วย atob() ที่พังออกไป
      // เราจะดึงข้อมูลจาก /me API (getCurrentUser) เท่านั้น
      // ซึ่งเป็นวิธีที่ถูกต้องและปลอดภัยกว่า

      // 1. เรียก API โดยตรง
      const response = await getCurrentUser();
      const backendUser = response.user || response;

      if (!backendUser || !backendUser.id) {
        throw new Error("Could not load user from API");
      }

      // 2. ใช้ข้อมูลจาก API ที่ได้มา
      setUser(backendUser);
      setEditData(backendUser);
      
      // 3. ตั้งค่ารูปโปรไฟล์
      if (backendUser.profileImageUrl) {
        setProfileImage(backendUser.profileImageUrl);
      } else {
        setProfileImage(img12); // ใช้รูป default ถ้าใน DB เป็น null
      }
      // --- จบส่วนที่แก้ไข ---

    } catch (e) {
      // ถ้า getCurrentUser() ล้มเหลว (เช่น token หมดอายุ หรือ API พัง)
      // e.message จะแสดงข้อความ error จาก API (เช่น 'Unauthorized')
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

  const handleImageUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      alert("กรุณาใส่ URL รูปภาพ");
      return;
    }

    setImageLoading(true);

    try {
      // ตรวจสอบว่ารูปภาพโหลดได้หรือไม่
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("ไม่สามารถโหลดรูปภาพจาก URL นี้ได้"));
        img.src = imageUrl;
      });

      // บันทึกรูปภาพลงฐานข้อมูล
      const response = await updateProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        profileImageUrl: imageUrl // เพิ่ม profileImageUrl
      });

      // อัปเดต token ใหม่ถ้ามี
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // อัปเดต state
      const updatedUser = response.user; 
      setUser(updatedUser);
      setEditData(updatedUser);
      setProfileImage(updatedUser.profileImageUrl || img12);

      // ปิด modal
      setShowImageModal(false);
      setImageUrl("");

      alert("เปลี่ยนรูปโปรไฟล์สำเร็จ!");

    } catch (error) {
      console.error('Error updating profile image:', error);
      alert(error.message || "เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
    } finally {
      setImageLoading(false);
    }
  };

  const handleModalClose = () => {
    if (imageLoading) return; // ป้องกันปิด modal ขณะโหลด
    setShowImageModal(false);
    setImageUrl("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !imageLoading) {
      handleImageUrlSubmit();
    }
    if (e.key === 'Escape' && !imageLoading) {
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
        email: editData.email,
        profileImageUrl: user.profileImageUrl // รักษา profileImageUrl ไว้
      });

      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // อัปเดต state (ใช้ response.user โดยตรง)
      const updatedUser = response.user;
      setUser(updatedUser);
      setEditData(updatedUser);
      setIsEditing(false);

      alert("บันทึกข้อมูลสำเร็จ!");

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
              <button 
                className="modal-close" 
                onClick={handleModalClose}
                disabled={imageLoading}
              >
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
                disabled={imageLoading}
                autoFocus
              />
              <p className="modal-hint">กรุณาใส่ URL ของรูปภาพที่ต้องการใช้</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={handleModalClose}
                disabled={imageLoading}
              >
                ยกเลิก
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleImageUrlSubmit}
                disabled={imageLoading || !imageUrl.trim()}
              >
                {imageLoading ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}