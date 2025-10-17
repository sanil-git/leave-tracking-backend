// Role-based access control middleware

/**
 * Middleware to check if user has one of the required roles
 * @param {Array} roles - Array of allowed roles (e.g., ['manager', 'admin'])
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: `This action requires one of these roles: ${roles.join(', ')}`,
        yourRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is a manager
 */
const requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Manager access required',
      yourRole: req.user.role
    });
  }

  next();
};

/**
 * Middleware to check if user is an admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      yourRole: req.user.role
    });
  }

  next();
};

module.exports = {
  requireRole,
  requireManager,
  requireAdmin
};

