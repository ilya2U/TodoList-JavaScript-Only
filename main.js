const addButton = document.querySelector('.add-button');  
const addTaskModal = document.querySelector('.add-task-modal');           
const closeModalButton = document.querySelector('.task-add-close-btn'); 
const applyButton = document.querySelector('.task-add-apply-btn');
const addInput = document.querySelector('.add-input');
const todoListContainer = document.querySelector('.todo-list'); 
const searchInput = document.querySelector('.search-input');
const filterSelect = document.querySelector('.filter-select-todos');
const deleteAllBtn = document.querySelector('.delete-icon');
const themeSwitcher = document.querySelector('.switch-theme');
const swithThemeIcon = document.querySelector('.icon-theme');
const todoCounter = document.querySelector('.counter-todo-items')
let isDarkTheme = JSON.parse(localStorage.getItem('DarkTheme')) || true;
const todoList = JSON.parse(localStorage.getItem('todos')) || []; 

// рендер при перезагрузке
document.addEventListener('DOMContentLoaded', () => {
    isDarkTheme = JSON.parse(localStorage.getItem('DarkTheme'));
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        swithThemeIcon.src = '/public/icons/dark-theme-icon.svg';
    } else {
        document.body.classList.remove('dark-theme');
        swithThemeIcon.src = '/public/icons/light-theme-icon.svg';
    }
    appearanceTodoCounter();
    renderTodoList();
    updateTaskCounters(todoList);
});
// Открытие модального окна при клике на кнопку
addButton.addEventListener('click', () => {
    addTaskModal.classList.add('active');
    addInput.focus();
});

closeModalButton.addEventListener('click', () => {
    addTaskModal.classList.remove('active'); 
    addInput.value = ''; 
    addInput.placeholder = "Input your note..."
});

window.addEventListener('click', (event) => {
    if (event.target === addTaskModal) {
        addInput.value = '';
        addInput.placeholder = "Input your note..."
        addTaskModal.classList.remove('active');  
    }
});

applyButton.addEventListener('click', () => {
    addTodo();
     addInput.placeholder = "Input your note..."
});

addInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && addTaskModal.classList.contains('active')) {
        addTodo();
    }
});

searchInput.addEventListener('input', () => {
    renderTodoList();  
});

filterSelect.addEventListener('change', () => {
    renderTodoList(); 
});

function addTodo() {
    const value = addInput.value.trim();
    let errorSpan = document.querySelector('.input-error-message');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.classList.add('input-error-message');
        addInput.insertAdjacentElement('afterend', errorSpan);
    }
    if (value.length < 3) { 
        addInput.classList.add('input-error'); 
        errorSpan.textContent = 'Input must contain more than three characters.';
        errorSpan.style.display = 'block'; 
        return; 
    }
    addInput.classList.remove('input-error');
    errorSpan.style.display = 'none'; 

    if (value) {
        const newTodo = {
            id: Date.now(), 
            text: value,
            done: false
        };

        todoList.push(newTodo);
        updateCurrentTaskList(todoList);
        updateAllTasksList(newTodo); 

        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');
        todoItem.setAttribute('data-id', newTodo.id);

        const todoText = document.createElement('span');
        const todoIndex = todoList.length - 1; 
        todoText.classList.add('todo-item-active');
        todoText.textContent = `${value} #${todoIndex + 1}`;

        const checkerTodoStatus = document.createElement('input');
        checkerTodoStatus.type = 'checkbox';
        checkerTodoStatus.classList.add('check-todo-status');
        checkerTodoStatus.addEventListener('change', () => toggleTodo(newTodo.id));

        const todoItemBorderLine = document.createElement('div');
        todoItemBorderLine.classList.add('todo-item-border-purple-line');

        const todoIconContainer = document.createElement('div');
        todoIconContainer.classList.add('todo-icons-container');

        const editTodoIcon = document.createElement('img');
        editTodoIcon.src = '/public/icons/edit-todo-icon.svg';
        editTodoIcon.classList.add('edit-todo-icon');
        editTodoIcon.addEventListener('click', () => handleEditTask(newTodo, todoList.length - 1));

        const deleteTodoIcon = document.createElement('img');
        deleteTodoIcon.src = '/public/icons/delete-todo-icon.svg';
        deleteTodoIcon.classList.add('delete-todo-icon');
        deleteTodoIcon.addEventListener('click', () => deleteTodoItem(newTodo.id));

        todoIconContainer.appendChild(editTodoIcon);
        todoIconContainer.appendChild(deleteTodoIcon);

        todoItem.appendChild(checkerTodoStatus);
        todoItem.appendChild(todoText);
        todoItem.appendChild(todoIconContainer);
        todoListContainer.appendChild(todoItem);
        todoListContainer.appendChild(todoItemBorderLine);

        const emptyTodoList = document.querySelector('.empty-todo-list');
        if (emptyTodoList) {
            emptyTodoList.style.display = 'none';
        }

        addInput.value = '';
        addTaskModal.classList.remove('active');
        updateTaskCounters(todoList); 
        appearanceTodoCounter(); 
    }
}

