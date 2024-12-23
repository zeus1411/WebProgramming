import db from '../utils/db.js';

export default {
  // Lấy tất cả bài viết
  all: async () => {
    try {
      return await db('posts');
    } catch (err) {
      console.error('Error in all:', err);
      throw err;
    }
  },

  // Lấy bài viết theo trạng thái
  allByStatus: async (status) => {
    try {
      return await db('posts').where('Duyet', status);
    } catch (err) {
      console.error('Error in allByStatus:', err);
      throw err;
    }
  },

  // Lấy bài viết sắp public
  allPostSapPublic: async () => {
    try {
      return await db('posts').where('Duyet', 2);
    } catch (err) {
      console.error('Error in allPostSapPublic:', err);
      throw err;
    }
  },

  // Thêm bài viết mới
  add: async (entity) => {
    try {
      return await db('posts').insert(entity);
    } catch (err) {
      console.error('Error in add:', err);
      throw err;
    }
  },

  // Lấy bài viết theo CID
  singleByCID: async (id) => {
    try {
      const result = await db('posts').where({ CID: id });
      return result || []; // Trả về mảng rỗng nếu không tìm thấy
    } catch (err) {
      console.error('Error in singleByCID:', err);
      throw err;
    }
  },

  // Lấy bài viết theo trạng thái và CID
  singleByCIDStatus: async (cid, status) => {
    try {
      return await db('posts').where({ CID: cid, Duyet: status });
    } catch (err) {
      console.error('Error in singleByCIDStatus:', err);
      throw err;
    }
  },

  // Lấy bài viết đã xuất bản theo CID
  singleByCIDXuatBan: async (cid) => {
    try {
      return await db('posts')
        .where({ CID: cid, Duyet: 3 })
        .orderBy('TimePost', 'desc')
        .select(['PostID', 'PostTitle', 'TimePost', 'UID']);
    } catch (err) {
      console.error('Error in singleByCIDXuatBan:', err);
      throw err;
    }
  },

  // Lấy bài viết đã xuất bản theo SCID
  singleBySCIDXuatBan: async (id) => {
    try {
      return await db('posts')
        .where({ SCID: id, Duyet: 3 })
        .orderBy('TimePost', 'desc');
    } catch (err) {
      console.error('Error in singleBySCIDXuatBan:', err);
      throw err;
    }
  },

  // Lấy bài viết theo PostID
  singleByPostID: async (id) => {
    try {
      return await db('posts').where('PostID', id);
    } catch (err) {
      console.error('Error in singleByPostID:', err);
      throw err;
    }
  },

  // Lấy bài viết theo SCID
  singleBySCID: async (id) => {
    try {
      return await db('posts').where('SCID', id);
    } catch (err) {
      console.error('Error in singleBySCID:', err);
      throw err;
    }
  },

  // Lấy bài viết theo UID
  singleByUserID: async (userID) => {
    try {
      return await db('posts').where('UID', userID).orderBy('TimePost', 'desc');
    } catch (err) {
      console.error('Error in singleByUserID:', err);
      throw err;
    }
  },

  // Lấy bài viết theo UID và trạng thái
  singleByUserIDStatus: async (id, status) => {
    try {
      return await db('posts').where('UID', id).andWhere('Duyet', status);
    } catch (err) {
      console.error('Error in singleByUserIDStatus:', err);
      throw err;
    }
  },

  // Cập nhật bài viết
  patch: async (entity) => {
    try {
      const { PostID, ...updateData } = entity;
      return await db('posts').where('PostID', PostID).update(updateData);
    } catch (err) {
      console.error('Error in patch:', err);
      throw err;
    }
  },

  // Di chuyển bài viết sang CID và SCID mới
  move: async (id, cid, scid) => {
    try {
      return await db('posts').where('PostID', id).update({ CID: cid, SCID: scid });
    } catch (err) {
      console.error('Error in move:', err);
      throw err;
    }
  },

  // Đánh dấu bài viết là đã xóa
  del: async (id) => {
    try {
      return await db('posts').where('PostID', id).update({ xoa: 1 });
    } catch (err) {
      console.error('Error in del:', err);
      throw err;
    }
  },

  // Khôi phục bài viết
  restore: async (id) => {
    try {
      return await db('posts').where('PostID', id).update({ xoa: 0 });
    } catch (err) {
      console.error('Error in restore:', err);
      throw err;
    }
  },

  // Xóa bài viết vĩnh viễn
  del2: async (id) => {
    try {
      return await db('posts').where('PostID', id).del();
    } catch (err) {
      console.error('Error in del2:', err);
      throw err;
    }
  }
};
