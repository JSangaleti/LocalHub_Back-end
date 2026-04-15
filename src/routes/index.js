const { Router } = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const postsRoutes = require('./posts.routes');
const storesRoutes = require('./stores.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/stores', storesRoutes);

module.exports = router;