# 🚀 كيفية تشغيل الموقع على الشبكة

## 📡 الوصول من أجهزة أخرى

### 1️⃣ شغّل السيرفر:
```bash
npm run dev
# أو للإنتاج:
npm run build
npm start
```

### 2️⃣ اعرف عنوان IP الخاص بجهازك:

**Windows:**
```bash
ipconfig
```
ابحث عن `IPv4 Address` - مثال: `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
# أو
ip addr show
```

### 3️⃣ افتح الموقع من أي جهاز على نفس الشبكة:

```
http://192.168.1.100:3000
```
(استبدل 192.168.1.100 بعنوان IP الخاص بك)

---

## 📱 الوصول من الموبايل

1. تأكد أن الموبايل والكمبيوتر على **نفس الواي فاي**
2. افتح المتصفح في الموبايل
3. اكتب: `http://192.168.1.100:3000`
4. يمكنك تثبيته كتطبيق (PWA)

---

## 🔥 السماح في Firewall

إذا لم يعمل، اسمح للبورت في Firewall:

**Windows:**
```powershell
New-NetFirewallRule -DisplayName "High Safety App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

**أو من Control Panel:**
1. Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. Port → TCP → 3000 → Allow

---

## 🌍 الوصول من الإنترنت (خارج الشبكة المحلية)

### الطريقة 1: ngrok (الأسهل)
```bash
# حمّل ngrok من ngrok.com
ngrok http 3000
```
يعطيك رابط مثل: `https://abc123.ngrok.io`

### الطريقة 2: Cloudflare Tunnel
```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:3000
```

### الطريقة 3: استضافة حقيقية
- Render.com
- Railway.app
- Vercel
- DigitalOcean

---

## ⚙️ إعدادات متقدمة

### تغيير البورت:
في ملف `.env`:
```
PORT=8080
```

### استمع على localhost فقط (إيقاف الوصول الخارجي):
في ملف `.env`:
```
HOST=localhost
```

---

## ✅ التأكد من التشغيل

بعد `npm run dev`، يجب أن ترى:
```
✓ serving on port 3000
🌐 Local: http://localhost:3000
🌍 Network: http://<your-ip>:3000
📱 To access from phone: Use your computer's IP address
```

جرب الروابط التالية:
- ✅ `http://localhost:3000` - من نفس الجهاز
- ✅ `http://192.168.1.100:3000` - من أي جهاز على الشبكة
