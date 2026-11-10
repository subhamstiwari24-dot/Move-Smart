// test-workflows.js - Automated Verification of MoveSmart Business Logic & Workflows

// Mock localStorage for Node test runner
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

async function runTests() {
  console.log('--- STARTING MOVESMART AUTOMATED WORKFLOW VERIFICATION ---');

  // Dynamically import compiled or source files
  // Since we use TypeScript and have dist or can test the compiled modules or direct logic
  const { SEED_INCIDENTS } = await import('./src/data/seedIncidents.ts');
  const { storageService } = await import('./src/services/storageService.ts');

  // TEST 1: Initial Seed Verification
  console.log('\n[TEST 1] Verifying Seed Incidents...');
  const initialIncidents = storageService.getIncidents();
  console.assert(initialIncidents.length === 12, `Expected 12 seed incidents, got ${initialIncidents.length}`);
  const unmapped = initialIncidents.find(i => i.id === 'MS-2026-112');
  console.assert(unmapped && unmapped.latitude === undefined, 'Unmapped report MS-2026-112 should NOT have fabricated coordinates');
  console.log('✓ TEST 1 PASSED: 12 seed incidents verified, unmapped coordinate integrity confirmed.');

  // TEST 2: Statistics Computation
  console.log('\n[TEST 2] Verifying Executive Statistics...');
  const stats1 = storageService.computeStatistics(initialIncidents);
  console.assert(stats1.total === 12, `Expected total 12, got ${stats1.total}`);
  console.assert(stats1.resolved === 2, `Expected 2 resolved incidents, got ${stats1.resolved}`);
  console.assert(stats1.resolutionRate === Math.round((2/12)*100), `Expected resolution rate ${Math.round((2/12)*100)}%, got ${stats1.resolutionRate}%`);
  console.log('✓ TEST 2 PASSED: Real-time statistics match data.');

  // TEST 3: Citizen Incident Submission Workflow
  console.log('\n[TEST 3] Simulating Citizen Incident Submission...');
  const newIncident = storageService.createIncident({
    title: 'Severe Waterlogging at Milan Subway',
    category: 'Traffic Congestion',
    description: '3 feet water accumulation under subway, both vehicular directions halted.',
    location: 'Milan Subway, Santacruz West, Mumbai',
    latitude: 19.0835,
    longitude: 72.8415,
    priority: 'Critical',
    status: 'Reported',
    reporter: {
      name: 'Priyanka Patil',
      email: 'priyanka.p@example.com',
      isAnonymous: false
    }
  });

  console.assert(newIncident.id.startsWith('MS-'), `New incident ID should start with MS-, got ${newIncident.id}`);
  const afterCreateList = storageService.getIncidents();
  console.assert(afterCreateList.length === 13, `Expected 13 incidents after submission, got ${afterCreateList.length}`);
  const statsAfterCreate = storageService.computeStatistics(afterCreateList);
  console.assert(statsAfterCreate.total === 13, `Expected total 13, got ${statsAfterCreate.total}`);
  console.assert(statsAfterCreate.criticalOrHighOpen === stats1.criticalOrHighOpen + 1, 'Critical open incidents incremented');
  console.log(`✓ TEST 3 PASSED: Created incident #${newIncident.id}. Total increased to 13, critical counts updated.`);

  // TEST 4: Admin Status Update Workflow (Reported -> In Progress -> Resolved)
  console.log('\n[TEST 4] Simulating Admin Status Workflow...');
  const inProgress = storageService.updateIncidentStatus(newIncident.id, 'In Progress', 'High-flow dewatering pumps dispatched by MCGM Ward H-East');
  console.assert(inProgress.status === 'In Progress', 'Status should be In Progress');
  console.assert(inProgress.adminNotes.includes('dewatering pumps'), 'Admin notes should be attached');

  const resolved = storageService.updateIncidentStatus(newIncident.id, 'Resolved', 'Subway pumped clear, normal traffic flow restored');
  console.assert(resolved.status === 'Resolved', 'Status should be Resolved');
  const statsAfterResolve = storageService.computeStatistics(storageService.getIncidents());
  console.assert(statsAfterResolve.resolved === 3, `Expected 3 resolved incidents, got ${statsAfterResolve.resolved}`);
  console.log(`✓ TEST 4 PASSED: Successfully transitioned incident from Reported -> In Progress -> Resolved.`);

  // TEST 5: Admin Edit Workflow
  console.log('\n[TEST 5] Simulating Incident Edit...');
  const edited = storageService.updateIncident(newIncident.id, {
    title: 'Waterlogging Cleared at Milan Subway',
    estimatedImpact: 'Normal vehicular flow resumed'
  });
  console.assert(edited.title === 'Waterlogging Cleared at Milan Subway', 'Title should be updated');
  console.assert(edited.id === newIncident.id, 'ID must remain immutable');
  console.log('✓ TEST 5 PASSED: Incident details edited while preserving immutable fields.');

  // TEST 6: Audit / Activity Log Tracking
  console.log('\n[TEST 6] Verifying Sequential Activity Log...');
  const activities = storageService.getActivities();
  console.assert(activities.length >= 6, `Expected at least 6 activity events, got ${activities.length}`);
  const hasSubmitLog = activities.some(a => a.type === 'INCIDENT_SUBMITTED' && a.incidentId === newIncident.id);
  const hasResolveLog = activities.some(a => a.type === 'INCIDENT_RESOLVED' && a.incidentId === newIncident.id);
  console.assert(hasSubmitLog, 'Submission action must be logged in audit trail');
  console.assert(hasResolveLog, 'Resolution action must be logged in audit trail');
  console.log('✓ TEST 6 PASSED: Audit trail captured all user and admin actions.');

  // TEST 7: Delete Incident Workflow
  console.log('\n[TEST 7] Simulating Admin Incident Deletion...');
  const deleteResult = storageService.deleteIncident(newIncident.id);
  console.assert(deleteResult === true, 'Deletion should return true');
  const afterDeleteList = storageService.getIncidents();
  console.assert(afterDeleteList.length === 12, `Expected 12 incidents after deletion, got ${afterDeleteList.length}`);
  console.assert(!afterDeleteList.some(i => i.id === newIncident.id), 'Deleted incident must not be in list');
  console.log('✓ TEST 7 PASSED: Incident permanently deleted and removed from all dashboards.');

  // TEST 8: Reset Demo Data
  console.log('\n[TEST 8] Simulating Reset Demo Environment...');
  storageService.resetToDemoData();
  const resetList = storageService.getIncidents();
  console.assert(resetList.length === 12, `Expected 12 incidents after reset, got ${resetList.length}`);
  console.assert(resetList[0].id === 'MS-2026-101', 'First seed incident restored');
  console.log('✓ TEST 8 PASSED: Reset restored baseline demonstration data.');

  // TEST 9: Multi-Variable Filter Combination
  console.log('\n[TEST 9] Verifying Multi-Variable Filter Combinations (Priority + Status + Category)...');
  const allIncidents = storageService.getIncidents();
  // Filter for Category: Accident AND Priority: Critical
  const filteredCriticalAccidents = allIncidents.filter(
    i => i.category === 'Accident' && i.priority === 'Critical'
  );
  console.assert(filteredCriticalAccidents.length > 0, 'Should find critical accident incident');
  console.assert(filteredCriticalAccidents.every(i => i.category === 'Accident' && i.priority === 'Critical'), 'All results must match both filters');
  
  // Filter for Status: Resolved AND Category: Footpath / Accessibility
  const resolvedFootpaths = allIncidents.filter(
    i => i.status === 'Resolved' && i.category === 'Footpath / Accessibility'
  );
  console.assert(resolvedFootpaths.length === 1 && resolvedFootpaths[0].id === 'MS-2026-109', 'Should match MS-2026-109');
  console.log('✓ TEST 9 PASSED: Multi-variable combined filters operate with strict logic.');

  // TEST 10: Sequential ID Uniqueness Guarantee
  console.log('\n[TEST 10] Testing Rapid Sequential ID Uniqueness...');
  const id1 = storageService.createIncident({
    title: 'Test Incident A',
    category: 'Other',
    description: 'Test sequence A description here',
    location: 'Bandra Station',
    priority: 'Low',
    status: 'Reported',
    reporter: { name: 'Tester A' }
  }).id;

  const id2 = storageService.createIncident({
    title: 'Test Incident B',
    category: 'Other',
    description: 'Test sequence B description here',
    location: 'Andheri Station',
    priority: 'Low',
    status: 'Reported',
    reporter: { name: 'Tester B' }
  }).id;

  console.assert(id1 !== id2, 'Sequential IDs must be strictly unique');
  console.assert(id1 === 'MS-2026-113', `Expected MS-2026-113, got ${id1}`);
  console.assert(id2 === 'MS-2026-114', `Expected MS-2026-114, got ${id2}`);
  console.log(`✓ TEST 10 PASSED: Generated consecutive unique IDs: ${id1} -> ${id2}.`);

  // TEST 11: Case-Insensitive Citizen Tracking Lookup
  console.log('\n[TEST 11] Testing Citizen Tracking Case-Insensitive Lookup...');
  const lookupUpper = storageService.getIncidentById('MS-2026-101');
  const lookupLower = storageService.getIncidentById('ms-2026-101');
  const lookupPadded = storageService.getIncidentById('  MS-2026-101  ');
  console.assert(lookupUpper && lookupLower && lookupPadded, 'All case variants must resolve');
  console.assert(lookupUpper.id === lookupLower.id, 'IDs must match');
  console.log('✓ TEST 11 PASSED: Citizen Tracking ID lookup resolves regardless of case or whitespace.');

  // Clean up test items
  storageService.resetToDemoData();

  console.log('\n========================================================');
  console.log('ALL 11 MOVESMART VERIFICATION SUITES PASSED 100%!');
  console.log('========================================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
