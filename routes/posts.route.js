import express from 'express';
import postModel from '../models/posts.model.js';
import categoryModel from '../models/category.model.js';
import subcategoryModel from '../models/subcategory.model.js';
const router = express.Router();
import moment from 'moment';
import userModel from '../models/user.model.js';
import multer from 'multer';
moment.locale('vi');

router.get('/', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const cate = await categoryModel.allForUser ();
        const post = await postModel.all();

        // Process each post
        for (const postItem of post) {
            postItem.Time = moment(postItem.TimePost, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
            const cat_post = await categoryModel.single(postItem.CID);
            postItem.CName = cat_post[0].CName;

            const subcat_post = await subcategoryModel.getSingleForUserByCID(postItem.SCID);
            if (subcat_post && subcat_post.length > 0) {
                postItem.SCName = ' / ' + subcat_post[0].SCName;
            } else {
                postItem.SCName = ''; // Handle case where subcategory is not found
            }

            const uid_post = await userModel.singleByUserID(postItem.UID);
            postItem.UserName = uid_post.UserName;

            postItem.Delete = postItem.xoa === 1; 
            postItem.Pre = postItem.Premium === 1;  
        }

        // Process posts by status
        const statuses = [0, 1, 2, 3]; // Statuses: 0 = Chua Duyet, 1 = Tu Choi, 2 = Cho Xuat Ban, 3 = Xuat Ban
        const postByStatus = {};

        for (const status of statuses) {
            const postsByStatus = await postModel.allByStatus(status);
            for (const postItem of postsByStatus) {
                postItem.Time = moment(postItem.TimePost, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
                const cat_post = await categoryModel.single(postItem.CID);
                postItem.CName = cat_post[0].CName;

                const subcat_post = await subcategoryModel.getSingleForUserByCID(postItem.SCID);
                if (subcat_post && subcat_post.length > 0) {
                    postItem.SCName = ' / ' + subcat_post[0].SCName;
                } else {
                    postItem.SCName = ''; // Handle case where subcategory is not found
                }

                const uid_post = await userModel.singleByUserID(postItem.UID);
                postItem.UserName = uid_post.UserName;

                postItem.Delete = postItem.xoa === 1; 
                postItem.Pre = postItem.Premium === 1;  
            }
            postByStatus[status] = postsByStatus; // Store posts by status
        }

        res.render('vwPosts/home', {
            post,
            list: cate,
            empty: cate.length === 0,
            post_ChuaDuyet: postByStatus[0],
            post_TuChoi: postByStatus[1],
            post_ChoXuatBan: postByStatus[2],
            post_XuatBan: postByStatus[3]
        });
    } else {
        res.redirect('/');
    }
});
router.get('/status/:pid', async function(req, res) {
    if (req.isAuthenticated() && req.user.Permission > 1) {
        const pid = +req.params.pid || -1;
        const pst = await postModel.singleByPostID(pid);
        const cate_post = await categoryModel.singleByCID(pst[0].CID);
        const subcate_post = await subcategoryModel.getSingleForUserByCID(pst[0].SCID);
        const sub_post = subcate_post[0];
        const category = await categoryModel.allForUser();
        for (var i = 0; i < category.length; i++) {
            const row = await subcategoryModel.getSingleForUserByCID(category[i].CID);
            category[i].subcategories = row;
            category[i].PID = pid;
            for (var j = 0; j < category[i].subcategories.length; j++) {
                category[i].subcategories[j].PID = pid;
            }
        }

        const post = pst[0];
        res.render('vwPosts/status', {
            cate_post,
            sub_post,
            category,
            post
        })
    } else {
        res.redirect('/');
    }
})

router.post('/status/:id', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission > 1) {
        const id = +req.params.id || -1;
        req.body.PostID = id;
        if (req.body.Duyet === '1') {
            delete req.body.TimePublic;
            req.body.StatusPost = 'Bị từ chối';
        } else if (req.body.Duyet === '2') {
            req.body.StatusPost = 'Đã duyệt bài và chờ xuất bản';
        }
        await postModel.patch(req.body);
        res.redirect('/editorpanel');
    } else {
        res.redirect('/');
    }
})


