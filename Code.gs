/**
 * ============================================================================
 * CINESPACE & PRABHAKAR HOME CINEMA - MULTI-MERCHANT MARKETPLACE (APPS SCRIPT)
 * ============================================================================
 * Tech Stack: Google Apps Script + Google Sheets (Multi-Merchant Relational DB)
 * Features: Multi-Merchant Onboarding, Razorpay Gateway, Split Settlements,
 *           Indian Legal Compliance (Space Rental, Copyright Act 1957, SAC 997312)
 * ============================================================================
 */

var SHEET_NAMES = {
  SETTINGS: 'Settings',
  MERCHANTS: 'Merchants',
  SCREENS: 'Screens',
  TIME_SLOTS: 'Time_Slots',
  ADDONS: 'Addons_Packages',
  BOOKINGS: 'Bookings',
  SETTLEMENTS: 'Settlements'
};

var LEGAL_NOTICES = {
  COPYRIGHT_ACT_1957: 'This premises rental is strictly for private, non-commercial, family and personal entertainment purposes in compliance with the Indian Copyright Act, 1957 and Cinematograph Act, 1952. Neither the Platform nor the Host provides or broadcasts unlicensed commercial cinema prints. Guests are required to use their personal OTT accounts (Netflix, Prime, Hotstar, Apple TV) or personal gaming consoles.',
  SPACE_RENTAL_SAC: 'SAC Code 997312 (Rental of premises and event spaces for private functions) & SAC Code 998314 (Marketplace IT platform facilitation).',
  KYC_POLICE_RULE: 'Primary guest must be 18+ and present original Government-issued Photo ID (Aadhaar/DL/Voter ID/Passport) for physical verification upon check-in.'
};

/**
 * Serves Single Page Application
 */
function doGet(e) {
  try {
    initDatabase();
    var template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
      .setTitle('CineSpace India | Luxury Private Cinema Marketplace')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .addMetaTag('theme-color', '#090d16');
  } catch (err) {
    return HtmlService.createHtmlOutput('<div style="font-family:sans-serif;padding:30px;color:#b91c1c;"><h3>System Error</h3><p>' + err.toString() + '</p></div>');
  }
}

function getSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    var propSsId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (propSsId) ss = SpreadsheetApp.openById(propSsId);
  }
  if (!ss) throw new Error('No active spreadsheet found.');
  return ss;
}

/**
 * Initializes Multi-Merchant Database with Prabhakar Home Cinema and partner suites
 */
