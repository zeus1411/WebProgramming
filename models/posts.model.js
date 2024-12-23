import db from '../utils/db.js';

export default {
  // Lấy tất cả bài viết
  all: async () => {
    return await db('posts'); // Truy vấn trực tiếp bảng 'posts'
  },

  // Lấy bài viết theo trạng thái
  allByStatus: async (status) => {
    return await db('posts').where('Duyet', status);
  },

  // Lấy bài viết sắp public
  allPostSapPublic: async () => {
    return await db('posts').where('Duyet', 2);
  },

  // Thêm bài viết mới
  add: async (entity) => {
    return await db('posts').insert(entity);
  },

  // Lấy bài viết theo CID
  singleByCID: async (id) => {
    return await db('posts').where({CID: id}).first();
  },

  singleByCIDEditor: async (id) => {
    return await db('posts').where({CID: id});
  },

  getByCategory: async (cid) => {
    return await db('posts').where({ CID: cid }).select();
  },

  // Lấy bài viết xuất bản theo CID
  singleByCIDXuatBan: async (cid) => {
    return await db('posts')
      .where({CID: cid})
      .andWhere({Duyet: 3})
      .orderBy('TimePost', 'desc')
      .select();
  },

  // Lấy bài viết xuất bản theo SCID
  singleBySCIDXuatBan: async (id) => {
    return await db('posts')
      .where('SCID', id)
      .andWhere('Duyet', 3)
      .orderBy('TimePost', 'desc')
      .select();
  },

  // Lấy bài viết theo CID và trạng thái
  singleByCIDStatus: async (cid, status) => {
    return await db('posts').where('CID', cid).andWhere('Duyet', status).first();
  },

  singleByCIDStatusEditor: async (cid, status) => {
    return await db('posts').where('CID', cid).andWhere('Duyet', status);
  },

  // Lấy bài viết theo PostID
  singleByPostID: async (id) => {
    return await db('posts').where('PostID', id).first();
  },

  // Lấy bài viết theo UID và trạng thái
  singleByUserIDStatus: async (id, status) => {
    return await db('posts').where('UID', id).andWhere('Duyet', status).first();
  },

  singleByUserIDStatusEditor: async (id, status) => {
    return await db('posts').where('UID', id).andWhere('Duyet', status);
  },
  // Lấy bài viết theo SCID
  singleBySCID: async (id) => {
    return await db('posts').where('SCID', id).first();
  },

  // Lấy bài viết theo UID
  singleByUserID: async (userID) => {
    return await db('posts').where('UID', userID).orderBy('TimePost', 'desc').first();
},

  // Cập nhật bài viết
  patch: async (entity) => {
    const { PostID, ...updateData } = entity; // Tách PostID khỏi dữ liệu cập nhật
    return await db('posts').where('PostID', PostID).update(updateData);
  },

  // Di chuyển bài viết sang CID và SCID mới
  move: async (id, cid, scid) => {
    return await db('posts').where('PostID', id).update({ CID: cid, SCID: scid });
  },

  // Đánh dấu bài viết là đã xóa
  del: async (id) => {
    return await db('posts').where('PostID', id).update({ xoa: 1 });
  },

  // Khôi phục bài viết
  restore: async (id) => {
    return await db('posts').where('PostID', id).update({ xoa: 0 });
  },

  // Xóa bài viết vĩnh viễn
  del2: async (id) => {
    return await db('posts').where('PostID', id).del();
  }
};