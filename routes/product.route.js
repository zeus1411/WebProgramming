import express from 'express';
import productService from '../services/product.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const list = await productService.findAll();
  res.render('vwProduct/list', {
    products: list
  });
});

export default router;