import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import hbs_sections from 'express-handlebars-sections';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import 'express-async-errors';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import './passport-setup.js';

// Đặt Client ID và Secret từ Google Console
const GOOGLE_CLIENT_ID = '1041136174971-jqsg5dtr01c0rr556b4q2lpifuk3n11u.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

const app = express();

app.use(express.urlencoded({
    extended: true
}));

app.engine('hbs', engine({
    layoutsDir: 'views/layouts',
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    helpers: {
        section: hbs_sections()
    }
}));
app.set('view engine', 'hbs');
app.set('trust proxy', 1) // trust first proxy
  app.use(session({
    secret: 'keyboard cat', 
    resave: false,
    saveUninitialized: true,
    cookie: {
      // secure: true
    }
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/public', express.static('public'));

app.use(function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.lcIsAuthenticated = true;
        res.locals.lcAuthUser = req.user;
        if (req.user.Permission === 3) {
            res.locals.lcAdmin = true;
        }
        if (req.user.Permission === 2) {
            res.locals.lcEditor = true;
        }
        if (req.user.Permission === 1) {
            res.locals.lcWriter = true;
        }
    }

    next();
  })

// check sửa lại
  import categoryModel from './models/category.model.js';
  import subcategoryModel from './models/subcategory.model.js';
  import postModel from './models/posts.model.js';
  import _postModel from './models/_posts.model.js';
  import commentModel from './models/comment.model.js';

app.use(async function(req, res, next) {
    const rows = await categoryModel.allforuser();
    for (var i = 0; i < rows.length; i++) {
        if (i % 5 == 0) {
            rows[i].xd = 'margin-bottom: 45px;';
        }
    }
    for (var i = 0; i < rows.length; i++) {
        const row = await subcategoryModel.singleforuser(rows[i].CID);
        rows[i].subcategories = row;
    }
    res.locals.lcCategories = rows;
    next();
})

app.use(async function(req, res, next) {
    const post = await postModel.allPostSapPublic();
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
    var datetime = date+' '+time;
    datetime = moment(datetime, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh:mm:ss');

    for (var i = 0; i < post.length; i++) {
        const entity = {
            PostID: post[i].PostID,
            Duyet: 3,
            StatusPost: 'Đã xuất bản'
        }
        datetimep = moment(post[i].TimePublic, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh:mm:ss');
        if (datetimep <= datetime) {
            await postModel.patch(entity);
        }
    }

    next();
})

app.get('/', async function (req, res) {
    try {
        const rows = await _postModel.best();
        if (rows.length !== 0) {
            const cat_post = await categoryModel.singleByCID(rows[0].CID);

            // Kiểm tra subcat_post trước khi truy cập
            const subcat_post = await subcategoryModel.single2(rows[0].SCID);
            rows[0].CName = cat_post.CName;
            if (rows[0].SCID !== null && subcat_post.length > 0) {
                rows[0].SCName = subcat_post[0].SCName;
            } else {
                rows[0].SCName = null; // Hoặc gán giá trị mặc định
            }
            rows[0].Time = moment(rows[0].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();

            const hot = await _postModel.hot2();
            const countComment = await commentModel.countByPostID(rows[0].PostID);
            rows[0].countComment = countComment[0]?.Count || 0; // Xử lý khi countComment là undefined
            for (let i = 0; i < hot.length; i++) {
                const cat = await categoryModel.singleByCID(hot[i].CID);
                const subc = await subcategoryModel.single2(hot[i].SCID);
                hot[i].CName = cat.CName;
                if (hot[i].SCID !== null && subc.length > 0) {
                    hot[i].SCName = subc[0].SCName;
                } else {
                    hot[i].SCName = null;
                }
                hot[i].Time = moment(hot[i].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
            }

            // Loại bỏ bài viết trùng lặp trong hot
            for (let i = 0; i < hot.length; i++) {
                if (hot[i]?.PostID === rows[0]?.PostID) {
                    delete hot[i];
                }
            }

            const new10 = await _postModel.new10();
            for (let i = 0; i < new10.length; i++) {
                const cat = await categoryModel.singleByCID(new10[i].CID);
                const subc = await subcategoryModel.single2(new10[i].SCID);
                new10[i].CName = cat.CName;
                if (new10[i].SCID !== null && subc.length > 0) {
                    new10[i].SCName = subc[0].SCName;
                } else {
                    new10[i].SCName = null;
                }
                new10[i].Time = moment(new10[i].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
                new10[i].Pre = new10[i].Premium === 1;
            }

            const hot10 = await _postModel.hot10();
            for (let i = 0; i < hot10.length; i++) {
                const cat = await categoryModel.singleByCID(hot10[i].CID);
                const subc = await subcategoryModel.single2(hot10[i].SCID);
                hot10[i].CName = cat.CName;
                if (hot10[i].SCID !== null && subc.length > 0) {
                    hot10[i].SCName = subc[0].SCName;
                } else {
                    hot10[i].SCName = null;
                }
                hot10[i].Time = moment(hot10[i].TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
                hot10[i].Pre = hot10[i].Premium === 1;
            }

            const category = await categoryModel.allforuser();
            for (let i = 0; i < category.length; i++) {
                const subcategory = await subcategoryModel.singleforuser(category[i].CID);
                category[i].subcategory = subcategory;
                const new1 = await _postModel.new1(category[i].CID);
                category[i].new = new1;
            }
            res.render('home', {
                rows,
                hot,
                new10,
                hot10,
                category,
            });
        } else {
            res.render('home');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/admin', function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        res.render('adminpanel');
    } else {
        res.redirect('/');
    }
    });

import categoryRouter from './routes/category.route.js';
app.use('/admin/categories', categoryRouter);

import subcategoryRouter from './routes/subcategory.route.js';
app.use('/admin/subcategories', subcategoryRouter);

import postRouter from './routes/posts.route.js';
app.use('/admin/posts', postRouter);

import userRouter from './routes/user.route.js';
app.use('/', userRouter);

import usersRouter from './routes/users.route.js';
app.use('/admin/users', usersRouter);

import utilsRouter from './routes/utils.route.js';
app.use('/', utilsRouter);

import _userModel from './routes/_user.router.js';
app.use('/', _userModel);

import _postRouter from './routes/_post.route.js';
app.use('/post', _postRouter);

import writerPanelRouter from './routes/writerpanel.route.js';
app.use('/writerpanel', writerPanelRouter);

import editorPanelRouter from './routes/editorpanel.route.js';
app.use('/editorpanel', editorPanelRouter);

import userModel from './models/user.model.js';

import authRouter from './routes/google.route.js';
app.use('/', authRouter);

app.route('/dangnhap')
.get(function(req, res) {
    res.render('_vwAccount/dangnhap')
})
.post(passport.authenticate('local', {failureRedirect: '/dangnhap',
                                      successRedirect: '/',
                                     }))

passport.use(new LocalStrategy(async function (username, password, done) {
    const user = await userModel.singleByUserName(username);
    if (user === null) {
        return done(null, false);
    } 
    const rs = bcrypt.compareSync(password, user.Password_hash);
    if (rs === false) {
        return done(null, false);
    }
    
    return done(null, user);

    delete user.Password_hash;
}))

passport.serializeUser((user, done) => {
    // Kiểm tra nếu là user từ Google OAuth
    if (user.emails) {
        // Đây là user từ Google
        done(null, user.emails[0].value); // Lưu email vào session
    } else {
        // Đây là user từ database
        done(null, user.UserName);
    }
})

passport.deserializeUser(async function (identifier, done) {
    try {
        // Thử tìm user bằng cả email và username
        let user = await userModel.singleByEmail(identifier);
        if (!user) {
            user = await userModel.singleByUserName(identifier);
        }

        if (user) {
            delete user.Password_hash;
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: "1041136174971-jqsg5dtr01c0rr556b4q2lpifuk3n11u.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Kiểm tra xem user đã tồn tại trong DB chưa
      let user = await userModel.singleByEmail(profile.id);
      
      if (!user) {
        // Nếu chưa có, tạo user mới
        const newUser = {
          GoogleID: profile.id,
          Email: profile.emails[0].value,
          UserName: profile.displayName,
        };
        
        await userModel.add(newUser);
        user = newUser;
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

app.get('/dangxuat', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err); // Xử lý lỗi nếu xảy ra
        }
        res.redirect(req.headers.referer || '/'); // Chuyển hướng sau khi đăng xuất, hoặc về trang chủ nếu không có referer
    });
});

app.use(function (req, res) {
    res.render('404', { layout: false });
})

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('500', { layout: false });
})
  
const port = 3000;
app.listen(port, () => console.log(`Server is running http://localhost:${port}`));