router.get('/move/:pid', async function(req, res) {
    if (req.isAuthenticated() && req.user.Permission > 1) {
        const pid = +req.params.pid || -1;
        const pst = await postModel.singleByPostID(pid);
        const cate_post = await categoryModel.singleByCID(pst[0].CID);
        const subcate_post = await subcategoryModel.getSingleForUserByCID(pst[0].SCID);
        const sub_post = subcate_post[0];
        const category = await categoryModel.allForUser();
        for (var i = 0; i < category.length; i++) {
            const row = await subcategoryModel.getSingleForUserByCID(category[i].CID);
            category[i].subcategories = row;
            category[i].PID = pid;
            for (var j = 0; j < category[i].subcategories.length; j++) {
                category[i].subcategories[j].PID = pid;
            }
        }

        const post = pst[0];
        res.render('vwPosts/move', {
            cate_post,
            sub_post,
            category,
            post
        })
    } else {
        res.redirect('/');
    }
})

router.get('/move/:pid/:cid', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission > 1) {
        try {
            const pid = +req.params.pid;
            const cid = +req.params.cid;

            // Move the post to the new category
            await postModel.move(pid, cid);

            // Fetch posts for the new category
            const posts = await postModel.singleByCID(cid);

            // Render the posts in the category view
            res.render('admin/posts/cat/' + cid, {
                posts
            })
        } catch (error) {
            console.error(error);
            res.status(500).send('Error moving post');
        }
    } else {
        res.redirect('/');
    }
})

router.get('/upload/:id', async function (req, res) {
    if (req.isAuthenticated() && (req.user.Permission === 1 || req.user.Permission === 3)) {
    const id = +req.params.id || -1;
    const post = await postModel.singleByPostID(id);
    const rows = post[0];
    res.render('vwPosts/upload', {
        rows
    });
    } else {
        res.redirect('/');
    }
})

router.post('/upload/:id', function (req, res) {
    if (req.isAuthenticated() && (req.user.Permission === 1 || req.user.Permission === 3)) {
        const id = +req.params.id || -1;
        const storage = multer.diskStorage({
            filename(req, file, cb) {
                const tenfile = id+'.png';
                cb(null, tenfile);
            },
            destination(req, file, cb) {
                cb(null, './public/images');
            }
        })

        const upload = multer({ storage });
        upload.array('fuMain', 3)(req, res, function (err) {
            if (!err) { 
                res.render('vwPosts/upload');
            } else {
                res.send('err');
            }
        });
    } else {
        res.redirect('/');
    }
})
 
router.get('/:id', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        const post = await postModel.singleByPostID(id);
        const rows = post[0];
        if (rows.TimePost !== null) {
            rows.Time = moment(rows.TimePost, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
        }
        const uid_post = await userModel.singleByUserID(rows.UID);
        rows.UserName = uid_post.UserName;
        rows.U_FullName = uid_post.Fullname;
        
        res.render('vwPosts/article', {
            rows
        });
    } else {
        res.redirect('/');
    }
})

router.get('/edit/:id', async function (req, res) {
    const id = +req.params.id;
    const post = await postModel.singleByPostID(id);

    if (!post || !post.length) {
        return res.redirect('/');
    }

    const postInfo = post[0];

    if (!req.isAuthenticated() || !(req.user.Permission === 1 && (postInfo.Duyet === 0 || postInfo.Duyet === 1)) && req.user.Permission !== 3) {
            const category = await categoryModel.singleByCID(postInfo.CID);
            const subcategory = await subcategoryModel.getSingleForUserByCID(postInfo.SCID);
        
            postInfo.SCName = subcategory && subcategory.length ? subcategory[0].SCName : '';
            postInfo.CName = category.CName;
    }

    res.render('vwPosts/edit', {
        post: postInfo,
        Premium: postInfo.Premium === 1,
        qAdmin: req.user.Permission === 3
    });
});

router.post('/update', async function (req, res) {
    const id = req.body.PostID;
    await postModel.patch(req.body);
    res.redirect('/admin/posts/edit/'+id);
})

router.get('/del/:id', async function(req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;

        await postModel.del(id);
        res.redirect('/admin/posts/');
    } else {
        res.redirect('/')
    }
})

router.get('/restore/:id', async function(req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;

        await postModel.restore(id);
        res.redirect('/admin/posts/');
    } else {
        res.redirect('/')
    }
})

router.get('/delete/:id', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        await postModel.del2(id);
        res.redirect('/admin/posts/');
    } else {
        res.redirect('/')
    }
})

export default router;