function renderTodoList() {
    console.log('render((((');
    todoListContainer.innerHTML = '';
    const filter = filterSelect.value;  
    const searchText = searchInput.value.toLowerCase();  
    const emptyTodoList = document.querySelector('.empty-todo-list');
    if(!todoList.length) {
        emptyTodoList.style.display = 'block';
        return;  
    } else {
        emptyTodoList.style.display = 'none';
    }

    todoList
        .filter(todo => {
            if (filter === 'completed') return todo.done;
            if (filter === 'active') return !todo.done;
            return true;
        })
        .filter(todo => todo.text.toLowerCase().includes(searchText))
        .forEach((todo, index) => {
            const todoItem = document.createElement('div');
            todoItem.classList.add('todo-item');
            todoItem.setAttribute('data-id', todo.id);

            const todoText = document.createElement('span');
            todoText.classList.add(todo.done ? 'todo-item-done' : 'todo-item-active');
            todoText.textContent = `${todo.text} #${index + 1}`;

            const checkerTodoStatus = document.createElement('input');
            checkerTodoStatus.type = 'checkbox';
            checkerTodoStatus.checked = todo.done;
            checkerTodoStatus.classList.add('check-todo-status');
            checkerTodoStatus.addEventListener('change', () => toggleTodo(todo.id));

            const todoIconContainer = document.createElement('div');
            todoIconContainer.classList.add('todo-icons-container');

            const editTodoIcon = document.createElement('img');
            editTodoIcon.src = '/public/icons/edit-todo-icon.svg';
            editTodoIcon.classList.add('edit-todo-icon');
            editTodoIcon.addEventListener('click', () => handleEditTask(todo, index));

            const deleteTodoIcon = document.createElement('img');
            deleteTodoIcon.src = '/public/icons/delete-todo-icon.svg';
            deleteTodoIcon.classList.add('delete-todo-icon');
            deleteTodoIcon.addEventListener('click', () => deleteTodoItem(todo.id));

            const todoItemBorderLine = document.createElement('div');
            todoItemBorderLine.classList.add('todo-item-border-purple-line');

            todoIconContainer.appendChild(editTodoIcon);
            todoIconContainer.appendChild(deleteTodoIcon);

            todoItem.appendChild(checkerTodoStatus);
            todoItem.appendChild(todoText);
            todoItem.appendChild(todoIconContainer);
            todoListContainer.appendChild(todoItem);
            todoListContainer.appendChild(todoItemBorderLine);
        });
}

function toggleTodo(id) {
    const todo = todoList.find(t => t.id === id);
    if (todo) {
        todo.done = !todo.done;
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        const todoText = todoItem.querySelector('span');
        todoText.classList.toggle('todo-item-done');
        todoText.classList.toggle('todo-item-active');
        todoItem.querySelector('.check-todo-status').checked = todo.done;
        updateCurrentTaskList(todoList);
        updateTaskCounters(todoList);
    }
}

