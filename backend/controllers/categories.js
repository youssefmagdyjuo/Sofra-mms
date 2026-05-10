const { Category } = require('../models');
const categoryService = require('../services/categoryService');

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name_en, name_ar, isAvailable } = req.body;
    const category = await Category.create({ name_en, name_ar, isAvailable });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_en, name_ar, isAvailable } = req.body;

    // Use service for visibility cascade if isAvailable is provided
    if (isAvailable !== undefined) {
      const category = await categoryService.updateCategoryVisibilityCascade(id, isAvailable);
      if (!category) return res.status(404).json({ message: 'Not found' });

      // Also update names if provided
      if (name_en || name_ar) {
        await category.update({ name_en, name_ar });
      }

      return res.json(category);
    }

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Not found' });

    await category.update({ name_en, name_ar });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await categoryService.deleteCategoryCascade(id);

    if (!success) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
