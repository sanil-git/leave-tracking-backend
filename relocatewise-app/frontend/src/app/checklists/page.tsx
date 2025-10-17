'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square,
  ChevronDown,
  ChevronUp,
  GripVertical,
  FileText,
  Package,
  Wrench,
  Home,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface Category {
  id: string;
  title: string;
  iconName: string;
  color: string;
  tasks: Task[];
  expanded: boolean;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'documents',
    title: 'Important Documents',
    iconName: 'FileText',
    color: 'bg-blue-50',
    expanded: true,
    tasks: [
      { id: '1', text: 'Passport copies', completed: false, priority: 'high' },
      { id: '2', text: 'Medical records', completed: false, priority: 'high' },
      { id: '3', text: 'Insurance docs', completed: false, priority: 'medium' },
      { id: '4', text: 'Transfer certificates', completed: false, priority: 'medium' }
    ]
  },
  {
    id: 'packing',
    title: 'Packing Essentials',
    iconName: 'Package',
    color: 'bg-green-50',
    expanded: true,
    tasks: [
      { id: '5', text: 'Clothes', completed: false, priority: 'high' },
      { id: '6', text: 'Electronics', completed: false, priority: 'high' },
      { id: '7', text: 'Kitchen kit', completed: false, priority: 'medium' },
      { id: '8', text: 'Sentimental items', completed: false, priority: 'low' }
    ]
  },
  {
    id: 'utilities',
    title: 'Utilities & Services',
    iconName: 'Wrench',
    color: 'bg-orange-50',
    expanded: true,
    tasks: [
      { id: '9', text: 'Cancel old utilities', completed: false, priority: 'high' },
      { id: '10', text: 'Set up new ones', completed: false, priority: 'high' },
      { id: '11', text: 'Update bank address', completed: false, priority: 'medium' }
    ]
  },
  {
    id: 'housing',
    title: 'Housing Setup',
    iconName: 'Home',
    color: 'bg-purple-50',
    expanded: true,
    tasks: [
      { id: '12', text: 'Find apartment', completed: false, priority: 'high' },
      { id: '13', text: 'Sign lease', completed: false, priority: 'high' },
      { id: '14', text: 'Hire movers', completed: false, priority: 'medium' },
      { id: '15', text: 'Change mailing address', completed: false, priority: 'medium' }
    ]
  }
];

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    FileText,
    Package,
    Wrench,
    Home
  };
  return icons[iconName] || FileText;
};

