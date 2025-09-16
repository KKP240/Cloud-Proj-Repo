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
    const payload = {
      title,
      description,
      location,
      country,
      province,
      startDate,
      endDate,
      capacity: capacity ? Number(capacity) : null,
      tags: tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      images: images ? images.split(',').map(s => s.trim()).filter(Boolean) : []
    };
    const token = localStorage.getItem('token');

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
  }
  function add(){
    setCapacity(capacity+1)
  }

  function subtract(){
    if (capacity > 1){
      setCapacity(capacity-1)
    }
  }

  function addTags() {
    if (inputValue.trim() !== "" && !tags.includes(inputValue)) {
      setTags([...tags, inputValue.trim()]);
      setInputValue(""); // ล้างช่อง input หลังเพิ่ม
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
                style={{marginTop: '10px'}}
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

            {/* Participants */}
            <div className='participants-section'>
              <h4>Set participants</h4>
              <div className='participants-section1'>
                <button onClick={add} className='add'>+</button>
                {capacity}
                <button onClick={subtract} className='subtract'>-</button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-content">
            {/* Show Event Page */}
            <div className='show-event-section'>
              <h4>Show Event Page</h4>
              <div className="event-preview-area">
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
        <button type="button" className="tags-add-button" onClick={addTags}>
          +
        </button>
      </div>
      <ul>
        {tags.map((tag, index) => (
          <li key={index}>{tag}</li>
        ))}
      </ul>
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

            <button type="submit" className='create-event-btn'>Create Event</button>
            {msg && <p>{msg}</p>}
          </div>

        </form>
      </div>
    </div>
  );
}