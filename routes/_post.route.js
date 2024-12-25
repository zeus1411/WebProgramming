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
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { htmlToText } from 'html-to-text';
import puppeteer from 'puppeteer';
const router = express.Router();

moment.locale('vi');
const tahomaFontPath = path.join('public', 'fonts', 'tahoma.ttf');
router.get('/new', async function (req, res) {
    const post = await _postModel.new();
    for (var i = 0; i < post.length; i++) {
        post[i].Time = moment(post[i].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
        const cat_post = await categoryModel.singleByCID(post[i].CID);
        post[i].CName = cat_post.CName;

        const subcat_post = await subcategoryModel.getSingleForUserByCID(post[i].SCID);

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

        const subcat_post = await subcategoryModel.getSingleForUserByCID(post[i].SCID);

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
router.get('/:id/pdf', async function (req, res) {
    const id = +req.params.id || -1;

    const post = await postModel.singleByPostID(id);

    if (!post) {
        return res.status(404).send('Bài viết không tồn tại');
    }

    // Kiểm tra quyền truy cập Premium
    if (post.Premium === 1 && (!req.isAuthenticated() || (req.user && req.user.Premium !== 1))) {
        return res.status(403).send('Bạn cần tài khoản Premium để tải bài viết này');
    }

    // Chuyển đổi nội dung HTML thành plain text
    const plainTextContent = htmlToText(post.Content || 'Không có nội dung', {
        wordwrap: 130,
        // Các tùy chọn để xử lý văn bản tốt hơn
        selectors: [
            { selector: 'img', format: 'skip' },  // Bỏ qua hình ảnh
            { selector: 'a', options: { ignoreHref: true } },  // Bỏ qua links
            { selector: 'p', format: 'block' }  // Giữ lại định dạng đoạn văn
        ]
    });

    // Tạo tài liệu PDF
    const doc = new PDFDocument();
    const sanitizedTitle = post.PostTitle.replace(/[^a-zA-Z0-9-_ ]/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);

    doc.pipe(res);

    // Đăng ký và sử dụng font Tahoma
    doc.registerFont('Tahoma', tahomaFontPath);

    // Thêm nội dung đã được chuyển đổi vào PDF
    doc.font('Tahoma').fontSize(20).text(post.PostTitle, { align: 'center' });
    doc.moveDown();
    doc.font('Tahoma').fontSize(14).text(`Tác giả: ${post.U_FullName || 'Không rõ'}\n`, { align: 'left' });
    doc.text(`Thời gian: ${moment(post.TimePost, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY')}\n`);
    doc.moveDown();
    doc.font('Tahoma').fontSize(12).text(plainTextContent);

    doc.end();
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
    
    const comment = await commentModel.singleByPID(id);
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
    
    // Xuất router để sử dụng trong ứng dụng
export default router;