const { getUsers} = require("../controllers/userController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");

const router = require("express").Router();
router.use(authenticate);
router.use(authorizeRole("admin"));
router.get("/all", getUsers);

module.exports = router;
