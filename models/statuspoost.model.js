import db from '../utils/db.js';

export default {
    // Thêm trạng thái bài viết mới
    add: function(entity) {
        return db('poststatus').insert(entity);
    }
};