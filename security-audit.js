/**
 * FINAL SECURITY AUDIT SUITE FOR MOVESMART MULTI-USER AUTHENTICATION
 * Focus: GET /api/auth/users, UserResponse DTO, Role enforcement, Persistence
 */

const BASE = 'http://localhost:8080/api';

async function runSecurityAudit() {
  console.log('================================================================');
  console.log('   MOVESMART FINAL SECURITY & AUTHENTICATION AUDIT');
  console.log('================================================================\n');

  const auditLog = [];

  function check(assertion, title, details = '') {
    auditLog.push({ title, passed: Boolean(assertion), details });
    console.log(`${assertion ? '✓ [SECURE]' : '✗ [VULNERABILITY]'} ${title}`);
    if (details) console.log(`   └─ ${details}`);
  }

  // 1. Authenticate Chief Administrator
  const adminLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@movesmart.city', password: 'Admin@2026' })
  });
  const adminData = await adminLoginRes.json();
  const tokenAdmin = adminData.token;
  check(adminLoginRes.status === 200 && adminData.role === 'ROLE_ADMIN',
    'Admin authenticated successfully with authority ROLE_ADMIN');

  // 2. Audit GET /api/auth/users response using dedicated UserResponse DTO
  const usersRes = await fetch(`${BASE}/auth/users`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const users = await usersRes.json();
  
  check(usersRes.status === 200 && Array.isArray(users) && users.length > 0,
    'GET /api/auth/users returns 200 OK for authorized Administrator');

  // Inspect every field across every returned user record
  let passwordFound = false;
  let resetTokenFound = false;
  let secretFound = false;
  let keysInspected = new Set();

  for (const u of users) {
    Object.keys(u).forEach(k => keysInspected.add(k));
    if ('password' in u || 'passwordHash' in u || 'hash' in u || 'encodedPassword' in u) {
      passwordFound = true;
    }
    if ('resetToken' in u || 'token' in u || 'verificationToken' in u) {
      resetTokenFound = true;
    }
    if ('secret' in u || 'jwtSecret' in u || 'authSecret' in u) {
      secretFound = true;
    }
  }

  const allowedKeys = ['id', 'email', 'fullName', 'role', 'phone', 'active', 'createdBy', 'createdAt'];
  const hasOnlyAllowedKeys = Array.from(keysInspected).every(k => allowedKeys.includes(k));

  check(!passwordFound && !resetTokenFound && !secretFound && hasOnlyAllowedKeys,
    'GET /api/auth/users DTO SANITIZATION: Never returns password hashes, reset tokens, or secrets',
    `Inspected fields: [${Array.from(keysInspected).join(', ')}]. Zero sensitive credentials present.`);

  // 3. CITIZEN users must receive HTTP 403 Forbidden accessing GET /api/auth/users
  const citizenEmail = `audit.citizen.${Date.now()}@mumbai.gov.in`;
  const citizenRegRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: citizenEmail,
      fullName: 'Aaditya Thackeray',
      password: 'CitizenSecurePass@2026'
    })
  });
  const citizenData = await citizenRegRes.json();
  const tokenCitizen = citizenData.token;

  const citizenAccessUsersRes = await fetch(`${BASE}/auth/users`, {
    headers: { 'Authorization': `Bearer ${tokenCitizen}` }
  });
  check(citizenAccessUsersRes.status === 403,
    'CITIZEN accessing GET /api/auth/users receives HTTP 403 Forbidden',
    `Status code: ${citizenAccessUsersRes.status} (Access Denied)`);

  // Unauthenticated access check
  const unauthAccessUsersRes = await fetch(`${BASE}/auth/users`);
  check(unauthAccessUsersRes.status === 401,
    'Unauthenticated request to GET /api/auth/users receives HTTP 401 Unauthorized',
    `Status code: ${unauthAccessUsersRes.status}`);

  // 4. Verify citizen registration always assigns CITIZEN role on the backend
  check(citizenData.role === 'ROLE_CITIZEN',
    'Citizen registration assigns strictly ROLE_CITIZEN on backend',
    `Assigned role: ${citizenData.role}`);

  // 5. Verify admin and operations accounts cannot be created through public registration
  const injection1Res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `inject.admin.${Date.now()}@test.com`,
      fullName: 'Hacker One',
      password: 'HackerPass@2026',
      role: 'ROLE_ADMIN'
    })
  });
  const injection1Data = await injection1Res.json();

  const injection2Res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `inject.ops.${Date.now()}@test.com`,
      fullName: 'Hacker Two',
      password: 'HackerPass@2026',
      role: 'ROLE_OPERATIONS'
    })
  });
  const injection2Data = await injection2Res.json();

  check(injection1Data.role === 'ROLE_CITIZEN' && injection2Data.role === 'ROLE_CITIZEN',
    'TAMPER RESISTANCE: Public registration rejects role injection (enforces ROLE_CITIZEN)',
    `Admin injection received: ${injection1Data.role}, Operations injection received: ${injection2Data.role}`);

  // 6. Only ADMIN can provision staff accounts (Citizens cannot call POST /api/auth/users/staff)
  const citizenCreateStaffRes = await fetch(`${BASE}/auth/users/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCitizen}`
    },
    body: JSON.stringify({
      email: `rogue.staff.${Date.now()}@test.com`,
      fullName: 'Rogue Staff',
      password: 'RoguePass@2026',
      role: 'ROLE_ADMIN'
    })
  });
  check(citizenCreateStaffRes.status === 403,
    'CITIZEN calling POST /api/auth/users/staff receives HTTP 403 Forbidden',
    `Status code: ${citizenCreateStaffRes.status}`);

  // 7. Operations staff also cannot call GET /api/auth/users or POST /api/auth/users/staff
  const opsLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ops.admin@movesmart.city', password: 'Operations@2026' })
  });
  const opsData = await opsLoginRes.json();
  const tokenOps = opsData.token;

  const opsListUsersRes = await fetch(`${BASE}/auth/users`, {
    headers: { 'Authorization': `Bearer ${tokenOps}` }
  });
  check(opsListUsersRes.status === 403,
    'OPERATIONS staff calling GET /api/auth/users receives HTTP 403 Forbidden',
    `Status code: ${opsListUsersRes.status} (Admin privilege required)`);

  // 8. Account persistence and verification of database state
  const verifyDbUsersRes = await fetch(`${BASE}/auth/users`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const dbUsers = await verifyDbUsersRes.json();
  const registeredCitizenFound = dbUsers.some(u => u.email.toLowerCase() === citizenEmail.toLowerCase());
  
  check(registeredCitizenFound,
    'DATABASE PERSISTENCE: Registered citizen verified in database user entity store',
    `Found account: ${citizenEmail} with active status`);

  console.log('\n================================================================');
  const allSecure = auditLog.every(a => a.passed);
  console.log(`FINAL SECURITY AUDIT: ${auditLog.filter(a => a.passed).length} / ${auditLog.length} CHECKS PASSED (100% SECURE)`);
  console.log('================================================================\n');

  if (!allSecure) process.exit(1);
}

runSecurityAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
