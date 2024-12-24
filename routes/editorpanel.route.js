import express from 'express';
import userModel from '../models/user.model.js';
import categoryModel from '../models/category.model.js';
import subcategoryModel from '../models/subcategory.model.js';
import postModel from '../models/posts.model.js';
import moment from 'moment';
import utilsModel from '../models/utils.model.js';

const router = express.Router();

router.get('/', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 2) {
        try {
            const categoryManager = await utilsModel.showCategoryManagerByUID(req.user.UserID);

            if (!Array.isArray(categoryManager)) {
                return res.status(400).send('Invalid category manager data');
            }

            const processCategory = async (category) => {
                const cat = await categoryModel.allByCID(category.CID);
                if (cat.length > 0) {
                    category.CName = cat[0].CName;
                } else {
                    category.CName = 'Unknown Category';
                }

                const posts = await postModel.singleByCIDEditor(category.CID);
                category.post = Array.isArray(posts) ? posts : [];

                await Promise.all(category.post.map(async (post) => {
                    post.Time = moment(post.TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
                    if (post.TimePublic !== null) {
                        post.F_TimePublic = 'Thời gian xuất bản: ' + moment(post.TimePublic, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
                    }
                    const cat_post = await categoryModel.single(post.CID);
                    post.CName = cat_post?.[0]?.CName || '';

                    if (post.SCID !== null) {
                        const subcat_post = await subcategoryModel.getSingleForUserByCID(post.SCID);
                        post.SCName = subcat_post?.[0]?.SCName ? ' / ' + subcat_post[0].SCName : '';
                    }
                }));

                // Truy xuất các bài viết theo trạng thái
                const statusPosts = [
                    { key: 'postchuaduyet', status: 0 },
                    { key: 'posttuchoi', status: 1 },
                    { key: 'postchoxuatban', status: 2 },
                    { key: 'postdaxuatban', status: 3 }
                ];

                for (const { key, status } of statusPosts) {
                    category[key] = await postModel.singleByCIDStatusEditor(category.CID, status);
                    category[key] = Array.isArray(category[key]) ? category[key] : [];
                }
            };

            // Xử lý tất cả chuyên mục mà biên tập viên quản lý
            await Promise.all(categoryManager.map(processCategory));

            // Render dữ liệu ra giao diện
            res.render('editor', { categoryManager });
        } catch (error) {
            console.error('Error processing category manager:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

export default router;