import express from 'express';
import userModel from '../models/user.model.js';
import categoryModel from '../models/category.model.js';
import subcategoryModel from '../models/subcategory.model.js';
import postModel from '../models/posts.model.js';
import moment from 'moment';
import cpS from 'bcryptjs';
import post from './posts.route.js';
const router = express.Router();

const { compareSync } = cpS;

router.get('/', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 1) {
        try {
            const [category, post_by_UID, post_ChuaDuyet, post_TuChoi, post_ChoXuatBan, post_XuatBan] = await Promise.all([
                categoryModel.allForUser (),
                postModel.allByUserID(req.user.UserID),
                postModel.allByUserIDStatus(req.user.UserID, 0),
                postModel.allByUserIDStatus(req.user.UserID, 1),
                postModel.allByUserIDStatus(req.user.UserID, 2),
                postModel.allByUserIDStatus(req.user.UserID, 3)
            ]);

            // Ensure post_by_UID is an array
            const postsArray = Array.isArray(post_by_UID) ? post_by_UID : (post_by_UID ? [post_by_UID] : []);

            const posts = await Promise.all(postsArray.map(async (post) => {
                const cat_post = await categoryModel.allByCID(post.CID);
                const subcat_post = await subcategoryModel.getSingleBySCID(post.SCID);

                return {
                    ...post,
                    Time: moment(post.TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow(),
                    CName: cat_post && cat_post.length > 0 ? cat_post[0].CName : 'Danh mục không tồn tại',
                    SCName: post.SCID !== null && subcat_post && subcat_post.length > 0 ? ` / ${subcat_post[0].SCName}` : ''
                };
            }));

            res.render('writerpanel', {
                list: category,
                empty: category.length === 0,
                post: posts,
                post_ChuaDuyet,
                post_TuChoi,
                post_ChoXuatBan,
                post_XuatBan
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

router.get('/post', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 1) {
        try {
            const category = await categoryModel.allForUser();
            const categoriesWithSubcategories = await Promise.all(category.map(async (cat) => {
                const subcategory = await subcategoryModel.getSingleForUserByCID(cat.CID);
                return { ...cat, Subcategory: subcategory };
            }));
            res.render('vwPosts/post', {
                category: categoriesWithSubcategories
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

router.post('/post', async function (req, res) {
    try {
        const subcategory = await subcategoryModel.getSingleBySCID(req.body.SCID);
        req.body.CID = subcategory[0]?.CID;
        const now = new Date();
        req.body.TimePost = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        req.body.UID = req.user.UserID;

        await postModel.add(req.body);
        res.redirect('/writerpanel');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
export default router;