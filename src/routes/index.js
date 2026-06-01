const { Router } = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const postsRoutes = require('./posts.routes');
const storesRoutes = require('./stores.routes');
const categoriesRoutes = require('./categories.routes');
const usersRoutes = require('./users.routes');
const uploadsRoutes = require('./uploads.routes');
const locationsRoutes = require('./locations.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/stores', storesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/users', usersRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/locations', locationsRoutes);

module.exports = router;