import express from 'express';
import categoryModel from '../models/category.model.js';
import subcategoryModel from '../models/subcategory.model.js';
import postModel from '../models/posts.model.js';
import moment from 'moment';
import commentModel from '../models/comment.model.js';
import _postModel from '../models/_posts.model.js';

const router = express.Router();

const getPostDetails = async (post) => {
    post.Time = moment(post.TimePost, 'YYYY-MM-DD hh:mm:ss').fromNow();
    const cat_post = await categoryModel.singleByCID(post.CID);
    post.CName = cat_post ? cat_post.CName : '';
    const subcat_post = await subcategoryModel.getSingleBySCID(post.SCID);
    if (subcat_post && subcat_post.SCID !== null) {
      post.SCName = subcat_post.SCName;
    }
    if (post.Premium === 1) { post.Pre = true; }
    return post;
};

router.get('/cat/:id', async function (req, res) {
    try {
      const id = +req.params.id; // Convert the ID to a number
      const category = await categoryModel.singleByCID(id);
      const subcate = await subcategoryModel.getSingleForUserByCID(id);
      const subcategory = subcate && subcate[0] ? subcate[0] : null;
      const posts = await postModel.singleByCIDXuatBan(id) || [];
  
      // Check if posts is an array, if not wrap it in an array
      const postsArray = Array.isArray(posts) ? posts : [posts];
  
      // Process each post to get additional details
      const detailedPosts = await Promise.all(postsArray.map(getPostDetails));
  
      // Render the view with the category, subcategory, and detailed posts
      res.render('_vwPosts/news_categories', {
        category,
        subcategory,
        post: detailedPosts // Pass the detailed posts to the view
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

router.get('/subcat/:id', async function (req, res) {
  const id = +req.params.id || -1;
  const subcate = await subcategoryModel.getSingleBySCID(id);
  const subcategory = subcate && subcate[0] ? subcate[0] : null;
  const post = await postModel.singleBySCIDXuatBan(id) || [];

  const postsArray = Array.isArray(post) ? post : [post];
  const posts = await Promise.all(postsArray.map(getPostDetails));

  res.render('_vwPosts/new_subcategories', {
    subcategory,
    post: posts
  });
});

router.post('/search', async function (req, res) {
  const result = await _postModel.search(req.body.search) || [];

  const results = await Promise.all(result.map(getPostDetails));

  res.render('search', { result: results, search: req.body.search, empty: results.length === 0 });
});

router.get('/comment/like/:id', async function (req, res) {
  if (req.isAuthenticated()) {
    const id = +req.params.id || -1;
    const comment = await commentModel.singleByComID(id) || [];
    if (comment.length === 0) {
      return res.redirect('/dangnhap');
    }
    const commentlike = await commentModel.singleLikeByComID(id);
    const entity = {
      ComID: id,
      UID: req.user.UserID
    };

    if (commentlike && commentlike.length > 0 && req.user.UserID === commentlike[0].UID) {
      res.redirect(`/post/${comment[0].PostID}#comment`);
    } else {
      await commentModel.addLike(entity);
      res.redirect(`/post/${comment[0].PostID}#comment`);
    }
  } else {
    res.redirect('/dangnhap');
  }
});

export default router;