function deleteTodoItem(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        const borderLine = todoItem.nextElementSibling;
        if (borderLine && borderLine.classList.contains('todo-item-border-purple-line')) {
            todoListContainer.removeChild(borderLine);
        }
        todoListContainer.removeChild(todoItem); 
        const indexToDelete = todoList.findIndex(todo => todo.id === id);
        const itemForDelete = todoList[indexToDelete];
        todoList.splice(indexToDelete, 1);  
        deleteOneTask(itemForDelete); 
        updateCurrentTaskList(todoList); 
        updateTaskCounters(todoList); 
        appearanceTodoCounter(); 
        const emptyTodoList = document.querySelector('.empty-todo-list');
        if (emptyTodoList && !todoList.length) {
            emptyTodoList.style.display = 'block';
        }
    }
}

function handleEditTask(todo) {
    const todoItem = document.querySelector(`[data-id="${todo.id}"]`);
    const textElement = todoItem.querySelector('span'); 
    const editIcon = todoItem.querySelector('.edit-todo-icon');
    const deleteIcon = todoItem.querySelector('.delete-todo-icon');
    editIcon.style.display = 'none';
    deleteIcon.style.display = 'none';

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = todo.text;
    editInput.classList.add('edit-task-input');

    const editContainer = document.createElement('div');
    editContainer.classList.add('edit-task-input-container');
    editContainer.appendChild(editInput);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-button');
    saveButton.addEventListener('click', () => saveTodoText(todo.id, editInput.value));

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-button');
    cancelButton.addEventListener('click', () => {
        const errorSpan = editContainer.querySelector('.edit-error-message');
        if (errorSpan) {
            errorSpan.remove();
        }
        todoItem.replaceChild(textElement, editContainer);
        saveButton.remove();
        cancelButton.remove();
        editIcon.style.display = 'block';
        deleteIcon.style.display = 'block';
    });

    todoItem.replaceChild(editContainer, textElement);
    todoItem.appendChild(saveButton); 
    todoItem.appendChild(cancelButton);
    editInput.focus();
}

function saveTodoText(id, newText) {
    const todo = todoList.find(t => t.id === id);
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const editInput = todoItem.querySelector('.edit-task-input');
    const editContainer = todoItem.querySelector('.edit-task-input-container');
    
    let errorSpan = editContainer.querySelector('.edit-error-message');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.classList.add('edit-error-message');
        editContainer.appendChild(errorSpan);
    }

    if (newText.trim().length < 3) {
        editInput.classList.add('input-error');
        errorSpan.textContent = 'Task must contain more than three characters.';
        return;
    }

    editInput.classList.remove('input-error');
    errorSpan.textContent = '';

    if (todo) {
        todo.text = newText;
        const todoText = document.createElement('span');
        const todoIndex = todoList.findIndex(t => t.id === id);
        todoText.textContent = `${newText} #${todoIndex + 1}`;
        todoText.classList.add(todo.done ? 'todo-item-done' : 'todo-item-active');

        const editIcon = todoItem.querySelector('.edit-todo-icon');
        const deleteIcon = todoItem.querySelector('.delete-todo-icon');
        editIcon.style.display = 'block';
        deleteIcon.style.display = 'block';

        todoItem.replaceChild(todoText, editContainer);

        todoItem.querySelector('.save-button').remove();
        todoItem.querySelector('.cancel-button').remove();

        updateCurrentTaskList(todoList);
    }
}

