-- ==========================================================
-- ResQ: AI-Powered Disaster Response & Emergency Coordination Platform
-- Database Schema for MySQL 8.0+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `resq_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `resq_db`;

-- Drop existing tables in reverse dependency order if re-creating
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `rescue_updates`;
DROP TABLE IF EXISTS `rescue_requests`;
DROP TABLE IF EXISTS `ai_analysis`;
DROP TABLE IF EXISTS `emergency_reports`;
DROP TABLE IF EXISTS `alerts`;
DROP TABLE IF EXISTS `shelters`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `volunteers`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role` ENUM('citizen', 'volunteer', 'admin') NOT NULL DEFAULT 'citizen',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. VOLUNTEERS TABLE (Extension of User role 'volunteer')
CREATE TABLE `volunteers` (
  `volunteer_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `skills` VARCHAR(255) DEFAULT 'First Aid & Rescue Assistance',
  `availability_status` ENUM('available', 'busy', 'offline') NOT NULL DEFAULT 'available',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ADMINS TABLE (Extension of User role 'admin')
CREATE TABLE `admins` (
  `admin_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. EMERGENCY REPORTS TABLE
CREATE TABLE `emergency_reports` (
  `report_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `disaster_type` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `image_url` VARCHAR(255) NULL,
  `ai_classification` VARCHAR(50) NULL,
  `priority_level` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  `summary` TEXT NULL,
  `status` ENUM('Reported', 'Verified', 'In Progress', 'Resolved', 'Dismissed') NOT NULL DEFAULT 'Reported',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  INDEX `idx_report_priority` (`priority_level`),
  INDEX `idx_report_status` (`status`),
  INDEX `idx_report_type` (`disaster_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. AI ANALYSIS TABLE
CREATE TABLE `ai_analysis` (
  `analysis_id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_id` INT NOT NULL,
  `classification` VARCHAR(50) NOT NULL,
  `confidence` VARCHAR(20) DEFAULT 'High',
  `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  `summary` TEXT NOT NULL,
  `safety_tips` TEXT NULL,
  `source` ENUM('gemini', 'fallback') NOT NULL DEFAULT 'fallback',
  `raw_response` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`report_id`) REFERENCES `emergency_reports`(`report_id`) ON DELETE CASCADE,
  INDEX `idx_analysis_report` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. RESCUE REQUESTS TABLE
CREATE TABLE `rescue_requests` (
  `request_id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_id` INT NOT NULL,
  `requested_by` INT NOT NULL,
  `assigned_to` INT NULL, -- user_id of volunteer
  `status` ENUM('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `priority_level` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`report_id`) REFERENCES `emergency_reports`(`report_id`) ON DELETE CASCADE,
  FOREIGN KEY (`requested_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`user_id`) ON DELETE SET NULL,
  INDEX `idx_rescue_status` (`status`),
  INDEX `idx_rescue_priority` (`priority_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. RESCUE UPDATES TABLE
CREATE TABLE `rescue_updates` (
  `update_id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_id` INT NOT NULL,
  `volunteer_id` INT NOT NULL, -- user_id of volunteer
  `status` ENUM('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled') NOT NULL,
  `remarks` TEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`request_id`) REFERENCES `rescue_requests`(`request_id`) ON DELETE CASCADE,
  FOREIGN KEY (`volunteer_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  INDEX `idx_update_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. SHELTERS TABLE
CREATE TABLE `shelters` (
  `shelter_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `capacity` INT NOT NULL DEFAULT 100,
  `available_slots` INT NOT NULL DEFAULT 100,
  `contact_number` VARCHAR(30) NOT NULL,
  `status` ENUM('Available', 'Full', 'Temporarily Closed') NOT NULL DEFAULT 'Available',
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL,
  INDEX `idx_shelter_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ALERTS TABLE
CREATE TABLE `alerts` (
  `alert_id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NULL, -- user_id of admin
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `alert_type` ENUM('Evacuation', 'Weather Warning', 'Safety Instruction', 'Emergency', 'General') NOT NULL DEFAULT 'General',
  `severity` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  `location` VARCHAR(150) NOT NULL DEFAULT 'All Affected Areas',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL,
  INDEX `idx_alert_severity` (`severity`),
  INDEX `idx_alert_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
