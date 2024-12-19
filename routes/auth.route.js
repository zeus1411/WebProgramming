import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import userModel from '../models/user.model.js';

const router = express.Router();

// Tạo transporter cho nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
  auth: {
    user: 'zeusgaming1411@gmail.com',
    pass: 'avuobudnekoiznjf'  // Sử dụng App Password từ Google
  }
});

// Route hiển thị form quên mật khẩu
router.get('/forgot-password', (req, res) => {
  res.render('_vwAccount/forgot-password');
});

// Xử lý yêu cầu quên mật khẩu
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.singleByEmail(email);

    if (!user) {
      return res.render('_vwAccount/forgot-password', {
        error: 'Email không tồn tại trong hệ thống'
      });
    }

    // Tạo token reset password
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token hết hạn sau 1 giờ

    // Lưu token vào database
    await userModel.updateResetToken(user.UserID, resetToken, resetTokenExpiry);

    // Gửi email
    const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Reset Password',
      html: `
        <p>Bạn đã yêu cầu reset mật khẩu.</p>
        <p>Click vào link sau để reset mật khẩu:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.render('_vwAccount/forgot-password-success');

  } catch (error) {
    console.error(error);
    res.render('_vwAccount/forgot-password', {
      error: 'Có lỗi xảy ra, vui lòng thử lại sau'
    });
  }
});

// Route hiển thị form reset password
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await userModel.findByResetToken(token);

    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.render('_vwAccount/reset-password', {
        error: 'Link reset mật khẩu không hợp lệ hoặc đã hết hạn'
      });
    }

    res.render('_vwAccount/reset-password', { token });
  } catch (error) {
    res.render('_vwAccount/reset-password', {
      error: 'Có lỗi xảy ra, vui lòng thử lại sau'
    });
  }
});

// Xử lý reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('_vwAccount/reset-password', {
        error: 'Mật khẩu không khớp',
        token
      });
    }

    const user = await userModel.findByResetToken(token);
    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.render('_vwAccount/reset-password', {
        error: 'Link reset mật khẩu không hợp lệ hoặc đã hết hạn',
        token
      });
    }

    // Update mật khẩu mới và xóa token
    await userModel.updatePassword(user.UserID, password);
    await userModel.clearResetToken(user.UserID);

    res.redirect('/dangnhap');
  } catch (error) {
    res.render('_vwAccount/reset-password', {
      error: 'Có lỗi xảy ra, vui lòng thử lại sau',
      token: req.params.token
    });
  }
});

export default router;