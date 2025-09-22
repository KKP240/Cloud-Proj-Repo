import React, { useEffect, useState } from 'react';
import { getActivities, deleteActivity } from '../services/api';
import '../css/Activities.css';

export default function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // state สำหรับ search และ filter
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  // เก็บค่า filter
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  
  // dropdown states
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getActivities({ page: 1, limit: 50 });
      console.log("✅ Activities data from API:", data);

      setActivities(data);

      // สร้าง list ของ country, province
      const uniqueCountries = [...new Set(data.map(a => a.country).filter(Boolean))];
      const uniqueProvinces = [...new Set(data.map(a => a.province).filter(Boolean))];

      // ใช้ field Tags (ตัวใหญ่) จาก backend
      const allTags = data.flatMap(a => a.Tags || []);
      console.log("📌 All Tags from activities:", allTags);

      const uniqueTags = allTags.filter((tag, index, self) =>
        index === self.findIndex(t => t.id === tag.id)
      );

      console.log("✅ Unique Tags:", uniqueTags);

      setCountries(uniqueCountries);
      setProvinces(uniqueProvinces);
      setAvailableTags(uniqueTags);

    } catch (e) {
      console.error("❌ Error fetching activities:", e);
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.activities-select-container') && 
          !event.target.closest('.activities-tags-select')) {
        setShowCountryDropdown(false);
        setShowProvinceDropdown(false);
        setShowSortDropdown(false);
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ฟังก์ชันเพื่อแสดง modal ยืนยันการลบ
  const showDeleteConfirmation = (activity) => {
    setActivityToDelete(activity);
    setShowDeleteModal(true);
  };

  // ฟังก์ชันยกเลิกการลบ
  const cancelDelete = () => {
    setActivityToDelete(null);
    setShowDeleteModal(false);
  };

  // ฟังก์ชันลบจริง
const confirmDelete = async () => {
  if (!activityToDelete) return;

  try {
    setDeletingId(activityToDelete.id);
    setShowDeleteModal(false);

    await deleteActivity(activityToDelete.id);

    // อัปเดต state ทันทีโดยไม่ต้องรีเฟรช
    setActivities(prev => prev.filter(a => a.id !== activityToDelete.id));

  } catch (error) {
    console.error('Delete error:', error);
    alert(`เกิดข้อผิดพลาด: ${error.message}`);
  } finally {
    setDeletingId(null);
    setActivityToDelete(null);
  }
};


  // toggle เลือก tag
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.id === tag.id);
      if (exists) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagToRemove.id));
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  // Handle dropdown selections
  const handleCountrySelect = (selectedCountry) => {
    setCountry(selectedCountry);
    setShowCountryDropdown(false);
  };

  const handleProvinceSelect = (selectedProvince) => {
    setProvince(selectedProvince);
    setShowProvinceDropdown(false);
  };

  const handleSortSelect = (selectedSort) => {
    setSortOrder(selectedSort);
    setShowSortDropdown(false);
  };

  if (loading) {
    return (
      <div className="activities-container">
        <div className="activities-inner-container">
          <div className="activities-loading">
            <div className="activities-spinner"></div>
            <div>กำลังโหลดกิจกรรม...</div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="activities-container">
        <div className="activities-inner-container">
          <div className="activities-error">
            <h3>เกิดข้อผิดพลาด</h3>
            <p>Error: {err}</p>
            <button onClick={loadActivities} className="retry-btn">
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  // filter data
  let filteredActivities = activities.filter(act => {
    const matchesSearch =
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase());

    const matchesCountry = country ? act.country === country : true;
    const matchesProvince = province ? act.province === province : true;

    // ✅ ใช้ act.Tags (ตัวใหญ่)
    const matchesTags = selectedTags.length === 0 ? true :
      selectedTags.some(selectedTag =>
        (act.Tags || []).some(actTag => actTag.id === selectedTag.id)
      );

    return matchesSearch && matchesCountry && matchesProvince && matchesTags;
  });

  if (sortOrder === "asc") {
    filteredActivities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortOrder === "desc") {
    filteredActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return (
    <div className="activities-container">
      <div className="activities-inner-container">
        <h2 className="activities-title">Activity Manager</h2>

        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="activities-search-input"
        />

        {/* Filters */}
        <div className="activities-filters">
          {/* Country Dropdown */}
          <div className="activities-select-container">
            <div
              className="activities-select-button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            >
              <span>
                {country || "-- Select Country --"}
              </span>
              <span className={`activities-dropdown-arrow ${showCountryDropdown ? 'open' : ''}`}>
                ▼
              </span>
            </div>

            {showCountryDropdown && (
              <div className="activities-dropdown">
                <div className="activities-dropdown-list">
                  <div
                    className="activities-dropdown-option"
                    onClick={() => handleCountrySelect("")}
                  >
                    -- Select Country --
                  </div>
                  {countries.map((c, i) => (
                    <div
                      key={i}
                      className={`activities-dropdown-option ${country === c ? 'selected' : ''}`}
                      onClick={() => handleCountrySelect(c)}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Province Dropdown */}
          <div className="activities-select-container">
            <div
              className="activities-select-button"
              onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
            >
              <span>
                {province || "-- Select Province --"}
              </span>
              <span className={`activities-dropdown-arrow ${showProvinceDropdown ? 'open' : ''}`}>
                ▼
              </span>
            </div>

            {showProvinceDropdown && (
              <div className="activities-dropdown">
                <div className="activities-dropdown-list">
                  <div
                    className="activities-dropdown-option"
                    onClick={() => handleProvinceSelect("")}
                  >
                    -- Select Province --
                  </div>
                  {provinces.map((p, i) => (
                    <div
                      key={i}
                      className={`activities-dropdown-option ${province === p ? 'selected' : ''}`}
                      onClick={() => handleProvinceSelect(p)}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multi-select Tags Dropdown */}
          <div className="activities-tags-select">
            <div
              className="activities-tags-button"
              onClick={() => setShowTagDropdown(!showTagDropdown)}
            >
              <span>
                {selectedTags.length === 0
                  ? "-- Select Tags --"
                  : `Select ${selectedTags.length} tags`
                }
              </span>
              <span className={`activities-dropdown-arrow ${showTagDropdown ? 'open' : ''}`}>
                ▼
              </span>
            </div>

            {showTagDropdown && (
              <div className="activities-tags-dropdown">
                <div className="activities-tags-dropdown-header">
                  <span>Select Tags</span>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={clearAllTags}
                      className="activities-clear-tags-btn"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="activities-tags-list">
                  {availableTags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`activities-tag-option ${
                        selectedTags.find(t => t.id === tag.id) ? 'selected' : ''
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.find(t => t.id === tag.id) ? true : false}
                        onChange={() => {}} // handled by onClick
                      />
                      <span>{tag.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="activities-select-container">
            <div
              className="activities-select-button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <span>
                {sortOrder === "asc" ? "Oldest → Newest" :
                 sortOrder === "desc" ? "Newest → Oldest" :
                 "-- Date created --"}
              </span>
              <span className={`activities-dropdown-arrow ${showSortDropdown ? 'open' : ''}`}>
                ▼
              </span>
            </div>

            {showSortDropdown && (
              <div className="activities-dropdown">
                <div className="activities-dropdown-list">
                  <div
                    className="activities-dropdown-option"
                    onClick={() => handleSortSelect("")}
                  >
                    -- Date created --
                  </div>
                  <div
                    className={`activities-dropdown-option ${sortOrder === 'asc' ? 'selected' : ''}`}
                    onClick={() => handleSortSelect("asc")}
                  >
                    Oldest → Newest
                  </div>
                  <div
                    className={`activities-dropdown-option ${sortOrder === 'desc' ? 'selected' : ''}`}
                    onClick={() => handleSortSelect("desc")}
                  >
                    Newest → Oldest
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="activities-selected-tags">
            <span className="activities-selected-tags-label">Tags ที่เลือก:</span>
            {selectedTags.map((tag) => (
              <span key={tag.id} className="activities-selected-tag">
                {tag.name}
                <button
                  onClick={() => removeTag(tag)}
                  className="activities-remove-tag-btn"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {filteredActivities.length === 0 ? (
          <div className="activities-empty">
            <div className="activities-empty-icon">📅</div>
            <div>ไม่พบกิจกรรมที่ค้นหา</div>
          </div>
        ) : (
          <div>
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="activities-card"
                onClick={() => window.location.href = `/activitiesEdit/${act.id}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="activities-card-content">
                  <div className="activities-image-container">
                    {act.posterUrl ? (
                      <img
                        src={act.posterUrl}
                        alt={act.title}
                        className="activities-image"
                      />
                    ) : (
                      <div className="activities-no-image">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="activities-content">
                    <h3 className="activities-activity-title">{act.title}</h3>
                    <div className="activities-description">{act.description}</div>

                    <div className="activities-meta">
                      <div className="activities-meta-item">
                        <span>✈️</span>
                        <span>Country: {act.country || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="activities-meta-item">
                        <span>📍</span>
                        <span>Province: {act.province || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="activities-meta-item">
                        <span>📅</span>
                        <span>
                          Date: {new Date(act.startDate).toLocaleDateString('Eng', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {act.Tags && act.Tags.length > 0 && (
                        <div className="activities-meta-item">
                          <span>🏷️</span>
                          <span>Tags: {act.Tags.map(tag => tag.name).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Management Buttons */}
                    <div className="activities-management-buttons">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // ป้องกัน event bubbling
                          showDeleteConfirmation(act);
                        }}
                        disabled={deletingId === act.id}
                        className="activities-delete-btn"
                      >
                        {deletingId === act.id ? (
                          <>
                            <div className="activities-delete-spinner"></div>
                            Deleting
                          </>
                        ) : (
                          <>
                            <span>🗑️</span>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && activityToDelete && (
          <div className="activities-delete-modal-overlay">
            <div className="activities-delete-modal">
              <div className="activities-delete-modal-header">
                <h3>⚠️ ยืนยันการลบ</h3>
              </div>
              
              <div className="activities-delete-modal-body">
                <p>คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?</p>
                <div className="activities-delete-activity-info">
                  <h4>"{activityToDelete.title}"</h4>
                  <p>{activityToDelete.description}</p>
                </div>
                <p className="activities-delete-warning">
                  <strong>⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้</strong>
                </p>
              </div>
              
              <div className="activities-delete-modal-footer">
                <button
                  onClick={cancelDelete}
                  className="activities-cancel-btn"
                  disabled={deletingId === activityToDelete?.id}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDelete}
                  className="activities-confirm-delete-btn"
                  disabled={deletingId === activityToDelete?.id}
                >
                  {deletingId === activityToDelete?.id ? (
                    <>
                      <div className="activities-delete-spinner"></div>
                      กำลังลบ...
                    </>
                  ) : (
                    <>
                      🗑️ ลบ
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}