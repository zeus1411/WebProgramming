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
        const category = await categoryModel.allForUser();
        const post_by_UID = await postModel.singleByUserID(req.user.UserID);
        const post_ChuaDuyet = await postModel.singleByUserIDStatus(req.user.UserID, 0);
        const post_TuChoi = await postModel.singleByUserIDStatus(req.user.UserID, 1);
        const post_ChoXuatBan = await postModel.singleByUserIDStatus(req.user.UserID, 2);
        const post_XuatBan = await postModel.singleByUserIDStatus(req.user.UserID, 3);

        for (var i = 0; i < post_by_UID.length; i++) {
            post_by_UID[i].Time = moment(post_by_UID[i].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();

            const cat_post = await categoryModel.single(post_by_UID[i].CID);
            if (cat_post && cat_post.length > 0) {
                post_by_UID[i].CName = cat_post[0].CName;
            } else {
                post_by_UID[i].CName = 'Danh mục không tồn tại'; // Giá trị mặc định
            }

            const subcat_post = await subcategoryModel.single2(post_by_UID[i].SCID);
            if (post_by_UID[i].SCID !== null && subcat_post && subcat_post.length > 0) {
                post_by_UID[i].SCName = ' / ' + subcat_post[0].SCName;
            }

            const uid_post = await userModel.singleByUserID(post_by_UID[i].UID);
        }

        res.render('writerpanel', {
            list: category,
            empty: category.length === 0,
            post: post_by_UID,
            post_ChuaDuyet,
            post_TuChoi,
            post_ChoXuatBan,
            post_XuatBan
        });
    } else {
        res.redirect('/');
    }
});

router.get('/post', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 1) {
        const category = await categoryModel.allForUser();
        for (var i = 0; i < category.length; i++) {
            const subcategory = await subcategoryModel.getSingleForUserByCID(category[i].CID)
            category[i].Subcategory = subcategory;
        }
        res.render('vwPosts/post', {
            category
        });
    } else {
        res.redirect('/');
    }
});

router.post('/post', async function (req, res) {
    try {
        const subcategory = await subcategoryModel.single2(req.body.SCID);
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