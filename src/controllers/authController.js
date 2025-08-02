// src/controllers/authController.js

// Gerekli kütüphaneleri dahil ediyoruz
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); 

/**
 * Yeni bir kullanıcı kaydı yapar.
 * İşlem:
 * 1. İstekten gelen e-posta, kullanıcı adı ve şifreyi alır.
 * 2. Şifreyi güvenli bir şekilde hash'ler (şifreler).
 * 3. Yeni kullanıcıyı veritabanına ekler.
 * 4. Başarılı yanıtı döndürür.
 */
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Gelen verilerin boş olup olmadığını kontrol edelim
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
  }

  try {
    // Şifreyi güvenli bir şekilde hash'liyoruz
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Yeni kullanıcıyı veritabanına ekliyoruz
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, passwordHash]
    );

    // 201 Created (Oluşturuldu) durum koduyla başarılı yanıtı gönderiyoruz
    res.status(201).json({
      message: "Kullanıcı başarıyla kaydedildi.",
      user: newUser.rows[0]
    });

  } catch (err) {
    // Aynı e-posta veya kullanıcı adı kullanıldığında PostgreSQL hata kodu '23505' döner
    if (err.code === '23505') {
      return res.status(409).json({ message: "Bu e-posta veya kullanıcı adı zaten kullanımda." });
    }
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
};

/**
 * Mevcut bir kullanıcının sisteme giriş yapmasını sağlar.
 * İşlem:
 * 1. İstekten gelen e-posta ve şifreyi alır.
 * 2. E-posta adresini kullanarak kullanıcıyı veritabanında arar.
 * 3. Girilen şifreyi, veritabanındaki hash'lenmiş şifre ile karşılaştırır.
 * 4. Şifreler eşleşirse, kullanıcıya JWT (JSON Web Token) oluşturur.
 * 5. Oluşturulan token'ı başarılı yanıt olarak gönderir.
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Gelen verilerin boş olup olmadığını kontrol edelim
  if (!email || !password) {
    return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
  }

  try {
    // E-posta adresine göre kullanıcıyı buluyoruz
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // Eğer kullanıcı bulunamazsa, 401 Unauthorized (Yetkisiz) hatası döndürürüz
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }

    // Girilen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştırıyoruz
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    
    // Şifreler eşleşmezse, 401 Unauthorized hatası döndürürüz
    if (!validPassword) {
      return res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }

    // Giriş başarılıysa, kullanıcı için bir JWT oluşturuyoruz
    const token = jwt.sign(
      { userId: user.rows[0].id }, // JWT içinde saklanacak veri (payload)
      process.env.JWT_SECRET, // `.env` dosyasındaki gizli anahtarımız
      { expiresIn: '1h' } // Token'ın geçerlilik süresi (1 saat)
    );

    // Başarılı yanıtı, token ve kullanıcı bilgileriyle birlikte gönderiyoruz
    res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
};
