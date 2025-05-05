import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTasks, createTask, updateTaskStatus, deleteTask, updateTask } from '../services/taskService';
import { getTaskSuggestions, optimizeTaskPriorities } from '../services/aiService';
import KanbanBoard from '../components/KanbanBoard';
import TaskSuggestions from '../components/TaskSuggestions';
import VoiceRecorder from '../components/VoiceRecorder';
import MeetingNotesSummarizer from '../components/MeetingNotesSummarizer';

function Tasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'voice', 'meeting'

  // Görevleri gerçek zamanlı dinleme
  useEffect(() => {
    const unsubscribe = subscribeToTasks(currentUser.uid, (updatedTasks) => {
      const sortedTasks = updatedTasks.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(sortedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // AI görev önerilerini al
  const handleGetSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const newSuggestions = await getTaskSuggestions(tasks);
      setSuggestions(newSuggestions);
    } catch (error) {
      setError('Görev önerileri alınırken bir hata oluştu: ' + error.message);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Öneriyi kabul et
  const handleAcceptSuggestion = async (suggestion) => {
    try {
      await createTask({
        title: suggestion.title,
        description: suggestion.description,
        status: 'todo',
        priority: suggestion.priority
      }, currentUser.uid);

      // Öneriyi listeden kaldır
      setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
    } catch (error) {
      setError('Öneri göreve eklenirken bir hata oluştu: ' + error.message);
    }
  };

  // Görev önceliklerini optimize et
  const handleOptimizePriorities = async () => {
    try {
      setIsOptimizing(true);
      const optimizedPriorities = await optimizeTaskPriorities(tasks);
      
      // Tüm öncelik güncellemelerini gerçekleştir
      await Promise.all(
        optimizedPriorities.map(({ taskId, priority }) =>
          updateTask(taskId, { priority })
        )
      );
    } catch (error) {
      setError('Görev öncelikleri optimize edilirken bir hata oluştu: ' + error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Yeni görev oluşturma
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      return setError('Görev başlığı boş olamaz');
    }

    try {
      setError('');
      console.log("Yeni görev oluşturuluyor...");
      
      // Status değerini doğru formatta ayarla
      await createTask({
        title: newTask.title,
        description: newTask.description,
        status: 'todo', // Her zaman 'todo' formatını kullan
        priority: newTask.priority
      }, currentUser.uid);
      
      // Görev başarıyla oluşturuldu bildirimi yap
      console.log("Görev başarıyla oluşturuldu, Kanban tahtası güncelleniyor...");
      
      // Form alanlarını temizle ve formu kapat
      setNewTask({ title: '', description: '', priority: 'medium' });
      setIsFormVisible(false);
      
      // Kanban tahtasına odaklan ve aktif sekmeyi tasks olarak ayarla
      setActiveTab('tasks');
      
      // Bildirim eklemek istersen burada ekleyebilirsin
      const element = document.querySelector('.kanban-container');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      setError('Görev oluşturulurken bir hata oluştu: ' + error.message);
    }
  };

  // Görev durumunu güncelleme
  const handleTaskMove = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      setError('Görev durumu güncellenirken bir hata oluştu: ' + error.message);
    }
  };

  // Görev silme
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        setError('Görev silinirken bir hata oluştu: ' + error.message);
      }
    }
  };

  // Ses kaydından görev oluşturma
  const handleVoiceTaskCreate = async (task) => {
    try {
      setError('');
      await createTask({
        title: task.title,
        description: task.description,
        status: 'todo',
        priority: task.priority,
      }, currentUser.uid);
      
      // Başarılı olduktan sonra kanban tablosuna dön
      setActiveTab('tasks');
    } catch (error) {
      setError('Ses kaydından görev oluşturulurken bir hata oluştu: ' + error.message);
    }
  };

  // Toplantı notlarından görevler oluşturma
  const handleMeetingTasksCreate = async (tasks) => {
    try {
      setError('');
      
      // Her bir aksiyon maddesini görev olarak ekle
      await Promise.all(
        tasks.map(task => 
          createTask({
            title: task.title,
            description: task.description,
            status: 'todo',
            priority: task.priority,
          }, currentUser.uid)
        )
      );
      
      // Başarılı olduktan sonra kanban tablosuna dön
      setActiveTab('tasks');
    } catch (error) {
      setError('Toplantı notlarından görevler oluşturulurken bir hata oluştu: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Görevler
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            type="button"
            onClick={handleGetSuggestions}
            disabled={isSuggestionsLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSuggestionsLoading ? 'Öneriler Alınıyor...' : 'AI Önerileri Al'}
          </button>
          <button
            type="button"
            onClick={handleOptimizePriorities}
            disabled={isOptimizing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isOptimizing ? 'Optimize Ediliyor...' : 'Öncelikleri Optimize Et'}
          </button>
          <button
            type="button"
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isFormVisible ? 'Formu Gizle' : 'Yeni Görev Ekle'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Sekme Kontrolü */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`${
              activeTab === 'tasks'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Kanban Tahtası
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`${
              activeTab === 'voice'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Sesli Görev Ekleme
          </button>
          <button
            onClick={() => setActiveTab('meeting')}
            className={`${
              activeTab === 'meeting'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Toplantı Notları
          </button>
        </nav>
      </div>

      {/* AI Önerileri */}
      {activeTab === 'tasks' && (
        <div className="mb-8">
          <TaskSuggestions
            suggestions={suggestions}
            onAccept={handleAcceptSuggestion}
            isLoading={isSuggestionsLoading}
          />
        </div>
      )}

      {/* Yeni görev formu */}
      {isFormVisible && activeTab === 'tasks' && (
        <form onSubmit={handleCreateTask} className="mb-8 bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Görev Başlığı
              </label>
              <input
                type="text"
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Öncelik
              </label>
              <select
                id="priority"
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Görev Ekle
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Aktif sekmeye göre içerik göster */}
      {activeTab === 'tasks' && (
        <KanbanBoard
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {activeTab === 'voice' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sesli Görev Oluşturma</h3>
          <p className="text-gray-500 mb-6">
            Görev detaylarınızı sesli olarak anlatın, yapay zeka görevinizi oluştursun.
          </p>
          <VoiceRecorder onTaskCreate={handleVoiceTaskCreate} />
        </div>
      )}

      {activeTab === 'meeting' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Toplantı Notları Özeti</h3>
          <p className="text-gray-500 mb-6">
            Toplantı notlarınızı girin, yapay zeka özetleyip aksiyon maddeleri çıkarsın.
          </p>
          <MeetingNotesSummarizer onTasksCreate={handleMeetingTasksCreate} />
        </div>
      )}
    </div>
  );
}

export default Tasks; 