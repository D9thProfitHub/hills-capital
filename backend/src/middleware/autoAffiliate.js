import db from '../models/index.js';
import { generateAffiliateCode } from '../utils/affiliate.js';

const { Affiliate } = db;

export const createAffiliateAccount = async (user) => {
  try {
    // Generate unique affiliate code
    const affiliateCode = generateAffiliateCode(user);
    
    // Create affiliate record
    await Affiliate.create({
      userId: user.id,
      affiliateCode: affiliateCode,
      tier: 'bronze',
      status: 'active',
      totalReferrals: 0,
      activeReferrals: 0,
      totalCommissions: 0,
      paidCommissions: 0,
      pendingCommissions: 0
    });
    
    console.log(`✅ Created affiliate account for user ${user.email}`);
  } catch (error) {
    console.error('Error creating affiliate account:', error);
  }
};
