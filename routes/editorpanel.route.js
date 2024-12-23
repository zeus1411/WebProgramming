import express from 'express';
import userModel from '../models/user.model.js';
import categoryModel from '../models/category.model.js';
import subcategoryModel from '../models/subcategory.model.js';
import postModel from '../models/posts.model.js';
import moment from 'moment';
import utilsModel from '../models/utils.model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    try {
        if (!req.isAuthenticated() || req.user.Permission !== 2) {
            return res.redirect('/');
        }

        // Lấy danh sách các danh mục mà người dùng quản lý
        const categoryManager = await utilsModel.showCategoryManagerByUID(req.user.UserID);

        // Lấy dữ liệu chi tiết của từng danh mục và bài viết bên trong
        const enrichedCategories = await Promise.all(
            categoryManager.map(async (categoryItem) => {
                // Lấy chi tiết danh mục
                const category = await categoryModel.singleByCID(categoryItem.CID);
                const CName = category?.CName || 'Không rõ tên danh mục';

                // Lấy danh sách bài viết theo CID
                const posts = await postModel.singleByCID(categoryItem.CID);

                // Làm giàu thông tin cho từng bài viết
                const enrichedPosts = await Promise.all(
                    posts.map(async (post) => {
                        const Time = moment(post.TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
                        const F_TimePublic = post.TimePublic
                            ? 'Thời gian xuất bản: ' + moment(post.TimePublic, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY')
                            : null;

                        // Lấy thông tin danh mục con (subcategory)
                        let SCName = 'Không có danh mục con';
                        if (post.SCID !== null) {
                            const subcat_post = await subcategoryModel.getSingleForUserByCID(post.SCID);
                            SCName = subcat_post?.[0]?.SCName ? ' / ' + subcat_post[0].SCName : SCName;
                        }

                        // Lấy thông tin người dùng
                        const uid_post = await userModel.singleByUserID(post.UID);
                        const UserName = uid_post?.[0]?.Name || 'Không rõ người dùng';

                        return {
                            ...post,
                            Time,
                            F_TimePublic,
                            SCName,
                            UserName,
                        };
                    })
                );

                // Lấy các bài viết theo trạng thái (đã duyệt, từ chối, chờ xuất bản, đã xuất bản)
                const postchuaduyet = await postModel.singleByCIDStatus(categoryItem.CID, 0);
                const posttuchoi = await postModel.singleByCIDStatus(categoryItem.CID, 1);
                const postchoxuatban = await postModel.singleByCIDStatus(categoryItem.CID, 2);
                const postdaxuatban = await postModel.singleByCIDStatus(categoryItem.CID, 3);

                return {
                    ...categoryItem,
                    CName,
                    post: enrichedPosts,
                    postchuaduyet,
                    posttuchoi,
                    postchoxuatban,
                    postdaxuatban,
                };
            })
        );

        // Render giao diện editor với dữ liệu
        res.render('editor', {
            categoryManager: enrichedCategories,
        });
    } catch (err) {
        console.error('Error in /editor route:', err.message);
        res.status(500).send('Có lỗi xảy ra khi xử lý dữ liệu.');
    }
});

export default router;
