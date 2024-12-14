import db from '../utils/db.js';

export default {
    // Thêm bình luận
    add: function (entity) {
      return db('comment').insert(entity);
    },
  
    // Thêm lượt thích bình luận
    addLike: function (entity) {
      return db('commentlike').insert(entity);
    },
  
    // Lấy bình luận theo PostID
    singleByPostID: function (id) {
      return db('comment').where('PostID', id);
    },
  
    // Đếm số bình luận theo PostID
    countByPostID: function (id) {
      return db('comment')
        .where('PostID', id)
        .count('* as Count')
        .first(); // Trả về một hàng duy nhất
    },
  
    // Lấy bình luận theo ComID
    singleByComID: function (id) {
      return db('comment').where('ComID', id).first();
    },
  
    // Lấy lượt thích bình luận theo ComID
    singleLikeByComID: function (id) {
      return db('commentlike').where('ComID', id).first();
    }
  };