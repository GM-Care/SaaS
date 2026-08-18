/**
 * ============================================================================
 * MULTI-TENANT MARKETPLACE DATABASE ENGINE
 * ============================================================================
 * Includes Merchant Profile & Rich Media Management (Up to 10 Photos & 1 Video),
 * Brand Logo, Google Maps URL, Guest Check-in OTP, and Space Leasing.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'marketplace_db.json');

const DEFAULT_SEED_DATA = {
  adminCredentials: {
    username: 'admin',
    email: process.env.ADMIN_EMAIL || 'prabhakar@prabhakarcinema.in',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    pin: process.env.ADMIN_PIN || '1234',
    updatedAt: '2026-08-18'
  },

  gatewaySettings: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_DemoCineSpace2026',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret_key_123',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'demo_webhook_secret',
    mode: 'Test Mode (Sandbox)'
  },

  houseRules: [
    { icon: 'fa-ban-smoking', title: 'Strict No Smoking / Vaping', desc: 'Acoustic wall fabrics and laser optical sensors are ultra-sensitive.' },
    { icon: 'fa-shoe-prints', title: 'Indoor Footwear Only', desc: 'Place outdoor footwear on the entrance organizer to protect velvet acoustic carpets.' },
    { icon: 'fa-users', title: 'Strict Max 9 Guests', desc: '5 Motorized Recliner Sofas + 4-Guest VIP Bed Lounge. No overcrowding permitted.' },
    { icon: 'fa-shield-heart', title: 'Equipment Care', desc: 'Hirer is 100% liable for any damage or spillage to recliners, bed lounge, or 9.4.6 audio gear.' }
  ],

  merchants: [
    {
      id: 'MERCH-001',
      username: 'prabhakar',
      password: 'password123',
      pin: '1234',
      businessName: 'Prabhakar Luxury Theaters & Hospitality LLP',
      brandName: 'Prabhakar Home Cinema',
      logo: 'https://img.icons8.com/fluency/96/movie-projector.png',
      entityType: 'Limited Liability Partnership (LLP)',
      gstin: '33AABCP1234F1Z8',
      panNumber: 'AABCP1234F',
      ownerName: 'Prabhakar R.',
      phone: '+91 99622 79790',
      email: 'prabhakar@prabhakarcinema.in',
      city: 'Chennai',
      locality: 'Anna Nagar',
      address: 'Prabhakar Home Cinemas, 4th Cross Street, Anna Nagar, Chennai, Tamil Nadu - 600040.',
      googleMapsUrl: 'https://maps.google.com/?q=Anna+Nagar+Chennai',
      electricityConsumerNo: '04-123-456-789',
      fireSafetyCertified: true,
      cctvInstalled: true,
      bankAccountName: 'Prabhakar Luxury Theaters LLP',
      bankName: 'HDFC Bank Ltd',
      bankAccountNumber: '50200012345678',
      bankIfsc: 'HDFC0000123',
      upiId: '8667708711@upi',
      commissionRatePercent: 3.0,
      verificationStatus: 'Approved',
      inspectionNotes: 'Certified 9-Guest Luxury Lounge: 5 Motorized Ergonomic Recliners + 4 Bed VIP Lounge. Acoustic RT60 < 0.28s, 4K Laser & 9.4.6 Dolby Atmos Verified.',
      verifiedAt: '2026-01-16',
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        user: 'prabhakarhomecinema@gmail.com',
        pass: '',
        fromName: 'Prabhakar Home Cinema Concierge'
      },
      status: 'Active',
      joinedAt: '2026-01-15'
    },
    {
      id: 'MERCH-002',
      username: 'starlight',
      password: 'password123',
      pin: '5678',
      businessName: 'Starlight Acoustic Theaters Pvt Ltd',
      brandName: 'Starlight Private Suites',
      logo: 'https://img.icons8.com/fluency/96/cinema-glasses.png',
      entityType: 'Private Limited Company',
      gstin: '29AAECS5678K1ZQ',
      panNumber: 'AAECS5678K',
      ownerName: 'Vikram Menon',
      phone: '+91 98450 11223',
      email: 'vikram@starlightsuites.in',
      city: 'Bengaluru',
      locality: 'Indiranagar',
      address: 'Plot 45, 100ft Road, Indiranagar, Bengaluru, Karnataka - 560038.',
      googleMapsUrl: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
      electricityConsumerNo: 'BESCOM-9876543',
      fireSafetyCertified: true,
      cctvInstalled: true,
      bankAccountName: 'Starlight Acoustic Theaters Pvt Ltd',
      bankName: 'ICICI Bank Ltd',
      bankAccountNumber: '000205015678',
      bankIfsc: 'ICIC0000002',
      upiId: 'starlighttheaters@upi',
      commissionRatePercent: 5.0,
      verificationStatus: 'Approved',
      inspectionNotes: 'Starlight Fiber-Optic Constellation ceiling verified.',
      verifiedAt: '2026-02-12',
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        user: 'starlightsuites@gmail.com',
        pass: '',
        fromName: 'Starlight Suites Booking Desk'
      },
      status: 'Active',
      joinedAt: '2026-02-10'
    }
  ],

  venues: [
    {
      id: 'VEN-001',
      merchantId: 'MERCH-001',
      name: 'Dolby Atmos Gold Lounge (5 Recliners + 4 Bed Lounge)',
      brandName: 'Prabhakar Home Cinema',
      city: 'Chennai',
      locality: 'Anna Nagar',
      capacity: 9,
      layoutSpecs: '5 Motorized Recliner Sofas + Plush 4-Guest VIP Bed Lounge',
      avSpecs: '4K RGB Laser + 9.4.6 Dolby Atmos Spatial Audio + 180" Micro-Perforated Screen',
      basePrice: 4999,
      durationHours: 3,
      description: 'The pinnacle of bespoke cinematic luxury with 5 motorized ergonomic recliners and a rear 4-guest velvet bed lounge. Acoustically treated for reference-level Dolby Atmos immersion.',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1200&q=80'
      ],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      amenities: ['4K Laser HDR', '9.4.6 Dolby Atmos', '5 Motorized Sofas', '4-Bed VIP Lounge', 'PS5 4K Gaming', 'High-Speed Wi-Fi', 'Complimentary Popcorn', 'Valet Parking'],
      verificationStatus: 'Approved',
      averageRating: 4.95,
      totalReviews: 48,
      ratingScores: { av: 5.0, comfort: 4.9, hospitality: 4.9 },
      status: 'Active'
    },
    {
      id: 'VEN-002',
      merchantId: 'MERCH-001',
      name: 'IMAX Grand Suite',
      brandName: 'Prabhakar Home Cinema',
      city: 'Chennai',
      locality: 'Anna Nagar',
      capacity: 14,
      layoutSpecs: '14 Dual-Motor Leather Loungers across 2 Tiered Rows',
      avSpecs: '200" 4K MicroLED Wall + 9.4.6 Studio Reference Audio',
      basePrice: 5999,
      durationHours: 3,
      description: 'Massive theatrical scale private auditorium designed for large family reunions, celebrations, and sports screenings.',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'
      ],
      videoUrl: '',
      amenities: ['200" MicroLED 4K', 'Dolby Atmos', 'Tiered Loungers', 'Karaoke System', 'Party Lighting'],
      verificationStatus: 'Approved',
      averageRating: 4.9,
      totalReviews: 32,
      ratingScores: { av: 4.9, comfort: 4.9, hospitality: 4.8 },
      status: 'Active'
    }
  ],

  timeSlots: [
    { id: 'SLT-01', name: 'Morning Matinee (10:00 AM - 01:00 PM)', startTime: '10:00 AM', endTime: '01:00 PM', active: true },
    { id: 'SLT-02', name: 'Afternoon Screening (02:00 PM - 05:00 PM)', startTime: '02:00 PM', endTime: '05:00 PM', active: true },
    { id: 'SLT-03', name: 'Prime Evening (06:00 PM - 09:00 PM)', startTime: '06:00 PM', endTime: '09:00 PM', active: true },
    { id: 'SLT-04', name: 'Midnight Chill (10:00 PM - 01:00 AM)', startTime: '10:00 PM', endTime: '01:00 AM', active: true }
  ],

  addons: [
    { id: 'ADD-01', category: 'Gourmet Snacks', name: 'Caramel Popcorn & Artisanal Beverage Tub', price: 899, description: 'Large gourmet caramel popcorn tub + 4 cold-pressed craft beverages.' },
    { id: 'ADD-02', category: 'Gourmet Snacks', name: 'Loaded Cheese Nachos & Mini Burger Sliders', price: 699, description: 'Warm queso nachos + 4 assorted chef sliders platter.' },
    { id: 'ADD-03', category: 'Celebrations', name: 'VIP Birthday / Anniversary Decor Package', price: 1299, description: 'Helium balloons, custom LED lighting, digital banner & screen message display.' },
    { id: 'ADD-04', category: 'Celebrations', name: 'Designer Celebration Cake (1 Kg Belgian Truffle)', price: 999, description: 'Artisan customized celebration cake with sparkler candles and presentation knife.' },
    { id: 'ADD-05', category: 'Gaming & Tech', name: 'PlayStation 5 Console Setup with 4 Controllers', price: 799, description: 'PS5 console with FIFA 24, Mortal Kombat 1, Gran Turismo & 4 wireless controllers.' }
  ],

  reviews: [
    {
      id: 'REV-001',
      venueId: 'VEN-001',
      merchantId: 'MERCH-001',
      bookingId: 'PHC-7A8B',
      customerName: 'Ananya Deshmukh',
      rating: 5,
      avRating: 5,
      comfortRating: 5,
      hospitalityRating: 5,
      comment: 'Unbelievable Dolby Atmos 9.4.6 bass and audio separation! The 5 motorized recliners and the rear bed lounge made our family birthday celebration feel like a billionaire’s mansion.',
      createdAt: '2026-08-10',
      status: 'Published'
    }
  ],

  bookings: [],
  settlements: [],
  resetTokens: []
};

let db = { ...DEFAULT_SEED_DATA };

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(raw);
      if (!db.resetTokens) db.resetTokens = [];
      if (!db.houseRules) db.houseRules = DEFAULT_SEED_DATA.houseRules;
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Error loading DB file, fallback to default seed:', err.message);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving DB file:', err.message);
  }
}

loadDb();

// ============================================================================
// DATABASE METHODS
// ============================================================================

const dbService = {
  getHouseRules: () => db.houseRules || DEFAULT_SEED_DATA.houseRules,

  // --- PASSWORD RESET VIA EMAIL ENGINE ---
  createPasswordResetToken: (emailInput) => {
    const email = String(emailInput || '').trim().toLowerCase();
    if (!email) return null;

    const admin = dbService.getAdminCredentials();
    if (admin.email && admin.email.toLowerCase() === email) {
      const token = 'rst_' + crypto.randomBytes(24).toString('hex');
      const resetEntry = {
        token,
        role: 'admin',
        id: 'ADMIN',
        username: admin.username,
        email: admin.email,
        name: 'Master Platform Admin',
        expiresAt: Date.now() + 15 * 60 * 1000,
        used: false,
        createdAt: new Date().toISOString()
      };
      if (!db.resetTokens) db.resetTokens = [];
      db.resetTokens.push(resetEntry);
      saveDb();
      return resetEntry;
    }

    const merchant = (db.merchants || []).find(m => 
      (m.email && m.email.toLowerCase() === email) || 
      (m.smtpConfig && m.smtpConfig.user && m.smtpConfig.user.toLowerCase() === email)
    );

    if (merchant) {
      const token = 'rst_' + crypto.randomBytes(24).toString('hex');
      const resetEntry = {
        token,
        role: 'merchant',
        id: merchant.id,
        username: merchant.username || merchant.id,
        email: merchant.email,
        name: merchant.brandName,
        expiresAt: Date.now() + 15 * 60 * 1000,
        used: false,
        createdAt: new Date().toISOString()
      };
      if (!db.resetTokens) db.resetTokens = [];
      db.resetTokens.push(resetEntry);
      saveDb();
      return resetEntry;
    }

    return null;
  },

  verifyPasswordResetToken: (token) => {
    if (!token || !db.resetTokens) return null;
    const entry = db.resetTokens.find(t => t.token === token && !t.used);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) return { expired: true };
    return entry;
  },

  resetPasswordWithToken: (token, newPassword, newPin) => {
    const verified = dbService.verifyPasswordResetToken(token);
    if (!verified || verified.expired) return { success: false, message: 'Invalid or expired password reset link.' };

    if (verified.role === 'admin') {
      dbService.updateAdminCredentials(null, newPassword, newPin);
    } else if (verified.role === 'merchant') {
      dbService.updateMerchantCredentials(verified.id, null, newPassword, newPin);
    }

    verified.used = true;
    saveDb();

    return {
      success: true,
      role: verified.role,
      username: verified.username,
      name: verified.name
    };
  },

  // --- ADMIN CREDENTIALS ---
  getAdminCredentials: () => {
    return db.adminCredentials || {
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'prabhakar@prabhakarcinema.in',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      pin: process.env.ADMIN_PIN || '1234'
    };
  },

  verifyAdminAuth: (input) => {
    const creds = dbService.getAdminCredentials();
    const str = String(input).trim();
    return str === creds.pin || str === creds.password;
  },

  updateAdminCredentials: (newUsername, newPassword, newPin) => {
    db.adminCredentials = {
      username: newUsername ? newUsername.trim() : (db.adminCredentials.username || 'admin'),
      email: db.adminCredentials.email || 'prabhakar@prabhakarcinema.in',
      password: newPassword ? newPassword.trim() : (db.adminCredentials.password || 'admin123'),
      pin: newPin ? newPin.trim() : (db.adminCredentials.pin || '1234'),
      updatedAt: new Date().toISOString()
    };
    saveDb();
    return db.adminCredentials;
  },

  // --- GATEWAY & WEBHOOK SETTINGS ---
  getGatewaySettings: () => {
    return db.gatewaySettings || {
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_DemoKey',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      mode: 'Test Mode'
    };
  },

  updateGatewaySettings: (settings) => {
    db.gatewaySettings = {
      keyId: settings.keyId ? settings.keyId.trim() : '',
      keySecret: settings.keySecret ? settings.keySecret.trim() : '',
      webhookSecret: settings.webhookSecret ? settings.webhookSecret.trim() : '',
      mode: (settings.keyId || '').startsWith('rzp_live_') ? 'Live Production Mode' : 'Test Mode (Sandbox)'
    };
    saveDb();
    return db.gatewaySettings;
  },

  // --- MERCHANTS ---
  getMerchants: () => db.merchants || [],
  getMerchantById: (id) => (db.merchants || []).find(m => m.id === id),
  
  findMerchantByCredentials: (identifier, passwordOrPin) => {
    const id = String(identifier || '').trim().toLowerCase();
    const pass = String(passwordOrPin || '').trim();

    return (db.merchants || []).find(m => {
      const matchIdentifier = !identifier || 
        m.id.toLowerCase() === id || 
        (m.username && m.username.toLowerCase() === id) || 
        (m.email && m.email.toLowerCase() === id) ||
        (m.phone && m.phone.includes(id));

      const matchSecret = m.pin === pass || m.password === pass;
      return matchIdentifier && matchSecret;
    });
  },

  createMerchant: (data) => {
    const id = 'MERCH-' + ('00' + ((db.merchants.length || 0) + 1)).slice(-3);
    const newMerchant = {
      id,
      username: (data.username || data.email || id).toLowerCase().trim(),
      password: data.password || 'password123',
      pin: data.pin || '1234',
      businessName: data.businessName || '',
      brandName: data.brandName || data.businessName,
      logo: data.logo || 'https://img.icons8.com/fluency/96/movie-projector.png',
      entityType: data.entityType || 'Sole Proprietorship',
      gstin: data.gstin || 'EXEMPT_THRESHOLD',
      panNumber: data.panNumber || '',
      ownerName: data.ownerName || '',
      phone: data.phone || '',
      email: data.email || '',
      city: data.city || 'Chennai',
      locality: data.locality || '',
      address: data.address || '',
      googleMapsUrl: data.googleMapsUrl || '',
      electricityConsumerNo: data.electricityConsumerNo || '',
      fireSafetyCertified: data.fireSafetyCertified !== false,
      cctvInstalled: data.cctvInstalled !== false,
      bankAccountName: data.bankAccountName || data.ownerName,
      bankName: data.bankName || 'HDFC Bank',
      bankAccountNumber: data.bankAccountNumber || data.bankAccount || '',
      bankIfsc: data.bankIfsc || data.ifsc || '',
      upiId: data.upiId || '',
      commissionRatePercent: Number(data.commissionRatePercent || 10.0),
      verificationStatus: 'Pending Verification',
      inspectionNotes: 'Awaiting admin statutory KYC verification and infrastructure audit.',
      verifiedAt: null,
      smtpConfig: {
        host: data.smtpHost || 'smtp.gmail.com',
        port: Number(data.smtpPort || 587),
        user: data.smtpUser || data.email || '',
        pass: data.smtpPass || '',
        fromName: data.brandName || 'Private Cinema Concierge'
      },
      status: 'Active',
      joinedAt: new Date().toISOString().split('T')[0]
    };
    db.merchants.push(newMerchant);
    saveDb();
    return newMerchant;
  },

  // Merchant Self-Profile Update (Brand Name, Logo, Address, Maps Link, Phone, Email)
  updateMerchantProfile: (merchantId, profileData) => {
    const merchant = (db.merchants || []).find(m => m.id === merchantId);
    if (!merchant) return null;

    if (profileData.brandName) merchant.brandName = profileData.brandName.trim();
    if (profileData.logo) merchant.logo = profileData.logo.trim();
    if (profileData.city) merchant.city = profileData.city.trim();
    if (profileData.locality) merchant.locality = profileData.locality.trim();
    if (profileData.address) merchant.address = profileData.address.trim();
    if (profileData.googleMapsUrl) merchant.googleMapsUrl = profileData.googleMapsUrl.trim();
    if (profileData.phone) merchant.phone = profileData.phone.trim();
    if (profileData.email) merchant.email = profileData.email.trim();
    if (profileData.upiId) merchant.upiId = profileData.upiId.trim();

    // Update matching venues brandName and city
    (db.venues || []).forEach(v => {
      if (v.merchantId === merchantId) {
        if (profileData.brandName) v.brandName = profileData.brandName.trim();
        if (profileData.city) v.city = profileData.city.trim();
        if (profileData.locality) v.locality = profileData.locality.trim();
      }
    });

    saveDb();
    return merchant;
  },

  // Merchant Space & Media Update (Up to 10 Photos & 1 Video)
  updateVenueMediaAndDetails: (venueId, merchantId, data) => {
    const venue = (db.venues || []).find(v => v.id === venueId && v.merchantId === merchantId);
    if (!venue) return null;

    if (data.name) venue.name = data.name.trim();
    if (data.layoutSpecs) venue.layoutSpecs = data.layoutSpecs.trim();
    if (data.avSpecs) venue.avSpecs = data.avSpecs.trim();
    if (data.basePrice) venue.basePrice = Number(data.basePrice);
    if (data.capacity) venue.capacity = Number(data.capacity);
    if (data.description) venue.description = data.description.trim();

    // Primary image
    if (data.image) venue.image = data.image.trim();

    // Up to 10 photos array
    if (data.photos && Array.isArray(data.photos)) {
      venue.photos = data.photos.filter(p => typeof p === 'string' && p.trim().length > 0).slice(0, 10);
      if (venue.photos.length > 0 && !data.image) {
        venue.image = venue.photos[0];
      }
    }

    // 1 Video URL (YouTube, Vimeo, MP4 direct)
    if (data.videoUrl !== undefined) {
      venue.videoUrl = data.videoUrl ? data.videoUrl.trim() : '';
    }

    saveDb();
    return venue;
  },

  updateMerchantCredentials: (merchantId, newUsername, newPassword, newPin) => {
    const merchant = (db.merchants || []).find(m => m.id === merchantId);
    if (!merchant) return null;
    if (newUsername) merchant.username = newUsername.trim().toLowerCase();
    if (newPassword) merchant.password = newPassword.trim();
    if (newPin) merchant.pin = newPin.trim();
    saveDb();
    return merchant;
  },

  verifyMerchantInfrastructure: (merchantId, status, notes, customCommissionRate) => {
    const merchant = (db.merchants || []).find(m => m.id === merchantId);
    if (!merchant) return null;

    merchant.verificationStatus = status;
    if (notes) merchant.inspectionNotes = notes;
    if (status === 'Approved') merchant.verifiedAt = new Date().toISOString().split('T')[0];
    if (customCommissionRate !== undefined && customCommissionRate !== null) {
      merchant.commissionRatePercent = Number(customCommissionRate);
    }

    (db.venues || []).forEach(v => {
      if (v.merchantId === merchantId) {
        v.verificationStatus = status;
      }
    });

    saveDb();
    return merchant;
  },

  updateMerchantCommission: (merchantId, newRatePercent) => {
    const merchant = (db.merchants || []).find(m => m.id === merchantId);
    if (!merchant) return null;
    merchant.commissionRatePercent = Number(newRatePercent);
    saveDb();
    return merchant;
  },

  updateMerchantSmtp: (merchantId, smtpConfig) => {
    const merchant = (db.merchants || []).find(m => m.id === merchantId);
    if (!merchant) return null;
    merchant.smtpConfig = {
      host: smtpConfig.host || 'smtp.gmail.com',
      port: Number(smtpConfig.port || 587),
      user: smtpConfig.user || '',
      pass: smtpConfig.pass || '',
      fromName: smtpConfig.fromName || merchant.brandName || 'Cinema Concierge'
    };
    saveDb();
    return merchant;
  },

  // --- VENUES & SCREENS ---
  getVenues: (filters = {}) => {
    let list = db.venues || [];
    if (!filters.includeUnverified) {
      list = list.filter(v => v.verificationStatus === 'Approved');
    }
    if (filters.city && filters.city !== 'All') {
      list = list.filter(v => v.city.toLowerCase() === filters.city.toLowerCase());
    }
    if (filters.minCapacity) {
      list = list.filter(v => v.capacity >= Number(filters.minCapacity));
    }
    if (filters.merchantId) {
      list = list.filter(v => v.merchantId === filters.merchantId);
    }
    return list;
  },

  getVenueById: (id) => (db.venues || []).find(v => v.id === id),

  createVenue: (data) => {
    const id = 'VEN-' + ('00' + ((db.venues.length || 0) + 1)).slice(-3);
    const newVenue = {
      id,
      merchantId: data.merchantId,
      name: data.name,
      brandName: data.brandName || 'Private Theater',
      city: data.city || 'Chennai',
      locality: data.locality || '',
      capacity: Number(data.capacity || 9),
      layoutSpecs: data.layoutSpecs || '',
      avSpecs: data.avSpecs || '',
      basePrice: Number(data.basePrice || 4999),
      durationHours: Number(data.durationHours || 3),
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      photos: data.photos || [data.image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'],
      videoUrl: data.videoUrl || '',
      amenities: data.amenities || ['4K Laser', 'Dolby Atmos', 'Recliners'],
      verificationStatus: data.verificationStatus || 'Pending Verification',
      averageRating: 5.0,
      totalReviews: 0,
      ratingScores: { av: 5.0, comfort: 5.0, hospitality: 5.0 },
      status: 'Active'
    };
    db.venues.push(newVenue);
    saveDb();
    return newVenue;
  },

  // --- REVIEWS & FEEDBACK ---
  getReviews: (venueId) => {
    let list = db.reviews || [];
    if (venueId) list = list.filter(r => r.venueId === venueId);
    return list.reverse();
  },

  getMerchantReviews: (merchantId) => {
    return (db.reviews || []).filter(r => r.merchantId === merchantId).reverse();
  },

  submitReview: (payload) => {
    const reviewId = 'REV-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const newReview = {
      id: reviewId,
      venueId: payload.venueId,
      merchantId: payload.merchantId,
      bookingId: payload.bookingId || 'DIRECT',
      customerName: payload.customerName || 'Verified Guest',
      rating: Number(payload.rating) || 5,
      avRating: Number(payload.avRating) || 5,
      comfortRating: Number(payload.comfortRating) || 5,
      hospitalityRating: Number(payload.hospitalityRating) || 5,
      comment: payload.comment || 'Exceptional screening experience!',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Published'
    };

    db.reviews.push(newReview);

    const venue = (db.venues || []).find(v => v.id === payload.venueId);
    if (venue) {
      const venueReviews = db.reviews.filter(r => r.venueId === payload.venueId);
      const sum = venueReviews.reduce((acc, r) => acc + r.rating, 0);
      venue.totalReviews = venueReviews.length;
      venue.averageRating = Math.round((sum / venueReviews.length) * 10) / 10;
    }

    saveDb();
    return newReview;
  },

  // --- TIME SLOTS & AVAILABILITY ---
  getTimeSlots: () => db.timeSlots || [],
  getAvailableSlots: (venueId, bookingDate) => {
    const venue = (db.venues || []).find(v => v.id === venueId);
    if (!venue) return [];

    const activeSlots = (db.timeSlots || []).filter(s => s.active);
    const bookings = (db.bookings || []).filter(b => 
      b.venueId === venueId && 
      b.bookingDate === bookingDate &&
      (b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Blocked' || b.bookingStatus === 'Checked-In')
    );

    const occupiedSlotNames = new Set(bookings.map(b => b.timeSlot.trim()));

    return activeSlots.map(slot => ({
      id: slot.id,
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: !occupiedSlotNames.has(slot.name.trim())
    }));
  },

  getAddons: () => db.addons || [],

  // --- BOOKINGS & STATUTORY CONTRACT ---
  createBooking: (payload) => {
    const bookingId = 'PHC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const checkinOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking = {
      bookingId,
      checkinOtp,
      timestamp: new Date().toISOString(),
      venueId: payload.venueId,
      merchantId: payload.merchantId,
      venueName: payload.venueName,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      govtIdType: payload.govtIdType || 'Aadhaar Card',
      govtIdNumber: payload.govtIdNumber || 'XXXX-XXXX',
      adultsCount: Number(payload.adultsCount || 1),
      minorsCount: Number(payload.minorsCount || 0),
      bookingDate: payload.bookingDate,
      timeSlot: payload.timeSlot,
      guests: Number(payload.guests || 1),
      occasion: payload.occasion || 'Movie Screening',
      addons: payload.addons || [],
      addonsSummary: payload.addonsSummary || 'None',
      
      baseAmount: payload.baseAmount || 0,
      addonsAmount: payload.addonsAmount || 0,
      subTotal: payload.subTotal || 0,
      commissionRatePercent: payload.commissionRatePercent || 10.0,
      platformFee: payload.platformFee || 0,
      pgFee: payload.pgFee || 0,
      merchantNetPayout: payload.merchantNetPayout || 0,
      totalAmount: payload.totalAmount || 0,

      razorpayOrderId: payload.razorpayOrderId || '',
      razorpayPaymentId: payload.razorpayPaymentId || '',
      razorpaySignature: payload.razorpaySignature || '',
      paymentStatus: payload.paymentStatus || 'Pending Verification',
      bookingStatus: payload.bookingStatus || 'Blocked',
      checkinStatus: 'Pending Check-In',
      checkinTime: null,
      specialRequests: payload.specialRequests || '',
      legalAgreementAccepted: true,
      damageLiabilityAccepted: true
    };

    db.bookings.push(newBooking);

    if (newBooking.bookingStatus === 'Confirmed') {
      dbService.recordSettlement(newBooking);
    }

    saveDb();
    return newBooking;
  },

  getBookingById: (id) => (db.bookings || []).find(b => b.bookingId.toUpperCase() === String(id).trim().toUpperCase()),
  getBookingByOrderId: (orderId) => (db.bookings || []).find(b => b.razorpayOrderId === orderId),
  
  lookupBooking: (query) => {
    const q = String(query).trim().toLowerCase();
    const cleanPhone = q.replace(/\D+/g, '');
    return (db.bookings || []).filter(b => {
      const matchId = b.bookingId.toLowerCase() === q;
      const bPhone = (b.customerPhone || '').replace(/\D+/g, '');
      const matchPhone = cleanPhone.length >= 7 && bPhone.includes(cleanPhone);
      return matchId || matchPhone;
    });
  },

  updateBookingPayment: (bookingId, paymentId, signature) => {
    const b = (db.bookings || []).find(x => x.bookingId === bookingId);
    if (!b) return null;
    b.razorpayPaymentId = paymentId;
    b.razorpaySignature = signature;
    b.paymentStatus = 'Paid (Razorpay)';
    b.bookingStatus = 'Confirmed';
    
    dbService.recordSettlement(b);
    saveDb();
    return b;
  },

  verifyGuestCheckin: (bookingId, otpInput) => {
    const b = (db.bookings || []).find(x => x.bookingId === bookingId);
    if (!b) return { success: false, message: 'Booking not found' };

    if (otpInput && String(otpInput).trim() !== b.checkinOtp) {
      return { success: false, message: 'Invalid 4-digit check-in OTP' };
    }

    b.checkinStatus = 'Checked-In';
    b.checkinTime = new Date().toISOString();
    saveDb();
    return { success: true, booking: b };
  },

  // --- SETTLEMENTS LEDGER ---
  recordSettlement: (booking) => {
    const settlementId = 'SETT-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const settlement = {
      settlementId,
      merchantId: booking.merchantId,
      bookingId: booking.bookingId,
      venueName: booking.venueName,
      customerName: booking.customerName,
      showDate: booking.bookingDate,
      grossTotal: booking.totalAmount,
      commissionRate: booking.commissionRatePercent,
      platformFeeDeducted: booking.platformFee,
      pgFeeDeducted: booking.pgFee,
      netPayableToMerchant: booking.merchantNetPayout,
      settlementStatus: 'Pending Transfer',
      payoutUtr: '',
      createdAt: new Date().toISOString()
    };
    db.settlements.push(settlement);
    saveDb();
    return settlement;
  },

  getMerchantSettlements: (merchantId) => {
    return (db.settlements || []).filter(s => s.merchantId === merchantId);
  },

  getAllSettlements: () => db.settlements || [],

  markSettlementPaid: (settlementId, utr) => {
    const s = (db.settlements || []).find(x => x.settlementId === settlementId);
    if (s) {
      s.settlementStatus = 'Settled';
      s.payoutUtr = utr;
      s.settledAt = new Date().toISOString();
      saveDb();
      return s;
    }
    return null;
  },

  // --- MASTER ANALYTICS ---
  getMasterStats: () => {
    const totalBookings = db.bookings.length;
    const confirmedBookings = db.bookings.filter(b => b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Checked-In');
    const totalGmv = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalPlatformCommission = confirmedBookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);
    const totalMerchantPayouts = confirmedBookings.reduce((sum, b) => sum + (b.merchantNetPayout || 0), 0);

    return {
      totalMerchants: db.merchants.length,
      approvedMerchantsCount: db.merchants.filter(m => m.verificationStatus === 'Approved').length,
      pendingMerchantsCount: db.merchants.filter(m => m.verificationStatus === 'Pending Verification').length,
      totalVenues: db.venues.length,
      totalBookings,
      confirmedCount: confirmedBookings.length,
      totalGmv,
      totalPlatformCommission,
      totalMerchantPayouts,
      pendingSettlementsCount: db.settlements.filter(s => s.settlementStatus === 'Pending Transfer').length
    };
  }
};

module.exports = dbService;
