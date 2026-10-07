-- ==========================================================
-- ResQ: AI-Powered Disaster Response & Emergency Coordination Platform
-- Realistic Seed Data for Demo & Evaluation
-- ==========================================================

USE `resq_db`;

-- 1. SEED USERS
-- Passwords:
-- Citizen accounts: 'Citizen@123'
-- Volunteer accounts: 'Volunteer@123'
-- Admin account: 'Admin@123'

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `phone`, `role`, `created_at`) VALUES
-- Demo Accounts
(1, 'Rahul Sharma (Citizen)', 'citizen@resq.org', '$2a$10$PiUGoEryu.kvqw4QsnndIeYAfJ86qZsh/mfxB4KbUTGdBMA9Q5CkK', '+91 98765 43210', 'citizen', NOW() - INTERVAL 5 DAY),
(2, 'Priya Patel (Volunteer)', 'volunteer@resq.org', '$2a$10$IVCuELL1rbo/D.du6wfIvuV//wY6UlVStgkaN.Usf7eQI91J8hBEa', '+91 98765 12345', 'volunteer', NOW() - INTERVAL 5 DAY),
(3, 'Chief Officer Vikram Singh', 'admin@resq.org', '$2a$10$dx/U34VEojyvE75doZY4uuXotdJm1DDmzQJHDWr.UAKA/06RqQCIq', '+91 91234 56789', 'admin', NOW() - INTERVAL 6 DAY),
-- Additional Community Users
(4, 'Ananya Roy', 'ananya.roy@example.com', '$2a$10$PiUGoEryu.kvqw4QsnndIeYAfJ86qZsh/mfxB4KbUTGdBMA9Q5CkK', '+91 98111 22334', 'citizen', NOW() - INTERVAL 4 DAY),
(5, 'Amit Verma', 'amit.verma@example.com', '$2a$10$PiUGoEryu.kvqw4QsnndIeYAfJ86qZsh/mfxB4KbUTGdBMA9Q5CkK', '+91 98222 33445', 'citizen', NOW() - INTERVAL 3 DAY),
(6, 'David Fernandez (Medic)', 'david.medic@resq.org', '$2a$10$IVCuELL1rbo/D.du6wfIvuV//wY6UlVStgkaN.Usf7eQI91J8hBEa', '+91 98333 44556', 'volunteer', NOW() - INTERVAL 4 DAY),
(7, 'Sunita Rao (Search & Rescue)', 'sunita.sar@resq.org', '$2a$10$IVCuELL1rbo/D.du6wfIvuV//wY6UlVStgkaN.Usf7eQI91J8hBEa', '+91 98444 55667', 'volunteer', NOW() - INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 2. SEED VOLUNTEER PROFILES
INSERT INTO `volunteers` (`volunteer_id`, `user_id`, `skills`, `availability_status`, `created_at`) VALUES
(1, 2, 'First Aid, Water Rescue, Emergency Evacuation', 'available', NOW() - INTERVAL 5 DAY),
(2, 6, 'Paramedic, Trauma Care, Ambulance Support', 'available', NOW() - INTERVAL 4 DAY),
(3, 7, 'Disaster Search & Rescue, High-Angle Rope Rigging', 'busy', NOW() - INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE `skills` = VALUES(`skills`);

-- 3. SEED ADMIN PROFILES
INSERT INTO `admins` (`admin_id`, `user_id`, `created_at`) VALUES
(1, 3, NOW() - INTERVAL 6 DAY)
ON DUPLICATE KEY UPDATE `user_id` = VALUES(`user_id`);

-- 4. SEED EMERGENCY REPORTS
INSERT INTO `emergency_reports` (`report_id`, `user_id`, `disaster_type`, `description`, `location`, `latitude`, `longitude`, `image_url`, `ai_classification`, `priority_level`, `summary`, `status`, `created_at`) VALUES
(1, 1, 'Flood', 'Severe water overflow from Mula river into residential sector 4. Ground floor submerged up to 4 feet. Elderly couple and two children stranded on the first floor terrace without drinking water.', 'Sector 4, Riverfront Enclave, Pune', 18.5204303, 73.8567437, NULL, 'Flood', 'Critical', 'River overflow submerged ground floors up to 4ft; elderly couple and 2 children stranded on terrace without potable water.', 'In Progress', NOW() - INTERVAL 2 HOUR),
(2, 4, 'Fire', 'Short circuit triggered rapid fire in a commercial electrical substation near market square. Thick black toxic smoke spreading towards adjacent residential apartments.', 'Near MG Road Market, Camp Area, Pune', 18.5167260, 73.8790210, NULL, 'Fire', 'High', 'Commercial substation fire producing toxic smoke spreading toward residential housing.', 'Verified', NOW() - INTERVAL 4 HOUR),
(3, 5, 'Earthquake', 'Strong tremor caused partial wall collapse of old residential building. Two persons trapped inside ground floor bedroom. Debris blocking the main exit hallway.', 'Old City Quarter, Lane 12, Pune', 18.5180000, 73.8540000, NULL, 'Earthquake', 'Critical', 'Structural wall collapse following tremor; two individuals trapped by debris in ground floor quarters.', 'In Progress', NOW() - INTERVAL 6 HOUR),
(4, 1, 'Landslide', 'Heavy rainfall triggered boulder and mud slide on hillside ghat road. One tempo truck stranded on the edge with driver needing assistance.', 'Khandala Ghat Road, KM 42', 18.7562000, 73.3756000, NULL, 'Landslide', 'Medium', 'Rain-induced boulder and mud slide stranded commercial vehicle on hillside roadway.', 'Resolved', NOW() - INTERVAL 1 DAY),
(5, 4, 'Medical Emergency', 'Senior citizen suffering acute chest pain and breathing distress during flash flood power outage. No road vehicle accessible due to water logging.', 'Koregaon Park North Main Road', 18.5362000, 73.8939000, NULL, 'Medical Emergency', 'High', 'Acute cardiac distress in flooded sector with blocked vehicular transit; boat or high-clearance medical transport needed.', 'Reported', NOW() - INTERVAL 45 MINUTE)
ON DUPLICATE KEY UPDATE `disaster_type` = VALUES(`disaster_type`);

-- 5. SEED AI ANALYSIS RECORDS
INSERT INTO `ai_analysis` (`analysis_id`, `report_id`, `classification`, `confidence`, `priority`, `summary`, `safety_tips`, `source`, `created_at`) VALUES
(1, 1, 'Flood', 'High (96%)', 'Critical', 'River overflow submerged ground floors up to 4ft; elderly couple and 2 children stranded on terrace without potable water.', 'Move immediately to higher elevation. Avoid walking or wading through moving water. Do not touch electrical switches or cords.', 'gemini', NOW() - INTERVAL 2 HOUR),
(2, 2, 'Fire', 'High (94%)', 'High', 'Commercial substation fire producing toxic smoke spreading toward residential housing.', 'Stay low under smoke to avoid toxic gas inhalation. Evacuate immediately upwind from the fire. Do not use elevators.', 'gemini', NOW() - INTERVAL 4 HOUR),
(3, 3, 'Earthquake', 'High (98%)', 'Critical', 'Structural wall collapse following tremor; two individuals trapped by debris in ground floor quarters.', 'Drop, Cover, and Hold On. Avoid damaged walls and hanging fixtures. Do not use matches or open flames due to potential gas leaks.', 'gemini', NOW() - INTERVAL 6 HOUR),
(4, 4, 'Landslide', 'High (92%)', 'Medium', 'Rain-induced boulder and mud slide stranded commercial vehicle on hillside roadway.', 'Stay alert for sudden changes in water flow or falling rocks. Move away from steep slopes and drainage channels.', 'fallback', NOW() - INTERVAL 1 DAY),
(5, 5, 'Medical Emergency', 'High (95%)', 'High', 'Acute cardiac distress in flooded sector with blocked vehicular transit; boat or high-clearance medical transport needed.', 'Keep patient seated upright and calm. Loosen tight clothing around neck and chest. Dispatch amphibious rescue team.', 'gemini', NOW() - INTERVAL 45 MINUTE)
ON DUPLICATE KEY UPDATE `classification` = VALUES(`classification`);

-- 6. SEED RESCUE REQUESTS
INSERT INTO `rescue_requests` (`request_id`, `report_id`, `requested_by`, `assigned_to`, `status`, `priority_level`, `notes`, `created_at`) VALUES
(1, 1, 1, 2, 'In Progress', 'Critical', 'Inflatable raft dispatched with life jackets and potable water packets. 4 victims on terrace.', NOW() - INTERVAL 1 HOUR - INTERVAL 50 MINUTE),
(2, 3, 5, 7, 'In Progress', 'Critical', 'Hydraulic cutter and rescue jacks deployed to breach jammed doorway.', NOW() - INTERVAL 5 HOUR),
(3, 4, 1, 6, 'Completed', 'Medium', 'Driver assisted to safety and local authorities cleared single lane for traffic.', NOW() - INTERVAL 23 HOUR),
(4, 5, 4, NULL, 'Pending', 'High', 'Awaiting nearest volunteer with amphibious transport or inflatable dinghy.', NOW() - INTERVAL 40 MINUTE)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 7. SEED RESCUE UPDATES (Audit Trail & Progress Log)
INSERT INTO `rescue_updates` (`update_id`, `request_id`, `volunteer_id`, `status`, `remarks`, `updated_at`) VALUES
(1, 1, 2, 'Accepted', 'Volunteer Priya Patel accepted rescue request. Dispatched from Sector 2 staging base.', NOW() - INTERVAL 1 HOUR - INTERVAL 30 MINUTE),
(2, 1, 2, 'In Progress', 'Reached perimeter of flooded sector. Deploying inflatable raft toward building terrace.', NOW() - INTERVAL 45 MINUTE),
(3, 2, 7, 'Accepted', 'Search & rescue specialist Sunita Rao accepted structural collapse request.', NOW() - INTERVAL 4 HOUR - INTERVAL 45 MINUTE),
(4, 2, 7, 'In Progress', 'Stabilized exterior wall. Commenced extraction of trapped victims.', NOW() - INTERVAL 2 HOUR),
(5, 3, 6, 'Accepted', 'Medic David dispatched with tow vehicle.', NOW() - INTERVAL 22 HOUR),
(6, 3, 6, 'Completed', 'Driver evaluated with minor bruises; road cordoned off safely.', NOW() - INTERVAL 20 HOUR)
ON DUPLICATE KEY UPDATE `remarks` = VALUES(`remarks`);

-- 8. SEED SHELTERS (Relief Centers)
INSERT INTO `shelters` (`shelter_id`, `name`, `address`, `latitude`, `longitude`, `capacity`, `available_slots`, `contact_number`, `status`, `created_by`, `created_at`) VALUES
(1, 'Central Municipal Relief Center', 'Shivaji Nagar Community Hall, Pune', 18.5314000, 73.8446000, 300, 185, '+91 20 2550 0100', 'Available', 3, NOW() - INTERVAL 5 DAY),
(2, 'St. Mary High School Shelter & Medical Camp', 'Camp Cantonment Road, Pune', 18.5120000, 73.8760000, 200, 42, '+91 20 2634 1122', 'Available', 3, NOW() - INTERVAL 5 DAY),
(3, 'Balewadi Sports Complex Emergency Haven', 'Balewadi High Street, Baner, Pune', 18.5719000, 73.7685000, 600, 520, '+91 20 2738 8899', 'Available', 3, NOW() - INTERVAL 4 DAY),
(4, 'District Red Cross Care Center', 'Rasta Peth, Somwar Peth, Pune', 18.5200000, 73.8680000, 120, 0, '+91 20 2612 4455', 'Full', 3, NOW() - INTERVAL 3 DAY),
(5, 'Hillside Panchayat Relief Center', 'Lonavala Main Market Ground', 18.7547000, 73.4062000, 150, 0, '+91 2114 273001', 'Temporarily Closed', 3, NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 9. SEED ALERTS (Emergency Broadcasts)
INSERT INTO `alerts` (`alert_id`, `admin_id`, `title`, `message`, `alert_type`, `severity`, `location`, `is_active`, `created_at`) VALUES
(1, 3, 'URGENT: Flash Flood Warning for Mula-Mutha Basin', 'River levels have crossed danger mark following 140mm rainfall in catchment areas. Residents in low-lying riverside zones are advised to move to higher ground immediately.', 'Evacuation', 'Critical', 'Riverside Sectors 1-6 & Sangam Bridge', 1, NOW() - INTERVAL 3 HOUR),
(2, 3, 'Heavy Rainfall & Gale Wind Advisory for next 24 Hours', 'Meteorological department predicts sustained rainfall (70-110mm) and wind gusts up to 65 km/h. Avoid parking under old trees and avoid non-essential travel.', 'Weather Warning', 'High', 'Pune Metropolitan District', 1, NOW() - INTERVAL 8 HOUR),
(3, 3, 'Electrical Substation Cordon & Smoke Clearance', 'Fire department is containing electrical transformer fire near MG Road. Avoid the Camp market vicinity to keep emergency vehicle lanes clear.', 'Emergency', 'Medium', 'Camp & MG Road Area', 1, NOW() - INTERVAL 4 HOUR),
(4, 3, 'Potable Drinking Water & Medical Aid Available at Balewadi Haven', 'Displaced families can collect clean bottled water, dry rations, and infant formula at Gate 3 of Balewadi Sports Complex Relief Shelter.', 'Safety Instruction', 'Low', 'Baner / Balewadi', 1, NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
