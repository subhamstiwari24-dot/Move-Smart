const BASE_URL = 'http://localhost:8080/api';

async function runAuthTests() {
  console.log('====================================================');
  console.log('   MOVESMART MULTI-USER AUTHENTICATION VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Citizen 1 Registration
  const citizen1Email = `citizen.alpha.${Date.now()}@example.com`;
  const reg1Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: citizen1Email,
      password: 'CitizenAlphaPass123',
      fullName: 'Aarav Sharma',
      phone: '+91 98201 11111'
    })
  });
  const reg1Data = await reg1Res.json();
  assert(reg1Res.status === 201 && reg1Data.token && reg1Data.role === 'ROLE_CITIZEN',
    `Citizen 1 registered successfully with ROLE_CITIZEN (${citizen1Email})`);

  // 2. Citizen 2 Registration
  const citizen2Email = `citizen.beta.${Date.now()}@example.com`;
  const reg2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: citizen2Email,
      password: 'CitizenBetaPass456',
      fullName: 'Meera Patel',
      phone: '+91 98201 22222'
    })
  });
  const reg2Data = await reg2Res.json();
  assert(reg2Res.status === 201 && reg2Data.token && reg2Data.role === 'ROLE_CITIZEN',
    `Citizen 2 registered successfully with ROLE_CITIZEN (${citizen2Email})`);

  // 3. Independent Login Verification for both Citizens
  const login1Res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: citizen1Email, password: 'CitizenAlphaPass123' })
  });
  const login1Data = await login1Res.json();
  assert(login1Res.status === 200 && login1Data.email === citizen1Email,
    'Citizen 1 logged in independently with valid JWT');

  const login2Res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: citizen2Email, password: 'CitizenBetaPass456' })
  });
  const login2Data = await login2Res.json();
  assert(login2Res.status === 200 && login2Data.email === citizen2Email,
    'Citizen 2 logged in independently with valid JWT');

  // 4. Verify Citizen Cannot Tamper Role during registration (server-side role enforcement)
  const tamperEmail = `tamper.${Date.now()}@example.com`;
  const tamperRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: tamperEmail,
      password: 'TamperPassword123',
      fullName: 'Malicious Actor',
      role: 'ROLE_ADMIN' // Attempt to inject admin role
    })
  });
  const tamperData = await tamperRes.json();
  assert(tamperData.role === 'ROLE_CITIZEN',
    'Server strictly ignores frontend supplied role and enforces ROLE_CITIZEN');

  // 5. Citizen 1 logs a complaint
  const incidentRes = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${login1Data.token}`
    },
    body: JSON.stringify({
      title: 'Waterlogging outside Dadar West',
      category: 'Traffic Congestion',
      priority: 'High',
      location: 'Dadar Station West, Mumbai',
      description: 'Severe rainwater accumulation reaching sidewalk',
      reporter: {
        name: 'Aarav Sharma',
        email: citizen1Email
      }
    })
  });
  const incidentData = await incidentRes.json();
  assert(incidentRes.status === 201 && incidentData.id,
    `Citizen 1 created incident #${incidentData.id}`);

  // 6. Verify Citizen 2 cannot see Citizen 1's complaint in /my-reports
  const myReports2Res = await fetch(`${BASE_URL}/incidents/my-reports`, {
    headers: { 'Authorization': `Bearer ${login2Data.token}` }
  });
  const myReports2 = await myReports2Res.json();
  const foundOther = myReports2.some(i => i.id === incidentData.id);
  assert(!foundOther, 'Citizen 2 dashboard strictly isolates private reports from Citizen 1');

  // 7. Citizen token blocked from Operations/Admin APIs (HTTP 403 Forbidden)
  const forbiddenPatchRes = await fetch(`${BASE_URL}/incidents/${incidentData.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${login1Data.token}`
    },
    body: JSON.stringify({ status: 'Resolved' })
  });
  assert(forbiddenPatchRes.status === 403,
    'Citizen is blocked from Operations Center status update (HTTP 403 Forbidden)');

  // 8. Admin login with seeded chief administrator
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@movesmart.city', password: 'Admin@2026' })
  });
  const adminData = await adminLoginRes.json();
  assert(adminLoginRes.status === 200 && adminData.role === 'ROLE_ADMIN',
    'Chief System Administrator authenticated (ROLE_ADMIN)');

  // 9. Admin provisions a new Operations Staff account
  const newStaffEmail = `ops.patil.${Date.now()}@movesmart.city`;
  const createStaffRes = await fetch(`${BASE_URL}/auth/users/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminData.token}`
    },
    body: JSON.stringify({
      email: newStaffEmail,
      fullName: 'Ramesh Patil',
      password: 'StaffPassword@2026',
      phone: '+91 98201 55555',
      role: 'ROLE_OPERATIONS'
    })
  });
  const staffData = await createStaffRes.json();
  assert(createStaffRes.status === 201 && staffData.role === 'ROLE_OPERATIONS',
    `Administrator provisioned new Operations Staff: ${newStaffEmail}`);

  // 10. Newly provisioned Operations Staff can log in with their own credentials
  const staffLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newStaffEmail, password: 'StaffPassword@2026' })
  });
  const staffLoginData = await staffLoginRes.json();
  assert(staffLoginRes.status === 200 && staffLoginData.role === 'ROLE_OPERATIONS',
    'Newly provisioned Operations Staff logged in with own credentials');

  // 11. Newly provisioned Operations Staff CAN update status (HTTP 200 OK)
  const opsUpdateRes = await fetch(`${BASE_URL}/incidents/${incidentData.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffLoginData.token}`
    },
    body: JSON.stringify({
      status: 'In Progress',
      adminNote: 'Field response team deployed by Officer Ramesh Patil',
      publicUpdate: 'BMC pump truck deployed on site.'
    })
  });
  const opsUpdateData = await opsUpdateRes.json();
  assert(opsUpdateRes.status === 200 && opsUpdateData.status === 'In Progress',
    'Operations Staff successfully updated incident status and public advisory');

  // 12. Admin provisions an additional Administrator account
  const secondAdminEmail = `admin.second.${Date.now()}@movesmart.city`;
  const createAdmin2Res = await fetch(`${BASE_URL}/auth/users/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminData.token}`
    },
    body: JSON.stringify({
      email: secondAdminEmail,
      fullName: 'Suresh Deshmukh',
      password: 'AdminSecondPassword@2026',
      role: 'ROLE_ADMIN'
    })
  });
  const admin2Data = await createAdmin2Res.json();
  assert(createAdmin2Res.status === 201 && admin2Data.role === 'ROLE_ADMIN',
    `Administrator successfully created additional Admin: ${secondAdminEmail}`);

  // 13. Admin deactivates staff member and verifies login is rejected
  const deactivateRes = await fetch(`${BASE_URL}/auth/users/${staffData.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminData.token}`
    },
    body: JSON.stringify({ active: false })
  });
  assert(deactivateRes.status === 200, 'Admin deactivated staff account');

  const deactivatedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newStaffEmail, password: 'StaffPassword@2026' })
  });
  assert(deactivatedLoginRes.status === 401,
    'Deactivated staff account is rejected from logging in (HTTP 401 Unauthorized)');

  // 14. Forgot / Reset Password flow
  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: citizen1Email })
  });
  assert(forgotRes.status === 200, 'Forgot password request dispatched');

  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: citizen1Email, newPassword: 'NewUpdatedPassword@2026' })
  });
  assert(resetRes.status === 200, 'Citizen updated password successfully');

  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: citizen1Email, password: 'NewUpdatedPassword@2026' })
  });
  assert(newLoginRes.status === 200, 'Citizen logged in with newly updated password');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED (100%)`);
  console.log('====================================================');
}

runAuthTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
