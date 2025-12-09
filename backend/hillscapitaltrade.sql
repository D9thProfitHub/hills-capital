-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 27, 2025 at 08:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hillscapitaltrade`
--

-- --------------------------------------------------------

--
-- Table structure for table `affiliates`
--

CREATE TABLE `affiliates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `affiliate_code` varchar(20) NOT NULL,
  `tier` enum('Bronze','Silver','Gold','Platinum') DEFAULT 'Bronze',
  `status` enum('active','pending','suspended') DEFAULT 'pending',
  `total_commissions` decimal(10,2) DEFAULT 0.00,
  `paid_commissions` decimal(10,2) DEFAULT 0.00,
  `pending_commissions` decimal(10,2) DEFAULT 0.00,
  `total_referrals` int(11) DEFAULT 0,
  `active_referrals` int(11) DEFAULT 0,
  `conversion_rate` decimal(5,2) DEFAULT 0.00,
  `last_activity` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `affiliates`
--

INSERT INTO `affiliates` (`id`, `user_id`, `affiliate_code`, `tier`, `status`, `total_commissions`, `paid_commissions`, `pending_commissions`, `total_referrals`, `active_referrals`, `conversion_rate`, `last_activity`, `created_at`, `updated_at`) VALUES
(1, 1, 'ADM001', 'Platinum', 'active', 5250.00, 4500.00, 750.00, 42, 35, 18.70, '2025-07-30 20:30:00', '2025-07-30 20:54:19', '2025-07-30 20:54:19'),
(6, 2, 'J002', 'Bronze', 'active', 0.00, 0.00, 0.00, 0, 0, 0.00, '2025-07-30 22:05:18', '2025-07-30 22:05:18', '2025-07-30 22:05:18'),
(7, 3, 'UTU003', 'Bronze', 'active', 0.00, 0.00, 0.00, 0, 0, 0.00, '2025-07-30 22:05:18', '2025-07-30 22:05:18', '2025-07-30 22:05:18'),
(8, 4, 'AS004', 'Bronze', 'active', 0.00, 0.00, 0.00, 0, 0, 0.00, '2025-07-30 22:05:18', '2025-07-30 22:05:18', '2025-07-30 22:05:18'),
(9, 7, 'JER007', 'Bronze', 'active', 0.00, 0.00, 0.00, 0, 0, 0.00, NULL, '2025-08-10 00:31:24', '2025-08-10 00:31:24'),
(10, 8, 'JER008', 'Bronze', 'active', 0.00, 0.00, 0.00, 0, 0, 0.00, NULL, '2025-08-10 00:34:19', '2025-08-10 00:34:19'),
(11, 9, 'JER009', 'Bronze', 'active', 0.00, 0.00, 0.00, 0, 0, 0.00, NULL, '2025-08-10 01:12:41', '2025-08-10 01:12:41');

-- --------------------------------------------------------

--
-- Table structure for table `bot_requests`
--

CREATE TABLE `bot_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `bot_type` varchar(255) NOT NULL,
  `capital` decimal(15,2) NOT NULL,
  `trading_pair` varchar(255) NOT NULL,
  `risk_level` enum('low','medium','high') DEFAULT 'medium',
  `duration` varchar(255) DEFAULT '30',
  `strategy` varchar(255) DEFAULT 'scalping',
  `status` enum('pending','approved','rejected','active','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bot_requests`
--

