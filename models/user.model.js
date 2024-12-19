import db from '../utils/db.js';
import bcrypt from 'bcrypt';

export default {
    // Lấy tất cả người dùng
    all: function () {
      return db('users');
    },
  
    // Thêm người dùng mới
    add: function(entity) {
      return db('users').insert(entity);
    },
  
    // Lấy người dùng theo username
    singleByUserName: function (username) {
      return db('users').where({ username }).first();
    },

    singleByGoogleId: function (googleId) {
      return db('users').where({ GoogleID: googleId }).first();
    },
  
    // Lấy người dùng theo email
    singleByEmail: function (email) {
      return db('users').where({ Email: email }).first();
    },
  
    // Lấy người dùng theo số điện thoại
    singleByPhone: function (phone) {
      return db('users').where({ Phone: phone }).first();
    },
  
    // Lấy người dùng theo UserID
    singleByUserID: function (id) {
      return db('users').where({ UserID: id }).first();
    },
  
    // Lấy người dùng theo username (không dùng async)
    single: function (username) {
      return db('users').where({ username }).first();
    },

    // Cập nhật reset token cho người dùng
  updateResetToken: function (userID, token, expiry) {
    return db('users').where({ UserID: userID }).update({
      resetToken: token,
      resetTokenExpiry: expiry,
    });
  },

  // Tìm người dùng theo reset token
  findByResetToken: function (token) {
    return db('users').where({ resetToken: token }).first();
  },

  // Cập nhật mật khẩu mới cho người dùng
  updatePassword: async function (userID, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    return db('users').where({ UserID: userID }).update({
      Password_hash: hash,
    });
  },

  // Xóa reset token của người dùng
  clearResetToken: function (userID) {
    return db('users').where({ UserID: userID }).update({
      resetToken: null,
      resetTokenExpiry: null,
    });
  },
  
    // Cập nhật thông tin người dùng
    patch: function (entity) {
      const { UserID, ...updatedData } = entity; // Tách UserID ra khỏi đối tượng
      return db('users').where({ UserID }).update(updatedData);
    },
  
    // Xóa người dùng (đánh dấu xóa)
    del: function (id) {
      return db('users').where({ UserID: id }).update({ Del: 1 });
    },
  
    // Khôi phục người dùng
    restore: function (id) {
      return db('users').where({ UserID: id }).update({ Del: 0 });
    },
  
    // Xóa người dùng vĩnh viễn
    del2: function (id) {
      return db('users').where({ UserID: id }).del();
    }
};