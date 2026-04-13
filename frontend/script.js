const API = 'https://shopeasy-api-vc0d.onrender.com';

let allProducts = [];
let editingId = null;

// ─────────────────────────────────────────
// ON PAGE LOAD — fetch all products
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadProducts);

async function loadProducts() {
  showLoading(true);
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (err) {
    console.error('Failed to load products:', err);
    showEmpty(true);
  } finally {
    showLoading(false);
  }
}

// ─────────────────────────────────────────
// RENDER — build product cards from array
// ─────────────────────────────────────────
function renderProducts(products) {
  const grid = document.getElementById('productGrid');

  if (products.length === 0) {
    showEmpty(true);
    grid.classList.add('hidden');
    return;
  }

  showEmpty(false);
  grid.classList.remove('hidden');

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img
        src="${p.image}"
        alt="${p.name}"
        onerror="this.src='https://placehold.co/400x200?text=No+Image'"
      />
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${Number(p.price).toLocaleString()}</div>
        <div class="product-actions">
          <button class="btn-edit" onclick="openEditModal(${p.id})">✏️ Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────
function handleSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const priceRange = document.getElementById('priceFilter').value;

  let filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query)
  );

  if (priceRange !== 'all') {
    if (priceRange === '5000+') {
      filtered = filtered.filter(p => p.price > 5000);
    } else {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }
  }

  renderProducts(filtered);
}

// ─────────────────────────────────────────
// ADD PRODUCT
// ─────────────────────────────────────────
async function addProduct(data) {
  const res = await fetch(`${API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─────────────────────────────────────────
// EDIT PRODUCT
// ─────────────────────────────────────────
async function editProduct(id, data) {
  const res = await fetch(`${API}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─────────────────────────────────────────
// DELETE PRODUCT
// ─────────────────────────────────────────
async function deleteProduct(id) {
  const confirmed = confirm('Are you sure you want to delete this product?');
  if (!confirmed) return;

  try {
    const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');

    // Remove from local array and re-render (no extra fetch needed)
    allProducts = allProducts.filter(p => p.id !== id);
    renderProducts(allProducts);
  } catch (err) {
    alert('Failed to delete product. Please try again.');
    console.error(err);
  }
}

// ─────────────────────────────────────────
// MODAL — open for ADD
// ─────────────────────────────────────────
function openModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Product';
  clearForm();
  document.getElementById('modalOverlay').classList.remove('hidden');
}

// ─────────────────────────────────────────
// MODAL — open for EDIT
// ─────────────────────────────────────────
function openEditModal(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('inputName').value = product.name;
  document.getElementById('inputPrice').value = product.price;
  document.getElementById('inputImage').value = product.image;
  clearErrors();
  document.getElementById('modalOverlay').classList.remove('hidden');
}

// ─────────────────────────────────────────
// MODAL — close
// ─────────────────────────────────────────
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  clearForm();
  editingId = null;
}

function handleOverlayClick(e) {
  if (e.target.id === 'modalOverlay') closeModal();
}

// ─────────────────────────────────────────
// FORM — submit (add or edit)
// ─────────────────────────────────────────
async function handleSubmit() {
  if (!validateForm()) return;

  const data = {
    name: document.getElementById('inputName').value.trim(),
    price: Number(document.getElementById('inputPrice').value),
    image: document.getElementById('inputImage').value.trim()
  };

  const saveBtn = document.querySelector('.modal-footer .btn-primary');
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  try {
    if (editingId) {
      // Edit existing
      const updated = await editProduct(editingId, data);
      allProducts = allProducts.map(p => p.id === editingId ? updated : p);
    } else {
      // Add new
      const newProduct = await addProduct(data);
      allProducts.push(newProduct);
    }
    renderProducts(allProducts);
    closeModal();
  } catch (err) {
    alert('Something went wrong. Please try again.');
    console.error(err);
  } finally {
    saveBtn.textContent = 'Save Product';
    saveBtn.disabled = false;
  }
}

// ─────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────
function validateForm() {
  clearErrors();
  let valid = true;

  const name = document.getElementById('inputName').value.trim();
  const price = document.getElementById('inputPrice').value;
  const image = document.getElementById('inputImage').value.trim();

  if (!name) {
    document.getElementById('errorName').textContent = 'Product name is required';
    valid = false;
  }

  if (!price || isNaN(price) || Number(price) <= 0) {
    document.getElementById('errorPrice').textContent = 'Enter a valid price greater than 0';
    valid = false;
  }

  if (!image) {
    document.getElementById('errorImage').textContent = 'Image URL is required';
    valid = false;
  }

  return valid;
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function clearForm() {
  document.getElementById('inputName').value = '';
  document.getElementById('inputPrice').value = '';
  document.getElementById('inputImage').value = '';
  clearErrors();
}

function clearErrors() {
  document.getElementById('errorName').textContent = '';
  document.getElementById('errorPrice').textContent = '';
  document.getElementById('errorImage').textContent = '';
}

function showLoading(show) {
  document.getElementById('loadingState').classList.toggle('hidden', !show);
}

function showEmpty(show) {
  document.getElementById('emptyState').classList.toggle('hidden', !show);
}