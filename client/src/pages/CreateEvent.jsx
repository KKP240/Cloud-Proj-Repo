// client/src/pages/CreateEvent.jsx
import React, { useState, useEffect } from 'react';
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
  //const [images, setImages] = useState(''); // ไม่ใช้แล้ว เปลี่ยนเป็น s3
  const [selectedFiles, setSelectedFiles] = useState([]); // เก็บไฟล์ที่เลือก
  const [previewUrl, setPreviewUrl] = useState(null);     // สำหรับพรีวิวรูปแรก
  const [isUploading, setIsUploading] = useState(false);  // สถานะอัปโหลด
  const [msg, setMsg] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [provinceOptions, setProvinceOptions] = useState([]);

  const nav = useNavigate();

  // ตรวจสอบว่า login หรือยัง
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณา login ก่อนสร้างอีเวนท์');
      nav('/login'); // เปลี่ยนไปหน้า login (ปรับ path ตามที่คุณใช้)
    }
  }, [nav]);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      // 1. สร้าง URL ชั่วคราวสำหรับไฟล์แรก
      const firstFile = selectedFiles[0];
      const objectUrl = URL.createObjectURL(firstFile);
      setPreviewUrl(objectUrl);

      // 2. คืนค่า memory เมื่อ component ถูกปิด หรือไฟล์เปลี่ยน
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null); // เคลียร์พรีวิวถ้าไม่เลือกไฟล์
    }
  }, [selectedFiles]); // ทำงานใหม่ทุกครั้งที่ 'selectedFiles' เปลี่ยน

async function onSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // --- 1. ตรวจสอบว่ามีไฟล์ให้เลือกหรือไม่ ---
    if (selectedFiles.length === 0) {
      setMsg('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป');
      return;
    }
    
    setMsg('กำลังอัปโหลดรูปภาพ...');
    setIsUploading(true);

    const uploadedImageUrls = [];

    try {
      // --- 2. วนลูปอัปโหลดทีละไฟล์ ---
      for (const file of selectedFiles) {
        
        // 2a. ขอ Pre-signed URL จาก Backend
        const presignRes = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ fileName: file.name, fileType: file.type })
        });

        if (!presignRes.ok) {
          const err = await presignRes.json();
          throw new Error(`ไม่สามารถรับ URL: ${err.details || err.error}`);
        }

        const { signedUrl, finalUrl } = await presignRes.json();

        // 2b. อัปโหลดไฟล์ไปที่ S3 โดยตรง (ใช้ PUT)
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });

        if (!uploadRes.ok) {
          throw new Error(`อัปโหลดไฟล์ ${file.name} ไปที่ S3 ล้มเหลว`);
        }

        // 2c. เก็บ URL จริงที่อัปโหลดเสร็จแล้ว
        uploadedImageUrls.push(finalUrl);
      }

      // --- 3. เมื่ออัปโหลดเสร็จทั้งหมดแล้ว สร้าง Event ---
      setMsg('กำลังสร้างอีเวนท์...');

      const normStart = startDate ? (startDate.length === 10 ? startDate + 'T00:00:00' : startDate) : null;
      const normEnd = endDate ? (endDate.length === 10 ? endDate + 'T00:00:00' : endDate) : null;

      const payload = {
        title,
        description,
        location,
        country,
        province,
        startDate: normStart,
        endDate: normEnd,
        capacity: capacity ? Number(capacity) : null,
        tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()).filter(Boolean) : []),
        images: uploadedImageUrls, // 👈 ใช้ URL จาก S3
        posterUrl: uploadedImageUrls[0] || null // 👈 ใช้รูปแรกเป็น poster
      };

      // 4. ส่งข้อมูลไปที่ API สร้าง Activity
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg('Created');
        nav(`/activities/${data.activity.id}`);
      } else {
        setMsg('Error: ' (data.error || JSON.stringify(data)));
      }

    } catch (err) {
      setMsg('เกิดข้อผิดพลาด: ' + err.message);
      console.error(err);
    } finally {
      setIsUploading(false); // ปลดล็อกปุ่ม
    }
  }

  function addTags(e) {
    e.preventDefault();
    if (inputValue.trim() !== "" && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  }

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

  const firstImageUrl = images.split(',')[0].trim();

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
                type="file"
                multiple  // 👈 อนุญาตให้เลือกหลายไฟล์
                accept="image/*" // 👈 รับเฉพาะไฟล์รูปภาพ
                className="form-input"
                onChange={e => setSelectedFiles(Array.from(e.target.files))} // 👈 เก็บไฟล์ใน state
                style={{ marginTop: '10px' }}
              />
              <small>คุณสามารถเลือกได้หลายรูป</small>
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
                  min={startDate || ''}
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
              <div className="event-preview-area">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Event Preview" 
                    className="event-preview-image" 
                  />
                ) : (
                  <div className="event-preview-placeholder">
                    <span>Image Preview</span>
                  </div>
                )}
              </div>
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

            {/* Country */}
            <div className='country-section'>
              <h4>Country</h4>
              <select
                className="form-input"
                value={country}
                onChange={e => {
                  setCountry(e.target.value);
                  setProvince("");
                  setProvinceOptions(countries[e.target.value] || []);
                }}
                required
              >
                <option value="">-- Select Country --</option>
                {Object.keys(countries).map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div className='province-section'>
              <h4>Province</h4>
              <select
                className="form-input"
                value={province}
                onChange={e => setProvince(e.target.value)}
                required
                disabled={!country}
              >
                <option value="">-- Select Province --</option>
                {provinceOptions.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <button type="submit" className='create-event-btn' disabled={isUploading}>
              {isUploading ? 'กำลังอัปโหลด...' : 'Create Event'}
            </button>
            {msg && <p>{msg}</p>}
          </div>

        </form>
      </div>
    </div>
  );
}