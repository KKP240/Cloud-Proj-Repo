// src/controllers/uploadController.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// 1. สร้าง S3 Client
// SDK จะอ่าน credentials (KEY, SECRET, TOKEN) จาก process.env อัตโนมัติ
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.S3_BUCKET;

// ฟังก์ชันช่วยสร้างชื่อไฟล์แบบสุ่ม
const randomImageName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');

module.exports = {
  async getPresignedUrl(req, res) {
    try {
      const { fileName, fileType } = req.body;
      if (!fileName || !fileType) {
        return res.status(400).json({ error: 'fileName and fileType are required' });
      }

      // 2. สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน
      const fileExtension = fileName.split('.').pop();
      const uniqueKey = `images/${randomImageName()}.${fileExtension}`; // เก็บในโฟลเดอร์ images/

      // 3. สร้างคำสั่งสำหรับ S3
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueKey,
        ContentType: fileType,
        ACL: 'public-read'
      });

      // 4. สร้าง Pre-signed URL
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300 // URL ใช้งานได้ 5 นาที
      });

      // 5. นี่คือ URL จริงของไฟล์หลังจากอัปโหลดเสร็จ
      const finalUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

      // 6. ส่ง URL ทั้งสองกลับไป
      res.json({ signedUrl, finalUrl });

    } catch (err) {
      console.error('Error creating presigned URL:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
};