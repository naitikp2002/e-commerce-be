// Generic error-handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err); // Log the error for debugging purposes
  
    // Sequelize-specific error handling
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: err.errors.map((error) => ({
          field: error.path,
          message: error.message,
        })),
      });
    }
  
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Unique Constraint Error',
        errors: err.errors.map((error) => ({
          field: error.path,
          message: error.message,
        })),
      });
    }
  
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        message: 'Database Error',
        error: err.message,
      });
    }
  
    // General error handling
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  };
  
  module.exports = errorHandler;
  