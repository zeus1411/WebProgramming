import db from '../utils/db.js';

export default {
  // Lấy tất cả danh mục không bị xóa
  allForUser: async function () {
    return await db('categories').where({ Xoa: 0 });
  },

  // Lấy tất cả danh mục
  all: async function () {
    return await db('categories');
  },

  // Lấy danh mục theo CID
  single: async function (id) {
    return await db('categories').where({ CID: id }).first();
  },
  
  multiplebyCID: async function (id) {
    return await db('categories').where({ CID: id });
  },
  
  // Thêm danh mục mới
  add: async function (entity) {
    return await db('categories').insert(entity);
  },

  // Xóa mềm (đánh dấu Xoa = 1)
  deleteLogic: async function (id) {
    return await db('categories').where({ CID: id }).update({ Xoa: 1 });
  },

  // Khôi phục danh mục (đặt Xoa = 0)
  restoreLogic: async function (id) {
    return await db('categories').where({ CID: id }).update({ Xoa: 0 });
  },

  // Cập nhật danh mục
  patch: async function (entity) {
    const { CID, ...updatedData } = entity; // Tách CID ra khỏi đối tượng
    return await db('categories').where({ CID }).update(updatedData);
  },

  // Lấy danh mục theo CID (trả về 1 đối tượng hoặc null)
  singleByCID: async function (id) {
    const row = await db('categories').where({ CID: id });
    return row || null;
  },

  allbyCID: async function (id) { 
    return await db('categories').where({ CID: id });
  },
  // Lấy tất cả danh mục không bị xóa và không thuộc bảng categorymanager
  all2: async function () {
    return await db('categories')
      .where({ Xoa: 0 })
      .whereNotIn('CID', db('categorymanager').select('CID'));
  },

  // Xóa vĩnh viễn danh mục
  delete: async function (id) {
    return await db('categories').where({ CID: id }).del();
  },

  delL: async function (id) {
    return await db('categories').where({ CID: id }).del();
  },
};