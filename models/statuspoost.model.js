import db from '../utils/db.js';

export default {
    /**
     * Thêm trạng thái bài viết mới
     * @param {Object} entity - Trạng thái bài viết mới
     * @returns {Promise} Kết quả thêm trạng thái bài viết
     */
    add: async function(entity) {
        try {
            const result = await db('poststatus').insert(entity);
            return result;
        } catch (error) {
            throw new Error(`Lỗi thêm trạng thái bài viết: ${error.message}`);
        }
    }
};