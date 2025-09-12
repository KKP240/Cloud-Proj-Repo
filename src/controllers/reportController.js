// src/controllers/reportController.js
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const models = require('../../models');
const { Activity, Registration, User } = models;

function formatDate(dt) {
  if (!dt) return '';
  try { return new Date(dt).toLocaleString(); } catch(e) { return String(dt); }
}

module.exports = {
  // GET /api/activities/:id/registrations/export?format=csv|pdf
  async exportRegistrations(req, res) {
    const activityId = Number(req.params.id);
    const format = (req.query.format || 'pdf').toLowerCase();

    try {
      const activity = await Activity.findByPk(activityId);
      if (!activity) return res.status(404).json({ error: 'Activity not found' });

      const regs = await Registration.findAll({
        where: { activityId },
        include: [{ model: User, attributes: ['id', 'name', 'email'] }],
        order: [['registeredAt', 'ASC']]
      });

      const rows = regs.map(r => ({
        registrationId: r.id,
        userId: r.userId,
        userName: r.User ? r.User.name : '',
        userEmail: r.User ? r.User.email : '',
        status: r.status,
        registeredAt: formatDate(r.registeredAt),
        createdAt: formatDate(r.createdAt)
      }));

      const filenameBase = `activity_${activityId}_registrations_${Date.now()}`;

      if (format === 'csv') {
        // fallback to previous CSV behavior if needed
        const { Parser } = require('json2csv');
        const fields = ['registrationId','userId','userName','userEmail','status','registeredAt','createdAt'];
        const parser = new Parser({ fields });
        const csv = parser.parse(rows);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
        return res.send(csv);
      }

      // -------------- HTML -> PDF via Puppeteer ----------------
      const templatePath = path.join(__dirname, '..', 'templates', 'registration_report.ejs');

      const html = await ejs.renderFile(templatePath, {
        activity: {
          id: activity.id,
          title: activity.title,
          location: activity.location,
          startDateStr: formatDate(activity.startDate),
          endDateStr: formatDate(activity.endDate)
        },
        rows,
        nowStr: formatDate(new Date())
      });

      // Launch puppeteer
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // safe defaults for many environments
      });
      const page = await browser.newPage();

      // set content and wait for networkidle to allow images/external resources (if any)
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
      return res.send(pdfBuffer);

    } catch (err) {
      console.error('exportRegistrations error (puppeteer):', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
};
