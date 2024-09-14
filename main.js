const addButton = document.querySelector('.add-button');  
const modal = document.getElementById('modal');           
const closeButton = document.querySelector('.close-btn'); 
const applyButton = document.querySelector('.apply-btn');
const addInput = document.querySelector('.add-input');
const todoListContainer = document.querySelector('.todo-list'); 
const searchInput = document.querySelector('.search-input');
const filterSelect = document.querySelector('.filter-select-todos');
const deleteAllBtn = document.querySelector('.delete-icon');
const themeSwitcher = document.getElementById('themeSwitcher');
const themeIcon = document.getElementById('themeIcon');
const todoCounter = document.querySelector('.counter-todo-items')
let isDarkTheme = JSON.parse(localStorage.getItem('DarkTheme')) || true;
const todoList = JSON.parse(localStorage.getItem('todos')) || []; 
// рендер при перезагрузке
document.addEventListener('DOMContentLoaded', () => {
    isDarkTheme = JSON.parse(localStorage.getItem('DarkTheme'));
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeIcon.src = '/public/icons/dark-theme-icon.svg';
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.src = '/public/icons/light-theme-icon.svg';
    }
    renderTodoList();
    updateTaskCounters(todoList);
});
// Открытие модального окна при клике на кнопку
addButton.addEventListener('click', () => {
    modal.classList.add('active');
    addInput.focus();
});

closeButton.addEventListener('click', () => {
    modal.classList.remove('active'); 
    addInput.value = ''; 
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        addInput.value = '';
        modal.classList.remove('active');  
    }
});

applyButton.addEventListener('click', () => {
    addTodo();
    
});

addInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && modal.classList.contains('active')) {
        addTodo();
    }
});

searchInput.addEventListener('input', () => {
    renderTodoList();  
});

filterSelect.addEventListener('change', () => {
    renderTodoList(); 
});

deleteAllBtn.addEventListener('click', () => {
    if(todoList.length === 0){
        searchInput.classList.add('search-input-shake');
        setTimeout(() => {
            searchInput.classList.remove('search-input-shake');
        }, 3000);
    }
    deleteAllCurrentTasks(todoList);
    todoList.length = 0;
    renderTodoList();
    updateTaskCounters(todoList);
})

function addTodo() {
    const value = addInput.value.trim();
    if (value === '') { 
        addInput.placeholder = 'Поле не должно быть пустое'; 
        addInput.classList.add('input-error'); 
        return; 
    }
    addInput.placeholder = 'Input your note...'; 
    addInput.classList.remove('input-error');
    if (value) {
        const newTodo = {
            id: Date.now(), 
            text: value,
            done: false
        };
        todoList.unshift(newTodo);
        updateCurrentTaskList(todoList);
        updateAllTasksList(newTodo)
        addInput.value = '';
        modal.classList.remove('active');
        renderTodoList();
        updateTaskCounters(todoList)
    } else {
        alert('Please enter a task!');
    }
}

function renderTodoList() {
    todoListContainer.innerHTML = '';
    const filter = filterSelect.value;  
    const searchText = searchInput.value.toLowerCase();  
    const emptyTodoBlock = document.querySelector('.empty-todo-list-block');
    appearanceTodoCounter();
    if(todoList.length === 0) {

        emptyTodoBlock.style.display = 'block';
        return;  
    } else {
        emptyTodoBlock.style.display = 'none';
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
            editTodoIcon.addEventListener('click', () => startEditing(todo, index));

            const deleteTodoIcon = document.createElement('img');
            deleteTodoIcon.src = '/public/icons/delete-todo-icon.svg';
            deleteTodoIcon.classList.add('delete-todo-icon');
            deleteTodoIcon.addEventListener('click', () => deleteTodoItem(todo.id));

            const purpleLineItem = document.createElement('div');
            purpleLineItem.classList.add('purple-line-item');

            todoIconContainer.appendChild(editTodoIcon);
            todoIconContainer.appendChild(deleteTodoIcon);

            todoItem.appendChild(checkerTodoStatus);
            todoItem.appendChild(todoText);
            todoItem.appendChild(todoIconContainer);
            todoListContainer.appendChild(todoItem);
            todoListContainer.appendChild(purpleLineItem);
        });
}

function toggleTodo(id) {
    const todo = todoList.find(t => t.id === id);
    if (todo) {
        todo.done = !todo.done;
        renderTodoList();
        updateCurrentTaskList(todoList);
        updateTaskCounters(todoList);
    }
}

function deleteTodoItem(id) {
    const itemForDelete = todoList.find(t => t.id === id);
    todoList.splice(todoList.findIndex(todo => todo.id === id), 1);
    deleteOneTask(itemForDelete)
    updateCurrentTaskList(todoList);
    renderTodoList();
    updateTaskCounters(todoList);
}

function startEditing(todo, index) {
    const todoItem = document.querySelectorAll('.todo-item')[index]; 
    const textElement = todoItem.querySelector('span'); 
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = todo.text;
    editInput.classList.add('edit-input');

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-button');
    saveButton.addEventListener('click', () => saveTodoText(todo.id, editInput.value));

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-button');
    cancelButton.addEventListener('click', () => renderTodoList());

    todoItem.replaceChild(editInput, textElement);
    todoItem.appendChild(saveButton); 
    todoItem.appendChild(cancelButton);
    editInput.focus();
}

function saveTodoText(id, newText) {
    const todo = todoList.find(t => t.id === id);
    const editInput = document.querySelector('.edit-input');
    if (newText.trim() === '') { 
        editInput.placeholder = 'Поле не должно быть пустое'; 
        editInput.classList.add('input-error'); 
        return; 
    }
    editInput.classList.remove('input-error');
    if (todo) {
        todo.text = newText;
        renderTodoList(); 
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
    const totalQuantityTasks = todos.length;
    const currentQuantityActiveTasks = todos.filter(t => !t.done).length;
    const currentQuantityCompleteTasks = todos.filter(t => t.done).length;
    document.getElementById('total-tasks').textContent = `Общее количество задач: ${totalQuantityTasks}`;
    document.getElementById('current-task').textContent = `Активные задачи: ${currentQuantityActiveTasks}`;
    document.getElementById('deleted-tasks').textContent = `Выполненые задачи: ${currentQuantityCompleteTasks}`;
}

themeSwitcher.addEventListener('click', () => {
    if (isDarkTheme) {
        document.body.classList.remove('dark-theme'); 
        themeIcon.src = '/public/icons/light-theme-icon.svg';
    } else {
        document.body.classList.add('dark-theme'); 
        themeIcon.src = '/public/icons/dark-theme-icon.svg'; 
    }
    isDarkTheme = !isDarkTheme; 
    localStorage.setItem('DarkTheme', JSON.stringify(isDarkTheme))
});

function appearanceTodoCounter() {
    if (todoList.length === 0) {
        todoCounter.style.display = 'none';
    } else {
        todoCounter.textContent = todoList.length
        todoCounter.style.display = 'flex'; 
        todoCounter.classList.add('counter-todo-items-animation');
        setTimeout(() => {
            todoCounter.classList.remove('counter-todo-items-animation');
        }, 500);
    }
}
