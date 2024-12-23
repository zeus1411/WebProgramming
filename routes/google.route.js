import express from 'express';
import passport from 'passport';

const router = express.Router();
// Route để khởi động đăng nhập Google
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Route xử lý callback sau khi Google xác thực
router.get('/auth/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/dangnhap',
    successRedirect: '/' // Redirect về trang chủ sau khi thành công
  })
);

// Middleware kiểm tra đăng nhập
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/dangnhap'); // Redirect về trang đăng nhập nếu chưa đăng nhập
}

// Route kiểm tra và hiển thị thông tin người dùng
router.get('/profile', isLoggedIn, (req, res) => {
  res.send(`Welcome ${req.user.displayName}`); // Hiển thị tên người dùng sau khi đăng nhập
});

export default router;