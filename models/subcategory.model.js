import db from '../utils/db.js';

export default {
  // Lấy tất cả các danh mục con
  getAll: async function () {
    try {
      const subcategories = await db('subcategories');
      return subcategories;
    } catch (error) {
      throw new Error('Lỗi khi lấy tất cả danh mục con');
    }
  },
  single: async function (id) {
    const result = await db('subcategories').where({ CID: id });
    return result.length > 0 ? result : []; // Trả về mảng trống nếu không có kết quả
  },
  
  // Lấy danh mục con theo CID
  getSingleByCID: async function (id) {
    try {
      const subcategory = await db('subcategories').where('CID', id);
      return subcategory;
    } catch (error) {
      throw new Error('Lỗi khi lấy danh mục con theo CID');
    }
  },

  // Lấy danh mục con chưa bị xóa theo CID
  getSingleForUserByCID: async function (id) {
    try {
      const subcategory = await db('subcategories').where('CID', id).andWhere('Del', 0);
      return subcategory;
    } catch (error) {
      throw new Error('Lỗi khi lấy danh mục con chưa bị xóa theo CID');
    }
  },

  // Lấy danh mục con theo SCID
  getSingleBySCID: async function (id) {
    try {
      const subcategory = await db('subcategories').where('SCID', id).first();
      return subcategory;
    } catch (error) {
      throw new Error('Lỗi khi lấy danh mục con theo SCID');
    }
  },

  // Thêm danh mục con mới
  add: async function (entity) {
    try {
      const result = await db('subcategories').insert(entity);
      return result;
    } catch (error) {
      throw new Error('Lỗi khi thêm danh mục con mới');
    }
  },

  // Cập nhật danh mục con
  patch: async function (entity) {
    try {
      const { SCID, ...updateData } = entity;
      const result = await db('subcategories').where('SCID', SCID).update(updateData);
      return result;
    } catch (error) {
      throw new Error('Lỗi khi cập nhật danh mục con');
    }
  },

  // Đánh dấu danh mục con là đã xóa
  softDelete: async function (id) {
    try {
      const result = await db('subcategories').where('SCID', id).update({ Del: 1 });
      return result;
    } catch (error) {
      throw new Error('Lỗi khi đánh dấu danh mục con là đã xóa');
    }
  },

  // Khôi phục danh mục con đã xóa
  restore: async function (id) {
    try {
      const result = await db('subcategories').where('SCID', id).update({ Del: 0 });
      return result;
    } catch (error) {
      throw new Error('Lỗi khi khôi phục danh mục con đã xóa');
    }
  },

  // Xóa danh mục con vĩnh viễn
  hardDelete: async function (id) {
    try {
      const result = await db('subcategories').where('SCID', id).del();
      return result;
    } catch (error) {
      throw new Error('Lỗi khi xóa danh mục con vĩnh viễn');
    }
  }
};