import { sequelize } from '../config/db.js';

// Get all affiliates with user data using raw SQL
export const getAffiliates = async (req, res) => {
  try {
    console.log('Fetching affiliates from database using raw SQL...');
    
    const query = `
      SELECT 
        a.id,
        a.user_id,
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
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `;

    const [affiliates] = await sequelize.query(query);
    console.log(`Found ${affiliates.length} affiliates in database`);

    // Transform data to match frontend expectations
    const transformedAffiliates = affiliates.map(affiliate => {
      return {
        id: affiliate.id,
        userName: affiliate.name || 'Unknown User',
        userEmail: affiliate.email || 'No email',
        affiliateCode: affiliate.affiliate_code,
        affiliateLink: `https://hillscapital.com/ref/${affiliate.affiliate_code}`,
        tier: affiliate.tier,
        status: affiliate.status,
        totalReferrals: affiliate.total_referrals,
        activeReferrals: affiliate.active_referrals,
        conversionRate: parseFloat(affiliate.conversion_rate),
        totalCommissions: parseFloat(affiliate.total_commissions),
        paidCommissions: parseFloat(affiliate.paid_commissions),
        pendingCommissions: parseFloat(affiliate.pending_commissions),
        joinedDate: affiliate.created_at ? new Date(affiliate.created_at).toISOString().split('T')[0] : null,
        lastActivity: affiliate.last_activity ? new Date(affiliate.last_activity).toISOString().split('T')[0] : null
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
    const [userCheck] = await sequelize.query(
      'SELECT id FROM users WHERE id = ?',
      { replacements: [userId] }
    );

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if affiliate code already exists
    const [existingAffiliate] = await sequelize.query(
      'SELECT id FROM affiliates WHERE affiliate_code = ?',
      { replacements: [affiliateCode] }
    );

    if (existingAffiliate.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Affiliate code already exists'
      });
    }

    // Create affiliate
    const insertQuery = `
      INSERT INTO affiliates (user_id, affiliate_code, tier, status, last_activity, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', NOW(), NOW(), NOW())
    `;

    const [result] = await sequelize.query(insertQuery, {
      replacements: [userId, affiliateCode, tier]
    });

    // Fetch the created affiliate with user data
    const fetchQuery = `
      SELECT 
        a.id,
        a.user_id,
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
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `;

    const [createdAffiliate] = await sequelize.query(fetchQuery, {
      replacements: [result.insertId]
    });

    const affiliate = createdAffiliate[0];

    res.status(201).json({
      success: true,
      data: {
        id: affiliate.id,
        userName: affiliate.name || 'Unknown User',
        userEmail: affiliate.email || 'No email',
        affiliateCode: affiliate.affiliate_code,
        affiliateLink: `https://hillscapital.com/ref/${affiliate.affiliate_code}`,
        tier: affiliate.tier,
        status: affiliate.status,
        totalReferrals: affiliate.total_referrals,
        activeReferrals: affiliate.active_referrals,
        conversionRate: parseFloat(affiliate.conversion_rate),
        totalCommissions: parseFloat(affiliate.total_commissions),
        paidCommissions: parseFloat(affiliate.paid_commissions),
        pendingCommissions: parseFloat(affiliate.pending_commissions),
        joinedDate: affiliate.created_at ? new Date(affiliate.created_at).toISOString().split('T')[0] : null,
        lastActivity: affiliate.last_activity ? new Date(affiliate.last_activity).toISOString().split('T')[0] : null
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

    // Build dynamic update query
    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      // Convert camelCase to snake_case for database fields
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updateFields.push(`${dbField} = ?`);
      values.push(updates[key]);
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id); // Add ID for WHERE clause

    const updateQuery = `
      UPDATE affiliates 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `;

    await sequelize.query(updateQuery, { replacements: values });

    // Fetch updated affiliate
    const fetchQuery = `
      SELECT 
        a.id,
        a.user_id,
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
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `;

    const [updatedAffiliate] = await sequelize.query(fetchQuery, {
      replacements: [id]
    });

    if (updatedAffiliate.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }

    const affiliate = updatedAffiliate[0];

    res.json({
      success: true,
      data: {
        id: affiliate.id,
        userName: affiliate.name || 'Unknown User',
        userEmail: affiliate.email || 'No email',
        affiliateCode: affiliate.affiliate_code,
        affiliateLink: `https://hillscapital.com/ref/${affiliate.affiliate_code}`,
        tier: affiliate.tier,
        status: affiliate.status,
        totalReferrals: affiliate.total_referrals,
        activeReferrals: affiliate.active_referrals,
        conversionRate: parseFloat(affiliate.conversion_rate),
        totalCommissions: parseFloat(affiliate.total_commissions),
        paidCommissions: parseFloat(affiliate.paid_commissions),
        pendingCommissions: parseFloat(affiliate.pending_commissions),
        joinedDate: affiliate.created_at ? new Date(affiliate.created_at).toISOString().split('T')[0] : null,
        lastActivity: affiliate.last_activity ? new Date(affiliate.last_activity).toISOString().split('T')[0] : null
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

    const [result] = await sequelize.query(
      'DELETE FROM affiliates WHERE id = ?',
      { replacements: [id] }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }

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
    const [stats] = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM affiliates 
      GROUP BY status
    `);

    const formattedStats = {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0
    };

    stats.forEach(stat => {
      const status = stat.status;
      const count = parseInt(stat.count);
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
