import db from '../utils/db.js';

export default {
  // Lấy tất cả danh mục không bị xóa
  allforuser: function () {
    return db('categories').where({ Xoa: 0 });
  },

  // Lấy tất cả danh mục
  all: function () {
    return db('categories');
  },

  // Lấy danh mục theo CID
  single: function (id) {
    return db('categories').where({ CID: id }).first();
  },

  // Thêm danh mục mới
  add: function (entity) {
    return db('categories').insert(entity);
  },

  // Xóa mềm (đánh dấu Xoa = 1)
  delL: function (id) {
    return db('categories').where({ CID: id }).update({ Xoa: 1 });
  },

  // Khôi phục danh mục (đặt Xoa = 0)
  restoreL: function (id) {
    return db('categories').where({ CID: id }).update({ Xoa: 0 });
  },

  // Cập nhật danh mục
  patch: function (entity) {
    const { CID, ...updatedData } = entity; // Tách CID ra khỏi đối tượng
    return db('categories').where({ CID }).update(updatedData);
  },

  // Lấy danh mục theo CID (trả về 1 đối tượng hoặc null)
  singleByCID: async function (id) {
    const row = await db('categories').where({ CID: id }).first();
    return row || null;
  },

  // Lấy tất cả danh mục không bị xóa và không thuộc bảng categorymanager
  all2: function () {
    return db('categories')
      .where({ Xoa: 0 })
      .whereNotIn('CID', db('categorymanager').select('CID'));
  },

  // Xóa vĩnh viễn danh mục
  del: function (id) {
    return db('categories').where({ CID: id }).del();
  },
};