import db from '../utils/db.js';

export default {
  // Lấy bài viết theo PostID đã duyệt
  singleByPostID: async function (id) {
    return await db('posts').where({ PostID: id, Duyet: 3 });
  },

  // Lấy 5 bài viết ngẫu nhiên trong cùng chuyên mục
  tincungchuyenmuc: async function (id) {
    return await db('posts')
      .where({ SCID: id, Duyet: 3 })
      .orderByRaw('RAND()')
      .limit(5);
  },

  // Lấy bài viết theo UserID
  singleByUserID: async function (id) {
    return await db('posts').where({ UID: id });
  },

  // Lấy bài viết mới nhất đã duyệt
  new: async function () {
    return await db('posts')
      .where({ Duyet: 3 })
      .orderBy('TimePost', 'DESC');
  },

  // Lấy bài viết mới nhất trong chuyên mục
  new1: async function (id) {
    return await db('posts')
      .where({ Duyet: 3, CID: id })
      .orderBy('TimePost', 'DESC')
      .limit(1);
  },

  // Lấy 10 bài viết mới nhất đã duyệt
  new10: async function () {
    return await db('posts')
      .where({ Duyet: 3 })
      .orderBy('TimePost', 'DESC')
      .limit(10);
  },

  // Lấy 10 bài viết hot nhất (xếp theo lượt xem)
  hot10: async function () {
    return await db('posts')
      .where({ Duyet: 3 })
      .orderBy('view', 'DESC')
      .limit(10);
  },

  // Lấy toàn bộ bài viết hot (xếp theo lượt xem)
  hot: async function () {
    return await db('posts')
      .where({ Duyet: 3 })
      .orderBy('view', 'DESC');
  },

  // Lấy bài viết hot nhất
  best: async function () {
    return await db('posts')
      .where({ Duyet: 3 })
      .orderBy('view', 'DESC')
      .limit(1);
  },

  // Lấy 4 bài viết hot nhất
  hot2: async function () {
    return await db('posts')
      .where({ Duyet: 3 })
      .orderBy('view', 'DESC')
      .limit(4);
  },

  // Tăng lượt xem bài viết
  upview: async function (id) {
    return await db('posts')
      .where({ PostID: id })
      .increment('view', 1);
  },

  // Tìm kiếm bài viết theo từ khóa
  search: async function (value) {
    return await db('posts')
      .where('PostTitle', 'like', `%${value}%`)
      .orWhere('SumContent', 'like', `%${value}%`)
      .orWhere('Content', 'like', `%${value}%`)
      .orderBy('Premium', 'DESC');
  },
};