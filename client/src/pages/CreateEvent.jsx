// client/src/pages/CreateEvent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CreateEvent.css';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState('');
  const [msg, setMsg] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('Creating...');

    // normalize date-only (yyyy-mm-dd) to ISO start-of-day if needed
    const normStart = startDate ? (startDate.length === 10 ? startDate + 'T00:00:00' : startDate) : null;
    const normEnd = endDate ? (endDate.length === 10 ? endDate + 'T00:00:00' : endDate) : null;

    const payload = {
      title,
      description,
      location,
      country,
      province,
      startDate: normStart,   // <- use normalized values
      endDate: normEnd,       // <- use normalized values
      capacity: capacity ? Number(capacity) : null,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()).filter(Boolean) : []),
      images: images ? images.split(',').map(s => s.trim()).filter(Boolean) : []
    };
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg('Created');
        nav(`/activities/${data.activity.id}`);
      } else {
        setMsg('Error: ' + (data.error || JSON.stringify(data)));
      }
    } catch (err) {
      setMsg('Network error: ' + err.message);
    }
  }

  function add(e) {
    e.preventDefault();
    setCapacity(prev => Number(prev) + 1);
  }

  function subtract(e) {
    e.preventDefault();
    setCapacity(prev => (Number(prev) > 1 ? Number(prev) - 1 : 1));
  }

  function addTags(e) {
    e.preventDefault();
    if (inputValue.trim() !== "" && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  }

  return (
    <div className='StartEvent1'>
      <div className='StartEvent-life'>
        <h1>Start Your Event</h1>
        <form className='left-column' onSubmit={onSubmit}>

          {/* LEFT COLUMN */}
          <div className="left-content">
            {/* Name Event */}
            <div className='form-group'>
              <h4>Name Event</h4>
              <input
                className="form-input"
                placeholder="Name Event"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className='form-group'>
              <h4>Description</h4>
              <textarea
                className="form-input description-textarea"
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Image Section */}
            <div className='image-section'>
              <h4>Image</h4>
              <input
                className="form-input"
                placeholder="Image URLs (comma separated)"
                value={images}
                onChange={e => setImages(e.target.value)}
                style={{ marginTop: '10px' }}
              />
            </div>

            {/* Dates */}
            <div className='date-section'>
              <div className='date-group'>
                <h4>Start Day</h4>
                <input
                  type="date"
                  className="date-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className='date-group'>
                <h4>End Day</h4>
                <input
                  type="date"
                  className="date-input"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="tags-section">
              <h4>Tags</h4>
              <div className="tags-input-area">
                <input
                  className="tags-input"
                  placeholder="Tags"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="button" className="tags-add-button" onClick={addTags}>+</button>
              </div>
              <ul>
                {tags.map((tag, index) => (
                  <li key={index}>{tag}</li>
                ))}
              </ul>
            </div>

            {/* Participants */}
            <div className='participants-section'>
              <h4>Set participants</h4>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                min="0"
                className='participants-input'
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-content">
            {/* Show Event Page */}
            <div className='show-event-section'>
              <h4>Show Event Page</h4>
              <div className="event-preview-area"></div>
            </div>

            {/* Location */}
            <div className='location-section'>
              <h4>Location</h4>
              <input
                className="form-input"
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Province */}
            <div className='province-section'>
              <h4>Province</h4>
              <input
                className="form-input"
                placeholder="Province"
                value={province}
                onChange={e => setProvince(e.target.value)}
                required
              />
            </div>

            {/* Country */}
            <div className='country-section'>
              <h4>Country</h4>
              <input
                className="form-input"
                placeholder="Country"
                value={country}
                onChange={e => setCountry(e.target.value)}
                required
              />
            </div>

            <button type="submit" className='create-event-btn'>Create Event</button>
            {msg && <p>{msg}</p>}
          </div>

        </form>
      </div>
    </div>
  );
}
