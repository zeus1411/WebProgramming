import db from '../utils/db.js';

export default {
  // Lấy tất cả các danh mục con
  all: function () {
    return db('subcategories'); // Truy vấn trực tiếp bảng 'subcategories'
  },

  // Lấy danh mục con theo CID
  single: function (id) {
    return db('subcategories').where('CID', id);
  },

  // Lấy danh mục con chưa bị xóa theo CID
  singleforuser: function (id) {
    return db('subcategories').where('CID', id).andWhere('Del', 0);
  },

  // Lấy danh mục con theo SCID
  single2: function (id) {
    return db('subcategories').where('SCID', id).first();
  },

  // Thêm danh mục con mới
  add: function (entity) {
    return db('subcategories').insert(entity);
  },

  // Cập nhật danh mục con
  patch: function (entity) {
    const { SCID, ...updateData } = entity; // Tách SCID khỏi dữ liệu cập nhật
    return db('subcategories').where('SCID', SCID).update(updateData);
  },

  // Đánh dấu danh mục con là đã xóa
  del: function (id) {
    return db('subcategories').where('SCID', id).update({ Del: 1 });
  },

  // Khôi phục danh mục con đã xóa
  restore: function (id) {
    return db('subcategories').where('SCID', id).update({ Del: 0 });
  },

  // Xóa danh mục con vĩnh viễn
  del2: function (id) {
    return db('subcategories').where('SCID', id).del();
  }
};

