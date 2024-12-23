import db from '../utils/db.js';
import bcrypt from 'bcrypt';

const users = {
  // Lấy tất cả người dùng
  async all() {
    return await db('users');
  },

  // Thêm người dùng mới
  async add(entity) {
    return await db('users').insert(entity);
  },

  // Lấy người dùng theo username
  async singleByUserName(username) {
    return await db('users').where({ username }).first();
  },

  async singleByGoogleId(googleId) {
    return await db('users').where({ GoogleID: googleId }).first();
  },

  // Lấy người dùng theo email
  async singleByEmail(email) {
    return await db('users').where({ Email: email }).first();
  },

  // Lấy người dùng theo số điện thoại
  async singleByPhone(phone) {
    return await db('users').where({ Phone: phone }).first();
  },

  // Lấy người dùng theo UserID
  async singleByUserID(id) {
    return await db('users').where({ UserID: id }).first();
  },

  // Lấy người dùng theo username (không dùng async)
  async single(username) {
    return await db('users').where({ username }).first();
  },

  // Cập nhật reset token cho người dùng
  async updateResetToken(userID, token, expiry) {
    return await db('users').where({ UserID: userID }).update({
      resetToken: token,
      resetTokenExpiry: expiry,
    });
  },

  // Tìm người dùng theo reset token
  async findByResetToken(token) {
    return await db('users').where({ resetToken: token }).first();
  },

  // Cập nhật mật khẩu mới cho người dùng
  async updatePassword(userID, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    return await db('users').where({ UserID: userID }).update({
      Password_hash: hash,
    });
  },

  // Xóa reset token của người dùng
  async clearResetToken(userID) {
    return await db('users').where({ UserID: userID }).update({
      resetToken: null,
      resetTokenExpiry: null,
    });
  },

  // Cập nhật thông tin người dùng
  async patch(entity) {
    const { UserID, ...updatedData } = entity; // Tách UserID ra khỏi đối tượng
    return await db('users').where({ UserID }).update(updatedData);
  },

  // Xóa người dùng (đánh dấu xóa)
  async del(id) {
    return await db('users').where({ UserID: id }).update({ Del: 1 });
  },

  // Khôi phục người dùng
  async restore(id) {
    return await db('users').where({ UserID: id }).update({ Del: 0 });
  },

  // Xóa người dùng vĩnh viễn
  async del2(id) {
    return await db('users').where({ UserID: id }).del();
  }
};

export default users;
