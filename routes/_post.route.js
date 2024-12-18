import express from 'express';
import postModel from '../models/posts.model.js';
import categoryModel from '../models/category.model.js';
import subcategoryModel from '../models/subcategory.model.js';
import _postModel from '../models/_posts.model.js';
import moment from 'moment';
import userModel from '../models/user.model.js';
import multer from 'multer';
import commentModel from '../models/comment.model.js';
import expressHandlebarsSections from 'express-handlebars-sections';

const router = express.Router();

moment.locale('vi');

router.get('/new', async function (req, res) {
    const post = await _postModel.new();
    for (var i = 0; i < post.length; i++) {
        post[i].Time = moment(post[i].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
        const cat_post = await categoryModel.singleByCID(post[i].CID);
        post[i].CName = cat_post.CName;

        const subcat_post = await subcategoryModel.single2(post[i].SCID);

        // Kiểm tra subcat_post tồn tại và có ít nhất một phần tử
        if (post[i].SCID !== null && subcat_post && subcat_post.length > 0) {
            post[i].SCName = subcat_post[0].SCName;
        } else {
            post[i].SCName = null;  // Gán giá trị mặc định nếu không tìm thấy SCName
        }

        if (post[i].Premium === 1) { 
            post[i].Pre = true;
        }
    }
    
    res.render('_vwPosts/new_news', {
        post
    });
});

router.get('/hot', async function (req, res) {
    const post = await _postModel.hot();
    for (var i = 0; i < post.length; i++) {
        post[i].Time = moment(post[i].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
        const cat_post = await categoryModel.singleByCID(post[i].CID);
        post[i].CName = cat_post.CName;

        const subcat_post = await subcategoryModel.single2(post[i].SCID);

        if (post[i].Premium === 1) { 
            post[i].Pre = true;
        }

        // Kiểm tra nếu subcat_post tồn tại và có ít nhất 1 phần tử
        if (post[i].SCID !== null && subcat_post && subcat_post.length > 0) { 
            post[i].SCName = subcat_post[0].SCName;
        } else {
            post[i].SCName = null; // Gán giá trị mặc định hoặc xử lý tùy ý khi không có SCName
        }
    }

    res.render('_vwPosts/hotnews', {
        post
    });
});

router.get('/:id', async function (req, res) {
    const id = +req.params.id || -1;
    
    // Thay đổi cách xử lý kết quả từ singleByPostID
    const post = await postModel.singleByPostID(id);

    // Kiểm tra nếu không tìm thấy bài viết
    if (!post) {
        return res.status(404).render('_vwPosts/error', { 
            message: 'Bài viết không tồn tại' 
        });
    }

    // Kiểm tra điều kiện Premium
    if (post.Premium === 1 && (!req.isAuthenticated() || (req.user && req.user.Premium !== 1))) {
        return res.render('_vwPosts/news', { 
            premium: true 
        });
    } 

    const ufullname = await userModel.singleByUserID(post.UID);
    if (ufullname) { 
        post.U_FullName = ufullname.Fullname; 
    }
    
    post.Time = moment(post.TimePost, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
    
    const comment = await commentModel.singleByPostID(id);
    for (const cmt of comment) {
        const u = await userModel.singleByUserID(cmt.UID);
        if (u) {
            cmt.username = u.UserName;
            cmt.Time = moment(cmt.Date, 'YYYY-MM-DD hh:mm:ss').fromNow();
        }
    }
    
    const tincungchuyenmuc = await _postModel.tincungchuyenmuc(post.SCID);
    await _postModel.upview(id);
    
    res.render('_vwPosts/news', {
        post,
        comment,
        tincungchuyenmuc,
        empty: tincungchuyenmuc.length === 0
    });
});

router.post('/:id', async function (req, res) {
    const id = +req.params.id || -1;
    req.body.UID = req.user.UserID;
    req.body.PostID = id;
    var today = new Date();
    var time = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
    req.body.Date = time;
    await commentModel.add(req.body);
    res.redirect('/post/'+id);
});


export default router;