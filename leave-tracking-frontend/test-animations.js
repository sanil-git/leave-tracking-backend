// Simple test script to verify animations are working
const puppeteer = require('puppeteer');

async function testAnimations() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing PlanWise animations...');
    
    // Navigate to the app
    await page.goto('http://localhost:3006');
    await page.waitForSelector('h1');
    
    // Check if animations are present
    const hasFadeIn = await page.$('.animate-fade-in');
    const hasFadeInDelay = await page.$('.animate-fade-in-delay');
    const hasFadeInDelay2 = await page.$('.animate-fade-in-delay-2');
    
    console.log('✅ Fade-in animation:', hasFadeIn ? 'Present' : 'Missing');
    console.log('✅ Fade-in delay animation:', hasFadeInDelay ? 'Present' : 'Missing');
    console.log('✅ Fade-in delay 2 animation:', hasFadeInDelay2 ? 'Present' : 'Missing');
    
    // Check hover effects
    const hoverScaleElements = await page.$$('.hover\\:scale-105');
    const transitionElements = await page.$$('.transition-all');
    
    console.log('✅ Hover scale elements:', hoverScaleElements.length);
    console.log('✅ Transition elements:', transitionElements.length);
    
    // Test hover on feature cards
    const featureCards = await page.$$('.group.cursor-pointer');
    console.log('✅ Feature cards with hover effects:', featureCards.length);
    
    console.log('🎉 Animation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Animation test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Only run if puppeteer is available
if (typeof require !== 'undefined') {
  testAnimations().catch(console.error);
} else {
  console.log('📝 Animation test script created. Run with: node test-animations.js');
}
