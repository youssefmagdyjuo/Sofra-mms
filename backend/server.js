require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const seed = require('./seed');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
//Test connection
app.get('/', (req, res) => {
  res.send('Welcome to Sofra API The server is running and connected to Aiven Database.');
});
// Database sync and server start
sequelize.sync().then(async () => {
  await seed();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
