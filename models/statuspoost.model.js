import db from '../utils/db';

export default {
    // Thêm trạng thái bài viết mới
    add: function(entity) {
        return db('poststatus').insert(entity);
    }
};