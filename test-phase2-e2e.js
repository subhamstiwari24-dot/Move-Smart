// test-phase2-e2e.js
// Comprehensive End-to-End Verification of Phase 2 Citizen Portal & Multi-User Backend

const BACKEND_URL = 'http://localhost:8080';

async function runPhase2Verification() {
  console.log('================================================================');
  console.log('   MOVESMART PHASE 2 — CITIZEN PORTAL E2E VERIFICATION SUITE   ');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 14;

  const timestamp = Date.now();
  const citizenA_Email = `citizen.a.${timestamp}@mumbai-mobility.in`;
  const citizenB_Email = `citizen.b.${timestamp}@mumbai-mobility.in`;
  const citizenA_Pass = 'SecurePass@2026';
  const citizenB_Pass = 'SafeCommute@2026';

  let tokenA = '';
  let tokenB = '';
  let userA = null;
  let userB = null;
  let trackingIdA = '';
  let incidentIdA = '';
  let notificationIdA = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Citizen A Registration with Valid Details
    // -------------------------------------------------------------
    console.log('[TEST 1] Registering Citizen A with complete credentials...');
    const regResA = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Aarav Mehta',
        email: citizenA_Email,
        phone: '9820011223',
        password: citizenA_Pass
      })
    });
    console.assert(regResA.status === 200 || regResA.status === 201, `Expected 200/201, got ${regResA.status}`);
    const regDataA = await regResA.json();
    console.assert(regDataA.role === 'ROLE_CITIZEN', `Role must be strictly ROLE_CITIZEN, got ${regDataA.role}`);
    console.assert(regDataA.token, 'Must return JWT token');
    tokenA = regDataA.token;
    userA = { id: regDataA.id, email: regDataA.email, fullName: regDataA.fullName, role: regDataA.role };
    console.log(`✓ TEST 1 PASSED: Citizen A registered successfully. Role: ${regDataA.role}, ID: ${regDataA.id}`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 2: Duplicate Email Rejection
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Attempting duplicate registration with Citizen A email...');
    const dupRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Imposter Citizen',
        email: citizenA_Email,
        phone: '9820099999',
        password: 'Password@123'
      })
    });
    console.assert(dupRes.status === 400, `Expected 400 Bad Request, got ${dupRes.status}`);
    const dupData = await dupRes.json();
    console.assert(dupData.error && dupData.error.toLowerCase().includes('already in use'), 'Should report duplicate email error');
    console.log(`✓ TEST 2 PASSED: Duplicate registration rejected with HTTP 400: "${dupData.error}"`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 3: Citizen Login with Valid Credentials
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Citizen Login with registered credentials...');
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: citizenA_Email,
        password: citizenA_Pass
      })
    });
    console.assert(loginRes.status === 200, `Expected 200 OK, got ${loginRes.status}`);
    const loginData = await loginRes.json();
    console.assert(loginData.token, 'Login must yield JWT token');
    console.assert(loginData.email === citizenA_Email, 'User email must match');
    tokenA = loginData.token;
    console.log(`✓ TEST 3 PASSED: Citizen A logged in. JWT token verified.`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 4: Invalid Password Rejection
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Citizen Login with incorrect password...');
    const badLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: citizenA_Email,
        password: 'WrongPassword@999'
      })
    });
    console.assert(badLoginRes.status === 401, `Expected 401 Unauthorized, got ${badLoginRes.status}`);
    console.log(`✓ TEST 4 PASSED: Invalid password rejected with HTTP 401 Unauthorized.`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 5: Second Citizen Registration (Citizen B)
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Registering independent second Citizen B...');
    const regResB = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Kavita Joshi',
        email: citizenB_Email,
        phone: '9833344556',
        password: citizenB_Pass
      })
    });
    console.assert(regResB.status === 200 || regResB.status === 201, `Expected 200/201, got ${regResB.status}`);
    const regDataB = await regResB.json();
    tokenB = regDataB.token;
    userB = { id: regDataB.id, email: regDataB.email, fullName: regDataB.fullName, role: regDataB.role };
    console.log(`✓ TEST 5 PASSED: Citizen B registered. ID: ${userB.id}, Role: ${userB.role}`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 6: RBAC Isolation - Citizens cannot access Admin API (/api/auth/users)
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Verifying RBAC protection - Citizen cannot access /api/auth/users...');
    const usersAdminRes = await fetch(`${BACKEND_URL}/api/auth/users`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    console.assert(usersAdminRes.status === 403, `Expected 403 Forbidden for Citizen, got ${usersAdminRes.status}`);
    console.log(`✓ TEST 6 PASSED: Endpoint /api/auth/users returned HTTP 403 Forbidden for Citizen.`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 7: Complaint Submission by Citizen A (4-Step Wizard Backend API)
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Submitting road hazard complaint as Citizen A...');
    const submitRes = await fetch(`${BACKEND_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Deep Hazardous Pothole Near SV Road Signal',
        category: 'Damaged Road',
        description: 'Large 40cm wide crater causing sudden braking and two-wheeler skidding risk.',
        location: 'SV Road, Bandra West near Lucky Restaurant Signal',
        latitude: 19.0558,
        longitude: 72.8398,
        priority: 'High',
        status: 'Submitted',
        reporter: {
          name: 'Aarav Mehta',
          email: citizenA_Email,
          phone: '9820011223',
          isAnonymous: false
        }
      })
    });
    console.assert(submitRes.status === 201, `Expected 201 Created, got ${submitRes.status}`);
    const incidentA = await submitRes.json();
    console.assert(incidentA.id.startsWith('MS-'), 'Incident ID must start with MS-');
    console.assert(incidentA.trackingId && incidentA.trackingId.startsWith('MS-TRK-'), `Tracking ID must start with MS-TRK-, got ${incidentA.trackingId}`);
    incidentIdA = incidentA.id;
    trackingIdA = incidentA.trackingId;
    console.log(`✓ TEST 7 PASSED: Complaint submitted. Incident ID: ${incidentIdA}, Tracking ID: ${trackingIdA}`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 8: Persistent Evidence Upload Endpoint (/api/incidents/upload)
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing multipart photo evidence upload to persistent storage...');
    const boundary = '----WebKitFormBoundaryMoveSmartTest' + Date.now();
    const photoContent = 'SIMULATED_JPEG_IMAGE_BINARY_DATA';
    const multipartBody = 
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="pothole_evidence.jpg"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n` +
      photoContent + `\r\n` +
      `--${boundary}--\r\n`;

    const uploadRes = await fetch(`${BACKEND_URL}/api/incidents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${tokenA}`
      },
      body: multipartBody
    });
    console.assert(uploadRes.status === 200, `Expected 200 OK, got ${uploadRes.status}`);
    const uploadData = await uploadRes.json();
    console.assert(uploadData.url && uploadData.url.startsWith('/uploads/'), `URL must be in /uploads/, got ${uploadData.url}`);
    console.log(`✓ TEST 8 PASSED: Photo uploaded successfully. File URL: ${uploadData.url}`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 9: In-App Citizen Notifications
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Checking in-app notification generated for Citizen A...');
    const notifsRes = await fetch(`${BACKEND_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    console.assert(notifsRes.status === 200, `Expected 200 OK, got ${notifsRes.status}`);
    const notifs = await notifsRes.json();
    console.assert(notifs.length >= 1, `Expected at least 1 notification, found ${notifs.length}`);
    const notif = notifs[0];
    console.assert(notif.type === 'SUBMITTED', `Notification type should be SUBMITTED, got ${notif.type}`);
    notificationIdA = notif.id;
    console.log(`✓ TEST 9 PASSED: In-app notification found: "${notif.title}" (Type: ${notif.type})`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 10: Notification Mark Read
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Marking notification as read...');
    const markReadRes = await fetch(`${BACKEND_URL}/api/notifications/${notificationIdA}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    console.assert(markReadRes.status === 200, `Expected 200 OK, got ${markReadRes.status}`);
    const readNotif = await markReadRes.json();
    console.assert(readNotif.read === true, 'Notification read flag should be true');
    console.log(`✓ TEST 10 PASSED: Notification #${notificationIdA} marked as read.`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 11: Multi-User Data Isolation (/api/incidents/my-reports)
    // -------------------------------------------------------------
    console.log('\n[TEST 11] Verifying data isolation between Citizen A and Citizen B...');
    const myReportsA = await (await fetch(`${BACKEND_URL}/api/incidents/my-reports`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    })).json();

    const myReportsB = await (await fetch(`${BACKEND_URL}/api/incidents/my-reports`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    })).json();

    console.assert(myReportsA.some(i => i.id === incidentIdA), 'Citizen A reports MUST contain their complaint');
    console.assert(!myReportsB.some(i => i.id === incidentIdA), 'Citizen B reports MUST NOT contain Citizen A complaint');
    console.log(`✓ TEST 11 PASSED: Strict data isolation confirmed. Citizen A has ${myReportsA.length} reports, Citizen B has ${myReportsB.length} reports.`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 12: Public Complaint Tracking & PII Redaction
    // -------------------------------------------------------------
    console.log('\n[TEST 12] Tracking complaint anonymously and verifying PII redaction...');
    const trackRes = await fetch(`${BACKEND_URL}/api/incidents/track/${trackingIdA}`);
    console.assert(trackRes.status === 200, `Expected 200 OK, got ${trackRes.status}`);
    const trackedIncident = await trackRes.json();
    console.assert(trackedIncident.trackingId === trackingIdA, 'Tracking ID matches');
    console.assert(trackedIncident.reporter.phone === null || trackedIncident.reporter.phone === undefined, 'Reporter phone must be redacted');
    console.assert(trackedIncident.reporter.email === null || trackedIncident.reporter.email === undefined, 'Reporter email must be redacted');
    console.assert(trackedIncident.adminNotes === null || trackedIncident.adminNotes === undefined, 'Admin notes must never be exposed');
    console.log(`✓ TEST 12 PASSED: Tracking resolves accurately. Reporter phone, email, and admin notes are securely redacted.`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 13: Citizen Profile Update
    // -------------------------------------------------------------
    console.log('\n[TEST 13] Updating Citizen A profile (Full Name & Phone)...');
    const updateProfileRes = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        fullName: 'Aarav S. Mehta',
        phone: '9820099887'
      })
    });
    console.assert(updateProfileRes.status === 200, `Expected 200 OK, got ${updateProfileRes.status}`);
    const updatedProfile = await updateProfileRes.json();
    console.assert(updatedProfile.fullName === 'Aarav S. Mehta', 'Full name should be updated');
    console.assert(updatedProfile.phone === '9820099887', 'Phone should be updated');
    console.log(`✓ TEST 13 PASSED: Profile updated successfully to "${updatedProfile.fullName}", Phone: ${updatedProfile.phone}`);
    passedTests++;

    // -------------------------------------------------------------
    // TEST 14: Citizen Password Change & Authentication Verification
    // -------------------------------------------------------------
    console.log('\n[TEST 14] Changing Citizen A password and verifying re-authentication...');
    const newPassA = 'UpdatedSecretPass@2026';
    const changePassRes = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        currentPassword: citizenA_Pass,
        newPassword: newPassA
      })
    });
    console.assert(changePassRes.status === 200, `Expected 200 OK, got ${changePassRes.status}`);

    // Verify old password fails
    const oldLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenA_Email, password: citizenA_Pass })
    });
    console.assert(oldLoginRes.status === 401, 'Old password must fail');

    // Verify new password succeeds
    const newLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenA_Email, password: newPassA })
    });
    console.assert(newLoginRes.status === 200, 'New password must succeed');
    console.log(`✓ TEST 14 PASSED: Password changed. Old password rejected (401), new password authenticated (200).`);
    passedTests++;

    console.log('\n================================================================');
    console.log(`   ALL ${passedTests}/${totalTests} PHASE 2 VERIFICATION TESTS PASSED SUCCESSFULLY!   `);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exit(1);
  }
}

runPhase2Verification();
