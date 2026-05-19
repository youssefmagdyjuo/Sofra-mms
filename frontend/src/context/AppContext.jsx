import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('sofra_categories');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('sofra_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [categoriesLoaded, setCategoriesLoaded] = useState(() => {
    return !!localStorage.getItem('sofra_categories');
  });

  const [productsLoaded, setProductsLoaded] = useState(() => {
    return !!localStorage.getItem('sofra_products');
  });

  const [globalLoading, setGlobalLoading] = useState(false);
  const [activeRequests, setActiveRequests] = useState(0);

  // Global request tracking helpers
  const startRequest = () => setActiveRequests(prev => prev + 1);
  const endRequest = () => setActiveRequests(prev => Math.max(0, prev - 1));

  // Dynamic interceptor setup to automatically manage activeRequests state
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        startRequest();
        return config;
      },
      (error) => {
        endRequest();
        return Promise.reject(error);
      }
    );

    const resInterceptor = api.interceptors.response.use(
      (response) => {
        endRequest();
        return response;
      },
      (error) => {
        endRequest();
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // Auto set global loading based on active requests
  useEffect(() => {
    setGlobalLoading(activeRequests > 0);
  }, [activeRequests]);

  // Centralized fetching logic with built-in cache
  const fetchCategories = async (force = false) => {
    if (categoriesLoaded && !force && categories.length > 0) {
      // Return cached instantly
      return categories;
    }

    startRequest();
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
      localStorage.setItem('sofra_categories', JSON.stringify(res.data));
      setCategoriesLoaded(true);
      return res.data;
    } catch (err) {
      console.error('Error fetching categories:', err);
      throw err;
    } finally {
      endRequest();
    }
  };

  const fetchProducts = async (force = false) => {
    if (productsLoaded && !force && products.length > 0) {
      // Return cached instantly
      return products;
    }

    startRequest();
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      localStorage.setItem('sofra_products', JSON.stringify(res.data));
      setProductsLoaded(true);
      return res.data;
    } catch (err) {
      console.error('Error fetching products:', err);
      throw err;
    } finally {
      endRequest();
    }
  };

  // Invalidate cache fully and trigger background updates
  const invalidateCache = async () => {
    localStorage.removeItem('sofra_categories');
    localStorage.removeItem('sofra_products');
    setCategories([]);
    setProducts([]);
    setCategoriesLoaded(false);
    setProductsLoaded(false);
    
    // Trigger silent background updates
    await Promise.all([
      fetchCategories(true),
      fetchProducts(true)
    ]);
  };

  return (
    <AppContext.Provider value={{
      categories,
      products,
      categoriesLoaded,
      productsLoaded,
      globalLoading,
      setGlobalLoading,
      startRequest,
      endRequest,
      fetchCategories,
      fetchProducts,
      invalidateCache
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
