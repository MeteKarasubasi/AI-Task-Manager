// Firebase entegrasyonu
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyA-uC0i4eLs5jJIEXxU9HLzNHnkKRFlVMY",
  authDomain: "taskmanager-af5bb.firebaseapp.com",
  projectId: "taskmanager-af5bb",
  storageBucket: "taskmanager-af5bb.appspot.com",
  messagingSenderId: "1088093486896",
  appId: "1:1088093486896:web:aece1fb33ac0c09d1e21ac"
};

// Firebase başlatma
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Theme Management
const THEME_KEY = 'preferredTheme';
let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';

function initializeTheme() {
    document.body.className = `${currentTheme}-theme`;
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.className = `${currentTheme}-theme`;
    localStorage.setItem(THEME_KEY, currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Form varsa sıfırla
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Search and Filter Management
function initializeSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const priorityFilter = document.getElementById('priorityFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    if (priorityFilter) {
        priorityFilter.addEventListener('change', handleFilters);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilters);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const taskCards = document.querySelectorAll('.task-card');

    taskCards.forEach(card => {
        const title = card.querySelector('.task-title').textContent.toLowerCase();
        const description = card.querySelector('.task-description').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) ||
                       tags.some(tag => tag.includes(searchTerm));

        card.style.display = matches ? '' : 'none';
    });
}

function handleFilters() {
    const priority = document.getElementById('priorityFilter').value;
    const status = document.getElementById('statusFilter').value;
    const taskCards = document.querySelectorAll('.task-card');

    taskCards.forEach(card => {
        const cardPriority = card.classList.contains(`priority-${priority}`);
        const cardStatus = card.closest('.kanban-column').dataset.status === status;

        const matchesPriority = priority === '' || cardPriority;
        const matchesStatus = status === '' || cardStatus;

        card.style.display = matchesPriority && matchesStatus ? '' : 'none';
    });
}

// Authentication Functions
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Giriş hatası:", error);
        throw error;
    }
}

async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Kayıt hatası:", error);
        throw error;
    }
}

async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = '/login.html';
    } catch (error) {
        console.error("Çıkış hatası:", error);
        throw error;
    }
}

// Button Event Handlers
function initializeButtons() {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Add Task Button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => openModal('taskModal'));
    }

    // Voice Input Button
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    if (voiceInputBtn) {
        voiceInputBtn.addEventListener('click', () => openModal('voiceModal'));
    }

    // AI Suggestions Button
    const aiSuggestBtn = document.getElementById('aiSuggestBtn');
    if (aiSuggestBtn) {
        aiSuggestBtn.addEventListener('click', () => openModal('aiModal'));
    }

    // Modal Close Buttons
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error Handling
function showError(message) {
    alert(message);
    console.error(message);
}

// User Profile Update
function updateUserProfile(user) {
    const userNameElement = document.getElementById('userName');
    const userAvatarElement = document.getElementById('userAvatar');
    
    if (userNameElement) {
        userNameElement.textContent = user.email || 'Anonim Kullanıcı';
    }
    
    if (userAvatarElement) {
        userAvatarElement.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.email || 'User') + '&background=random';
    }
}

// Authentication State Observer
function initializeAuthObserver() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Kullanıcı giriş yapmış
            updateUserProfile(user);
        } else {
            // Kullanıcı çıkış yapmış
            window.location.href = '/login.html';
        }
    });
}

// Initialize App
function initializeApp() {
    try {
        initializeTheme();
        initializeSearchAndFilters();
        initializeButtons();
        initializeAuthObserver();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Uygulama başlatılırken bir hata oluştu. Lütfen sayfayı yenileyin.');
    }
}

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 