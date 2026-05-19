import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function GlobalLoader() {
  const { globalLoading } = useApp();

  return (
    <>
      {/* Top progress bar loader for instant feedback */}
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
            className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-[#5AC6D8] z-[9999] shadow-[0_2px_10px_rgba(90,198,216,0.5)]"
          />
        )}
      </AnimatePresence>

      {/* Modern, glowing fullscreen overlay spinner */}
      <AnimatePresence>
        {globalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-[9998] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/80 p-5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 backdrop-blur-md pointer-events-auto"
            >
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-sm font-bold text-slate-700 tracking-wide select-none">Loading...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
