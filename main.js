  class Task {
  constructor(id, title, description, completed) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.completed = completed;
  }
}

class SubTask extends Task {
  constructor(id, title, description, completed, parentId) {
    super(id, title, description, completed);
    this.parentId = parentId;
  }
}

class TaskManager {
  constructor() {
    this.tasks = [];
    this.fetchTasksFromAPI();
  }

  async fetchTasksFromAPI() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const tasksFromAPI = await response.json();
      this.tasks = tasksFromAPI.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        completed: task.completed,
        parentId: task.parentId || null,
      }));
      this.updateTaskList();
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  addTask(title, description, isSubTask, parentTaskId) {
    const newTask = isSubTask
        ? new SubTask(
            this.tasks.length + 1,
            title,
            description || '',
            false,
            parentTaskId
        )
        : new Task(
            this.tasks.length + 1,
            title,
            description || '',
            false
        );

    if (isSubTask) {
      const parentTask = this.tasks.find(task => task.id === parentTaskId);
      if (parentTask) {
        parentTask.subTasks = parentTask.subTasks || [];
        parentTask.subTasks.push(newTask);
      } else {
        console.error('Parent task not found.');
        return;
      }
    } else {
      this.tasks.push(newTask);
    }

    this.updateTaskList();
  }

  listTasks() {
    return this.tasks;
  }

  async markTaskComplete(taskId) {
    try {
      const task = this.tasks.find(t => t.id === taskId);

      if (task) {
        task.completed = true;
        if (task.subTasks && task.subTasks.length > 0) {
          task.subTasks.forEach(subTask => {
            subTask.completed = true;
          });
        }
        this.updateTaskList();
        return 'Task marked as completed.';
      } else {
        throw new Error('Task not found.');
      }
    } catch (error) {
      console.error('Error marking task as complete:', error);
      throw error;
    }
  }

  updateTaskList() {
    const taskListElement = document.getElementById('taskList');
    taskListElement.innerHTML = '';

    this.tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.classList.add('taskItem');

      const taskIdElement = document.createElement('span');
      taskIdElement.textContent = `ID: ${task.id} - `;
      taskElement.appendChild(taskIdElement);

      const taskTitleElement = document.createElement('span');
      taskTitleElement.textContent = task.title;

      const completeButton = document.createElement('button');
      completeButton.textContent = 'Mark completed';
      completeButton.classList.add('completeButton');
      completeButton.addEventListener('click', () => this.markTaskComplete(task.id));

      taskElement.appendChild(taskTitleElement);
      taskElement.appendChild(completeButton);

      if (task.completed) {
        taskElement.classList.add('completedTask');
        completeButton.disabled = true;
      }

      taskListElement.appendChild(taskElement);
    });
  }
}

// Erstellen einer Instanz von TaskManager
const taskManager = new TaskManager();

// Funktion zum Abrufen der Werte aus den Eingabefeldern im HTML-Formular
function getTaskInputValues() {
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const isSubTask = document.getElementById('isSubTask').checked;
  const parentTaskId = document.getElementById('parentTaskId').value;

  return { title, description, isSubTask, parentTaskId };
}

// Function to handle the "Add Task" button click
async function addTask() {
  const { title, description, isSubTask, parentTaskId } = getTaskInputValues();
  try {
    await taskManager.addTask(title, description, isSubTask, parentTaskId);
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

// Function to handle marking a task as complete
async function markTaskComplete(taskId) {
  try {
    await taskManager.markTaskComplete(taskId);
  } catch (error) {
    console.error('Error marking task as complete:', error);
  }
}

// Function to update the parentTaskId dropdown options
function updateParentTaskDropdown() {
  const parentTaskDropdown = document.getElementById('parentTaskId');
  parentTaskDropdown.innerHTML = '';

  const tasks = taskManager.listTasks();
  tasks.forEach(task => {
    const option = document.createElement('option');
    option.value = task.id;
    option.textContent = task.title;
    parentTaskDropdown.appendChild(option);
  });
}

// Funktion zum Überprüfen der Checkbox "Is Subtask" und Anzeigen des Dropdown-Menüs
function checkSubTask() {
  const isSubTaskCheckbox = document.getElementById('isSubTask');
  const parentTaskIdField = document.getElementById('parentTaskId');

  if (isSubTaskCheckbox.checked) {
    updateParentTaskDropdown();
    parentTaskIdField.style.display = 'block';
  } else {
    parentTaskIdField.style.display = 'none';
  }
}

// Event-Listener für die Checkbox "Is Subtask"
const isSubTaskCheckbox = document.getElementById('isSubTask');
isSubTaskCheckbox.addEventListener('change', checkSubTask);

// Verbesserte Funktion zum Aktualisieren der Parent Task ID Dropdown-Optionen
function updateParentTaskDropdown() {
  const parentTaskDropdown = document.getElementById('parentTaskId');
  parentTaskDropdown.innerHTML = '';

  const tasks = taskManager.listTasks();
  tasks.forEach(task => {
    const option = document.createElement('option');
    option.value = task.id;
    option.textContent = `ID ${task.id}`;
    parentTaskDropdown.appendChild(option);
  });
}
taskManager.updateTaskList();
