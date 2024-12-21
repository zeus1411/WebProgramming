import db from '../utils/db.js';

export default {
  // Lấy tất cả bài viết
  all: async function () {
    return await db('posts'); // Truy vấn trực tiếp bảng 'posts'
  },

  // Lấy bài viết theo trạng thái
  allByStatus: async function (status) {
    return await db('posts').where('Duyet', status);
  },

  // Lấy bài viết sắp public
  allPostSapPublic: async function () {
    return await db('posts').where('Duyet', 2);
  },

  // Thêm bài viết mới
  add: async function (entity) {
    return await db('posts').insert(entity);
  },

  // Lấy bài viết theo CID
  singleByCID: async function (id) {
    return await db('posts').where({CID: id});
  },
  

  // Lấy bài viết xuất bản theo CID
  singleByCIDXuatBan: async function (cid) {
    return await db('posts')
      .where({CID: cid})
      .andWhere({Duyet: 3})
      .orderBy('TimePost', 'desc')
      .select();
  },

  // Lấy bài viết xuất bản theo SCID
  singleBySCIDXuatBan: async function (id) {
    return await db('posts')
      .where('SCID', id)
      .andWhere('Duyet', 3)
      .orderBy('TimePost', 'desc')
      .select();
  },

  // Lấy bài viết theo CID và trạng thái
  singleByCIDStatus: async function (cid, status) {
    return await db('posts').where({CID: cid}).andWhere({Duyet: status});
  },

  // Lấy bài viết theo PostID
  singleByPostID: async function (id) {
    return await db('posts').where('PostID', id);
  },

  // Lấy bài viết theo UID và trạng thái
  singleByUserIDStatus: async function (id, status) {
    return await db('posts').where('UID', id).andWhere('Duyet', status);
  },

  // Lấy bài viết theo SCID
  singleBySCID: async function (id) {
    return await db('posts').where('SCID', id).first();
  },

  // Lấy bài viết theo UID
  singleByUserID: async function (id) {
    return await db('posts').where('UID', id);
  },

  // Cập nhật bài viết
  patch: async function (entity) {
    const { PostID, ...updateData } = entity; // Tách PostID khỏi dữ liệu cập nhật
    return await db('posts').where('PostID', PostID).update(updateData);
  },

  // Di chuyển bài viết sang CID và SCID mới
  move: async function (id, cid, scid) {
    return await db('posts').where('PostID', id).update({ CID: cid, SCID: scid });
  },

  // Đánh dấu bài viết là đã xóa
  del: async function (id) {
    return await db('posts').where('PostID', id).update({ xoa: 1 });
  },

  // Khôi phục bài viết
  restore: async function (id) {
    return await db('posts').where('PostID', id).update({ xoa: 0 });
  },

  // Xóa bài viết vĩnh viễn
  del2: async function (id) {
    return await db('posts').where('PostID', id).del();
  }
};