INSERT INTO `bot_requests` (`id`, `user_id`, `bot_type`, `capital`, `trading_pair`, `risk_level`, `duration`, `strategy`, `status`, `notes`, `approved_at`, `approved_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'scalping', 1000.00, 'BTC/USDT', 'medium', '30', 'High-frequency scalping strategy for BTC/USDT pair', 'pending', 'First bot request for testing', NULL, NULL, '2025-07-31 10:04:49', '2025-07-31 10:04:49'),
(2, 1, 'swing', 2500.00, 'ETH/USDT', 'low', '60', 'Swing trading strategy for ETH with conservative approach', 'approved', 'Approved for testing', NULL, NULL, '2025-07-31 10:04:49', '2025-07-31 10:04:49'),
(3, 2, 'grid', 5000.00, 'BNB/USDT', 'high', '90', 'Grid trading bot for BNB with aggressive parameters', 'active', 'Currently running', NULL, NULL, '2025-07-31 10:04:49', '2025-07-31 10:04:49'),
(4, 2, 'dca', 1500.00, 'ADA/USDT', 'medium', '45', 'Dollar cost averaging strategy for ADA accumulation', 'pending', 'Waiting for approval', NULL, NULL, '2025-07-31 10:04:49', '2025-07-31 10:04:49'),
(5, 2, 'Forex EA', 1802.00, 'BTC/USDT', 'medium', '30', 'swing', 'pending', NULL, NULL, NULL, '2025-07-31 10:35:44', '2025-07-31 10:35:44'),
(6, 2, 'Crypto Arbitrage', 100.00, 'ETH/USDT', 'medium', '30', 'scalping', 'pending', NULL, NULL, NULL, '2025-08-01 11:59:36', '2025-08-01 11:59:36'),
(7, 2, 'Forex EA', 1226.00, 'BTC/USDT', 'medium', '30', 'scalping', 'pending', NULL, NULL, NULL, '2025-08-03 02:51:05', '2025-08-03 02:51:05'),
(8, 2, 'Crypto Arbitrage', 111111.00, 'BTC/USDT', 'medium', '30', 'swing', 'pending', NULL, NULL, NULL, '2025-08-05 01:08:23', '2025-08-05 01:08:23');

-- --------------------------------------------------------

--
-- Table structure for table `commission_settings`
--

CREATE TABLE `commission_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `commission_settings`
--

INSERT INTO `commission_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES
(1, 'default_commission_rate', '5', 'Default commission rate percentage', '2025-07-30 22:08:39', '2025-07-30 22:08:39'),
(2, 'tier_rates', '{\"Bronze\":5,\"Silver\":8,\"Gold\":12,\"Platinum\":15}', 'Commission rates by tier', '2025-07-30 22:08:39', '2025-07-30 22:08:39'),
(3, 'minimum_payout', '100', 'Minimum payout amount', '2025-07-30 22:08:39', '2025-07-30 22:08:39'),
(4, 'cookie_duration', '30', 'Cookie duration in days', '2025-07-30 22:08:39', '2025-07-30 22:08:39'),
(5, 'payout_schedule', 'monthly', 'Payout schedule (weekly, monthly, quarterly)', '2025-07-30 22:08:39', '2025-07-30 22:08:39');

-- --------------------------------------------------------

--
-- Table structure for table `copy_trading_requests`
--

CREATE TABLE `copy_trading_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'Trader',
  `account_type` enum('MT4','MT5') NOT NULL DEFAULT 'MT4',
  `capital` decimal(10,2) NOT NULL,
  `preferred_trader` varchar(255) DEFAULT NULL,
  `assigned_trader` int(11) DEFAULT NULL,
  `risk_level` enum('Conservative','Moderate','Aggressive') NOT NULL DEFAULT 'Moderate',
  `copy_ratio` int(11) NOT NULL DEFAULT 50,
  `status` enum('pending','approved','active','rejected','paused','completed') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `activated_at` datetime DEFAULT NULL,
  `total_trades` int(11) DEFAULT 0,
  `win_rate` decimal(5,2) DEFAULT 0.00,
  `total_profit` decimal(10,2) DEFAULT 0.00,
  `current_value` decimal(10,2) DEFAULT 0.00,
  `max_daily_loss` decimal(10,2) DEFAULT NULL,
  `stop_copy_on_drawdown` decimal(5,2) DEFAULT NULL,
  `follow_new_positions` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `broker` varchar(255) DEFAULT NULL,
  `server` varchar(255) DEFAULT NULL,
  `login` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `max_drawdown` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `copy_trading_requests`
--

INSERT INTO `copy_trading_requests` (`id`, `user_id`, `name`, `account_type`, `capital`, `preferred_trader`, `assigned_trader`, `risk_level`, `copy_ratio`, `status`, `rejection_reason`, `approved_by`, `approved_at`, `activated_at`, `total_trades`, `win_rate`, `total_profit`, `current_value`, `max_daily_loss`, `stop_copy_on_drawdown`, `follow_new_positions`, `created_at`, `updated_at`, `broker`, `server`, `login`, `password`, `max_drawdown`, `notes`) VALUES
(1, 1, 'Trader', '', 5000.00, 'jayblog', 2, 'Moderate', 75, 'active', NULL, NULL, NULL, NULL, 12, 78.50, 750.00, 5750.00, NULL, NULL, 1, '2025-07-31 10:54:48', '2025-07-31 10:54:48', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 'Trader', '', 3000.00, 'Updated Test User', 3, 'Conservative', 50, 'active', NULL, NULL, NULL, NULL, 8, 85.00, 240.00, 3240.00, NULL, NULL, 1, '2025-07-31 10:54:49', '2025-07-31 10:54:49', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 3, 'Trader', '', 2500.00, 'jayblog', 2, 'Aggressive', 100, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 2500.00, NULL, NULL, 1, '2025-07-31 10:54:49', '2025-07-31 10:54:49', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 1, 'Trader', '', 1000.00, 'trader1', NULL, 'Conservative', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, NULL, NULL, 1, '2025-08-03 03:15:48', '2025-08-03 03:15:48', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 1, 'Trader', '', 1500.00, 'test-trader', NULL, 'Moderate', 75, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, NULL, NULL, 1, '2025-08-03 03:20:43', '2025-08-03 03:20:43', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 2, 'Trader', '', 11108.00, '1', NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, NULL, NULL, 1, '2025-08-03 03:46:40', '2025-08-03 03:46:40', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 2, 'Trader', '', 99999999.99, '2', NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, NULL, NULL, 1, '2025-08-05 01:08:56', '2025-08-05 01:08:56', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-07 00:39:08', '2025-08-07 00:39:08', 'emmy', 'http://localhost:3000/copy-trading', '3456761', '12345678', 20.00, 'New copy trading request'),
(9, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-07 00:51:42', '2025-08-07 00:51:42', 'emmy', 'http://localhost:3000/copy-trading', '2345672', '12345678', 20.00, 'New copy trading request'),
(10, 2, 'Sag Tech', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-07 08:57:21', '2025-08-07 08:57:21', 'emmy', 'http://localhost:3000/copy-trading', '24356460', '12345678', 20.00, 'New copy trading request'),
(11, 2, 'Sag Tech', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-07 08:57:55', '2025-08-07 08:57:55', 'emmy', 'http://localhost:3000/copy-trading', '24356460', '12345678', 20.00, 'New copy trading request'),
(12, 2, 'Sag Tech', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-07 08:58:09', '2025-08-07 08:58:09', 'emmy', 'http://localhost:3000/copy-trading', '24356460', '12345678', 20.00, 'New copy trading request'),
(13, 2, 'Sag Tech', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-07 08:58:30', '2025-08-07 08:58:30', 'emmy', 'http://localhost:3000/copy-trading', '24356460', '12345678', 20.00, 'New copy trading request'),
(14, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 07:53:54', '2025-08-09 07:53:54', 'emmy', 'http://localhost:3000/copy-trading', '2234545654', '12345678', 20.00, 'New copy trading request'),
(15, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 07:54:37', '2025-08-09 07:54:37', 'emmy', 'http://localhost:3000/copy-trading', '2234545654', '12345678', 20.00, 'New copy trading request'),
(16, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:21:14', '2025-08-09 08:21:14', 'emmy', 'http://localhost:3000/copy-trading', '2234545654', '12345678', 20.00, 'New copy trading request'),
(17, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:21:19', '2025-08-09 08:21:19', 'emmy', 'http://localhost:3000/copy-trading', '2234545654', '12345678', 20.00, 'New copy trading request'),
(18, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:21:36', '2025-08-09 08:21:36', 'emmy', 'http://localhost:3000/copy-trading', '2234545654', '12345678', 20.00, 'New copy trading request'),
(19, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:21:43', '2025-08-09 08:21:43', 'emmy', 'http://localhost:3000/copy-trading', '2234545654', '12345678', 20.00, 'New copy trading request'),
(20, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:34:07', '2025-08-09 08:34:07', 'emmy', 'http://localhost:3000/copy-trading', '223454565', '12345678', 20.00, 'New copy trading request'),
(21, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:47:00', '2025-08-09 08:47:00', 'emmy', 'http://localhost:3000/copy-trading', '223454565', '12345678', 20.00, 'New copy trading request'),
(22, 2, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:47:17', '2025-08-09 08:47:17', 'emmy', 'http://localhost:3000/copy-trading', '223454565', '12345678', 20.00, 'New copy trading request'),
(23, 2, 'JEREMIAH SUGHNEN IORT', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:48:48', '2025-08-09 08:48:48', 'emmuu', 'http://localhost:3000/copy-trading', '223454534352', '12345678', 20.00, 'New copy trading request'),
(24, 2, 'JEREMIAH', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 08:51:10', '2025-08-09 08:51:10', 'emmyfh', 'http://localhost:3000/copy-trading', '345678645', '12345678', 30.00, 'New copy trading request'),
(25, 5, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-09 23:50:19', '2025-08-09 23:50:19', 'emmyfh', 'http://localhost:3000/copy-trading', '123454', '12345678', 20.00, 'New copy trading request'),
(26, 8, 'JEREMIAH SUGHNEN IORTSWAM', '', 0.00, NULL, NULL, '', 50, 'pending', NULL, NULL, NULL, NULL, 0, 0.00, 0.00, 0.00, 5.00, 1.00, 1, '2025-08-10 00:35:33', '2025-08-10 00:35:33', 'emmy', 'http://localhost:3000/copy-trading', '1234565', '12345678', 20.00, 'New copy trading request');

-- --------------------------------------------------------

--
-- Table structure for table `education_content`
--

CREATE TABLE `education_content` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `type` enum('course','webinar','article','quiz') NOT NULL DEFAULT 'course',
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `education_content`
--

INSERT INTO `education_content` (`id`, `title`, `description`, `type`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 'Introduction to Trading', 'Learn the fundamentals of trading in financial markets. This comprehensive course covers basic concepts, terminology, and strategies for beginners.', 'course', 1, '2025-08-02 22:50:50', '2025-08-02 22:50:50'),
(2, 'Technical Analysis Masterclass', 'Master the art of technical analysis with chart patterns, indicators, and trading signals. Perfect for intermediate traders looking to improve their skills.', 'course', 1, '2025-08-02 22:50:50', '2025-08-02 22:50:50'),
(3, 'Risk Management Strategies', 'Learn how to protect your capital and manage risk effectively. Essential knowledge for all traders regardless of experience level.', 'course', 1, '2025-08-02 22:50:50', '2025-08-02 22:50:50'),
(4, 'Market Outlook 2025', 'Join our expert analysts as they discuss market trends, opportunities, and predictions for the upcoming year.', 'webinar', 1, '2025-08-02 22:50:50', '2025-08-02 22:50:50'),
(5, 'Cryptocurrency Trading Basics', 'Understand the world of cryptocurrency trading, from Bitcoin to altcoins. Learn about exchanges, wallets, and trading strategies.', 'course', 1, '2025-08-02 22:50:50', '2025-08-02 22:50:50'),
(6, 'Options Trading Workshop', 'Live workshop covering options trading strategies, Greeks, and risk management. Interactive session with Q&A.', 'webinar', 1, '2025-08-02 22:50:50', '2025-08-02 22:50:50'),
(7, 'test course', 'ttttty', 'course', 1, '2025-08-03 00:06:37', '2025-08-03 00:06:37'),
(8, 'tetrrr', 'ytyty', 'course', 0, '2025-08-05 16:40:35', '2025-08-05 16:40:35');

-- --------------------------------------------------------

--
-- Table structure for table `investments`
--

CREATE TABLE `investments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `duration` int(11) NOT NULL,
  `roi` decimal(5,2) NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('pending','active','completed','cancelled') DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `plan_id` int(11) NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `total_earned` decimal(15,2) DEFAULT 0.00,
  `last_payout` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `investments`
--

INSERT INTO `investments` (`id`, `user_id`, `amount`, `duration`, `roi`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`, `plan_id`, `completed_at`, `total_earned`, `last_payout`) VALUES
(4, 1, 5000.00, 30, 15.00, '2024-01-01 00:00:00', '2024-01-31 00:00:00', 'active', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 1, NULL, 750.00, NULL),
(5, 1, 10000.00, 60, 25.00, '2024-01-15 00:00:00', '2024-03-15 00:00:00', 'active', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 2, NULL, 1250.00, NULL),
(6, 1, 2500.00, 30, 15.00, '2023-12-01 00:00:00', '2023-12-31 00:00:00', 'completed', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 1, NULL, 375.00, NULL),
(7, 1, 15000.00, 90, 35.00, '2024-01-10 00:00:00', '2024-04-10 00:00:00', 'active', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 3, NULL, 2100.00, NULL),
(8, 1, 7500.00, 60, 25.00, NULL, NULL, 'pending', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 2, NULL, 0.00, NULL),
(9, 2, 100.00, 30, 5.50, '2025-07-31 03:15:39', '2025-08-30 03:15:39', 'pending', '2025-07-31 03:15:39', '2025-07-31 03:15:39', 6, NULL, 0.00, NULL),
(10, 8, 1000.00, 45, 8.00, '2025-08-27 18:24:40', '2025-10-11 18:24:40', 'pending', '2025-08-27 18:24:40', '2025-08-27 18:24:40', 7, NULL, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `investment_plans`
--

CREATE TABLE `investment_plans` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL,
  `min_amount` decimal(15,2) NOT NULL,
  `max_amount` decimal(15,2) NOT NULL,
  `roi` float NOT NULL,
  `duration` int(11) NOT NULL COMMENT 'Duration in days',
  `is_active` tinyint(1) DEFAULT 1,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `risk_level` enum('Low','Medium','High') DEFAULT 'Medium',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `investment_plans`
--

INSERT INTO `investment_plans` (`id`, `name`, `description`, `min_amount`, `max_amount`, `roi`, `duration`, `is_active`, `features`, `risk_level`, `created_at`, `updated_at`) VALUES
(6, 'Starter Plan', 'Perfect for beginners looking to start their investment journey with minimal risk.', 100.00, 999.99, 5.5, 30, 1, '[\"Daily profit updates\",\"Email notifications\",\"Basic support\",\"Withdrawal after 30 days\"]', 'Low', '2025-07-31 02:45:20', '2025-07-31 02:45:20'),
(7, 'Silver Plan', 'Balanced investment option with moderate returns and manageable risk.', 1000.00, 4999.99, 8, 45, 1, '[\"Real-time profit tracking\",\"SMS & Email notifications\",\"Priority support\",\"Flexible withdrawal options\",\"Investment insurance\"]', 'Medium', '2025-07-31 02:45:20', '2025-07-31 02:45:20'),
(8, 'Gold Plan', 'Premium investment plan with higher returns for experienced investors.', 5000.00, 19999.99, 12, 60, 1, '[\"Advanced analytics dashboard\",\"Dedicated account manager\",\"VIP support 24/7\",\"Multiple withdrawal methods\",\"Investment protection\",\"Bonus rewards program\"]', 'Medium', '2025-07-31 02:45:20', '2025-07-31 02:45:20'),
(9, 'Platinum Plan', 'Elite investment package with maximum returns for high-net-worth individuals.', 20000.00, 99999.99, 15, 90, 1, '[\"Personalized investment strategy\",\"Private wealth manager\",\"Exclusive market insights\",\"Instant withdrawals\",\"Full investment protection\",\"Premium rewards & bonuses\",\"Private investor events\"]', 'High', '2025-07-31 02:45:20', '2025-07-31 02:45:20'),
(10, 'dfd', 'vc', 1111.00, 111111.00, 4, 39, 1, NULL, 'Medium', '2025-08-05 01:14:22', '2025-08-05 01:14:22');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `nowpayment_id` varchar(255) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'deposit',
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `pay_currency` varchar(10) DEFAULT NULL,
  `pay_amount` decimal(15,8) DEFAULT NULL,
  `pay_address` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'waiting',
  `description` text DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `actually_paid` decimal(15,8) DEFAULT NULL,
  `network_fee` decimal(15,8) DEFAULT NULL,
  `tx_hash` varchar(255) DEFAULT NULL,
  `ipn_callback_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ipn_callback_data`)),
  `expires_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `order_id`, `nowpayment_id`, `type`, `amount`, `currency`, `pay_currency`, `pay_amount`, `pay_address`, `status`, `description`, `related_id`, `actually_paid`, `network_fee`, `tx_hash`, `ipn_callback_data`, `expires_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 8, 'HC-DEPOSIT-1756285781856-971', NULL, 'deposit', 10.00, 'USD', 'btc', NULL, NULL, 'waiting', 'Account Deposit - $10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 09:09:41', '2025-08-27 09:09:41'),
(2, 8, 'HC-DEPOSIT-1756295263338-921', NULL, 'deposit', 20.00, 'USD', 'usdt', NULL, NULL, 'waiting', 'Account Deposit - $20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 11:47:43', '2025-08-27 11:47:43'),
(3, 8, 'HC-DEPOSIT-1756295301582-575', NULL, 'deposit', 20.00, 'USD', 'usdt', NULL, NULL, 'waiting', 'Account Deposit - $20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 11:48:21', '2025-08-27 11:48:21'),
(4, 8, 'HC-DEPOSIT-1756295737533-704', NULL, 'deposit', 20.00, 'USD', 'usdt', NULL, NULL, 'waiting', 'Account Deposit - $20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 11:55:37', '2025-08-27 11:55:37'),
(5, 8, 'HC-DEPOSIT-1756296623843-103', NULL, 'deposit', 20.00, 'USD', 'usdt', NULL, NULL, 'waiting', 'Account Deposit - $20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 12:10:23', '2025-08-27 12:10:23'),
(6, 8, 'HC-DEPOSIT-1756306610756-435', NULL, 'deposit', 20.00, 'USD', 'usdt', NULL, NULL, 'waiting', 'Account Deposit - $20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 14:56:50', '2025-08-27 14:56:50'),
(7, 8, 'HC-DEPOSIT-1756306670105-515', '6420610346', 'deposit', 50.00, 'USD', 'btc', 0.00044619, '3Qq3NMKRfzKaUtACsNu95Xm3LnVseyvLRx', 'waiting', 'Account Deposit - $50', NULL, NULL, NULL, NULL, NULL, '2025-08-27 15:27:52', NULL, '2025-08-27 14:57:50', '2025-08-27 14:57:52'),
(8, 2, 'HC-DEPOSIT-1756307275390-131', '6091122483', 'deposit', 50.00, 'USD', 'btc', 0.00044611, '3BinFKrBfUrr72JmdDd4sNoMpiWTrwP9r1', 'waiting', 'Account Deposit - $50', NULL, NULL, NULL, NULL, NULL, '2025-08-27 15:38:00', NULL, '2025-08-27 15:07:55', '2025-08-27 15:08:00'),
(9, 8, 'HC-DEPOSIT-1756310734815-678', '6355297891', 'deposit', 30.00, 'USD', 'eth', 0.00642787, '0xeB919676eF8013A4f3bDd91BcFCC85AA9E2bCB7D', 'waiting', 'Account Deposit - $30', NULL, NULL, NULL, NULL, NULL, '2025-08-27 16:35:38', NULL, '2025-08-27 16:05:34', '2025-08-27 16:05:38'),
(10, 8, 'HC-DEPOSIT-1756311777606-911', '5588415015', 'deposit', 50.00, 'USD', 'btc', 0.00044508, '3C7X2WuQCSxNtJ8tAnu5oZY4Mdo5WzZvhA', 'waiting', 'Account Deposit - $50', NULL, NULL, NULL, NULL, NULL, '2025-08-27 16:53:00', NULL, '2025-08-27 16:22:57', '2025-08-27 16:23:00'),
(11, 8, 'HC-DEPOSIT-1756312499850-708', '4919075313', 'deposit', 20.00, 'USD', 'usdtbsc', 19.99968785, '0xcd21A359bF05F5dD0a478477dD9F69b9e6f0D42d', 'waiting', 'Account Deposit - $20', NULL, NULL, NULL, NULL, NULL, '2025-08-27 17:05:03', NULL, '2025-08-27 16:34:59', '2025-08-27 16:35:03'),
(12, 8, 'HC-DEPOSIT-1756314070565-641', '4457565081', 'deposit', 50.00, 'USD', 'btc', 0.00044535, '35xohHNipNyf2DCRKjuK9dAQMvJNqMYJdf', 'waiting', 'Account Deposit - $50', NULL, NULL, NULL, NULL, NULL, '2025-08-27 17:31:13', NULL, '2025-08-27 17:01:10', '2025-08-27 17:01:13'),
(13, 8, 'HC-DEPOSIT-1756318963607-288', '6002860987', 'deposit', 30.00, 'USD', 'usdtbsc', 29.91976414, '0x23cb366835Be5d9e94a47b744735A114B87C30B8', 'waiting', 'Account Deposit - $30', NULL, NULL, NULL, NULL, NULL, '2025-08-27 18:52:50', NULL, '2025-08-27 18:22:43', '2025-08-27 18:22:50'),
(14, 8, 'HC-INVEST-1756319080980-242', '5811239649', 'investment', 1000.00, 'USD', 'btc', 0.00886918, '3EZh5diikbUZdDJgGYSAsKkqjs3eyNL8sf', 'waiting', 'Investment in Silver Plan', 10, NULL, NULL, NULL, NULL, '2025-08-27 18:54:50', NULL, '2025-08-27 18:24:40', '2025-08-27 18:24:50');

-- --------------------------------------------------------

--
-- Table structure for table `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `signals`
--

CREATE TABLE `signals` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL,
  `pair` varchar(20) NOT NULL,
  `type` enum('buy','sell') NOT NULL,
  `entry_price` decimal(10,5) NOT NULL,
  `stop_loss` decimal(10,5) NOT NULL,
  `take_profit` decimal(10,5) NOT NULL,
  `status` enum('pending','active','closed') DEFAULT 'pending',
  `result` enum('win','loss') DEFAULT NULL,
  `pips` decimal(8,2) DEFAULT NULL,
  `risk_reward_ratio` decimal(5,2) DEFAULT 1.00,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `signals`
--

INSERT INTO `signals` (`id`, `title`, `description`, `pair`, `type`, `entry_price`, `stop_loss`, `take_profit`, `status`, `result`, `pips`, `risk_reward_ratio`, `created_at`, `updated_at`, `created_by`) VALUES
(58, 'EUR/USD Long Position', 'Strong bullish momentum on EUR/USD with breakout above key resistance level at 1.0850. Target 1.0920 with stop at 1.0800.', 'EUR/USD', 'buy', 1.08500, 1.08000, 1.09200, 'active', NULL, NULL, 1.40, '2025-08-03 01:32:56', '2025-08-03 01:32:56', 1),
(59, 'GBP/JPY Short Setup', 'GBP/JPY showing bearish divergence on 4H chart. Entry at 188.50, targeting 186.80 with stop at 189.20.', 'GBP/JPY', 'sell', 188.50000, 189.20000, 186.80000, 'closed', 'win', 170.00, 2.40, '2025-08-03 01:32:56', '2025-08-03 01:32:56', 1),
(60, 'USD/CAD Buy Signal', 'USD/CAD bouncing off major support at 1.3420. Looking for move to 1.3520 with tight stop at 1.3380.', 'USD/CAD', 'buy', 1.34200, 1.33800, 1.35200, 'closed', 'win', 100.00, 2.50, '2025-08-03 01:32:56', '2025-08-03 01:32:56', 1),
(61, 'AUD/USD Short Position', 'AUD/USD rejected at key resistance 0.6750. Targeting 0.6680 with stop above 0.6780.', 'AUD/USD', 'sell', 0.67500, 0.67800, 0.66800, 'closed', 'loss', -30.00, 2.30, '2025-08-03 01:32:56', '2025-08-03 01:32:56', 1),
(62, 'XAU/USD Gold Long', 'Gold showing strong support at $2010. Bullish momentum building for move to $2040.', 'XAU/USD', 'buy', 2010.50000, 1995.00000, 2040.00000, 'pending', NULL, NULL, 1.90, '2025-08-03 01:32:56', '2025-08-03 01:32:56', 1),
(63, 'USD/JPY Sell Setup', 'USD/JPY overbought at 150.20. Looking for correction to 148.50 with stop at 151.00.', 'USD/JPY', 'sell', 150.20000, 151.00000, 148.50000, 'active', NULL, NULL, 2.10, '2025-08-03 01:32:56', '2025-08-03 01:32:56', 1),
(64, 'EUR/GBP Long Position', 'EUR/GBP breaking above descending trendline. Target 0.8650 with stop at 0.8580.', 'EUR/GBP', 'buy', 0.86000, 0.85800, 0.86500, 'closed', 'win', 50.00, 2.50, '2025-08-03 01:32:56', '2025-08-03 01:32:56', 1),
(65, 'NZD/USD Short Signal', 'NZD/USD facing resistance at 0.6180. Bearish setup targeting 0.6120 with stop at 0.6200.', 'NZD/USD', 'sell', 0.61800, 0.62000, 0.61200, 'active', NULL, NULL, 3.00, '2025-08-03 01:32:56', '2025-08-03 01:32:56', 1),
(66, 'rrttrt', 'fhfh', 'EUR/USDT', 'sell', 10.00000, 9.00000, 11.00000, 'pending', NULL, NULL, 1.00, '2025-08-05 16:39:03', '2025-08-05 16:39:03', 1);

-- --------------------------------------------------------

--
-- Table structure for table `signal_subscription_plans`
--

CREATE TABLE `signal_subscription_plans` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `duration` int(11) NOT NULL DEFAULT 30,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `signal_subscription_plans`
--

INSERT INTO `signal_subscription_plans` (`id`, `name`, `description`, `price`, `duration`, `features`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Basic Plan', 'Basic signal subscription with standard features', 29.99, 30, '[\"Daily signals\", \"Email alerts\", \"Basic support\"]', 1, '2025-07-31 22:41:24', '2025-07-31 22:41:24'),
(2, 'Pro Plan', 'Professional signal subscription with advanced features', 59.99, 30, '[\"Premium signals\", \"SMS & Email alerts\", \"Priority support\", \"Market analysis\"]', 1, '2025-07-31 22:41:24', '2025-07-31 22:41:24'),
(3, 'Enterprise Plan', 'Complete signal solution for professional traders', 99.99, 30, '[\"All Pro features\", \"24/7 dedicated support\", \"Custom signals\", \"Personal account manager\"]', 1, '2025-07-31 22:41:24', '2025-07-31 22:41:24');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `plan_id` int(11) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `next_billing_date` datetime DEFAULT NULL,
  `status` enum('active','expired','cancelled','canceled','pending') NOT NULL DEFAULT 'pending',
  `auto_renew` tinyint(1) NOT NULL DEFAULT 0,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `payment_method` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `plan_id`, `start_date`, `end_date`, `next_billing_date`, `status`, `auto_renew`, `amount`, `currency`, `payment_method`, `transaction_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-01-01 00:00:00', '2025-02-01 00:00:00', '2025-02-01 00:00:00', 'active', 1, 29.99, 'USD', 'credit_card', NULL, '2025-07-30 23:15:29', '2025-07-30 23:15:29'),
(2, 2, 2, '2025-01-15 00:00:00', '2025-02-15 00:00:00', '2025-02-15 00:00:00', 'canceled', 1, 99.99, 'USD', 'paypal', NULL, '2025-07-30 23:15:29', '2025-08-03 01:56:26'),
(3, 3, 3, '2024-12-01 00:00:00', '2025-01-01 00:00:00', '2025-01-01 00:00:00', 'expired', 0, 199.99, 'USD', 'credit_card', NULL, '2025-07-30 23:15:29', '2025-07-30 23:15:29'),
(5, 2, 5, '2024-03-01 00:00:00', '2025-03-01 00:00:00', '2025-03-01 00:00:00', 'cancelled', 0, 999.99, 'USD', 'credit_card', NULL, '2025-07-30 23:15:29', '2025-07-30 23:15:29'),
(6, 2, 10, '2025-08-03 02:38:37', '2025-09-03 02:38:37', '2025-09-03 02:38:37', 'active', 1, 49.99, 'USD', 'bank_transfer', NULL, '2025-08-03 02:38:37', '2025-08-03 02:38:37'),
(7, 8, 9, '2025-08-26 21:06:16', '2025-09-26 21:06:16', '2025-09-26 21:06:16', 'canceled', 1, 0.00, 'USD', 'crypto', NULL, '2025-08-26 21:06:16', '2025-08-26 21:07:12'),
(8, 8, 10, '2025-08-26 21:07:12', '2025-09-26 21:07:12', '2025-09-26 21:07:12', 'active', 1, 49.99, 'USD', 'crypto', NULL, '2025-08-26 21:07:12', '2025-08-26 21:07:12');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `billing_cycle` enum('monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `max_signals` int(11) DEFAULT NULL,
  `has_bot_access` tinyint(1) NOT NULL DEFAULT 0,
  `has_copy_trading` tinyint(1) NOT NULL DEFAULT 0,
  `support_level` enum('basic','priority','vip') NOT NULL DEFAULT 'basic',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `name`, `description`, `price`, `billing_cycle`, `features`, `is_active`, `max_signals`, `has_bot_access`, `has_copy_trading`, `support_level`, `created_at`, `updated_at`) VALUES
(9, 'Free', 'Basic trading signals for beginners', 0.00, 'monthly', '[\"Up to 3 signals per week\",\"Basic signal information\",\"Email notifications\",\"24-hour delay on signals\"]', 1, 3, 0, 0, 'basic', '2025-08-03 03:31:57', '2025-08-03 03:31:57'),
(10, 'Pro', 'Professional trading signals with detailed analysis', 49.99, 'monthly', '[\"Up to 10 signals per week\",\"Detailed technical analysis\",\"Real-time notifications\",\"Telegram group access\",\"Priority support\",\"Risk management tips\"]', 1, 10, 1, 0, 'priority', '2025-08-03 03:31:57', '2025-08-03 03:31:57'),
(11, 'VIP', 'Premium trading signals with unlimited access', 99.99, 'monthly', '[\"Unlimited signals\",\"Detailed analysis with charts\",\"Real-time notifications\",\"VIP Telegram group access\",\"24/7 dedicated support\",\"1-on-1 consultation sessions\",\"Copy trading access\",\"Custom risk management\"]', 1, 999, 1, 1, 'vip', '2025-08-03 03:31:57', '2025-08-03 03:31:57');

-- --------------------------------------------------------

--
-- Table structure for table `trades`
--

CREATE TABLE `trades` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `investment_id` int(11) DEFAULT NULL,
  `asset` varchar(255) NOT NULL,
  `type` enum('buy','sell') NOT NULL,
  `amount` decimal(24,8) NOT NULL,
  `price` decimal(24,8) NOT NULL,
  `total` decimal(24,8) NOT NULL,
  `status` enum('open','closed','cancelled') DEFAULT 'open',
  `profit_loss` decimal(24,8) DEFAULT 0.00000000,
  `close_price` decimal(24,8) DEFAULT NULL,
  `leverage` int(11) NOT NULL DEFAULT 1,
  `stop_loss` decimal(24,8) DEFAULT NULL,
  `take_profit` decimal(24,8) DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expire` datetime DEFAULT NULL,
  `two_factor_code` varchar(255) DEFAULT NULL,
  `two_factor_code_expire` datetime DEFAULT NULL,
  `two_factor_enable` tinyint(1) DEFAULT 0,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `total_deposits` decimal(15,2) DEFAULT 0.00,
  `total_withdrawals` decimal(15,2) DEFAULT 0.00,
  `total_trades` int(11) DEFAULT 0,
  `total_profit` decimal(15,2) DEFAULT 0.00,
  `status` enum('active','suspended','banned') DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `last_ip` varchar(255) DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0,
  `lock_until` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `confirm_email_token` varchar(255) DEFAULT NULL,
  `is_email_confirmed` tinyint(1) DEFAULT 0
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `reset_password_token`, `reset_password_expire`, `two_factor_code`, `two_factor_code_expire`, `two_factor_enable`, `avatar`, `phone`, `address`, `city`, `country`, `postal_code`, `date_of_birth`, `balance`, `total_deposits`, `total_withdrawals`, `total_trades`, `total_profit`, `status`, `last_login`, `last_ip`, `login_attempts`, `lock_until`, `created_at`, `updated_at`, `confirm_email_token`, `is_email_confirmed`) VALUES
(1, 'Admin User', 'admin@hillscapital.com', '$2a$10$//dj27CgzxEx3Ou08Gkv1uzVfQ6eVJ10jvbsRIK9X2Ku3I5ImbgG2', 'admin', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 25000.00, 40000.00, 5000.00, 15, 4475.00, 'active', '2025-08-05 01:26:11', '127.0.0.1', 0, NULL, '2025-07-23 01:59:05', '2025-08-05 01:26:11', NULL, 0),
(2, 'jayblog', 'jeremiahajayi4@gmail.com', '$2a$10$wf0R3OIuVeRJ8529L7zlI.nxNTnUczWl7VRF1y696bwrHXk/ipK.S', 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0, 0.00, 'active', '2025-08-10 03:46:04', '127.0.0.1', 0, NULL, '2025-07-23 18:50:51', '2025-08-10 03:46:04', NULL, 0),
(3, 'Updated Test User', 'test@example.com', '$2b$10$example.hashed.password', 'user', NULL, NULL, NULL, NULL, 0, NULL, '123-456-7890', NULL, NULL, NULL, NULL, NULL, 15000.00, 20000.00, 5000.00, 45, 3250.75, 'active', NULL, NULL, 0, NULL, '2025-07-28 23:12:51', '2025-07-30 12:55:50', NULL, 0),
(8, 'JEREMIAH SUGHNEN IORTSWAM', 'Sagtechng@gmail.com', '$2a$10$pTCMsfyWESPxv7roqlM3VuQzFoxmohlY4DsOWLBNXWtzHYyUHI0vK', 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0, 0.00, 'active', '2025-08-26 21:03:28', '127.0.0.1', 0, NULL, '2025-08-10 00:34:19', '2025-08-26 21:03:28', '4808b661de425de6182d3a1d37011441cf1d35ee8cdb8214311b489f128caae8', 0),
(7, 'JEREMIAH SUGHNEN IORTSWAM', 'Starryajayiglobal@gmail.com', '$2a$10$wNLf7ABBtPp.jNjEUvo2M.90Qzyv84tqxlLmAi5beFUIzWSkQG/PW', 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0, 0.00, 'active', NULL, NULL, 0, NULL, '2025-08-10 00:31:24', '2025-08-10 00:31:24', 'b7b48972046c083b873617ad077caf222ce62e508f332e8d8cfde5234e15ea41', 0),
(9, 'JEREMIAH Jeremiah', 'build@sagtech.com.ng', '$2a$10$cfFDnAdD7pmPQSqi4djf3.mmr7gN5ATaPJ0JB.MJjRD6qJJdFiJSq', 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0, 0.00, 'active', '2025-08-10 01:48:40', '127.0.0.1', 0, NULL, '2025-08-10 01:12:40', '2025-08-10 01:48:40', '5c06fd48b7c4904bcc1eba1aab85caac40f5a4f14633ffa5c47a2749f00254fb', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_education_progress`
--

CREATE TABLE `user_education_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `education_content_id` int(11) NOT NULL,
  `progress` decimal(5,2) NOT NULL DEFAULT 0.00,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_education_progress`
--

INSERT INTO `user_education_progress` (`id`, `user_id`, `education_content_id`, `progress`, `is_completed`, `created_at`, `updated_at`) VALUES
(1, 2, 7, 33.00, 0, '2025-08-03 00:28:32', '2025-08-03 00:38:49'),
(2, 2, 2, 33.00, 0, '2025-08-03 00:39:05', '2025-08-03 00:39:05');

-- --------------------------------------------------------

--
-- Table structure for table `user_signal_subscriptions`
--

CREATE TABLE `user_signal_subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
  `start_date` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `signal_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `affiliates`
--
ALTER TABLE `affiliates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `affiliate_code` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_2` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_3` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_4` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_5` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_6` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_7` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_8` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_9` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_10` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_11` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_12` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_13` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_14` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_15` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_16` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_17` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_18` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_19` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_20` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_21` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_22` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_23` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_24` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_25` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_26` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_27` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_28` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_29` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_30` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_31` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_32` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_33` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_34` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_35` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_36` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_37` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_38` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_39` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_40` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_41` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_42` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_43` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_44` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_45` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_46` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_47` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_48` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_49` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_50` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_51` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_52` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_53` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_54` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_55` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_56` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_57` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_58` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_59` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_60` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_61` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_62` (`affiliate_code`),
  ADD UNIQUE KEY `affiliate_code_63` (`affiliate_code`);

--
-- Indexes for table `bot_requests`
--
ALTER TABLE `bot_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `bot_requests_user_id` (`user_id`),
  ADD KEY `bot_requests_status` (`status`),
  ADD KEY `bot_requests_created_at` (`created_at`);

--
-- Indexes for table `commission_settings`
--
ALTER TABLE `commission_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `copy_trading_requests`
--
ALTER TABLE `copy_trading_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `assigned_trader` (`assigned_trader`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `education_content`
--
ALTER TABLE `education_content`
  ADD PRIMARY KEY (`id`),
  ADD KEY `education_content_type` (`type`);

--
-- Indexes for table `investments`
--
ALTER TABLE `investments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `investment_plans`
--
ALTER TABLE `investment_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `token` (`token`(250));

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `signals`
--
ALTER TABLE `signals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `signal_subscription_plans`
--
ALTER TABLE `signal_subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_signal_subscription_plans_active` (`is_active`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trades`
--
ALTER TABLE `trades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trades_user_status_idx` (`user_id`,`status`),
  ADD KEY `trades_asset_status_idx` (`asset`,`status`),
  ADD KEY `trades_created_at_idx` (`created_at`),
  ADD KEY `investment_id` (`investment_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`) USING HASH,
  ADD KEY `idx_users_email` (`email`(250)),
  ADD KEY `idx_users_status` (`status`);

--
-- Indexes for table `user_education_progress`
--
ALTER TABLE `user_education_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_content` (`user_id`,`education_content_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_education_content_id` (`education_content_id`),
  ADD KEY `idx_is_completed` (`is_completed`);

--
-- Indexes for table `user_signal_subscriptions`
--
ALTER TABLE `user_signal_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_signal_subscriptions_user_id_plan_id_unique` (`user_id`,`plan_id`),
  ADD KEY `user_signal_subscriptions_plan_id_foreign` (`plan_id`),
  ADD KEY `user_signal_subscriptions_status_index` (`status`),
  ADD KEY `user_signal_subscriptions_expires_at_index` (`expires_at`),
  ADD KEY `user_signal_subscriptions_user_id_status_index` (`user_id`,`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `affiliates`
--
ALTER TABLE `affiliates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `bot_requests`
--
ALTER TABLE `bot_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `commission_settings`
--
ALTER TABLE `commission_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `copy_trading_requests`
--
ALTER TABLE `copy_trading_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `education_content`
--
ALTER TABLE `education_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `investments`
--
ALTER TABLE `investments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `investment_plans`
--
ALTER TABLE `investment_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `signals`
--
ALTER TABLE `signals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `signal_subscription_plans`
--
ALTER TABLE `signal_subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `trades`
--
ALTER TABLE `trades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_education_progress`
--
ALTER TABLE `user_education_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_signal_subscriptions`
--
ALTER TABLE `user_signal_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
