import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiCheck, FiX } from 'react-icons/fi';

/**
 * AI tarafından önerilen görev optimizasyonlarını gösteren bileşen
 * @param {Object} props
 * @param {Array} props.suggestions - AI önerileri
 * @param {Function} props.onAccept - Öneri kabul edildiğinde çalışacak fonksiyon
 * @param {Function} props.onReject - Öneri reddedildiğinde çalışacak fonksiyon
 */
const TaskOptimizationSuggestions = ({ suggestions, onAccept, onReject }) => {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  /**
   * Öneri kartı bileşeni
   */
  const SuggestionCard = ({ suggestion, index }) => {
    const isExpanded = expandedSuggestion === index;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer"
        onClick={() => setExpandedSuggestion(isExpanded ? null : index)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              w-3 h-3 rounded-full
              ${suggestion.newPriority === 'high' ? 'bg-red-500' :
                suggestion.newPriority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'}
            `} />
            <h3 className="font-semibold text-gray-800">{suggestion.taskTitle}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {!isExpanded && (
              <span className="text-sm text-gray-500">
                Detaylar için tıklayın
              </span>
            )}
            <FiChevronRight
              className={`transform transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Mevcut Öncelik:</span>
                  <span className={`
                    px-2 py-1 rounded text-sm
                    ${suggestion.currentPriority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.currentPriority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'}
                  `}>
                    {suggestion.currentPriority.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Önerilen Öncelik:</span>
                  <span className={`
                    px-2 py-1 rounded text-sm
                    ${suggestion.newPriority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.newPriority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'}
                  `}>
                    {suggestion.newPriority.toUpperCase()}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-1">Optimizasyon Nedeni:</p>
                  <p className="text-gray-700">{suggestion.reason}</p>
                </div>

                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(suggestion);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <FiCheck />
                    <span>Kabul Et</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(suggestion);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <FiX />
                    <span>Reddet</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          AI Öncelik Önerileri
        </h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
          {suggestions.length} öneri
        </span>
      </div>

      <AnimatePresence>
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.taskId}
            suggestion={suggestion}
            index={index}
          />
        ))}
      </AnimatePresence>

      {suggestions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Şu anda aktif öneri bulunmuyor.
        </div>
      )}
    </div>
  );
};

export default TaskOptimizationSuggestions; 