export default function ChecklistsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Load from localStorage
    const saved = localStorage.getItem('relocatewise_checklist');
    if (saved) {
      setCategories(JSON.parse(saved));
    }
  }, [user, loading, router]);

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('relocatewise_checklist', JSON.stringify(newCategories));
  };

  const getOverallProgress = () => {
    const allTasks = categories.flatMap(cat => cat.tasks);
    const completed = allTasks.filter(task => task.completed).length;
    return allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;
  };

  const getCategoryProgress = (category: Category) => {
    const completed = category.tasks.filter(task => task.completed).length;
    return category.tasks.length > 0 ? Math.round((completed / category.tasks.length) * 100) : 0;
  };

  const toggleCategory = (categoryId: string) => {
    const updated = categories.map(cat => 
      cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
    );
    saveCategories(updated);
  };

  const toggleTask = (categoryId: string, taskId: string) => {
    const updated = categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            tasks: cat.tasks.map(task => 
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : cat
    );
    saveCategories(updated);
  };

  const addTask = (categoryId: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: 'New task',
      completed: false,
      priority: 'medium'
    };
    
    const updated = categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, tasks: [...cat.tasks, newTask] }
        : cat
    );
    saveCategories(updated);
    
    // Start editing the new task
    setEditingTask(newTask.id);
    setEditingText('New task');
  };

  const deleteTask = (categoryId: string, taskId: string) => {
    const updated = categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, tasks: cat.tasks.filter(task => task.id !== taskId) }
        : cat
    );
    saveCategories(updated);
  };

  const deleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this entire category? This action cannot be undone.')) {
      const updated = categories.filter(cat => cat.id !== categoryId);
      saveCategories(updated);
    }
  };

  const startEditing = (taskId: string, currentText: string) => {
    setEditingTask(taskId);
    setEditingText(currentText);
  };

  const saveEdit = (categoryId: string, taskId: string) => {
    if (!editingText.trim()) return;
    
    const updated = categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            tasks: cat.tasks.map(task => 
              task.id === taskId ? { ...task, text: editingText.trim() } : task
            )
          }
        : cat
    );
    saveCategories(updated);
    setEditingTask(null);
    setEditingText('');
  };

  const updatePriority = (categoryId: string, taskId: string, priority: 'high' | 'medium' | 'low') => {
    const updated = categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            tasks: cat.tasks.map(task => 
              task.id === taskId ? { ...task, priority } : task
            )
          }
        : cat
    );
    saveCategories(updated);
  };

  const moveTask = (fromCategoryId: string, toCategoryId: string, taskId: string) => {
    if (fromCategoryId === toCategoryId) return;
    
    const taskToMove = categories
      .find(cat => cat.id === fromCategoryId)
      ?.tasks.find(task => task.id === taskId);
    
    if (!taskToMove) return;
    
    const updated = categories.map(cat => {
      if (cat.id === fromCategoryId) {
        return { ...cat, tasks: cat.tasks.filter(task => task.id !== taskId) };
      } else if (cat.id === toCategoryId) {
        return { ...cat, tasks: [...cat.tasks, taskToMove] };
      }
      return cat;
    });
    saveCategories(updated);
  };

  const resetToDefaults = () => {
    if (window.confirm('This will restore all default checklist items. Any custom tasks you\'ve added will be lost. Continue?')) {
      setCategories(INITIAL_CATEGORIES);
      localStorage.setItem('relocatewise_checklist', JSON.stringify(INITIAL_CATEGORIES));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const overallProgress = getOverallProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Relocation Checklist</h1>
                <p className="text-gray-500">Stay organized with your moving tasks.</p>
              </div>
            </div>
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Overall Progress */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {overallProgress}% completed
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.iconName);
            const progress = getCategoryProgress(category);
            
            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm">
                {/* Category Header */}
                <div className={`p-6 ${category.color} rounded-t-2xl`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{category.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 bg-white/60 px-2 py-1 rounded-full">
                            {progress}%
                          </span>
                          {category.expanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="ml-3 p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      title="Delete entire category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category Content */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  category.expanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-6">
                    {/* Tasks */}
                    <div className="space-y-4">
                      {category.tasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedTask(task.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedTask && draggedTask !== task.id) {
                              const sourceCategory = categories.find(cat => 
                                cat.tasks.some(t => t.id === draggedTask)
                              );
                              if (sourceCategory) {
                                moveTask(sourceCategory.id, category.id, draggedTask);
                              }
                            }
                            setDraggedTask(null);
                          }}
                          className={`group flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            task.completed 
                              ? 'bg-gray-50 border-gray-200' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          } ${draggedTask === task.id ? 'opacity-50' : ''}`}
                        >
                          {/* Drag Handle */}
                          <div className="cursor-move text-gray-400 hover:text-gray-600">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(category.id, task.id)}
                            className="flex-shrink-0"
                          >
                            {task.completed ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>

                          {/* Task Text */}
                          <div className="flex-1 min-w-0">
                            {editingTask === task.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      saveEdit(category.id, task.id);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingTask(null);
                                      setEditingText('');
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => saveEdit(category.id, task.id)}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className={`text-sm ${
                                  task.completed 
                                    ? 'line-through text-gray-500' 
                                    : 'text-gray-800'
                                }`}>
                                  {task.text}
                                </span>
                                <button
                                  onClick={() => {
                                    const priorities = ['high', 'medium', 'low'] as const;
                                    const currentIndex = priorities.indexOf(task.priority);
                                    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
                                    updatePriority(category.id, task.id, nextPriority);
                                  }}
                                  className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} hover:scale-125 transition-transform cursor-pointer`}
                                  title={`Priority: ${task.priority}. Click to change.`}
                                />
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(task.id, task.text)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-600"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTask(category.id, task.id)}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Task Button */}
                    <button
                      onClick={() => addTask(category.id)}
                      className="mt-6 text-indigo-600 hover:underline text-sm font-medium"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}