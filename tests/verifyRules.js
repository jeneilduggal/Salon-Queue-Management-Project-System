import { 
  validatePhone, 
  findActiveTicketByPhone, 
  getServicesTotals, 
  calculateEstimatedWait, 
  getQueuePosition, 
  getNextCustomerForBarber 
} from '../src/utils/queueRules.js';

import { initialServices, initialBarbers } from '../src/data/initialData.js';

console.log("=== RUNNING SALON QUEUE VERIFICATION TESTS ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// TC-1: Join with 2 services -> correct total time and price
const testServices = ['haircut', 'beard_trim'];
const totals = getServicesTotals(testServices, initialServices);
assert(totals.duration === 45, `TC-1: Total duration for Haircut (30m) + Beard Trim (15m) is 45 min (got ${totals.duration})`);
assert(totals.price === 230, `TC-1: Total price is ₹230 (₹150 + ₹80) (got ₹${totals.price})`);

// TC-2: Same phone joins twice -> detected existing spot
const existingTickets = [
  { id: 'S-1', token: 'S-1', phone: '9876543210', status: 'waiting' },
  { id: 'S-2', token: 'S-2', phone: '9825012345', status: 'done' }
];
const duplicate = findActiveTicketByPhone('9876543210', existingTickets);
const completedPhone = findActiveTicketByPhone('9825012345', existingTickets);
assert(duplicate !== null && duplicate.token === 'S-1', 'TC-2: Duplicate active phone detected with S-1');
assert(completedPhone === null, 'TC-2: Finished/Done ticket allows re-joining (not duplicate)');

// TC-3: Call next for Amit skips customer who chose Ravi
const queueForDispatch = [
  { id: 'S-10', token: 'S-10', barberPreference: 'ravi', status: 'waiting', createdAt: 1000 },
  { id: 'S-11', token: 'S-11', barberPreference: 'any', status: 'waiting', createdAt: 2000 },
  { id: 'S-12', token: 'S-12', barberPreference: 'amit', status: 'waiting', createdAt: 3000 }
];

const nextForAmit = getNextCustomerForBarber('amit', queueForDispatch);
assert(nextForAmit !== null && nextForAmit.token === 'S-11', `TC-3: Amit call-next skips S-10 (prefers Ravi) and picks S-11 (Any) (got ${nextForAmit?.token})`);

const nextForRavi = getNextCustomerForBarber('ravi', queueForDispatch);
assert(nextForRavi !== null && nextForRavi.token === 'S-10', `TC-3: Ravi call-next picks S-10 (earliest FIFO) (got ${nextForRavi?.token})`);

// TC-4: Phone validation
assert(validatePhone('9876543210') === true, 'Phone validation valid 10 digits');
assert(validatePhone('12345') === false, 'Phone validation rejects short numbers');

// TC-5: Waiting time formula test
const sampleWaitingTicket = {
  id: 'S-20',
  token: 'S-20',
  serviceIds: ['haircut'],
  barberPreference: 'any',
  status: 'waiting',
  createdAt: 5000
};
const waitTime = calculateEstimatedWait(sampleWaitingTicket, queueForDispatch, initialBarbers, initialServices);
assert(waitTime > 0, `TC-9: Dynamic wait time is positive (~${waitTime} min)`);

console.log(`\nTEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
if (failed > 0) process.exit(1);
