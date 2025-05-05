// Kanban Board State Management
let tasks = {
    todo: [],
    inProgress: [],
    done: []
};

// Task Template
const createTaskElement = (task) => {
    const taskElement = document.createElement('div');
    taskElement.className = `task-card priority-${task.priority}`;
    taskElement.draggable = true;
    taskElement.dataset.taskId = task.id;
    
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
        <p class="task-description">${task.description}</p>
        <div class="task-metadata">
            <div class="task-tags">
                ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <span class="task-due-date">
                <i class="far fa-calendar"></i>
                ${task.dueDate}
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
    const newStatus = taskList.dataset.status;
    
    if (taskElement && newStatus) {
        const task = findTaskById(taskId);
        if (task) {
            updateTaskStatus(task, newStatus);
            taskList.appendChild(taskElement);
        }
    }
}

// Task Management Functions
function addTask(taskData) {
    const task = {
        id: Date.now().toString(),
        status: 'todo',
        ...taskData
    };
    
    tasks[task.status].push(task);
    const taskElement = createTaskElement(task);
    document.querySelector(`[data-status="${task.status}"]`).appendChild(taskElement);
    saveTasksToLocalStorage();
}

function updateTask(taskId, updatedData) {
    const task = findTaskById(taskId);
    if (task) {
        Object.assign(task, updatedData);
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            const newTaskElement = createTaskElement(task);
            taskElement.replaceWith(newTaskElement);
        }
        saveTasksToLocalStorage();
    }
}

function deleteTask(taskId) {
    const task = findTaskById(taskId);
    if (task) {
        tasks[task.status] = tasks[task.status].filter(t => t.id !== taskId);
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }
        saveTasksToLocalStorage();
    }
}

function updateTaskStatus(task, newStatus) {
    if (task && tasks[task.status]) {
        tasks[task.status] = tasks[task.status].filter(t => t.id !== task.id);
        task.status = newStatus;
        tasks[newStatus].push(task);
        saveTasksToLocalStorage();
    }
}

// Helper Functions
function findTaskById(taskId) {
    for (const status in tasks) {
        const task = tasks[status].find(t => t.id === taskId);
        if (task) return task;
    }
    return null;
}

// Local Storage Management
function saveTasksToLocalStorage() {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('kanbanTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderAllTasks();
    }
}

function renderAllTasks() {
    // Clear existing tasks
    document.querySelectorAll('.task-list').forEach(list => {
        list.innerHTML = '';
    });
    
    // Render tasks for each status
    for (const status in tasks) {
        const taskList = document.querySelector(`[data-status="${status}"]`);
        if (taskList) {
            tasks[status].forEach(task => {
                taskList.appendChild(createTaskElement(task));
            });
        }
    }
}

// Initialize Kanban Board
function initializeKanbanBoard() {
    // Set up drag and drop listeners for task lists
    document.querySelectorAll('.task-list').forEach(taskList => {
        taskList.addEventListener('dragover', handleDragOver);
        taskList.addEventListener('dragleave', handleDragLeave);
        taskList.addEventListener('drop', handleDrop);
    });
    
    // Load saved tasks
    loadTasksFromLocalStorage();
    
    // Initialize new task form
    const newTaskForm = document.getElementById('newTaskForm');
    if (newTaskForm) {
        newTaskForm.addEventListener('submit', handleNewTaskSubmit);
    }
}

// Form Handlers
function handleNewTaskSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        dueDate: formData.get('dueDate'),
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'todo'
    };
    
    addTask(taskData);
    closeModal('newTaskModal');
    e.target.reset();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeKanbanBoard); 