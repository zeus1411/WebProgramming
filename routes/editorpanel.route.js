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
        for (var i = 0; i < categoryManager.length; i++) {
            const category = await categoryModel.singleByCID(categoryManager[i].CID);
            categoryManager[i].CName = category.CName;
            categoryManager[i].post = await postModel.singleByCID(categoryManager[i].CID);
            for (var j = 0; j < categoryManager[i].post.length; j++) {
                categoryManager[i].post[j].Time = moment(categoryManager[i].post[j].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
                if (categoryManager[i].post[j].TimePublic !== null) {
                    categoryManager[i].post[j].F_TimePublic = 'Thời gian xuất bản: '+moment(categoryManager[i].post[j].TimePublic, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
                }
                const cat_post = await categoryModel.single(categoryManager[i].post[j].CID);
                categoryManager[i].post[j].CName = cat_post[0].CName;
                const subcat_post = await subcategoryModel.getSingleForUserByCID(categoryManager[i].post[j].SCID);
                if (categoryManager[i].post[j].SCID !== null) {
                    categoryManager[i].post[j].SCName = ' / '+subcat_post[0].SCName;
                }
                const uid_post = await userModel.singleByUserID(categoryManager[i].post[j].UID);
            }
            categoryManager[i].postchuaduyet = await postModel.singleByCIDStatus(categoryManager[i].CID, 0);
            categoryManager[i].posttuchoi = await postModel.singleByCIDStatus(categoryManager[i].CID, 1);
            categoryManager[i].postchoxuatban = await postModel.singleByCIDStatus(categoryManager[i].CID, 2);
            categoryManager[i].postdaxuatban = await postModel.singleByCIDStatus(categoryManager[i].CID, 3);

        }
        
        res.render('editor', {
            categoryManager,
        }) 
    } else {
        res.redirect('/');
    }
})

export default router;