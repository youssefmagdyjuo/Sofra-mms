const { Product, Category } = require('../models');
const productService = require('../services/productService');
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

    const result = await productService.importProductsFromExcel(req.file.buffer);

    res.status(200).json({
      message: 'Import completed',
      ...result
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: error.message || 'Failed to process Excel file' });
  }
};

const exportProducts = async (req, res) => {
  try {
    const { wb, ws } = await productService.exportProductsToExcel();
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
