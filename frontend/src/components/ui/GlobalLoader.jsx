import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalLoader() {
  const { globalLoading } = useApp();

  return (
    <AnimatePresence>
      {globalLoading && (
        <motion.div
          initial={{ width: '0%', opacity: 0 }}
          animate={{ 
            width: ['0%', '30%', '70%', '90%'],
            opacity: 1,
            transition: { 
              width: { duration: 10, ease: 'easeOut' },
              opacity: { duration: 0.2 } 
            }
          }}
          exit={{ 
            width: '100%', 
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeInOut' }
          }}
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-[#5AC6D8] z-[9999] shadow-[0_2px_10px_rgba(90,198,216,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
