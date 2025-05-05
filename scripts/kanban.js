// Kanban Board State Management
let tasks = {
    todo: [],
    'in-progress': [],
    completed: []
};

// Firebase entegrasyonu - tasks koleksiyonundan görevleri al
import { db, auth } from '../src/firebase.js';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Task Template
const createTaskElement = (task) => {
    const taskElement = document.createElement('div');
    taskElement.className = `task-card priority-${task.priority}`;
    taskElement.draggable = true;
    taskElement.dataset.taskId = task.id;
    
    const dueDate = task.dueDate ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : 'Tarih yok';
    
    taskElement.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.title}</h3>
            <div class="task-actions">
                <button class="icon-button edit-task" aria-label="Görevi Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-button delete-task" aria-label="Görevi Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <p class="task-description">${task.description || ''}</p>
        <div class="task-metadata">
            <div class="task-tags">
                ${task.tags && task.tags.length > 0 ? task.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
            <span class="task-due-date">
                <i class="far fa-calendar"></i>
                ${dueDate}
            </span>
        </div>
    `;

    // Event Listeners
    taskElement.addEventListener('dragstart', handleDragStart);
    taskElement.addEventListener('dragend', handleDragEnd);
    
    const editButton = taskElement.querySelector('.edit-task');
    const deleteButton = taskElement.querySelector('.delete-task');
    
    editButton.addEventListener('click', () => openEditTaskModal(task));
    deleteButton.addEventListener('click', () => deleteTask(task.id));
    
    return taskElement;
};

// Drag and Drop Handlers
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const taskList = e.currentTarget;
    taskList.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const taskList = e.currentTarget;
    taskList.classList.remove('drag-over');
    
    const taskId = e.dataTransfer.getData('text/plain');
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const newStatus = taskList.id === 'todoTasks' ? 'todo' : 
                      taskList.id === 'inProgressTasks' ? 'in-progress' : 'completed';
    
    if (taskElement && newStatus) {
        updateTaskStatus(taskId, newStatus);
        taskList.appendChild(taskElement);
    }
}

// Task Management Functions with Firebase
async function addTask(taskData) {
    try {
        if (!auth.currentUser) {
            console.error("Kullanıcı oturumu bulunamadı");
            return;
        }
        
        const task = {
            title: taskData.title,
            description: taskData.description || '',
            status: 'todo',
            priority: taskData.priority || 'low',
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
            tags: taskData.tags || [],
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'tasks'), task);
        
        // Firestore listener tasks dizisini güncelleyecek
        // UI otomatik güncellenecek
    } catch (error) {
        console.error("Görev eklenirken hata oluştu:", error);
        alert("Görev eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
}

async function updateTask(taskId, updatedData) {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            ...updatedData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Görev güncellenirken hata:", error);
        alert("Görev güncellenirken bir hata oluştu.");
    }
}

async function deleteTask(taskId) {
    try {
        if (confirm("Bu görevi silmek istediğinize emin misiniz?")) {
            const taskRef = doc(db, 'tasks', taskId);
            await deleteDoc(taskRef);
        }
    } catch (error) {
        console.error("Görev silinirken hata:", error);
        alert("Görev silinirken bir hata oluştu.");
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Görev durumu güncellenirken hata:", error);
    }
}

// Firebase'den görevleri dinleme
function listenToTasks() {
    if (!auth.currentUser) return;
    
    const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', auth.currentUser.uid)
    );
    
    // Realtime update listener
    return onSnapshot(tasksQuery, (snapshot) => {
        // Mevcut görevleri temizle
        document.getElementById('todoTasks').innerHTML = '';
        document.getElementById('inProgressTasks').innerHTML = '';
        document.getElementById('doneTasks').innerHTML = '';
        
        snapshot.docs.forEach(doc => {
            const task = { id: doc.id, ...doc.data() };
            const taskElement = createTaskElement(task);
            
            // İlgili kolona ekle
            if (task.status === 'todo') {
                document.getElementById('todoTasks').appendChild(taskElement);
            } else if (task.status === 'in-progress') {
                document.getElementById('inProgressTasks').appendChild(taskElement);
            } else if (task.status === 'completed') {
                document.getElementById('doneTasks').appendChild(taskElement);
            }
        });
    });
}

// Task Modal İşlemleri
function openEditTaskModal(task) {
    const modal = document.getElementById('taskModal');
    const titleElement = modal.querySelector('#taskTitle');
    const descriptionElement = modal.querySelector('#taskDescription');
    const priorityElement = modal.querySelector('#taskPriority');
    const dueDateElement = modal.querySelector('#taskDueDate');
    const tagsElement = modal.querySelector('#taskTags');
    
    // Modal başlığını güncelle
    modal.querySelector('.modal-header h2').textContent = 'Görevi Düzenle';
    
    // Form alanlarını doldur
    titleElement.value = task.title;
    descriptionElement.value = task.description || '';
    priorityElement.value = task.priority;
    
    if (task.dueDate) {
        const date = new Date(task.dueDate.seconds * 1000);
        dueDateElement.value = date.toISOString().split('T')[0];
    } else {
        dueDateElement.value = '';
    }
    
    tagsElement.value = task.tags ? task.tags.join(', ') : '';
    
    // Form gönderme işlemini özelleştir
    const form = modal.querySelector('#taskForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const updatedTask = {
            title: titleElement.value,
            description: descriptionElement.value,
            priority: priorityElement.value,
            dueDate: dueDateElement.value ? new Date(dueDateElement.value) : null,
            tags: tagsElement.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        await updateTask(task.id, updatedTask);
        closeModal('taskModal');
    };
    
    // Modal'ı aç
    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Form varsa sıfırla
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Yeni Görev Ekleme Modal İşlemleri
function setupNewTaskModal() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const closeButton = modal.querySelector('.close-button');
    const cancelButton = modal.querySelector('.secondary-button');
    
    // Yeni görev butonuna tıklandığında
    addTaskBtn.addEventListener('click', () => {
        // Modal başlığını güncelle
        modal.querySelector('.modal-header h2').textContent = 'Yeni Görev';
        
        // Form gönderme işlemini özelleştir
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const titleElement = modal.querySelector('#taskTitle');
            const descriptionElement = modal.querySelector('#taskDescription');
            const priorityElement = modal.querySelector('#taskPriority');
            const dueDateElement = modal.querySelector('#taskDueDate');
            const tagsElement = modal.querySelector('#taskTags');
            
            const taskData = {
                title: titleElement.value,
                description: descriptionElement.value,
                priority: priorityElement.value,
                dueDate: dueDateElement.value ? new Date(dueDateElement.value) : null,
                tags: tagsElement.value ? tagsElement.value.split(',').map(tag => tag.trim()).filter(tag => tag) : []
            };
            
            await addTask(taskData);
            closeModal('taskModal');
        };
        
        // Modal'ı aç
        modal.style.display = 'block';
    });
    
    // Kapatma düğmesi işlevleri
    closeButton.addEventListener('click', () => closeModal('taskModal'));
    cancelButton.addEventListener('click', () => closeModal('taskModal'));
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('taskModal');
        }
    });
}

// Initialize Kanban Board
function initializeKanbanBoard() {
    // Set up drag and drop listeners for task lists
    document.querySelectorAll('.task-list').forEach(taskList => {
        taskList.addEventListener('dragover', handleDragOver);
        taskList.addEventListener('dragleave', handleDragLeave);
        taskList.addEventListener('drop', handleDrop);
    });
    
    // Firebase Auth durumunu dinle ve görevleri yükle
    auth.onAuthStateChanged(user => {
        if (user) {
            listenToTasks();
            setupNewTaskModal();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeKanbanBoard); 