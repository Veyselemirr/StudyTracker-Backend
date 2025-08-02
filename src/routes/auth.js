// src/routes/auth.js

const express = require('express');
const router = express.Router();

// HEM registerUser HEM DE loginUser'ı içeri aktarıyoruz
const { registerUser, loginUser } = require('../controllers/authController');

// Kullanıcı kayıt uç noktası
router.post('/register', registerUser);

// Kullanıcı giriş uç noktası
router.post('/login', loginUser);

module.exports = router;