function updateCurrentTaskList(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function updateAllTasksList(todos) {
    const currentAllTodos = JSON.parse(localStorage.getItem('allTodos')) || [];
    currentAllTodos.unshift(todos); 
    localStorage.setItem('allTodos', JSON.stringify(currentAllTodos));
}

function deleteAllCurrentTasks(todos) {
    let deletedTodos = JSON.parse(localStorage.getItem('deletedTodos')) || [];
    deletedTodos = [...todos, ...deletedTodos]
    localStorage.setItem('deletedTodos', JSON.stringify(deletedTodos));
    updateCurrentTaskList([])
}

function deleteOneTask(todos) {
    const deletedTodos = JSON.parse(localStorage.getItem('deletedTodos')) || [];
    deletedTodos.unshift(todos);
    localStorage.setItem('deletedTodos', JSON.stringify(deletedTodos));
    updateCurrentTaskList([])
}

function updateTaskCounters(todos) {
    const taskStatisticts = document.querySelector('.task-statisticts');
    const totalQuantityTasks = todos.length;
    const currentQuantityActiveTasks = todos.filter(t => !t.done).length;
    const currentQuantityCompleteTasks = todos.filter(t => t.done).length;
    document.querySelector('.task-statisticts-total').textContent = `Общее количество задач: ${totalQuantityTasks}`;
    document.querySelector('.task-statisticts-active').textContent = `Активные задачи: ${currentQuantityActiveTasks}`;
    document.querySelector('.task-statisticts-completed').textContent = `Выполненые задачи: ${currentQuantityCompleteTasks}`;

    if (totalQuantityTasks > 0) {
        if (taskStatisticts.classList.contains('task-statisticts-hidden')) {
            taskStatisticts.classList.remove('task-statisticts-hidden');
        }
        taskStatisticts.classList.add('task-statisticts-slide-in');
        taskStatisticts.classList.remove('task-statisticts-slide-out');
    } else {
        taskStatisticts.classList.add('task-statisticts-slide-out');
        taskStatisticts.classList.remove('task-statisticts-slide-in');
        setTimeout(() => {
            taskStatisticts.classList.add('task-statisticts-hidden');
        }, 500);
    }
}

themeSwitcher.addEventListener('click', () => {
    if (isDarkTheme) {
        document.body.classList.remove('dark-theme'); 
        swithThemeIcon.src = '/public/icons/light-theme-icon.svg';
    } else {
        document.body.classList.add('dark-theme'); 
        swithThemeIcon.src = '/public/icons/dark-theme-icon.svg'; 
    }
    isDarkTheme = !isDarkTheme; 
    localStorage.setItem('DarkTheme', JSON.stringify(isDarkTheme))
});

function appearanceTodoCounter() {
    if (todoList.length === 0) {
        todoCounter.style.opacity = '0';
    } else {
        todoCounter.textContent = todoList.length
        todoCounter.style.opacity = '1';
        todoCounter.style.display = 'flex'; 
        todoCounter.classList.add('counter-todo-items-animation');
        setTimeout(() => {
            todoCounter.classList.remove('counter-todo-items-animation');
        }, 500);
    }
}

deleteAllBtn.addEventListener('click', () => {
    if (!todoList.length) {
        searchInput.classList.add('search-input-shake');
        setTimeout(() => {
            searchInput.classList.remove('search-input-shake');
        }, 3000);
        return;
    }
    else {
        overlayDeleteTasksModal.style.display = 'block';
        deleteAllTasksModal.style.display = 'block';
    }
});

const deleteAllTasksModal = document.querySelector('.delete-all-tasks-modal')
const cancelDeleteAllTodos = document.querySelector('.delete-all-tasks-modal-close-btn');
const applyDeleteAllTodos = document.querySelector('.delete-all-tasks-modal-apply-btn');
const overlayDeleteTasksModal = document.querySelector('.delete-all-tasks-modal-overlay');

cancelDeleteAllTodos.addEventListener('click', () => {
    overlayDeleteTasksModal.style.display = 'none';
    deleteAllTasksModal.style.display = 'none';
})

applyDeleteAllTodos.addEventListener('click', () => {
    while (todoListContainer.firstChild) {
        todoListContainer.removeChild(todoListContainer.firstChild);
    }
    deleteAllCurrentTasks(todoList);
    todoList.length = 0;
    updateTaskCounters(todoList);
    const emptyTodoList = document.querySelector('.empty-todo-list');
    if (emptyTodoList) {
        emptyTodoList.style.display = 'block';
    }
    appearanceTodoCounter();
    deleteAllTasksModal.style.display = 'none';
    overlayDeleteTasksModal.style.display = 'none';
})

overlayDeleteTasksModal.addEventListener('click', () => {
    overlayDeleteTasksModal.style.display = 'none';
    deleteAllTasksModal.style.display = 'none';
});