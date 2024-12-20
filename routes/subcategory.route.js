import express from 'express';
import categoryModel from '../models/category.model.js';
import subcategoryModel from '../models/subcategory.model.js';

const router = express.Router();

router.get('/:id', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        let list = await subcategoryModel.single(id);
        
        if (list && list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].Del == 1) {
                    list[i].Xoa = true;
                } else {
                    list[i].Xoa = false;
                }
            }
        } else {
            list = [];
        }

        const rows = await categoryModel.single(id);
        if (rows.length === 0)
            return res.send('Invalid parameter.');
        const category = rows[0];

        // Kiểm tra xem có bất kỳ phần tử nào có Del = 1 không
        const hasDeletedItems = list.some(item => item.Del === 1);

        res.render('vwSubCate/list', {
            categories: list,
            category,
            xoa: hasDeletedItems,  // Thay vì dùng list.Xoa
            empty: !list || list.length === 0
        });
    } else {
        res.redirect('/')
    }
})

router.get('/:id/add', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        const rows = await categoryModel.single(id);
        if (rows.length === 0)
        return res.send('Invalid parameter.');
    
        const category = rows[0];
        res.render('vwSubCate/add', { category });
    } else {
        res.redirect('/')
    }
})

router.post('/:id/add', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        const entity = {
            SCName: req.body.SCName,
            CID: id
        };
        await subcategoryModel.add(entity);
        
        res.redirect('/admin/subcategories/'+id);
    } else {
        res.redirect('/')
    }
})

router.get('/edit/:id', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        const rows = await subcategoryModel.getSingleBySCID(id);
        if (rows.length === 0)
        return res.send('Invalid parameter.');
    
        const subcategory = rows[0];
        res.render('vwSubCate/edit', { subcategory });
    } else {
        res.redirect('/')
    }
})

router.post('/update', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = req.body.SCID;
        await subcategoryModel.patch(req.body);
        res.redirect('/admin/subcategories/edit/'+id);
    } else {
        res.redirect('/')
    }
})

router.post('/del/:id', async function(req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const scid = req.body.SCID;
        const subcatory = await subcategoryModel.getSingleBySCID(scid);
        const cid = subcatory[0].CID;
        await subcategoryModel.del(req.body.SCID);

        res.redirect('/admin/subcategories/'+cid);
    } else {
        res.redirect('/')
    }
})
  
router.get('/del/:id', async function(req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        const rows = await subcategoryModel.getSingleBySCID(id);
        if(rows.length === 0) 
            res.send('Invaild parameter.');
        const cid = rows[0].CID;

        await subcategoryModel.del(req.params.id);
        res.redirect('/admin/subcategories/'+cid);
    } else {
        res.redirect('/')
    }
})

router.post('/restore/:id', async function(req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const scid = req.body.SCID;
        const subcatory = await subcategoryModel.getSingleBySCID(scid);
        const cid = subcatory[0].CID;
        await subcategoryModel.restore(req.body.SCID);

        res.redirect('/admin/subcategories/'+cid);
    } else {
        res.redirect('/')
    }
})
  
router.get('/restore/:id', async function(req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        const rows = await subcategoryModel.getSingleBySCID(id);
        if(rows.length === 0) 
            res.send('Invaild parameter.');
        const cid = rows[0].CID;

        await subcategoryModel.restore(req.params.id);
        res.redirect('/admin/subcategories/'+cid);
    } else {
        res.redirect('/')
    }
})

router.get('/delete/:id', async function (req, res) {
    if (req.isAuthenticated() && req.user.Permission === 3) {
        const id = +req.params.id || -1;
        const cid = await subcategoryModel.getSingleBySCID(id);
        await subcategoryModel.del2(id);
        res.redirect('/admin/subcategories/'+cid[0].CID);
    } else {
        res.redirect('/')
    }
})

export default router;