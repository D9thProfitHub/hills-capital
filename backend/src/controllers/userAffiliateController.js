import { sequelize } from '../config/db.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get user's own affiliate information
// @route   GET /api/v1/user/affiliate
// @access  Private
export const getUserAffiliate = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`📊 Fetching affiliate info for user ${userId}...`);
    
    const query = `
      SELECT 
        a.id,
        a.affiliate_code,
        a.tier,
        a.status,
        a.total_commissions,
        a.paid_commissions,
        a.pending_commissions,
        a.total_referrals,
        a.active_referrals,
        a.conversion_rate,
        a.last_activity,
        a.created_at,
        u.name,
        u.email
      FROM affiliates a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
    `;
    
    const [affiliates] = await sequelize.query(query, {
      replacements: [userId]
    });
    
    if (affiliates.length === 0) {
      // Return default affiliate data for users without affiliate records
      return res.json({
        success: true,
        data: {
          id: 0,
          userName: req.user.name,
          userEmail: req.user.email,
          affiliateCode: '',
          affiliateLink: '',
          tier: 'none',
          status: 'inactive',
          totalReferrals: 0,
          activeReferrals: 0,
          conversionRate: 0,
          totalCommissions: 0,
          paidCommissions: 0,
          pendingCommissions: 0,
          joinedDate: null,
          lastActivity: null
        }
      });
    }
    
    const affiliate = affiliates[0];
    
    const affiliateData = {
      id: affiliate.id,
      userName: affiliate.name,
      userEmail: affiliate.email,
      affiliateCode: affiliate.affiliate_code,
      affiliateLink: `https://hillscapital.com/ref/${affiliate.affiliate_code}`,
      tier: affiliate.tier,
      status: affiliate.status,
      totalReferrals: parseInt(affiliate.total_referrals) || 0,
      activeReferrals: parseInt(affiliate.active_referrals) || 0,
      conversionRate: parseFloat(affiliate.conversion_rate) || 0,
      totalCommissions: parseFloat(affiliate.total_commissions) || 0,
      paidCommissions: parseFloat(affiliate.paid_commissions) || 0,
      pendingCommissions: parseFloat(affiliate.pending_commissions) || 0,
      joinedDate: affiliate.created_at ? new Date(affiliate.created_at).toISOString().split('T')[0] : null,
      lastActivity: affiliate.last_activity ? new Date(affiliate.last_activity).toISOString().split('T')[0] : null
    };
    
    console.log('✅ User affiliate data loaded');
    
    res.json({
      success: true,
      data: affiliateData
    });
    
  } catch (error) {
    console.error('❌ Error fetching user affiliate:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliate information'
    });
  }
});

// @desc    Get user's referrals
// @route   GET /api/v1/user/affiliate/referrals
// @access  Private
export const getUserReferrals = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`📊 Fetching referrals for user ${userId}...`);
    
    // For now, return empty array since we don't have referral tracking yet
    // This can be implemented later with a referrals table
    
    res.json({
      success: true,
      data: [],
      message: 'Referral tracking will be implemented soon'
    });
    
  } catch (error) {
    console.error('❌ Error fetching user referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referrals'
    });
  }
});
