import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const { isPulling, isRefreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    disabled,
  });

  return (
    <div className="relative">
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              y: Math.min(pullDistance - 40, 20),
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
          >
            <div className="bg-background/90 backdrop-blur-sm border rounded-full p-3 shadow-lg">
              <motion.div
                animate={{ 
                  rotate: isRefreshing ? 360 : (progress / 100) * 180,
                }}
                transition={isRefreshing ? { 
                  repeat: Infinity, 
                  duration: 1, 
                  ease: 'linear' 
                } : { 
                  duration: 0.1 
                }}
              >
                <RefreshCw 
                  className={`h-5 w-5 ${
                    progress >= 100 || isRefreshing 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`} 
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with pull effect */}
      <motion.div
        animate={{
          y: isPulling && !isRefreshing ? pullDistance * 0.3 : 0,
        }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
