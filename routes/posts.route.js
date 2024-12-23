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
        const cate = await categoryModel.allForUser();
        const post = await postModel.all();

        const processPost = async (post) => {
            for (let i = 0; i < post.length; i++) {
                post[i].Time = moment(post[i].TimePost, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
                
                const cat_post = await categoryModel.single(post[i].CID);
                post[i].CName = cat_post && cat_post.CName ? cat_post.CName : 'Unknown Category';

                const subcat_post = await subcategoryModel.getSingleForUserByCID(post[i].SCID);
                post[i].SCName = (post[i].SCID !== null && subcat_post && subcat_post[0])
                    ? ' / ' + subcat_post[0].SCName
                    : '';

                const uid_post = await userModel.singleByUserID(post[i].UID);
                post[i].UserName = uid_post && uid_post.UserName ? uid_post.UserName : 'Unknown User';

                post[i].Delete = post[i].xoa === 1;
                post[i].Pre = post[i].Premium === 1;
            }
        };

        await Promise.all([
            processPost(post),
            processPost(await postModel.allByStatus(0)), // Chưa Duyệt
            processPost(await postModel.allByStatus(1)), // Từ Chối
            processPost(await postModel.allByStatus(2)), // Chờ Xuất Bản
            processPost(await postModel.allByStatus(3)), // Xuất Bản
        ]);

        res.render('vwPosts/home', {
            post,
            list: cate,
            empty: cate.length === 0,
            post_ChuaDuyet: await postModel.allByStatus(0),
            post_TuChoi: await postModel.allByStatus(1),
            post_ChoXuatBan: await postModel.allByStatus(2),
            post_XuatBan: await postModel.allByStatus(3),
        });
    } else {
        res.redirect('/');
    }
});


router.get('/status/:pid', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission > 1) {
        try {
            const pid = +req.params.pid || -1;

            // Lấy dữ liệu bài viết
            const pst = await postModel.singleByPostID(pid);

            // Kiểm tra nếu không có dữ liệu
            if (!pst) {
                return res.status(404).send('Post not found - null/undefined');
            }

            // Chuyển đổi dữ liệu thành mảng nếu cần
            const posts = Array.isArray(pst) ? pst : [pst];

            // Kiểm tra mảng rỗng
            if (posts.length === 0) {
                return res.status(404).send('Post not found - empty array');
            }

            // Lấy bài viết đầu tiên từ mảng
            const postData = posts[0];

            // Lấy danh mục bài viết
            const cate_post = await categoryModel.singleByCID(postData.CID);

            if (!cate_post) {
                return res.status(404).send('Category not found for the post');
            }

            // Lấy danh mục con bài viết
            const subcate_post = await subcategoryModel.getSingleForUserByCID(postData.SCID);

            if (!subcate_post || subcate_post.length === 0) {
                return res.status(404).send('Subcategory not found for the post');
            }

            const sub_post = subcate_post[0];

            // Lấy tất cả danh mục và danh mục con
            const category = await categoryModel.allForUser();
            for (const cat of category) {
                const row = await subcategoryModel.getSingleForUserByCID(cat.CID);
                cat.subcategories = row || [];
                cat.PID = pid;

                for (const sub of cat.subcategories) {
                    sub.PID = pid;
                }
            }

            res.render('vwPosts/status', {
                cate_post,
                sub_post,
                category,
                post: postData,
            });
        } catch (error) {
            console.error('Error in /status/:pid:', error);
            res.status(500).send('Internal Server Error: ' + error.message);
        }
    } else {
        res.redirect('/');
    }
});


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

        // Lấy bài viết
        const pst = await postModel.singleByPostID(pid);

        // Kiểm tra nếu bài viết không tồn tại
        if (!pst) {
            return res.status(404).send('Post not found');
        }

        // Lấy danh mục bài viết
        const cate_post = await categoryModel.singleByCID(pst.CID);
        if (!cate_post) {
            return res.status(404).send('Category not found for the post');
        }

        // Lấy danh mục con bài viết
        const subcate_post = await subcategoryModel.getSingleForUserByCID(pst.SCID);
        if (!subcate_post || subcate_post.length === 0) {
            return res.status(404).send('Subcategory not found for the post');
        }

        const sub_post = subcate_post[0];

        // Lấy tất cả danh mục và danh mục con
        const category = await categoryModel.allForUser();
        for (let i = 0; i < category.length; i++) {
            const row = await subcategoryModel.getSingleForUserByCID(category[i].CID);
            category[i].subcategories = row || [];
            category[i].PID = pid;
            for (let j = 0; j < category[i].subcategories.length; j++) {
                category[i].subcategories[j].PID = pid;
            }
        }

        res.render('vwPosts/move', {
            cate_post,
            sub_post,
            category,
            post: pst
        });
    } else {
        res.redirect('/');
    }
});

