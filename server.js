const dns = require('dns');
// Railway deployment sync - fixed server version

dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// Certificate Schema
// ===============================

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },

  studentName: {
    type: String,
    required: true
  },

  courseName: {
    type: String,
    required: true
  },

  category: {
    type: String,
    default: 'Internship'
  },

  duration: {
    type: String,
    required: true
  },

  companyName: {
    type: String,
    required: true
  },

  startDate: String,

  endDate: String,

  status: {
    type: String,
    enum: ['Valid', 'Revoked'],
    default: 'Valid'
  }

}, {
  timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);

// ===============================
// Base URL
// ===============================

function baseUrl(req) {
  return (
    process.env.BASE_URL ||
    `${req.protocol}://${req.get('host')}`
  ).replace(/\/$/, '');
}

// ===============================
// Verify Certificate API
// ===============================

app.get('/api/certificates/verify/:id', async (req, res) => {
  try {
    const cert = await Certificate
      .findOne({ certificateId: req.params.id })
      .lean();

    if (!cert) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      valid: cert.status === 'Valid',
      certificate: cert
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      valid: false,
      message: 'Server error'
    });
  }
});

// ===============================
// Generate QR Code
// ===============================

app.get('/api/certificates/qr/:id', async (req, res) => {
  try {
    const cert = await Certificate
      .findOne({ certificateId: req.params.id })
      .lean();

    if (!cert) {
      return res.status(404).json({
        message: 'Certificate not found'
      });
    }

    const url =
      `${baseUrl(req)}/verify/${encodeURIComponent(cert.certificateId)}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      width: 500,
      margin: 2
    });

    res.type('png').send(qrBuffer);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Could not generate QR code'
    });
  }
});

// ===============================
// Create Certificate
// ===============================

app.post('/api/certificates', async (req, res) => {
  try {
    const certificateId =
      req.body.certificateId ||
      require('crypto')
        .randomBytes(8)
        .toString('hex')
        .toUpperCase();

    const cert = await Certificate.create({
      ...req.body,
      certificateId
    });

    const verificationUrl =
      `${baseUrl(req)}/verify/${encodeURIComponent(certificateId)}`;

    res.status(201).json({
      certificate: cert,
      verificationUrl,
      qrUrl:
        `${baseUrl(req)}/api/certificates/qr/${certificateId}`
    });

  } catch (err) {
    console.error(err);

    res.status(400).json({
      message: err.message
    });
  }
});

// ===============================
// Verification Page
// ===============================

app.get('/verify/:id', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'verify.html')
  );
});

// ===============================
// Health Check
// ===============================

app.get('/api/health', (req, res) => {
  res.json({
    ok: true
  });
});

// ===============================
// Start Server
// ===============================

const port = process.env.PORT || 3000;

async function start() {

  if (process.env.MONGODB_URI) {

    try {

      await mongoose.connect(process.env.MONGODB_URI);

      console.log('MongoDB connected');

    } catch (e) {

      console.error(
        'MongoDB connection failed:',
        e.message
      );

    }

  } else {

    console.warn(
      'MONGODB_URI not set. Database routes will not work until configured.'
    );

  }

  app.listen(
    port,
    '0.0.0.0',
    () => {
      console.log(
        `Server running on port ${port}`
      );
    }
  );
}

start();