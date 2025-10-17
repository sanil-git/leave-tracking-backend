const Suggestion = require('../models/Suggestion');

const seedSuggestions = async () => {
  try {
    // Clear existing suggestions
    await Suggestion.deleteMany({});
    
    const suggestions = [
      // Bangalore suggestions
      {
        city: 'bangalore',
        country: 'india',
        category: 'housing',
        phase: 'pre_move',
        title: 'Research Areas in Bangalore',
        description: 'Explore popular areas like Koramangala, Indiranagar, Whitefield, and Electronic City based on your work location and budget.',
        priority: 'high',
        estimatedTime: '2-3 weeks',
        cost: 'Free',
        requirements: ['Internet access', 'Real estate apps'],
        tips: [
          'Check proximity to metro stations',
          'Consider traffic patterns during peak hours',
          'Look for areas with good connectivity to your workplace'
        ],
        resources: [
          {
            name: '99acres',
            url: 'https://www.99acres.com',
            type: 'website'
          },
          {
            name: 'Magicbricks',
            url: 'https://www.magicbricks.com',
            type: 'website'
          }
        ],
        applicableFor: ['expat', 'worker', 'student'],
        tags: ['housing', 'research', 'location']
      },
      {
        city: 'bangalore',
        country: 'india',
        category: 'documents',
        phase: 'pre_move',
        title: 'Apply for Aadhaar Card',
        description: 'If you are an Indian citizen, apply for Aadhaar card which is required for most services in India.',
        priority: 'high',
        estimatedTime: '1-2 weeks',
        cost: 'Free',
        requirements: ['Identity proof', 'Address proof', 'Biometric data'],
        tips: [
          'Book appointment online to avoid long queues',
          'Carry original documents',
          'Keep multiple copies of all documents'
        ],
        resources: [
          {
            name: 'Aadhaar Official Website',
            url: 'https://uidai.gov.in',
            type: 'website'
          }
        ],
        applicableFor: ['citizen'],
        tags: ['aadhaar', 'identity', 'documents']
      },
      {
        city: 'bangalore',
        country: 'india',
        category: 'local_setup',
        phase: 'post_move',
        title: 'Open Bank Account',
        description: 'Open a local bank account for easy transactions and salary deposits.',
        priority: 'high',
        estimatedTime: '1-2 days',
        cost: 'Minimal charges',
        requirements: ['Aadhaar card', 'PAN card', 'Address proof', 'Passport size photos'],
        tips: [
          'Choose a bank with good ATM network',
          'Consider digital banking features',
          'Keep minimum balance requirements in mind'
        ],
        resources: [
          {
            name: 'SBI',
            url: 'https://www.sbi.co.in',
            type: 'website'
          },
          {
            name: 'HDFC Bank',
            url: 'https://www.hdfcbank.com',
            type: 'website'
          }
        ],
        applicableFor: ['citizen', 'expat', 'worker'],
        tags: ['banking', 'finance', 'local_setup']
      },
      
      // Tokyo suggestions
      {
        city: 'tokyo',
        country: 'japan',
        category: 'housing',
        phase: 'pre_move',
        title: 'Find Apartment in Tokyo',
        description: 'Research apartments in Tokyo. Consider areas like Shibuya, Shinjuku, or residential areas based on your budget and commute.',
        priority: 'critical',
        estimatedTime: '3-4 weeks',
        cost: '¥50,000-200,000 (deposit + key money)',
        requirements: ['Valid visa', 'Employment contract', 'Japanese guarantor or guarantor company'],
        tips: [
          'Most apartments require key money (reikin) - non-refundable gift to landlord',
          'Consider furnished apartments for short-term stays',
          'Check if utilities are included',
          'Learn basic Japanese for apartment hunting'
        ],
        resources: [
          {
            name: 'Suumo',
            url: 'https://suumo.jp',
            type: 'website'
          },
          {
            name: 'Homes',
            url: 'https://www.homes.co.jp',
            type: 'website'
          }
        ],
        applicableFor: ['expat', 'worker', 'student'],
        tags: ['housing', 'apartment', 'rent']
      },
      {
        city: 'tokyo',
        country: 'japan',
        category: 'documents',
        phase: 'pre_move',
        title: 'Register at City Hall',
        description: 'Register your address at the local city hall (kuyakusho) within 14 days of moving.',
        priority: 'critical',
        estimatedTime: '1 day',
        cost: 'Free',
        requirements: ['Passport', 'Visa', 'Apartment contract', 'Certificate of residence'],
        tips: [
          'Go early to avoid long queues',
          'Bring a Japanese speaker if possible',
          'Get multiple copies of your residence certificate (juminhyo)'
        ],
        resources: [
          {
            name: 'Tokyo Metropolitan Government',
            url: 'https://www.metro.tokyo.lg.jp',
            type: 'website'
          }
        ],
        applicableFor: ['expat', 'worker', 'student'],
        tags: ['registration', 'documents', 'city_hall']
      },
      {
        city: 'tokyo',
        country: 'japan',
        category: 'local_setup',
        phase: 'post_move',
        title: 'Set Up Mobile Phone',
        description: 'Get a Japanese mobile phone number and data plan.',
        priority: 'high',
        estimatedTime: '1-2 hours',
        cost: '¥3,000-8,000/month',
        requirements: ['Passport', 'Visa', 'Residence card', 'Credit card or bank account'],
        tips: [
          'Consider MVNO providers for cheaper options',
          'Check if your phone is unlocked',
          'Some providers offer English support'
        ],
        resources: [
          {
            name: 'SoftBank',
            url: 'https://www.softbank.jp',
            type: 'website'
          },
          {
            name: 'au',
            url: 'https://www.au.com',
            type: 'website'
          }
        ],
        applicableFor: ['expat', 'worker', 'student'],
        tags: ['mobile', 'phone', 'communication']
      }
    ];
    
    await Suggestion.insertMany(suggestions);
    console.log('✅ Suggestions seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding suggestions:', error);
  }
};

module.exports = { seedSuggestions };
