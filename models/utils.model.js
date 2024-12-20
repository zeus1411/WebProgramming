import db from '../utils/db.js';
/**
 * Category Manager Model
 */
export default {
  /**
   * Get category manager by UserID
   * @param {number} id - UserID
   * @returns {Promise} Category manager data
   */
  showCategoryManagerByUID: async function (id) {
    return await db('categorymanager').where({ UserID: id });
  },

  /**
   * Get CID from category manager by UserID
   * @param {number} id - UserID
   * @returns {Promise} CID data
   */
  showCIDCategoryManagerByUID: async function (id) {
    return await db('categorymanager').where({ UserID: id }).select('CID');
  },

  /**
   * Add new category manager
   * @param {object} entity - Category manager data
   * @returns {Promise} Insert result
   */
  setCategoryManager: async function (entity) {
    return await db('categorymanager').insert(entity);
  },

  /**
   * Delete category manager by UserID
   * @param {number} id - UserID
   * @returns {Promise} Delete result
   */
  delCategoryManagerByUserID: async function (id) {
    return await db('categorymanager').where({ UserID: id }).del();
  },

  /**
   * Delete category manager by CID
   * @param {number} id - CID
   * @returns {Promise} Delete result
   */
  delCategoryManagerByCID: async function (id) {
    return await db('categorymanager').where({ CID: id }).del();
  }
};