import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  // Placeholder for admin stats endpoint
  res.json({ message: 'Admin stats endpoint' });
});

export default router;
