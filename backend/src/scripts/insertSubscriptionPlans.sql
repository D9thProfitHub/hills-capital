-- Clear existing subscription plans
DELETE FROM subscription_plans;

-- Insert subscription plans
INSERT INTO subscription_plans (name, description, price, billingCycle, features, isActive, maxSignals, hasBotAccess, hasCopyTrading, supportLevel, popular, created_at, updated_at) VALUES
('Free', 'Basic trading signals for beginners', 0.00, 'monthly', '["Up to 3 signals per week", "Basic signal information", "Email notifications", "24-hour delay on signals"]', 1, 3, 0, 0, 'basic', 0, NOW(), NOW()),
('Pro', 'Professional trading signals with detailed analysis', 49.99, 'monthly', '["Up to 10 signals per week", "Detailed technical analysis", "Real-time notifications", "Telegram group access", "Priority support", "Risk management tips"]', 1, 10, 1, 0, 'priority', 1, NOW(), NOW()),
('VIP', 'Premium trading signals with unlimited access', 99.99, 'monthly', '["Unlimited signals", "Detailed analysis with charts", "Real-time notifications", "VIP Telegram group access", "24/7 dedicated support", "1-on-1 consultation sessions", "Copy trading access", "Custom risk management"]', 1, 999, 1, 1, 'vip', 0, NOW(), NOW());

-- Verify the data
SELECT * FROM subscription_plans;
