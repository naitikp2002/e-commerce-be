const { registerUser, loginUser } = require("../controllers/userController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");
const checkDuplicateFields = require("../middleware/validateField");

const router = require("express").Router();

router.post("/register", checkDuplicateFields,registerUser);
router.post("/login", loginUser);
router.use(authenticate);

router.get("/admin", authorizeRole("admin"), (req, res) => {
  res.status(200).json({ message: "Welcome Admin!" });
});

// Protected Route Example (Check if User is Regular User)
router.get("/user", authorizeRole("user"), (req, res) => {
  res.status(200).json({ message: "Welcome User!" });
});

module.exports = router;
