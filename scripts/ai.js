// AI Suggestions State
let isLoadingSuggestions = false;
let currentSuggestions = [];

// DOM Elements
const aiSuggestionsList = document.getElementById('aiSuggestionsList');

// Initialize AI Suggestions
function initializeAISuggestions() {
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    const aiSuggestBtn = document.getElementById('aiSuggestBtn');
    if (aiSuggestBtn) {
        aiSuggestBtn.addEventListener('click', loadAISuggestions);
    }
}

// Load AI Suggestions
async function loadAISuggestions() {
    if (isLoadingSuggestions) return;
    
    try {
        isLoadingSuggestions = true;
        updateLoadingState(true);
        
        // Get existing tasks for context
        const existingTasks = getAllTasks();
        
        // TODO: Implement Gemini API integration
        // For now, we'll simulate the API call
        const suggestions = await simulateAISuggestions(existingTasks);
        
        currentSuggestions = suggestions;
        renderSuggestions(suggestions);
        
    } catch (error) {
        console.error('Error loading AI suggestions:', error);
        showError('AI önerileri yüklenirken bir hata oluştu.');
        
    } finally {
        isLoadingSuggestions = false;
        updateLoadingState(false);
    }
}

// Get all tasks for context
function getAllTasks() {
    const tasks = {
        todo: [],
        inProgress: [],
        done: []
    };
    
    document.querySelectorAll('.kanban-column').forEach(column => {
        const status = column.dataset.status;
        column.querySelectorAll('.task-card').forEach(card => {
            tasks[status].push({
                title: card.querySelector('.task-title').textContent,
                description: card.querySelector('.task-description').textContent,
                priority: Array.from(card.classList)
                    .find(cls => cls.startsWith('priority-'))
                    ?.replace('priority-', ''),
                tags: Array.from(card.querySelectorAll('.tag'))
                    .map(tag => tag.textContent)
            });
        });
    });
    
    return tasks;
}

// Render Suggestions
function renderSuggestions(suggestions) {
    if (!aiSuggestionsList) return;
    
    aiSuggestionsList.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-card">
            <div class="suggestion-header">
                <h3>${suggestion.title}</h3>
                <span class="priority-badge priority-${suggestion.priority}">
                    ${suggestion.priority}
                </span>
            </div>
            <p class="suggestion-description">${suggestion.description}</p>
            <div class="suggestion-tags">
                ${suggestion.tags.map(tag => `
                    <span class="tag">${tag}</span>
                `).join('')}
            </div>
            <button class="primary-button add-suggestion" data-suggestion-id="${suggestion.id}">
                <i class="fas fa-plus"></i> Göreve Ekle
            </button>
        </div>
    `).join('');
    
    // Add event listeners to "Add" buttons
    aiSuggestionsList.querySelectorAll('.add-suggestion').forEach(button => {
        button.addEventListener('click', () => {
            const suggestionId = button.dataset.suggestionId;
            const suggestion = currentSuggestions.find(s => s.id === suggestionId);
            if (suggestion) {
                addSuggestionAsTask(suggestion);
            }
        });
    });
}

// Add Suggestion as Task
function addSuggestionAsTask(suggestion) {
    const taskData = {
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        tags: suggestion.tags,
        dueDate: suggestion.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'todo'
    };
    
    addTask(taskData);
    
    // Remove the suggestion card
    const suggestionCard = aiSuggestionsList.querySelector(`[data-suggestion-id="${suggestion.id}"]`).closest('.suggestion-card');
    if (suggestionCard) {
        suggestionCard.remove();
    }
}

// Update Loading State
function updateLoadingState(loading) {
    if (!aiSuggestionsList) return;
    
    if (loading) {
        aiSuggestionsList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>AI önerileri yükleniyor...</p>
            </div>
        `;
    }
}

// Temporary function to simulate Gemini API integration
async function simulateAISuggestions(existingTasks) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate AI-generated suggestions
    return [
        {
            id: '1',
            title: 'Haftalık Proje Değerlendirmesi',
            description: 'Takım üyeleriyle haftalık ilerleme toplantısı düzenle ve sprint hedeflerini gözden geçir.',
            priority: 'high',
            tags: ['toplantı', 'proje', 'değerlendirme']
        },
        {
            id: '2',
            title: 'Kullanıcı Arayüzü İyileştirmeleri',
            description: 'Kullanıcı geri bildirimleri doğrultusunda dashboard sayfasının performansını optimize et.',
            priority: 'medium',
            tags: ['UI', 'optimizasyon']
        },
        {
            id: '3',
            title: 'Dokümantasyon Güncellemesi',
            description: 'API dokümantasyonunu güncelle ve yeni eklenen endpoint\'leri belgele.',
            priority: 'low',
            tags: ['dokümantasyon', 'API']
        }
    ];
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAISuggestions); 