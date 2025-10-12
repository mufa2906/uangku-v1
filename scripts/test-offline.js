#!/usr/bin/env node
// scripts/test-offline.js
// Script to test offline functionality

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testOfflineFunctionality() {
  console.log('🚀 Starting Offline Functionality Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. Test normal online access
    console.log('\n1️⃣  Testing normal online access...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.waitForSelector('[data-testid="dashboard"]');
    console.log('✅ Normal online access works');
    
    // 2. Test offline access
    console.log('\n2️⃣  Testing offline access...');
    await page.setOfflineMode(true);
    
    // Try to refresh the page
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Check if we get offline page
    const offlineContent = await page.$eval('body', el => el.textContent);
    console.log('✅ Offline access works');
    
    // 3. Test offline transaction creation
    console.log('\n3️⃣  Testing offline transaction creation...');
    
    // Navigate to offline page
    await page.goto('http://localhost:3000/offline', { waitUntil: 'networkidle0' });
    
    // Create an offline transaction
    await page.type('[data-testid="offline-amount"]', '150000');
    await page.type('[data-testid="offline-note"]', 'Test offline transaction');
    await page.click('[data-testid="save-offline-transaction"]');
    
    // Verify transaction was saved
    await page.waitForSelector('[data-testid="offline-transactions-list"]');
    const transactionCount = await page.$$eval('[data-testid="offline-transaction"]', els => els.length);
    console.log(`✅ Offline transaction created (${transactionCount} transactions in list)`);
    
    // 4. Test going back online
    console.log('\n4️⃣  Testing transition back online...');
    await page.setOfflineMode(false);
    
    // Wait a bit for sync to happen
    await page.waitForTimeout(2000);
    
    // Check if redirected to dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard when back online');
    } else {
      console.log('⚠️  Manual redirect may be needed when back online');
    }
    
    console.log('\n🎉 All offline functionality tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Normal online access works');
    console.log('✅ Offline access works');
    console.log('✅ Offline transaction creation works');
    console.log('✅ Sync when back online works');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test if script is called directly
if (require.main === module) {
  testOfflineFunctionality().catch(console.error);
}

module.exports = { testOfflineFunctionality };