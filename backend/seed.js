const bcrypt = require('bcrypt');
const { User, Category, Product } = require('./models');

const seed = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ where: { email: 'admin@mms.com' } });
    if (adminExists) {
      let updated = false;
      if (adminExists.role !== 'super_admin') {
        adminExists.role = 'super_admin';
        updated = true;
      }
      if (!adminExists.username) {
        adminExists.username = 'Super Admin';
        updated = true;
      }
      if (updated) {
        await adminExists.save();
        console.log('Updated existing admin to super_admin.');
      } else {
        console.log('Database already seeded. Skipping...');
      }
      return;
    }

    console.log('Seeding database...');
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      username: 'Super Admin',
      email: 'admin@mms.com',
      password: hashedPassword,
      role: 'super_admin',
    });
    
    // Create categories
    const cat1 = await Category.create({ name_en: 'Drinks', name_ar: 'مشروبات' });
    const cat2 = await Category.create({ name_en: 'Main Courses', name_ar: 'أطباق رئيسية' });

    // Create products
    await Product.create({
      name_en: 'Espresso',
      name_ar: 'اسبريسو',
      description_en: 'A strong black coffee',
      description_ar: 'قهوة سوداء قوية',
      price_staff: 2.00,
      price_guest: 3.50,
      category_id: cat1.id,
    });

    await Product.create({
      name_en: 'Grilled Chicken',
      name_ar: 'دجاج مشوي',
      description_en: 'Served with rice and salad',
      description_ar: 'يقدم مع الأرز والسلطة',
      price_staff: 8.00,
      price_guest: 12.00,
      category_id: cat2.id,
    });

    console.log('Database seeded successfully! Admin: admin@mms.com / admin123');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seed;
