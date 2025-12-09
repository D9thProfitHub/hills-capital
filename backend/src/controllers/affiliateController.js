import db from '../models/index.js';
import { Op } from 'sequelize';

const { User, Affiliate } = db;

// Get all affiliates with user data
export const getAffiliates = async (req, res) => {
  try {
    console.log('Fetching affiliates from database...');
    
    const affiliates = await Affiliate.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${affiliates.length} affiliates in database`);

    // Transform data to match frontend expectations
    const transformedAffiliates = affiliates.map(affiliate => {
      const user = affiliate.user;
      return {
        id: affiliate.id,
        userName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown User',
        userEmail: user ? user.email : 'No email',
        affiliateCode: affiliate.affiliateCode,
        affiliateLink: affiliate.getAffiliateLink(),
        tier: affiliate.tier,
        status: affiliate.status,
        totalReferrals: affiliate.totalReferrals,
        activeReferrals: affiliate.activeReferrals,
        conversionRate: parseFloat(affiliate.conversionRate),
        totalCommissions: parseFloat(affiliate.totalCommissions),
        paidCommissions: parseFloat(affiliate.paidCommissions),
        pendingCommissions: parseFloat(affiliate.pendingCommissions),
        joinedDate: affiliate.createdAt.toISOString().split('T')[0],
        lastActivity: affiliate.lastActivity ? affiliate.lastActivity.toISOString().split('T')[0] : null
      };
    });

    res.json({
      success: true,
      data: transformedAffiliates
    });

  } catch (error) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliates',
      error: error.message
    });
  }
};

// Create new affiliate
export const createAffiliate = async (req, res) => {
  try {
    const { userId, affiliateCode, tier = 'Bronze' } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if affiliate code already exists
    const existingAffiliate = await Affiliate.findOne({
      where: { affiliateCode }
    });

    if (existingAffiliate) {
      return res.status(400).json({
        success: false,
        message: 'Affiliate code already exists'
      });
    }

    // Create affiliate
    const affiliate = await Affiliate.create({
      userId,
      affiliateCode,
      tier,
      status: 'pending',
      lastActivity: new Date()
    });

    // Fetch the created affiliate with user data
    const createdAffiliate = await Affiliate.findByPk(affiliate.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      data: {
        id: createdAffiliate.id,
        userName: `${createdAffiliate.user.firstName} ${createdAffiliate.user.lastName}`.trim(),
        userEmail: createdAffiliate.user.email,
        affiliateCode: createdAffiliate.affiliateCode,
        affiliateLink: createdAffiliate.getAffiliateLink(),
        tier: createdAffiliate.tier,
        status: createdAffiliate.status,
        totalReferrals: createdAffiliate.totalReferrals,
        activeReferrals: createdAffiliate.activeReferrals,
        conversionRate: parseFloat(createdAffiliate.conversionRate),
        totalCommissions: parseFloat(createdAffiliate.totalCommissions),
        paidCommissions: parseFloat(createdAffiliate.paidCommissions),
        pendingCommissions: parseFloat(createdAffiliate.pendingCommissions),
        joinedDate: createdAffiliate.createdAt.toISOString().split('T')[0],
        lastActivity: createdAffiliate.lastActivity.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error creating affiliate:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating affiliate',
      error: error.message
    });
  }
};

// Update affiliate
export const updateAffiliate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const affiliate = await Affiliate.findByPk(id);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }

    // Update affiliate
    await affiliate.update(updates);

    // Fetch updated affiliate with user data
    const updatedAffiliate = await Affiliate.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.json({
      success: true,
      data: {
        id: updatedAffiliate.id,
        userName: `${updatedAffiliate.user.firstName} ${updatedAffiliate.user.lastName}`.trim(),
        userEmail: updatedAffiliate.user.email,
        affiliateCode: updatedAffiliate.affiliateCode,
        affiliateLink: updatedAffiliate.getAffiliateLink(),
        tier: updatedAffiliate.tier,
        status: updatedAffiliate.status,
        totalReferrals: updatedAffiliate.totalReferrals,
        activeReferrals: updatedAffiliate.activeReferrals,
        conversionRate: parseFloat(updatedAffiliate.conversionRate),
        totalCommissions: parseFloat(updatedAffiliate.totalCommissions),
        paidCommissions: parseFloat(updatedAffiliate.paidCommissions),
        pendingCommissions: parseFloat(updatedAffiliate.pendingCommissions),
        joinedDate: updatedAffiliate.createdAt.toISOString().split('T')[0],
        lastActivity: updatedAffiliate.lastActivity ? updatedAffiliate.lastActivity.toISOString().split('T')[0] : null
      }
    });

  } catch (error) {
    console.error('Error updating affiliate:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating affiliate',
      error: error.message
    });
  }
};

// Delete affiliate
export const deleteAffiliate = async (req, res) => {
  try {
    const { id } = req.params;

    const affiliate = await Affiliate.findByPk(id);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }

    await affiliate.destroy();

    res.json({
      success: true,
      message: 'Affiliate deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting affiliate:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting affiliate',
      error: error.message
    });
  }
};

// Get affiliate statistics
export const getAffiliateStats = async (req, res) => {
  try {
    const stats = await Affiliate.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const formattedStats = {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0
    };

    stats.forEach(stat => {
      const status = stat.dataValues.status;
      const count = parseInt(stat.dataValues.count);
      formattedStats[status] = count;
      formattedStats.total += count;
    });

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching affiliate statistics',
      error: error.message
    });
  }
};
