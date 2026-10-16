const express = require('express');
const SiteContent = require('../models/SiteContent');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { logActivity } = require('../utils/activity');

const router = express.Router();

const str = (value, max) => String(value ?? '').trim().slice(0, max);

// Keeps only the listed fields of each row, with a maximum length per field
const rows = (arr, fields, maxRows) =>
  (Array.isArray(arr) ? arr : []).slice(0, maxRows).map((row) =>
    Object.fromEntries(Object.entries(fields).map(([key, max]) => [key, str(row?.[key], max)]))
  );

function clean(body) {
  const b = body && typeof body === 'object' ? body : {};
  const out = {};

  if (b.hero && typeof b.hero === 'object') {
    out.hero = { heading: str(b.hero.heading, 200), paragraph: str(b.hero.paragraph, 600) };
  }
  if (b.about && typeof b.about === 'object') {
    out.about = {
      heading: str(b.about.heading, 200),
      story1: str(b.about.story1, 1200),
      story2: str(b.about.story2, 1200),
      facts: rows(b.about.facts, { label: 60, value: 150 }, 6).filter((r) => r.label && r.value),
      mission: str(b.about.mission, 600),
      vision: str(b.about.vision, 600),
    };
  }
  if (b.contact && typeof b.contact === 'object') {
    out.contact = {
      address: str(b.contact.address, 300),
      phones: str(b.contact.phones, 200),
      emails: str(b.contact.emails, 200),
      hours: rows(b.contact.hours, { day: 60, time: 60 }, 8).filter((r) => r.day && r.time),
    };
  }
  if (Array.isArray(b.services)) {
    out.services = rows(b.services, { title: 60, desc: 300 }, 8).filter((r) => r.title);
  }
  if (Array.isArray(b.testimonials)) {
    out.testimonials = rows(b.testimonials, { quote: 500, who: 100 }, 9).filter((r) => r.quote);
  }
  if (b.footer && typeof b.footer === 'object') {
    out.footer = {
      copyrightName: str(b.footer.copyrightName, 100),
      notice1: str(b.footer.notice1, 600),
      notice2: str(b.footer.notice2, 600),
      notice3: str(b.footer.notice3, 600),
    };
  }
  return out;
}

// Public: the website reads its text from here
router.get('/site-content', async (req, res) => {
  const doc = await SiteContent.findOne({ key: 'main' }).lean();
  res.json(doc?.data || {});
});

// Owner only: save the edited text
router.put('/admin/site-content', requireAuth, requireRole('owner'), async (req, res) => {
  const incoming = clean(req.body);
  const existing = await SiteContent.findOne({ key: 'main' }).lean();
  const data = { ...(existing?.data || {}), ...incoming };

  await SiteContent.findOneAndUpdate({ key: 'main' }, { $set: { data } }, { upsert: true });

  await logActivity(req, {
    action: 'content.update',
    target: 'Website content',
    details: `sections: ${Object.keys(incoming).join(', ')}`,
  });
  res.json({ success: true });
});

module.exports = router;