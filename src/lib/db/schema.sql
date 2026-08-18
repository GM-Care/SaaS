-- ============================================================================
-- CLOUDFLARE D1 RELATIONAL SQL SCHEMA: CINESPACE SAAS
-- ============================================================================

-- 1. Merchants / Cinema Hosts
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  username TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL DEFAULT '1234',
  password_hash TEXT,
  business_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  logo_url TEXT,
  entity_type TEXT DEFAULT 'Limited Liability Partnership (LLP)',
  gstin TEXT DEFAULT '33AABCP1234F1Z8',
  pan_number TEXT DEFAULT 'AABCP1234F',
  owner_name TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  address TEXT NOT NULL,
  google_maps_url TEXT,
  bank_name TEXT,
  bank_account_no TEXT,
  bank_ifsc TEXT,
  upi_id TEXT,
  commission_rate_percent REAL DEFAULT 10.0,
  verification_status TEXT DEFAULT 'Approved',
  inspection_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Venues / Private Screening Suites
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  layout_specs TEXT NOT NULL,
  av_specs TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 9,
  base_price REAL NOT NULL DEFAULT 4999.0,
  photos_json TEXT DEFAULT '[]',
  video_url TEXT,
  image_url TEXT,
  description TEXT,
  average_rating REAL DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- 3. Time Slots
CREATE TABLE IF NOT EXISTS time_slots (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL,
  slot_name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);

-- 4. Bookings & Lease Passes (SAC 997312)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  venue_id TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  guests_count INTEGER NOT NULL,
  occasion TEXT,
  checkin_otp TEXT NOT NULL,
  govt_id_type TEXT NOT NULL,
  govt_id_number TEXT NOT NULL,
  damage_liability_accepted INTEGER DEFAULT 1,
  addons_json TEXT DEFAULT '[]',
  total_amount REAL NOT NULL,
  platform_commission REAL NOT NULL,
  merchant_net_payout REAL NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_status TEXT DEFAULT 'Paid',
  checkin_status TEXT DEFAULT 'Pending Check-In',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- 5. Customer Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  booking_id TEXT,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  av_rating INTEGER DEFAULT 5,
  comfort_rating INTEGER DEFAULT 5,
  hospitality_rating INTEGER DEFAULT 5,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payout Settlements Ledger
CREATE TABLE IF NOT EXISTS settlements (
  id TEXT PRIMARY KEY,
  settlement_id TEXT UNIQUE NOT NULL,
  booking_id TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  show_date TEXT NOT NULL,
  gross_total REAL NOT NULL,
  platform_fee_deducted REAL NOT NULL,
  net_payable_to_merchant REAL NOT NULL,
  settlement_status TEXT DEFAULT 'Settled',
  payout_utr TEXT,
  settled_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Platform Admin & Gateway Settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
