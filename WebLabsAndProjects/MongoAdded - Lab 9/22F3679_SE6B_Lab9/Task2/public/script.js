const form = document.getElementById('productForm');
const table = document.getElementById('productTable');
const cancelEdit = document.getElementById('cancelEdit');
let editingId = null;

async function loadProducts() {
    const res = await fetch('http://localhost:3000/api/products');
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

// ... (previous code remains the same until the form submit handler)

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form elements
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

    try {
        const name = document.getElementById('name').value;
        const category = document.getElementById('category').value;
        const price = parseFloat(document.getElementById('price').value);
        const description = document.getElementById('description').value;

        // Validate inputs
        if (!name || !category || isNaN(price) || !description) {
            throw new Error('Please fill all fields correctly');
        }

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `http://localhost:3000/api/products/${editingId}` : 'http://localhost:3000/api/products';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, price, description })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Operation failed');
        }

        const data = await response.json();
        console.log('Operation successful:', data);

        // Reset form and reload products
        form.reset();
        cancelEdit.style.display = 'none';
        editingId = null;
        await loadProducts();

        // Show success message (you could add this to your HTML)
        alert(editingId ? 'Product updated successfully!' : 'Product added successfully!');

    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

// ... (rest of the code remains the same)

cancelEdit.addEventListener('click', () => {
    form.reset();
    cancelEdit.style.display = 'none';
    editingId = null;
});

table.addEventListener('click', async (e) => {
    const id = e.target.closest('tr')?.dataset.id;
    if (!id) return;
    if (e.target.classList.contains('edit-btn')) {
        const res = await fetch(`http://localhost:3000/api/products/${id}`);
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
        await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
        loadProducts();
    }
});

loadProducts();