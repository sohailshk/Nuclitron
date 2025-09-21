'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingChatIcon: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  // Hide the floating icon if we're already on the chatbot page
  const isChatbotPage = pathname === '/chatbot';
  
  useEffect(() => {
    // Add a small delay before showing the icon for smooth page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClick = () => {
    router.push('/chatbot');
  };
  
  // Don't render if we're on the chatbot page
  if (isChatbotPage) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative group flex items-center justify-center
              w-14 h-14 md:w-16 md:h-16
              bg-gradient-to-r from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-blue-800
              text-white rounded-full shadow-lg
              hover:shadow-xl transition-all duration-300
              cursor-pointer overflow-hidden
            `}
            aria-label="Open AI Assistant Chat"
          >
            {/* Ripple effect background */}
            <div className="absolute inset-0 rounded-full">
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
            </div>
            
            {/* Icon */}
            <MessageCircle className="relative z-10 w-6 h-6 md:w-7 md:h-7" />
            
            {/* Notification dot */}
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </motion.button>
          
          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
              >
                <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">●</span>
                    <span>AI Assistant Online</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Click to chat</div>
                  {/* Arrow pointing to button */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 
                    border-t-[6px] border-t-transparent
                    border-b-[6px] border-b-transparent
                    border-l-[6px] border-l-gray-900"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingChatIcon;
