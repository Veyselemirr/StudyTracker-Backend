// server.js

// Gerekli kütüphaneleri dahil et
const express = require('express');
const dotenv = require('dotenv');

// .env dosyasındaki ortam değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantı dosyasını içeri al
require('./src/db');

// Express uygulamasını oluştur
const app = express();
// PORT'u .env dosyasından al, yoksa 3001 kullan
const PORT = process.env.PORT || 3001;

// Auth router'ı içeri al
const authRouter = require('./src/routes/auth');

// Middleware'ler
// Gelen JSON verilerini okumak için
app.use(express.json());

// API yollarını yönlendir
// /api/auth ile başlayan tüm istekleri authRouter'a yönlendir
app.use('/api/auth', authRouter);

// Kök dizin için basit bir API uç noktası
app.get('/', (req, res) => {
    res.send('API is running on backend server!');
});

// Sunucuyu belirtilen portta dinlemeye başla
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