router.get('/cat/:cid', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission > 1) {
        const cid = +req.params.cid || -1;
        
        try {
            // Lấy thông tin chuyên mục
            const category = await categoryModel.single(cid);
            
            if (!category) {
                return res.status(404).send('Category not found.');
            }

            // Lấy danh sách bài viết
            const posts = await postModel.getByCategory(cid);

            // Render với dữ liệu category trực tiếp (không cần [0])
            res.render('vwPosts/listByCategory', {
                posts,
                category: category,  // Truyền trực tiếp object category
                empty: !posts || posts.length === 0,
                layout: 'main'  // Chỉ định layout nếu cần
            });
            
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

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

        // Lấy bài viết theo ID
        const post = await postModel.singleByPostID(id);

        // Kiểm tra nếu không tìm thấy bài viết
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Format thời gian nếu tồn tại
        if (post.TimePost) {
            post.Time = moment(post.TimePost, 'YYYY-MM-DD hh:mm:ss').format('hh:mmA DD/MM/YYYY');
        }

        // Lấy thông tin người dùng
        const uid_post = await userModel.singleByUserID(post.UID);
        post.UserName = uid_post && uid_post.UserName ? uid_post.UserName : 'Unknown User';
        post.U_FullName = uid_post && uid_post.Fullname ? uid_post.Fullname : 'Unknown Fullname';

        // Render bài viết
        res.render('vwPosts/article', {
            rows: post
        });
    } else {
        res.redirect('/');
    }
});

router.get('/edit/:id', async function (req, res) {
    const id = +req.params.id || -1;

    // Lấy bài viết theo ID
    const post = await postModel.singleByPostID(id);

    // Kiểm tra nếu không tìm thấy bài viết
    if (!post) {
        return res.status(404).send('Post not found');
    }

    // Kiểm tra quyền của người dùng
    if (!req.isAuthenticated() || !(req.user.Permission === 3 || (req.user.Permission === 1 && (post.Duyet === 0 || post.Duyet === 1)))) {
        return res.redirect('/');
    }

    // Lấy thông tin danh mục và danh mục con
    const category = await categoryModel.singleByCID(post.CID);
    const sub = await subcategoryModel.getSingleForUserByCID(post.SCID);

    // Kiểm tra nếu danh mục hoặc danh mục con không tồn tại
    if (!category || !sub || sub.length === 0) {
        return res.status(404).send('Category or Subcategory not found');
    }

    const subcategory = sub[0];
    post.CName = category.CName || 'Unknown Category';
    post.SCName = subcategory.SCName || 'Unknown Subcategory';

    // Render trang chỉnh sửa
    res.render('vwPosts/edit', {
        post,
        Premium: post.Premium === 1,
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

router.get('/category/:id', async function (req, res) {
    const categoryId = req.params.id;

    try {
        // Lấy thông tin của chuyên mục
        const category = await categoryModel.singleByCID(categoryId);

        if (!category) {
            return res.render('categoryPosts', {
                category: null
            });
        }

        // Lấy danh sách bài viết thuộc chuyên mục
        const posts = await postModel.singleByCID(categoryId);

        // Kiểm tra nếu không có bài viết
        const isEmpty = posts.length === 0;

        // Render ra view
        res.render('vwPosts/listByCatEditor', {
            category,
            posts,
            empty: isEmpty
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi server');
    }
});

export default router;