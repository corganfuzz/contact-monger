const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");

// @route       POST api/users
// @desc        Register a user
// @access      Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Email needs to be valid").isEmail(),
    check("password", "Password length needs 6 or more characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      user = new User({
        name,
        email,
        password,
      });
      // Encrypt password with bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Object I want to send on the token

      const payload = {
        user: {
          id: user.id,
        },
      };

      res.send("User saved");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }

    // res.send("passed");
    // res.send("Register a user");
    // res.send(req.body); // the actual data
  }
);

module.exports = router;