function initDatabase() {
  var ss = getSpreadsheet();
  
  // 1. Settings Sheet
  var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SHEET_NAMES.SETTINGS);
    var settingsData = [
      ['Key', 'Value', 'Description'],
      ['Platform_Name', 'CineSpace India - Luxury Private Theaters', 'Marketplace Brand Name'],
      ['Master_Admin_Email', Session.getActiveUser().getEmail() || 'admin@cinespace.in', 'Master Admin Email'],
      ['Master_Admin_Pin', '1234', 'Master Admin Security PIN'],
      ['Platform_Commission_Percent', '10.0', 'Platform Commission Fee %'],
      ['Payment_Gateway_Fee_Percent', '2.36', 'Razorpay Payment Gateway Fee % (2% + 18% GST)'],
      ['Razorpay_Key_Id', 'rzp_test_YourTestKeyId', 'Public Razorpay Key ID'],
      ['Razorpay_Key_Secret', 'YourTestSecretKey', 'Private Razorpay Secret Key'],
      ['Default_Support_Phone', '+91 99622 79790', 'Helpline WhatsApp Number'],
      ['Currency_Symbol', '₹', 'Display Currency']
    ];
    settingsSheet.getRange(1, 1, settingsData.length, 3).setValues(settingsData);
    formatHeaderRow(settingsSheet, 3);
  }

  // 2. Merchants Sheet
  var merchantsSheet = ss.getSheetByName(SHEET_NAMES.MERCHANTS);
  if (!merchantsSheet) {
    merchantsSheet = ss.insertSheet(SHEET_NAMES.MERCHANTS);
    var merchantHeaders = [
      ['Merchant ID', 'Business Name', 'Brand Name', 'Owner Name', 'Phone', 'Email', 'City', 'Address', 'UPI ID', 'Bank Account', 'IFSC', 'Commission %', 'Security PIN', 'Status']
    ];
    merchantsSheet.getRange(1, 1, 1, merchantHeaders[0].length).setValues(merchantHeaders);
    
    var merchantSeed = [
      ['MERCH-001', 'Prabhakar Luxury Theaters & Hospitality LLP', 'Prabhakar Home Cinema', 'Prabhakar R.', '+91 99622 79790', 'prabhakar@prabhakarcinema.in', 'Chennai', 'Prabhakar Home Cinemas, 4th Cross Street, Anna Nagar, Chennai - 600040.', '8667708711@upi', 'XXXXXX1234', 'HDFC0001234', 10, '1234', 'Active'],
      ['MERCH-002', 'Starlight Acoustic Theaters Pvt Ltd', 'Starlight Private Suites', 'Vikram Menon', '+91 98450 11223', 'vikram@starlightsuites.in', 'Bengaluru', 'Plot 45, 100ft Road, Indiranagar, Bengaluru - 560038.', 'starlighttheaters@upi', 'XXXXXX5678', 'ICIC0005678', 12, '5678', 'Active']
    ];
    merchantsSheet.getRange(2, 1, merchantSeed.length, merchantSeed[0].length).setValues(merchantSeed);
    formatHeaderRow(merchantsSheet, merchantHeaders[0].length);
  }

  // 3. Screens Sheet
  var screensSheet = ss.getSheetByName(SHEET_NAMES.SCREENS);
  if (!screensSheet) {
    screensSheet = ss.insertSheet(SHEET_NAMES.SCREENS);
    var screensData = [
      ['Screen ID', 'Merchant ID', 'Screen Name', 'City', 'Capacity', 'Seating Layout Specs', 'AV Specs', 'Base Price (₹)', 'Description', 'Status'],
      ['SCR-01', 'MERCH-001', 'Dolby Atmos Gold Lounge', 'Chennai', 9, '5 Motorized Recliner Sofas + 4 Bed Lounge', '4K RGB Laser + 9.4.6 Dolby Atmos + 180" Screen', 4999, 'Ultra-luxurious private screening lounge with 5 motorized recliners and a rear 4-guest VIP lounge bed setup.', 'Active'],
      ['SCR-02', 'MERCH-001', 'IMAX Grand Suite', 'Chennai', 14, '14 Dual-Motor Leather Loungers', '200" 4K MicroLED Wall + 9.4.6 Spatial Audio', 5999, 'Ultimate theatrical scale experience for large family gatherings.', 'Active'],
      ['SCR-03', 'MERCH-002', 'Starlight Fiber-Optic Couple Suite', 'Bengaluru', 4, '2 Luxury Double Loveseats', '4K HDR Laser + Starlight Constellation Ceiling', 3999, 'Cozy romantic theater room featuring a starlight fiber-optic ceiling.', 'Active']
    ];
    screensSheet.getRange(1, 1, screensData.length, 10).setValues(screensData);
    formatHeaderRow(screensSheet, 10);
  }

  // 4. Time_Slots Sheet
  var slotsSheet = ss.getSheetByName(SHEET_NAMES.TIME_SLOTS);
  if (!slotsSheet) {
    slotsSheet = ss.insertSheet(SHEET_NAMES.TIME_SLOTS);
    var slotsData = [
      ['Slot ID', 'Slot Name', 'Start Time', 'End Time', 'Active'],
      ['SLT-01', 'Morning Matinee (10:00 AM - 01:00 PM)', '10:00 AM', '01:00 PM', 'YES'],
      ['SLT-02', 'Afternoon Screening (02:00 PM - 05:00 PM)', '02:00 PM', '05:00 PM', 'YES'],
      ['SLT-03', 'Prime Evening (06:00 PM - 09:00 PM)', '06:00 PM', '09:00 PM', 'YES'],
      ['SLT-04', 'Midnight Chill (10:00 PM - 01:00 AM)', '10:00 PM', '01:00 AM', 'YES']
    ];
    slotsSheet.getRange(1, 1, slotsData.length, 5).setValues(slotsData);
    formatHeaderRow(slotsSheet, 5);
  }

  // 5. Addons_Packages Sheet
  var addonsSheet = ss.getSheetByName(SHEET_NAMES.ADDONS);
  if (!addonsSheet) {
    addonsSheet = ss.insertSheet(SHEET_NAMES.ADDONS);
    var addonsData = [
      ['Item ID', 'Category', 'Item Name', 'Price (₹)', 'Description'],
      ['ADD-01', 'Gourmet Snacks', 'Jumbo Caramel Popcorn & Soft Drinks Combo', 899, 'Large tub fresh caramel popcorn + 4 chilled beverages.'],
      ['ADD-02', 'Gourmet Snacks', 'Gourmet Nachos & Sliders Platter', 699, 'Loaded Mexican cheese nachos & mini artisan sliders.'],
      ['ADD-03', 'Celebration', 'VIP Birthday / Anniversary Decor Package', 1299, 'Helium balloons, custom LED lighting & screen banner.'],
      ['ADD-04', 'Celebration', 'Designer Celebration Cake (1 Kg Truffle)', 999, 'Premium celebration cake with sparkler candles.'],
      ['ADD-05', 'Gaming & Tech', 'PS5 & 4K Gaming Console Add-on (3 Hours)', 799, 'PlayStation 5 console setup with 4 controllers.']
    ];
    addonsSheet.getRange(1, 1, addonsData.length, 5).setValues(addonsData);
    formatHeaderRow(addonsSheet, 5);
  }

  // 6. Bookings Sheet (with Financial Split)
  var bookingsSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
  if (!bookingsSheet) {
    bookingsSheet = ss.insertSheet(SHEET_NAMES.BOOKINGS);
    var bHeaders = [
      ['Booking ID', 'Timestamp', 'Merchant ID', 'Screen Name', 'Customer Name', 'Phone', 'Email', 'Govt ID Type', 'Date', 'Slot', 'Guests', 'Occasion', 'Add-ons', 'Base (₹)', 'Addons (₹)', 'Platform Fee (₹)', 'PG Fee (₹)', 'Merchant Net (₹)', 'Total Paid (₹)', 'Razorpay Order ID', 'Razorpay Payment ID', 'Payment Status', 'Booking Status', 'Special Requests']
    ];
    bookingsSheet.getRange(1, 1, 1, bHeaders[0].length).setValues(bHeaders);
    formatHeaderRow(bookingsSheet, bHeaders[0].length);
  }

  // 7. Settlements Sheet (Merchant Payout Ledger)
  var settSheet = ss.getSheetByName(SHEET_NAMES.SETTLEMENTS);
  if (!settSheet) {
    settSheet = ss.insertSheet(SHEET_NAMES.SETTLEMENTS);
    var sHeaders = [
      ['Settlement ID', 'Created At', 'Merchant ID', 'Booking ID', 'Customer Name', 'Show Date', 'Gross Total (₹)', 'Platform Fee Retained (₹)', 'PG Fee (₹)', 'Net Payable to Merchant (₹)', 'Payout UPI / Bank', 'Settlement Status', 'Payout UTR']
    ];
    settSheet.getRange(1, 1, 1, sHeaders[0].length).setValues(sHeaders);
    formatHeaderRow(settSheet, sHeaders[0].length);
  }
}

