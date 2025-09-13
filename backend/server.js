import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const app = express();
const PORT = process.env.PORT || 3000;


// Session middleware (จำเป็นสำหรับ Passport)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware สำหรับแปลง body เป็น JSON
app.use(express.json());
// Passport Google OAuth2 Strategy
passport.use(new GoogleStrategy({
  clientID: '1012259711015-ts0jtk15uljdtggi3r4f5ihmn0l9f1vl.apps.googleusercontent.com', // <-- ใส่ client id ของคุณ
  clientSecret: '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', // <-- ใส่ client secret ของคุณ
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // สามารถบันทึก profile ลง database ได้ที่นี่
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route สำหรับเริ่ม Login ด้วย Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route หลังจาก Google Auth
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // สำเร็จ: ส่งข้อมูล user กลับ หรือ redirect ไปหน้าอื่น
    res.json({ success: true, user: req.user });
  }
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// เพิ่ม API สำหรับ Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const usersPath = path.join(__dirname || '.', 'users.json');
  let users = [];
  try {
    const data = fs.readFileSync(usersPath, 'utf-8');
    users = JSON.parse(data);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Cannot read users data' });
  }
  const foundUser = users.find(u => u.username === username && u.password === password);
  if (foundUser) {
    res.json({
      success: true,
      message: 'Login successful',
      role: foundUser.role,
      id: foundUser.id
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});