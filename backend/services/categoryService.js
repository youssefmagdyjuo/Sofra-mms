const { Category, Product } = require('../models');

/**
 * Deletes a category and all its associated products.
 * @param {number|string} id - The category ID
 */
const deleteCategoryCascade = async (id) => {
  const categoryId = Number(id);
  const category = await Category.findByPk(categoryId);
  if (!category) return null;

  // 1. Delete all related products using the foreign key
  await Product.destroy({ 
    where: { category_id: categoryId } 
  });

  // 2. Delete the category itself
  await category.destroy();
  return true;
};

/**
 * Updates a category's visibility and synchronizes all its products.
 * @param {number|string} id - The category ID
 * @param {boolean|string|number} isAvailable - The new visibility status
 */
const updateCategoryVisibilityCascade = async (id, isAvailable) => {
  const categoryId = Number(id);
  const category = await Category.findByPk(categoryId);
  if (!category) return null;

  // Normalize isAvailable to a proper boolean
  const targetStatus = isAvailable === true || isAvailable === 'true' || isAvailable === 1 || isAvailable === '1';

  // 1. Update the category visibility
  await category.update({ isAvailable: targetStatus });

  // 2. Synchronize all related products visibility
  // This ensures no products remain active under an inactive category,
  // and restores all products when a category becomes active.
  await Product.update(
    { isAvailable: targetStatus },
    { where: { category_id: categoryId } }
  );
  
  return category;
};

module.exports = {
  deleteCategoryCascade,
  updateCategoryVisibilityCascade,
};