function formatHeaderRow(sheet, numColumns) {
  var headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setBackground('#0f172a')
             .setFontColor('#f59e0b')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, numColumns);
}

/**
 * Returns marketplace payload: Settings, Merchants, Screens, Slots, Addons
 */
function getMarketplaceData() {
  try {
    initDatabase();
    var ss = getSpreadsheet();

    // 1. Settings Map
    var settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    var sRows = settingsSheet.getDataRange().getValues();
    var settings = {};
    for (var i = 1; i < sRows.length; i++) {
      if (sRows[i][0]) settings[String(sRows[i][0]).trim()] = sRows[i][1];
    }

    // 2. Merchants Map
    var mSheet = ss.getSheetByName(SHEET_NAMES.MERCHANTS);
    var mRows = mSheet.getDataRange().getValues();
    var merchants = [];
    var merchantsMap = {};
    for (var m = 1; m < mRows.length; m++) {
      var mRow = mRows[m];
      if (String(mRow[13]).toUpperCase() === 'ACTIVE') {
        var mObj = {
          id: mRow[0],
          businessName: mRow[1],
          brandName: mRow[2],
          ownerName: mRow[3],
          phone: mRow[4],
          email: mRow[5],
          city: mRow[6],
          address: mRow[7],
          upiId: mRow[8],
          commissionRate: Number(mRow[11])
        };
        merchants.push(mObj);
        merchantsMap[mObj.id] = mObj;
      }
    }

    // 3. Screens
    var scSheet = ss.getSheetByName(SHEET_NAMES.SCREENS);
    var scRows = scSheet.getDataRange().getValues();
    var screens = [];
    for (var s = 1; s < scRows.length; s++) {
      var r = scRows[s];
      if (String(r[9]).toUpperCase() === 'ACTIVE') {
        var merchantInfo = merchantsMap[r[1]] || {};
        screens.push({
          id: r[0],
          merchantId: r[1],
          name: r[2],
          city: r[3],
          capacity: Number(r[4]),
          layoutSpecs: r[5],
          avSpecs: r[6],
          basePrice: Number(r[7]),
          description: r[8],
          brandName: merchantInfo.brandName || 'Private Cinema',
          merchantPhone: merchantInfo.phone || '+91 99622 79790',
          merchantAddress: merchantInfo.address || r[3]
        });
      }
    }

    // 4. Slots
    var slSheet = ss.getSheetByName(SHEET_NAMES.TIME_SLOTS);
    var slRows = slSheet.getDataRange().getValues();
    var slots = [];
    for (var t = 1; t < slRows.length; t++) {
      if (String(slRows[t][4]).toUpperCase() === 'YES') {
        slots.push({
          id: slRows[t][0],
          name: slRows[t][1],
          startTime: slRows[t][2],
          endTime: slRows[t][3]
        });
      }
    }

    // 5. Addons
    var adSheet = ss.getSheetByName(SHEET_NAMES.ADDONS);
    var adRows = adSheet.getDataRange().getValues();
    var addons = [];
    for (var a = 1; a < adRows.length; a++) {
      if (adRows[a][0]) {
        addons.push({
          id: adRows[a][0],
          category: adRows[a][1],
          name: adRows[a][2],
          price: Number(adRows[a][3]),
          description: adRows[a][4]
        });
      }
    }

    return {
      success: true,
      settings: settings,
      merchants: merchants,
      screens: screens,
      slots: slots,
      addons: addons,
      legalNotices: LEGAL_NOTICES
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Checks available slots for a screen & date
 */
function getAvailableSlots(screenIdOrName, bookingDate) {
  try {
    var ss = getSpreadsheet();
    var slSheet = ss.getSheetByName(SHEET_NAMES.TIME_SLOTS);
    var slRows = slSheet.getDataRange().getValues();

    var bSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
    var bRows = bSheet.getDataRange().getValues();

    var targetDateStr = formatDateKey(bookingDate);
    var targetScreen = String(screenIdOrName).trim().toLowerCase();

    var occupied = {};
    for (var i = 1; i < bRows.length; i++) {
      var row = bRows[i];
      var bScreen = String(row[3]).trim().toLowerCase();
      var bDate = formatDateKey(row[8]);
      var bSlot = String(row[9]).trim();
      var bStatus = String(row[22]).trim().toLowerCase();

      if (bScreen === targetScreen && bDate === targetDateStr && (bStatus === 'confirmed' || bStatus === 'blocked')) {
        occupied[bSlot] = true;
      }
    }

    var results = [];
    for (var s = 1; s < slRows.length; s++) {
      if (String(slRows[s][4]).toUpperCase() === 'YES') {
        var sName = String(slRows[s][1]).trim();
        results.push({
          id: slRows[s][0],
          name: sName,
          startTime: slRows[s][2],
          endTime: slRows[s][3],
          isAvailable: !occupied[sName]
        });
      }
    }

    return { success: true, date: targetDateStr, slots: results };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Creates confirmed/blocked booking with financial split & records payout settlement
 */
function createMarketplaceBooking(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.tryLock(15000);
    var ss = getSpreadsheet();
    var bSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
    var bRows = bSheet.getDataRange().getValues();

    var targetDateStr = formatDateKey(payload.bookingDate);
    var targetSlot = String(payload.timeSlot).trim();
    var targetScreen = String(payload.screenName).trim();

    // Check race condition
    for (var i = 1; i < bRows.length; i++) {
      var row = bRows[i];
      if (String(row[3]).trim().toLowerCase() === targetScreen.toLowerCase() &&
          formatDateKey(row[8]) === targetDateStr &&
          String(row[9]).trim().toLowerCase() === targetSlot.toLowerCase() &&
          (String(row[22]).toLowerCase() === 'confirmed' || String(row[22]).toLowerCase() === 'blocked')) {
        return { success: false, error: 'This time slot was just booked by another guest. Please select another slot.' };
      }
    }

    var bookingId = generateBookingId(bRows);
    var timestamp = new Date();

    // Financial calculations
    var baseAmount = Number(payload.baseAmount || 4999);
    var addonsAmount = Number(payload.addonsAmount || 0);
    var subTotal = baseAmount + addonsAmount;
    var commissionRate = Number(payload.commissionRate || 10.0);
    var platformFee = Math.round((subTotal * commissionRate) / 100);
    var pgFee = Math.round((subTotal * 0.0236)); // ~2.36% Razorpay PG charges
    var merchantNet = Math.max(0, subTotal - platformFee - pgFee);

    var isConfirmed = !!payload.razorpayPaymentId || payload.isPaid;
    var paymentStatus = isConfirmed ? 'Paid (Razorpay)' : 'Pending UTR Verification';
    var bookingStatus = isConfirmed ? 'Confirmed' : 'Blocked';

    var newRow = [
      bookingId,
      timestamp,
      payload.merchantId || 'MERCH-001',
      targetScreen,
      payload.customerName || '',
      payload.customerPhone || '',
      payload.customerEmail || '',
      payload.govtIdType || 'Aadhaar Card',
      targetDateStr,
      targetSlot,
      payload.guests || 1,
      payload.occasion || 'Movie Screening',
      payload.addonsSummary || 'None',
      baseAmount,
      addonsAmount,
      platformFee,
      pgFee,
      merchantNet,
      subTotal,
      payload.razorpayOrderId || '',
      payload.razorpayPaymentId || '',
      paymentStatus,
      bookingStatus,
      payload.specialRequests || ''
    ];

    bSheet.appendRow(newRow);

    // Record in Settlement Ledger
    var sSheet = ss.getSheetByName(SHEET_NAMES.SETTLEMENTS);
    var settlementId = 'SETT-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    var settlementRow = [
      settlementId,
      timestamp,
      payload.merchantId || 'MERCH-001',
      bookingId,
      payload.customerName || '',
      targetDateStr,
      subTotal,
      platformFee,
      pgFee,
      merchantNet,
      payload.merchantUpi || '8667708711@upi',
      'Pending Transfer',
      ''
    ];
    sSheet.appendRow(settlementRow);

    // Dispatch Emails
    var merchant = getMerchantById(payload.merchantId || 'MERCH-001');
    sendCustomerVIPPassEmail(payload, bookingId, targetDateStr, subTotal, merchant);
    sendMerchantAlertEmail(payload, bookingId, targetDateStr, subTotal, merchantNet, merchant);

    return {
      success: true,
      bookingId: bookingId,
      bookingDate: targetDateStr,
      timeSlot: targetSlot,
      screenName: targetScreen,
      totalAmount: subTotal,
      merchantNetPayout: merchantNet,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      merchantPhone: merchant.phone
    };

  } catch (err) {
    return { success: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Searches bookings by ID or Phone
 */
function lookupBooking(query) {
  try {
    if (!query) return { success: false, message: 'Please provide Booking ID or Phone Number' };
    var ss = getSpreadsheet();
    var bSheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
    var rows = bSheet.getDataRange().getValues();

    var clean = String(query).trim().toLowerCase();
    var qPhone = clean.replace(/\D+/g, '');
    var matches = [];

    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      var bId = String(r[0]).trim().toLowerCase();
      var bPhone = String(r[5]).trim().replace(/\D+/g, '');

      if (bId === clean || (qPhone.length >= 7 && bPhone.includes(qPhone))) {
        matches.push({
          bookingId: r[0],
          timestamp: r[1],
          merchantId: r[2],
          screenName: r[3],
          customerName: r[4],
          customerPhone: r[5],
          customerEmail: r[6],
          govtIdType: r[7],
          bookingDate: formatDateKey(r[8]),
          timeSlot: r[9],
          guests: r[10],
          occasion: r[11],
          addons: r[12],
          totalAmount: r[18],
          paymentStatus: r[21],
          bookingStatus: r[22]
        });
      }
    }

    if (matches.length === 0) return { success: false, message: 'No reservation found' };
    return { success: true, booking: matches[matches.length - 1] };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// Helpers & Emails
function getMerchantById(mId) {
  var ss = getSpreadsheet();
  var mSheet = ss.getSheetByName(SHEET_NAMES.MERCHANTS);
  var rows = mSheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(mId).trim()) {
      return {
        id: rows[i][0],
        businessName: rows[i][1],
        brandName: rows[i][2],
        ownerName: rows[i][3],
        phone: rows[i][4],
        email: rows[i][5],
        address: rows[i][7],
        upiId: rows[i][8]
      };
    }
  }
  return { brandName: 'Prabhakar Home Cinema', phone: '+91 99622 79790', address: 'Anna Nagar, Chennai' };
}

function generateBookingId(rows) {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var id = 'PHC-';
  for (var c = 0; c < 4; c++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

function formatDateKey(dateVal) {
  if (!dateVal) return '';
  if (dateVal instanceof Date) {
    return Utilities.formatDate(dateVal, Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  var str = String(dateVal).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
  var d = new Date(str);
  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  return str;
}

function sendCustomerVIPPassEmail(payload, bookingId, dateStr, totalAmount, merchant) {
  if (!payload.customerEmail || payload.customerEmail.indexOf('@') === -1) return;
  var subject = '🎟️ Official Space Rental Pass & Tax Invoice: ' + bookingId + ' - ' + merchant.brandName;
  var html = ''
    + '<div style="font-family:sans-serif; background:#0b0f19; color:#ffffff; padding:25px; border-radius:12px; border:2px solid #f59e0b; max-width:600px; margin:auto;">'
    + '  <div style="text-align:center; border-bottom:2px dashed #f59e0b; padding-bottom:15px;">'
    + '    <div style="background:#059669; display:inline-block; padding:3px 10px; border-radius:15px; font-size:11px; font-weight:bold;">OFFICIAL ADMISSION PASS</div>'
    + '    <h2 style="color:#f59e0b; margin:6px 0 0 0;">' + merchant.brandName + '</h2>'
    + '    <p style="color:#94a3b8; font-size:12px; margin:2px 0;">SAC Code 997312 (Space & Cinema Infrastructure Rental)</p>'
    + '    <div style="font-size:20px; font-weight:bold; color:#fbbf24; font-family:monospace; margin-top:8px;">' + bookingId + '</div>'
    + '  </div>'
    + '  <div style="padding:20px 0; font-size:14px; line-height:1.7;">'
    + '    <div><strong>Guest:</strong> ' + payload.customerName + ' (' + payload.customerPhone + ')</div>'
    + '    <div><strong>Auditorium:</strong> ' + payload.screenName + '</div>'
    + '    <div><strong>Date & Slot:</strong> ' + dateStr + ' | ' + payload.timeSlot + '</div>'
    + '    <div><strong>Guests & Occasion:</strong> ' + payload.guests + ' Guests (' + payload.occasion + ')</div>'
    + '    <div><strong>Total Paid:</strong> <span style="color:#10b981; font-weight:bold;">₹' + totalAmount + '</span></div>'
    + '  </div>'
    + '  <div style="background:rgba(217,119,6,0.1); border-left:4px solid #f59e0b; padding:12px; font-size:12px; border-radius:4px; margin-bottom:15px;">'
    + '    <strong>📜 Indian Copyright Act, 1957 Compliance:</strong><br/>'
    + '    ' + LEGAL_NOTICES.COPYRIGHT_ACT_1957
    + '  </div>'
    + '  <div style="background:rgba(16,185,129,0.1); border-left:4px solid #10b981; padding:12px; font-size:12px; border-radius:4px;">'
    + '    <strong>🛡️ Check-in KYC Protocol:</strong><br/>'
    + '    ' + LEGAL_NOTICES.KYC_POLICE_RULE + '<br/>Venue: ' + merchant.address
    + '  </div>'
    + '</div>';

  try {
    MailApp.sendEmail({ to: payload.customerEmail, subject: subject, htmlBody: html });
  } catch (e) {
    Logger.log('Customer email error: ' + e.toString());
  }
}

function sendMerchantAlertEmail(payload, bookingId, dateStr, totalAmount, netPayout, merchant) {
  if (!merchant.email || merchant.email.indexOf('@') === -1) return;
  var subject = '💰 [NEW BOOKING & PAYOUT] ' + bookingId + ' (Net Payout: ₹' + netPayout + ')';
  var html = ''
    + '<div style="font-family:sans-serif; background:#f8fafc; color:#0f172a; padding:20px; border-radius:8px; border:1px solid #cbd5e1; max-width:600px;">'
    + '  <h3 style="color:#b45309; margin-top:0;">New Reservation & Settlement Credited</h3>'
    + '  <p>Dear ' + merchant.brandName + ',</p>'
    + '  <p>You have received a new booking for <strong>' + payload.screenName + '</strong> on <strong>' + dateStr + ' (' + payload.timeSlot + ')</strong>.</p>'
    + '  <div style="background:#f1f5f9; padding:12px; border-radius:6px; margin:12px 0; font-size:14px;">'
    + '    <div><strong>Guest:</strong> ' + payload.customerName + ' (' + payload.customerPhone + ')</div>'
    + '    <div><strong>Gross Booking Value:</strong> ₹' + totalAmount + '</div>'
    + '    <div><strong>Your Net Payout:</strong> <span style="color:#059669; font-weight:bold; font-size:16px;">₹' + netPayout + '</span></div>'
    + '  </div>'
    + '  <p style="font-size:12px; color:#64748b;">Payout settlement has been recorded in your settlement ledger to be disbursed to: <strong>' + merchant.upiId + '</strong>.</p>'
    + '</div>';

  try {
    MailApp.sendEmail({ to: merchant.email, subject: subject, htmlBody: html });
  } catch (e) {
    Logger.log('Merchant email error: ' + e.toString());
  }
}
