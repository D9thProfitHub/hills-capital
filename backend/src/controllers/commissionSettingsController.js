import { sequelize } from '../config/db.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get commission settings
// @route   GET /api/admin/affiliate-settings
// @access  Private/Admin
export const getCommissionSettings = asyncHandler(async (req, res, next) => {
  try {
    console.log('📊 Fetching commission settings from database...');
    
    const [settings] = await sequelize.query(
      'SELECT setting_key, setting_value FROM commission_settings'
    );
    
    // Transform settings into expected format
    const commissionSettings = {
      defaultCommissionRate: 5,
      tierRates: { Bronze: 5, Silver: 8, Gold: 12, Platinum: 15 },
      minimumPayout: 100,
      cookieDuration: 30,
      payoutSchedule: 'monthly'
    };
    
    // Override with database values
    settings.forEach(setting => {
      switch(setting.setting_key) {
        case 'default_commission_rate':
          commissionSettings.defaultCommissionRate = parseFloat(setting.setting_value);
          break;
        case 'tier_rates':
          try {
            commissionSettings.tierRates = JSON.parse(setting.setting_value);
          } catch (e) {
            console.error('Error parsing tier_rates:', e);
          }
          break;
        case 'minimum_payout':
          commissionSettings.minimumPayout = parseFloat(setting.setting_value);
          break;
        case 'cookie_duration':
          commissionSettings.cookieDuration = parseInt(setting.setting_value);
          break;
        case 'payout_schedule':
          commissionSettings.payoutSchedule = setting.setting_value;
          break;
      }
    });
    
    console.log('✅ Commission settings loaded:', commissionSettings);
    
    res.json({
      success: true,
      data: commissionSettings
    });
    
  } catch (error) {
    console.error('❌ Error fetching commission settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commission settings'
    });
  }
});

// @desc    Update commission settings
// @route   PUT /api/admin/affiliate-settings
// @access  Private/Admin
export const updateCommissionSettings = asyncHandler(async (req, res, next) => {
  try {
    console.log('💾 Saving commission settings to database:', req.body);
    
    const {
      defaultCommissionRate,
      tierRates,
      minimumPayout,
      cookieDuration,
      payoutSchedule
    } = req.body;
    
    // Update each setting in database
    const updates = [
      {
        key: 'default_commission_rate',
        value: defaultCommissionRate?.toString() || '5',
        description: 'Default commission rate percentage'
      },
      {
        key: 'tier_rates',
        value: JSON.stringify(tierRates || { Bronze: 5, Silver: 8, Gold: 12, Platinum: 15 }),
        description: 'Commission rates by tier'
      },
      {
        key: 'minimum_payout',
        value: minimumPayout?.toString() || '100',
        description: 'Minimum payout amount'
      },
      {
        key: 'cookie_duration',
        value: cookieDuration?.toString() || '30',
        description: 'Cookie duration in days'
      },
      {
        key: 'payout_schedule',
        value: payoutSchedule || 'monthly',
        description: 'Payout schedule (weekly, monthly, quarterly)'
      }
    ];
    
    for (const update of updates) {
      const updateQuery = `
        INSERT INTO commission_settings (setting_key, setting_value, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        description = VALUES(description),
        updated_at = CURRENT_TIMESTAMP
      `;
      
      await sequelize.query(updateQuery, {
        replacements: [update.key, update.value, update.description]
      });
      
      console.log(`✅ Updated ${update.key} = ${update.value}`);
    }
    
    // Return the saved settings
    res.json({
      success: true,
      message: 'Commission settings saved successfully',
      data: {
        defaultCommissionRate: parseFloat(defaultCommissionRate || 5),
        tierRates: tierRates || { Bronze: 5, Silver: 8, Gold: 12, Platinum: 15 },
        minimumPayout: parseFloat(minimumPayout || 100),
        cookieDuration: parseInt(cookieDuration || 30),
        payoutSchedule: payoutSchedule || 'monthly'
      }
    });
    
  } catch (error) {
    console.error('❌ Error saving commission settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving commission settings'
    });
  }
});
