import express from 'express';
import userModel from '../models/user.model.js';
import categoryModel from '../models/category.model.js';
import subcategoryModel from '../models/subcategory.model.js';
import postModel from '../models/posts.model.js';
import moment from 'moment';
import commentModel from '../models/comment.model.js';
import utilsModel from '../models/utils.model.js';
const router = express.Router();

router.get('/', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 2) {
            const categoryManager = await utilsModel.showCategoryManagerByUID(req.user.UserID);
            const processCategory = async (category) => {
                const cat = await categoryModel.singleByCID(category.CID);
                category.CName = cat.CName;

                const posts = await postModel.singleByCID(category.CID);
                category.post = Array.isArray(posts) ? posts : [];

                const processPost = async (post) => {
                    post.Time = moment(post.TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
                    if (post.TimePublic !== null) {
                        post.F_TimePublic = 'Thời gian xuất bản: ' + moment(post.TimePublic, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
                    }
                    const cat_post = await categoryModel.single(post.CID);
                    post.CName = cat_post[0].CName;

                    if (post.SCID !== null) {
                        const subcat_post = await subcategoryModel.getSingleForUserByCID(post.SCID);
                        post.SCName = subcat_post && subcat_post.length > 0 ? ' / ' + subcat_post[0].SCName : '';
                    }
                };

                await Promise.all(category.post.map(processPost));

                const statusPosts = [
                    { key: 'postchuaduyet', status: 0 },
                    { key: 'posttuchoi', status: 1 },
                    { key: 'postchoxuatban', status: 2 },
                    { key: 'postdaxuatban', status: 3 }
                ];

                for (const { key, status } of statusPosts) {
                    category[key] = await postModel.singleByCIDStatus(category.CID, status);
                    if (Array.isArray(category[key])) {
                        await Promise.all(category[key].map(processPost));
                    } else {
                        category[key] = [];
                    }
                }
            };

            await Promise.all(categoryManager.map(processCategory));

            res.render('editor', {
                categoryManager,
            });
    } else {
        res.redirect('/');
    }
});

export default router;