document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  loadModels();
});

async function loadModels() {
  try {
    const res = await fetch('models/data.json');
    const models = await res.json();
    if (document.getElementById('shopGrid')) renderShop(models);
    if (document.getElementById('mainViewer')) loadViewer(models);
  } catch (e) {
    console.log('Models not loaded:', e.message);
  }
}

function renderShop(models) {
  const grid = document.getElementById('shopGrid');
  const template = document.getElementById('modelCard');
  const totalEl = document.getElementById('modelCount');

  function render(filter) {
    const filtered = filter === 'all' ? models : models.filter(m => m.tags.some(t => t.toLowerCase() === filter.toLowerCase()));
    grid.innerHTML = '';
    if (totalEl) totalEl.textContent = `${filtered.length} model${filtered.length > 1 ? '' : ''}`;

    filtered.forEach(model => {
      const card = template.content.cloneNode(true);
      const viewer = card.querySelector('.vrm-preview');
      const imgPreview = card.querySelector('.img-preview');

      if (model.preview3d) {
        viewer.style.display = 'block';
        imgPreview.style.display = 'none';
        viewer.setAttribute('src', model.preview3d);
        viewer.addEventListener('click', () => window.location.href = `model-viewer?id=${model.id}`);
      } else {
        viewer.style.display = 'none';
        imgPreview.style.display = 'block';
        imgPreview.src = model.thumbnail || (model.images && model.images.length > 0 ? model.images[0] : '');
        imgPreview.addEventListener('click', () => window.location.href = `model-viewer?id=${model.id}`);
      }

      card.querySelector('.model-name').textContent = model.name;
      card.querySelector('.model-desc').textContent = model.description;
      card.querySelector('.model-format-badge').textContent = model.format;
      card.querySelector('.model-price').textContent = model.price;
      const tags = card.querySelector('.model-tags');
      model.tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'model-tag';
        span.textContent = t;
        tags.appendChild(span);
      });
      card.querySelector('.buy-gumroad').href = model.gumroad;
      card.querySelector('.buy-booth').href = model.booth;
      grid.appendChild(card);
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.filter);
    });
  });
  render('all');
}

function loadViewer(models) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const model = models.find(m => m.id === id) || models[0];
  if (!model) return;

  if (model.preview3d) {
    document.getElementById('mainViewer').style.display = 'block';
    document.getElementById('mainViewer').setAttribute('src', model.preview3d);
    if (document.getElementById('viewerFallback')) document.getElementById('viewerFallback').style.display = 'none';
  } else {
    document.getElementById('mainViewer').style.display = 'none';
    if (document.getElementById('viewerFallback')) {
      document.getElementById('viewerFallback').style.display = 'block';
      document.getElementById('viewerFallback').src = model.thumbnail || (model.images && model.images.length > 0 ? model.images[0] : '');
    }
  }

  document.getElementById('modelName').textContent = model.name;
  document.getElementById('modelFormat').textContent = model.format;
  document.getElementById('modelDescription').textContent = model.description;
  document.getElementById('modelPrice').textContent = model.price;
  document.title = `${model.name} - Bentukin`;

  if (document.getElementById('modelFeatures') && model.features) {
    const featContainer = document.getElementById('modelFeatures');
    featContainer.innerHTML = '<h3>Fitur</h3><ul>' + model.features.map(f => `<li>${f}</li>`).join('') + '</ul>';
  }

  const gallery = document.getElementById('modelGallery');
  if (gallery && model.images && model.images.length > 0) {
    gallery.innerHTML = '<h3>Galeri</h3><div class="gallery-grid">' + model.images.map(img => `<div class="gallery-item"><img src="${img}" alt="Model photo" loading="lazy"></div>`).join('') + '</div>';
  } else if (gallery && model.thumbnail) {
    gallery.innerHTML = '<h3>Galeri</h3><div class="gallery-grid"><div class="gallery-item"><img src="${model.thumbnail}" alt="Model photo" loading="lazy"></div></div>';
  }

  document.getElementById('buyGumroad').href = model.gumroad;
  document.getElementById('buyBooth').href = model.booth;
}