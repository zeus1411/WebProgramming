import express from 'express';
import productService from '../services/product.service.js';

const router = express.Router();

// // .../byCat?id=1
// router.get('/byCat', async function (req, res) {
//   const id = +req.query.id || 0;
//   const list = await productService.findByCatId(id);
//   res.render('vwProduct/byCat', {
//     products: list,
//     empty: list.length === 0
//   });
// });

// .../byCat?id=1&page=1
router.get('/byCat', async function (req, res) {
  for (const category of res.locals.lcCategories) {
    category.active = +category.CatID === +req.query.id;
  }

  const id = +req.query.id || 0;
  const limit = 4;
  const page = +req.query.page || 1;
  const offset = (page - 1) * limit;
  const list = await productService.findPageByCatId(id, limit, offset);

  const total = await productService.countByCatId(id);
  const nPages = Math.ceil(total.number_of_products / limit);
  const page_items = [];
  for (let i = 1; i <= nPages; i++) {
    page_items.push({
      value: i,
      active: i === page,
    });
  }
  // console.log(page_items);

  res.render('vwProduct/byCat', {
    products: list,
    empty: list.length === 0,
    page_items: page_items,
    catId: id,
  });
});

// .../detail?id=1
router.get('/detail', async function (req, res) {
  const id = +req.query.id || 0;
  const product = await productService.findById(id);

  // for highlighting the active category in layout main.hbs
  for (const category of res.locals.lcCategories) {
    category.active = category.CatID === product.CatID;
  }

  res.render('vwProduct/detail', {
    product: product
  });
});

export default router;