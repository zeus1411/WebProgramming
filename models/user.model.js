import db from '../utils/db.js';
import bcrypt from 'bcrypt';

const users = {
  // Lấy tất cả người dùng
  all: async function () {
    return await db('users');
  },

  // Thêm người dùng mới
  add: async function (entity) {
    return await db('users').insert(entity);
  },

  // Lấy người dùng theo username
  singleByUserName: async function (username) {
    return await db('users').where({ username }).first();
  },

  singleByGoogleId: async function (googleId) {
    return await db('users').where({ GoogleID: googleId }).first();
  },

  // Lấy người dùng theo email
  singleByEmail: async function (email) {
    return await db('users').where({ Email: email }).first();
  },

  // Lấy người dùng theo số điện thoại
  singleByPhone: async function (phone) {
    return await db('users').where({ Phone: phone }).first();
  },

  // Lấy người dùng theo UserID
  singleByUserID: async function (userId) {
    return await db('users').where({ UserID: userId }).first();
  },

  // Lấy người dùng theo username (không dùng : async function)
  single: async function (username) {
    return await db('users').where({ username }).first();
  },

  // Cập nhật reset token cho người dùng
  updateResetToken: async function (userID, token, expiry) {
    return await db('users').where({ UserID: userID }).update({
      resetToken: token,
      resetTokenExpiry: expiry,
    });
  },

  // Tìm người dùng theo reset token
  findByResetToken: async function (token) {
    return await db('users').where({ resetToken: token }).first();
  },

  // Cập nhật mật khẩu mới cho người dùng
  updatePassword: async function (userID, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    return await db('users').where({ UserID: userID }).update({
      Password_hash: hash,
    });
  },

  // Xóa reset token của người dùng
  clearResetToken: async function (userID) {
    return await db('users').where({ UserID: userID }).update({
      resetToken: null,
      resetTokenExpiry: null,
    });
  },

  // Cập nhật thông tin người dùng
  patch: async function (entity) {
    const { UserID, ...updatedData } = entity; // Tách UserID ra khỏi đối tượng
    return await db('users').where({ UserID }).update(updatedData);
  },

  // Xóa người dùng (đánh dấu xóa)
  del: async function (id) {
    return await db('users').where({ UserID: id }).update({ Del: 1 });
  },

  // Khôi phục người dùng
  restore: async function (id) {
    return await db('users').where({ UserID: id }).update({ Del: 0 });
  },

  // Xóa người dùng vĩnh viễn
  del2: async function (id) {
    return await db('users').where({ UserID: id }).del();
  }
};

export default users;