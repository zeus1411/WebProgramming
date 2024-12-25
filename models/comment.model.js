import db from '../utils/db.js';

export default {
  // Thêm bình luận
  add: async function (entity) {
    try {
      const result = await db('comment').insert(entity);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Thêm lượt thích bình luận
  addLike: async function (entity) {
    try {
      const result = await db('commentlike').insert(entity);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Lấy bình luận theo PostID
  singleByPostID: async function (id) {
    try {
      const result = await db('comment').where('PostID', id);
      return result;
    } catch (error) {
      throw error;
    }
  },

  singleByPID: async function (id) {
    try {
      const result = await db('comment').where('PostID', id);
      return result;
    } catch (error) {
      throw error;
    }
  },


  // Đếm số bình luận theo PostID
  countByPostID: async function (id) {
    try {
      const result = await db('comment')
        .where('PostID', id)
        .count('* as Count')
        .first(); // Trả về một hàng duy nhất
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Lấy bình luận theo ComID
  singleByComID: async function (id) {
    try {
      const result = await db('comment').where('ComID', id).first();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Lấy lượt thích bình luận theo ComID
  singleLikeByComID: async function (id) {
    try {
      const result = await db('commentlike').where('ComID', id).first();
      return result;
    } catch (error) {
      throw error;
    }
  }
};