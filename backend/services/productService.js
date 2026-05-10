const { Product, Category } = require('../models');
const xlsx = require('xlsx');

const importProductsFromExcel = async (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  if (!rows || rows.length === 0) {
    throw new Error('Excel file is empty');
  }

  let insertedProducts = 0;
  let createdCategories = 0;
  let errors = [];

  const categoriesDb = await Category.findAll();
  const categoryCache = new Map(categoriesDb.map(c => [c.name_en.trim().toLowerCase(), c]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const name_en = row.product_name_en;
    const name_ar = row.product_name_ar;
    const description_en = row.description_en || '';
    const description_ar = row.description_ar || '';
    const price_staff = parseFloat(row.price_staff);
    const price_guest = parseFloat(row.price_guest);
    const category_en = row.category_name_en;
    const category_ar = row.category_name_ar || category_en;
    let isAvailable = row.isAvailable;

    if (typeof isAvailable === 'string') {
      isAvailable = isAvailable.toLowerCase() === 'true';
    } else if (typeof isAvailable !== 'boolean') {
      isAvailable = true;
    }

    if (!name_en || !name_ar || isNaN(price_staff) || isNaN(price_guest) || !category_en) {
      errors.push(`Row ${rowNum}: Missing required fields or invalid prices.`);
      continue;
    }

    try {
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

      const exists = await Product.findOne({ where: { name_en, category_id: category.id } });
      if (exists) {
        errors.push(`Row ${rowNum}: Product "${name_en}" already exists in this category.`);
        continue;
      }

      await Product.create({
        name_en, name_ar, description_en, description_ar, price_staff, price_guest, category_id: category.id, isAvailable
      });
      insertedProducts++;
    } catch (err) {
      errors.push(`Row ${rowNum}: Error inserting product - ${err.message}`);
    }
  }

  return { insertedProducts, createdCategories, errors };
};

const exportProductsToExcel = async () => {
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
  return { wb, ws };
};

module.exports = {
  importProductsFromExcel,
  exportProductsToExcel,
};
