const form = document.getElementById('productForm');
const table = document.getElementById('productTable');
const cancelEdit = document.getElementById('cancelEdit');
let editingId = null;

async function loadProducts() {
    const res = await fetch('/api/products');
    const products = await res.json();
    table.innerHTML = '';
    products.forEach(product => {
        table.innerHTML += `<tr data-id="${product.id}">
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price}</td>
            <td>${product.description}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-btn">Edit</button>
                <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </td>
        </tr>`;
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, price, description })
    });
    form.reset();
    cancelEdit.style.display = 'none';
    editingId = null;
    loadProducts();
});

cancelEdit.addEventListener('click', () => {
    form.reset();
    cancelEdit.style.display = 'none';
    editingId = null;
});

table.addEventListener('click', async (e) => {
    const id = e.target.closest('tr')?.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('edit-btn')) {
        const res = await fetch(`/api/products/${id}`);
        const product = await res.json();
        if (product.id) {
            document.getElementById('name').value = product.name;
            document.getElementById('category').value = product.category;
            document.getElementById('price').value = product.price;
            document.getElementById('description').value = product.description;
            editingId = id;
            cancelEdit.style.display = 'inline-block';
        }
    } else if (e.target.classList.contains('delete-btn')) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadProducts();
    }
});

loadProducts();