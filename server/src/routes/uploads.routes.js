import express from 'express';
const router = express.Router();

// ── Admin dashboard routes ────────────────────────────────────────────────────
// Why: These are protected routes that only admins can access.
// They allow admins to manage courses, users, and view analytics.

// Example admin route: Get all users (for admin dashboard)
router.get('/', async (req, res) => {
    // Placeholder for fetching all users from the database
    res.json({ message: 'List of all users (admin only)' });
});

export default router;