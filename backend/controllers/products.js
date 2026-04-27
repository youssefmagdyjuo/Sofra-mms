const { Product, Category } = require('../models');
const xlsx = require('xlsx');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category' }]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name_en, name_ar, description_en, description_ar, price_staff, price_guest, category_id, isAvailable } = req.body;
    const product = await Product.create({
      name_en, name_ar, description_en, description_ar, price_staff, price_guest, category_id, isAvailable
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_en, name_ar, description_en, description_ar, price_staff, price_guest, category_id, isAvailable } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Not found' });

    await product.update({
      name_en, name_ar, description_en, description_ar, price_staff, price_guest, category_id, isAvailable
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Not found' });

    await product.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    let insertedProducts = 0;
    let createdCategories = 0;
    let errors = [];

    // Pre-fetch all existing categories to minimize DB calls
    const categoriesDb = await Category.findAll();
    const categoryCache = new Map(categoriesDb.map(c => [c.name_en.trim().toLowerCase(), c]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +1 for 0-index, +1 for header

      // Extract fields matching the template
      const name_en = row.product_name_en;
      const name_ar = row.product_name_ar;
      const description_en = row.description_en || '';
      const description_ar = row.description_ar || '';
      const price_staff = parseFloat(row.price_staff);
      const price_guest = parseFloat(row.price_guest);
      const category_en = row.category_name_en;
      const category_ar = row.category_name_ar || category_en; // Fallback
      let isAvailable = row.isAvailable;
      if (typeof isAvailable === 'string') {
        isAvailable = isAvailable.toLowerCase() === 'true';
      } else if (typeof isAvailable !== 'boolean') {
        isAvailable = true; // default
      }

      // Validation
      if (!name_en || !name_ar || isNaN(price_staff) || isNaN(price_guest) || !category_en) {
        errors.push(`Row ${rowNum}: Missing required fields or invalid prices.`);
        continue;
      }

      try {
        // Resolve Category
        const normalizedCategoryName = category_en.trim().toLowerCase();
        let category = categoryCache.get(normalizedCategoryName);
        if (!category) {
          category = await Category.create({ 
            name_en: category_en.trim(), 
            name_ar: typeof category_ar === 'string' ? category_ar.trim() : category_ar, 
            isAvailable: true 
          });
          categoryCache.set(normalizedCategoryName, category);
          createdCategories++;
        }

        // Check for duplicates (optional)
        const exists = await Product.findOne({ where: { name_en, category_id: category.id } });
        if (exists) {
          errors.push(`Row ${rowNum}: Product "${name_en}" already exists in this category.`);
          continue;
        }

        // Insert Product
        await Product.create({
          name_en,
          name_ar,
          description_en,
          description_ar,
          price_staff,
          price_guest,
          category_id: category.id,
          isAvailable
        });
        insertedProducts++;
      } catch (err) {
        errors.push(`Row ${rowNum}: Error inserting product - ${err.message}`);
      }
    }

    res.status(200).json({
      message: 'Import completed',
      insertedProducts,
      createdCategories,
      errors
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Failed to process Excel file', error: error.message });
  }
};

const exportProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category' }]
    });

    const data = products.map(p => ({
      product_name_en: p.name_en,
      product_name_ar: p.name_ar,
      description_en: p.description_en || '',
      description_ar: p.description_ar || '',
      price_staff: p.price_staff,
      price_guest: p.price_guest,
      category_name_en: p.category ? p.category.name_en : '',
      category_name_ar: p.category ? p.category.name_ar : '',
      isAvailable: p.isAvailable ? 'TRUE' : 'FALSE'
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Products");

    const format = req.query.format || 'xlsx';

    if (format === 'csv') {
      let csvData = xlsx.utils.sheet_to_csv(ws);
      csvData = "\uFEFF" + csvData; // UTF-8 BOM
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
      return res.send(csvData);
    } else {
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="products_export.xlsx"');
      return res.send(buffer);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting data' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  exportProducts,
};
