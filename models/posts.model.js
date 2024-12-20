import db from '../utils/db.js';

export default {
  // Lấy tất cả bài viết
  all: function () {
    return db('posts'); // Truy vấn trực tiếp bảng 'posts'
  },

  // Lấy bài viết theo trạng thái
  allByStatus: function (status) {
    return db('posts').where('Duyet', status);
  },

  // Lấy bài viết sắp public
  allPostSapPublic: function () {
    return db('posts').where('Duyet', 2);
  },

  // Thêm bài viết mới
  add: function (entity) {
    return db('posts').insert(entity);
  },

  // Lấy bài viết theo CID
  singleByCID: function (cid) {
    return db('posts').where('CID', cid).first();
  },

  // Lấy bài viết xuất bản theo CID
  singleByCIDXuatBan: function (cid) {
    return db('posts')
      .where('CID', cid)
      .andWhere('Duyet', 3)
      .orderBy('TimePost', 'desc')
      .first();
  },

  // Lấy bài viết xuất bản theo SCID
  singleBySCIDXuatBan: function (id) {
    return db('posts')
      .where('SCID', id)
      .andWhere('Duyet', 3)
      .orderBy('TimePost', 'desc')
      .first();
  },

  // Lấy bài viết theo CID và trạng thái
  singleByCIDStatus: function (cid, status) {
    return db('posts').where('CID', cid).andWhere('Duyet', status).first();
  },

  // Lấy bài viết theo PostID
  singleByPostID: function (id) {
    return db('posts').where('PostID', id).first();
  },

  // Lấy bài viết theo UID và trạng thái
  singleByUserIDStatus: function (id, status) {
    return db('posts').where('UID', id).andWhere('Duyet', status).first();
  },

  // Lấy bài viết theo SCID
  singleBySCID: function (id) {
    return db('posts').where('SCID', id).first();
  },

  // Lấy bài viết theo UID
  singleByUserID: function (userID) {
    return db('posts')
        .where('UID', userID)
        .orderBy('TimePost', 'desc')
        .select('*');
},

  // Cập nhật bài viết
  patch: function (entity) {
    const { PostID, ...updateData } = entity; // Tách PostID khỏi dữ liệu cập nhật
    return db('posts').where('PostID', PostID).update(updateData);
  },

  // Di chuyển bài viết sang CID và SCID mới
  move: function (id, cid, scid) {
    return db('posts').where('PostID', id).update({ CID: cid, SCID: scid });
  },

  // Đánh dấu bài viết là đã xóa
  del: function (id) {
    return db('posts').where('PostID', id).update({ xoa: 1 });
  },

  // Khôi phục bài viết
  restore: function (id) {
    return db('posts').where('PostID', id).update({ xoa: 0 });
  },

  // Xóa bài viết vĩnh viễn
  del2: function (id) {
    return db('posts').where('PostID', id).del();
  }
};