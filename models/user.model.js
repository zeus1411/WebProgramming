import db from '../utils/db';

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