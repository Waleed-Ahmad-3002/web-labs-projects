const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

const loadTodos = () => {
    fetch('http://localhost:3000/api/todos')
        .then(res => res.json())
        .then(data => {
            list.innerHTML = '';
            data.forEach(todo => {
                const li = document.createElement('li');
                li.dataset.id = todo.id;
                li.className = todo.status == 1 ? 'done' : '';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = todo.status == 1;
                checkbox.addEventListener('change', () => {
                    const newStatus = checkbox.checked ? 1 : 0;
                    fetch(`http://localhost:3000/api/todos/${todo.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            description: todo.description, 
                            status: newStatus 
                        })
                    })
                    .then(() => loadTodos());
                });

                const span = document.createElement('span');
                span.textContent = todo.description;

                const editBtn = document.createElement('button');
                editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
                editBtn.addEventListener('click', () => {
                    const newDesc = prompt('Edit task', todo.description);
                    if (newDesc !== null && newDesc.trim() !== '') {
                        fetch(`http://localhost:3000/api/todos/${todo.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                description: newDesc, 
                                status: todo.status 
                            })
                        })
                        .then(() => loadTodos());
                    }
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this task?')) {
                        fetch(`http://localhost:3000/api/todos/${todo.id}`, { 
                            method: 'DELETE' 
                        })
                        .then(() => loadTodos());
                    }
                });

                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(editBtn);
                li.appendChild(deleteBtn);
                list.appendChild(li);
            });
        });
};

form.addEventListener('submit', e => {
    e.preventDefault();
    fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input.value })
    })
    .then(() => {
        input.value = '';
        loadTodos();
    })
    .catch(err => console.error('Error:', err));
});

loadTodos();