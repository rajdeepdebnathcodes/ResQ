const { pool } = require('../config/db');

/**
 * Get comprehensive analytics aggregated from database
 * GET /api/analytics
 */
async function getDashboardAnalytics(req, res, next) {
  try {
    // 1. Core Summary Metrics
    const [userCounts] = await pool.query(`
      SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'citizen' THEN 1 ELSE 0 END) AS citizens,
        SUM(CASE WHEN role = 'volunteer' THEN 1 ELSE 0 END) AS volunteers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins
      FROM users
    `);

    const [reportCounts] = await pool.query(`
      SELECT
        COUNT(*) AS total_reports,
        SUM(CASE WHEN status = 'Reported' THEN 1 ELSE 0 END) AS status_reported,
        SUM(CASE WHEN status = 'Verified' THEN 1 ELSE 0 END) AS status_verified,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS status_in_progress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS status_resolved
      FROM emergency_reports
    `);

    const [rescueCounts] = await pool.query(`
      SELECT
        COUNT(*) AS total_rescues,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_rescues,
        SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) AS accepted_rescues,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_rescues,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_rescues,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_rescues
      FROM rescue_requests
    `);

    const [shelterStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_shelters,
        COALESCE(SUM(capacity), 0) AS total_capacity,
        COALESCE(SUM(available_slots), 0) AS total_available,
        COALESCE(SUM(capacity - available_slots), 0) AS total_occupied,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS shelters_available,
        SUM(CASE WHEN status = 'Full' THEN 1 ELSE 0 END) AS shelters_full,
        SUM(CASE WHEN status = 'Temporarily Closed' THEN 1 ELSE 0 END) AS shelters_closed
      FROM shelters
    `);

    const [alertStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_alerts,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_alerts
      FROM alerts
    `);

    // 2. Disaster Types Distribution (for Pie/Doughnut Chart)
    const [disasterDist] = await pool.query(`
      SELECT
        COALESCE(ai_classification, disaster_type) AS disaster_type,
        COUNT(*) AS count
      FROM emergency_reports
      GROUP BY COALESCE(ai_classification, disaster_type)
      ORDER BY count DESC
    `);

    // 3. Priority Level Distribution (for Bar Chart)
    const [priorityDist] = await pool.query(`
      SELECT
        priority_level,
        COUNT(*) AS count
      FROM emergency_reports
      GROUP BY priority_level
      ORDER BY FIELD(priority_level, 'Critical', 'High', 'Medium', 'Low')
    `);

    // 4. Rescue Status Distribution
    const [rescueDist] = await pool.query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM rescue_requests
      GROUP BY status
      ORDER BY FIELD(status, 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled')
    `);

    // 5. Recent 6 Incidents
    const [recentReports] = await pool.query(`
      SELECT r.report_id, r.disaster_type, r.location, r.priority_level, r.status, r.created_at,
             u.name AS reporter_name
      FROM emergency_reports r
      LEFT JOIN users u ON r.user_id = u.user_id
      ORDER BY r.created_at DESC
      LIMIT 6
    `);

    return res.status(200).json({
      success: true,
      analytics: {
        summary: {
          users: userCounts[0] || { total_users: 0, citizens: 0, volunteers: 0, admins: 0 },
          reports: reportCounts[0] || { total_reports: 0, status_reported: 0, status_verified: 0, status_in_progress: 0, status_resolved: 0 },
          rescues: rescueCounts[0] || { total_rescues: 0, pending_rescues: 0, accepted_rescues: 0, in_progress_rescues: 0, completed_rescues: 0, cancelled_rescues: 0 },
          shelters: shelterStats[0] || { total_shelters: 0, total_capacity: 0, total_available: 0, total_occupied: 0 },
          alerts: alertStats[0] || { total_alerts: 0, active_alerts: 0 }
        },
        charts: {
          disasterTypes: disasterDist,
          priorityDistribution: priorityDist,
          rescueStatuses: rescueDist
        },
        recentIncidents: recentReports
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardAnalytics
};
