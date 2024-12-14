import db from '../utils/db';




export default {
    // Lấy thông tin quản lý danh mục theo UserID
    showCategoryManagerByUID: function (id) {
        return db('categorymanager').where({ UserID: id });
    },

    // Lấy CID từ quản lý danh mục theo UserID
    showCIDCategoryManagerByUID: function (id) {
        return db('categorymanager').where({ UserID: id }).select('CID');
    },

    // Thêm quản lý danh mục mới
    setCategoryManager: function (entity) {
        return db('categorymanager').insert(entity);
    },

    // Xóa quản lý danh mục theo UserID
    delCategoryManagerByUserID: function (id) {
        return db('categorymanager').where({ UserID: id }).del();
    },

    // Xóa quản lý danh mục theo CID
    delCategoryManagerByCID: function (id) {
        return db('categorymanager').where({ CID: id }).del();
    }
};