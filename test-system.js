#!/usr/bin/env node

// Interactive System Testing Script
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const BASE_URL = 'http://localhost:3001';

console.log('🚁 Drone Dashboard System Testing Tool');
console.log('=====================================\n');

async function testHealthEndpoints() {
  console.log('🏥 Testing Health Endpoints...\n');
  
  try {
    // Main health check
    console.log('1. Main Health Check:');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const health = await healthResponse.json();
    console.log(`   Status: ${health.status}`);
    console.log(`   Database: ${health.checks.database.status} (${health.checks.database.responseTime}ms)`);
    console.log(`   WebSocket: ${health.checks.websocket.status} (port ${health.checks.websocket.port})`);
    console.log(`   Memory: ${health.checks.memory.status} (${health.checks.memory.percentage}%)\n`);

    // Database health
    console.log('2. Database Health:');
    const dbResponse = await fetch(`${BASE_URL}/api/health/database`);
    const db = await dbResponse.json();
    console.log(`   Status: ${db.status}`);
    console.log(`   Response Time: ${db.responseTime}ms`);
    console.log(`   Drones: ${db.statistics.drones}`);
    console.log(`   Systems: ${db.statistics.systems}`);
    console.log(`   Items: ${db.statistics.items}\n`);

    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('🔌 Testing API Endpoints...\n');
  
  try {
    // Get drones
    console.log('1. Drones API:');
    const dronesResponse = await fetch(`${BASE_URL}/api/drones`);
    const drones = await dronesResponse.json();
    console.log(`   Found ${drones.length} drones:`);
    drones.forEach(drone => {
      console.log(`   - ${drone.serial} (${drone.model}): ${drone.overallCompletion}% complete`);
    });
    console.log('');

    // Executive report
    console.log('2. Executive Report:');
    const execResponse = await fetch(`${BASE_URL}/api/reports/executive`);
    const exec = await execResponse.json();
    console.log(`   Total Drones: ${exec.overview.totalDrones}`);
    console.log(`   In Progress: ${exec.overview.inProgressDrones}`);
    console.log(`   Overall Completion: ${exec.overview.overallCompletionRate}%`);
    console.log(`   Items Completed Today: ${exec.productivity.itemsCompletedToday}`);
    console.log(`   Bottlenecks Found: ${exec.bottlenecks.length}`);
    console.log('');

    return { drones, exec };
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return null;
  }
}

async function testWebhooks() {
  console.log('🔔 Testing Webhook Endpoints...\n');
  
  try {
    // Test Slack webhook
    console.log('1. Slack Webhook:');
    const slackResponse = await fetch(`${BASE_URL}/api/webhooks/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        droneSerial: 'S1',
        model: 'G1-M',
        milestone: 50,
        action: 'milestone_reached',
        timestamp: new Date().toISOString()
      })
    });
    const slackResult = await slackResponse.json();
    console.log(`   Status: ${slackResponse.status}`);
    console.log(`   Response: ${slackResult.error || slackResult.message || 'Success'}\n`);

    // Test generic webhook
    console.log('2. Generic Webhook:');
    const genericResponse = await fetch(`${BASE_URL}/api/webhooks/generic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'test_event',
        data: { test: 'System testing webhook' },
        timestamp: new Date().toISOString(),
        source: 'drone_assembly_tracker'
      })
    });
    const genericResult = await genericResponse.json();
    console.log(`   Status: ${genericResponse.status}`);
    console.log(`   Response: ${genericResult.message || 'Success'}\n`);

    return true;
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
    return false;
  }
}

async function testItemStatusUpdate(drones) {
  if (!drones || drones.length === 0) {
    console.log('❌ No drones available for status update test\n');
    return false;
  }

  console.log('🔧 Testing Item Status Update...\n');
  
  try {
    const drone = drones[0];
    const firstSystem = drone.systems?.[0];
    const firstAssembly = firstSystem?.assemblies?.[0];
    const firstItem = firstAssembly?.items?.find(item => item.status !== 'completed');

    if (!firstItem) {
      console.log('❌ No pending items found for testing\n');
      return false;
    }

    console.log(`Testing with drone ${drone.serial}, item: ${firstItem.name}`);
    console.log(`Current status: ${firstItem.status}`);

    const updateResponse = await fetch(`${BASE_URL}/api/drones/${drone.serial}/components`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: firstItem.id,
        status: 'completed'
      })
    });

    const updateResult = await updateResponse.json();
    console.log(`Update Status: ${updateResponse.status}`);
    console.log(`Result: ${updateResult.success ? 'Success' : 'Failed'}\n`);

    return updateResult.success;
  } catch (error) {
    console.error('❌ Status update test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Running Complete System Test...\n');
  
  const results = {
    health: false,
    api: false,
    webhooks: false,
    statusUpdate: false
  };

  // Test health endpoints
  results.health = await testHealthEndpoints();
  
  // Test API endpoints
  const apiResult = await testAPIEndpoints();
  results.api = !!apiResult;
  
  // Test webhooks
  results.webhooks = await testWebhooks();
  
  // Test status update
  if (apiResult) {
    results.statusUpdate = await testItemStatusUpdate(apiResult.drones);
  }

  // Summary
  console.log('📊 Test Results Summary:');
  console.log('========================');
  console.log(`Health Endpoints: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoints: ${results.api ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Webhook System: ${results.webhooks ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Status Updates: ${results.statusUpdate ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  console.log(`\nOverall: ${passCount}/4 tests passed`);
  
  if (passCount === 4) {
    console.log('🎉 All systems operational! Ready for production.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

function showMenu() {
  console.log('\n🎯 Choose a test to run:');
  console.log('1. Health Endpoints');
  console.log('2. API Endpoints');
  console.log('3. Webhook System');
  console.log('4. Run All Tests');
  console.log('5. Open Browser URLs');
  console.log('6. Exit');
  console.log('\nEnter your choice (1-6): ');
}

function openBrowserUrls() {
  console.log('🌐 Browser Testing URLs:');
  console.log('========================');
  console.log(`Dashboard: ${BASE_URL}`);
  console.log(`Fleet Page: ${BASE_URL}/fleet`);
  console.log(`Build Activity: ${BASE_URL}/build-activity`);
  console.log(`Health Check: ${BASE_URL}/api/health`);
  console.log(`Executive Report: ${BASE_URL}/api/reports/executive`);
  console.log('\n💡 Open these URLs in your browser to test the UI\n');
}

async function handleChoice(choice) {
  switch (choice.trim()) {
    case '1':
      await testHealthEndpoints();
      break;
    case '2':
      await testAPIEndpoints();
      break;
    case '3':
      await testWebhooks();
      break;
    case '4':
      await runAllTests();
      break;
    case '5':
      openBrowserUrls();
      break;
    case '6':
      console.log('👋 Goodbye!');
      rl.close();
      return;
    default:
      console.log('❌ Invalid choice. Please enter 1-6.');
  }
  
  showMenu();
  rl.question('', handleChoice);
}

// Start the interactive menu
showMenu();
rl.question('', handleChoice);
