import express from 'express';
import { engine } from 'express-handlebars';
import numeral from 'numeral';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import categoryRouter from './routes/category.route.js';
import productRouter from './routes/product.route.js';
import productUserRouter from './routes/product-user.route.js';

import categoryService from './services/category.service.js';

const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.engine('hbs', engine({
  extname: 'hbs',
  // defaultLayout: 'main',
  // layoutsDir: __dirname + '/views/layouts',
  // partialsDir: __dirname + '/views/partials',
  helpers: {
    format_number(value) {
      return numeral(value).format('0,0') + ' vnd';
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use('/static', express.static('static'));

// middleware
app.use(async function (req, res, next) {
  // const categories = await categoryService.findAllWithDetails();
  // res.locals.lcCategories = categories;
  next();
});

app.get('/', function (req, res) {
  // res.send('Hello World!');

  const randomNumber = Math.floor(Math.random() * 100);
  res.render('home', {
    // layout: false,
    // layout: 'anotherLayout',
    randomNumber: randomNumber,
  });
});

app.get('/about', function (req, res) {
  res.render('about');
  // res.render('about', {
  //   layout: false,
  // });
});

const __dirname = dirname(fileURLToPath(import.meta.url));
app.get('/test', function (req, res) {
  res.sendFile(__dirname + '/test.html');
});

app.use('/admin/categories', categoryRouter);
app.use('/admin/products', productRouter);
app.use('/products', productUserRouter);

app.listen(3000, function () {
  console.log('Server started on http://localhost:3000');
});

// function rootHandler(req, res) {
//   res.send('Hello World!');
// }
// app.get('/', rootHandler);

// function serverStartedHandler() {
//   console.log('Server started on http://localhost:3000');
// }
// app.listen(3000, serverStartedHandler);