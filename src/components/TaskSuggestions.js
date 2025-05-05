import React from 'react';
import { motion } from 'framer-motion';

/**
 * AI tarafından önerilen görevleri görüntüleyen ve yönetmeyi sağlayan bileşen
 */
const TaskSuggestions = ({ suggestions, onAccept, onReject, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-background-light p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        AI Görev Önerileri
      </h3>
      
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-4 rounded-md shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">{suggestion.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {suggestion.description}
                </p>
                <span className={`
                  inline-block mt-2 px-2 py-1 text-xs rounded-full
                  ${suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}
                `}>
                  {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Öncelik
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onAccept(suggestion)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Öneriyi Kabul Et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button
                  onClick={() => onReject(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Öneriyi Reddet"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TaskSuggestions; 