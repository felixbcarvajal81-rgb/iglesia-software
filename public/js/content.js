async function renderContent(container) {
  container.innerHTML = '<div class="page-header"><h1>Contenido</h1>' + (Auth.isLeader() ? '<button class="btn btn-primary" onclick="showContentForm()">+ Nuevo Contenido</button>' : '') + '</div><div class="search-bar"><select id="contentType" onchange="loadContentList()"><option value="">Todos los tipos</option><option value="news">Noticias</option><option value="sermon">Sermones</option><option value="announcement">Anuncios</option><option value="gallery">Galeria</option></select></div><div class="card" id="contentContainer"><p>Cargando...</p></div>';

  loadContentList();
}

async function loadContentList() {
  try {
    const type = document.getElementById('contentType')?.value || '';
    let query = '?';
    if (type) query += `type=${type}&`;

    const content = await API.get('/content' + query);
    const container = document.getElementById('contentContainer');

    if (content.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">&#9998;</div><p>No hay contenido publicado</p></div>';
      return;
    }

    container.innerHTML = content.map(c => `<div style="border-bottom:1px solid var(--border);padding:16px 0;"><div style="display:flex;justify-content:space-between;align-items:start;"><div><h3 style="color:var(--primary);margin-bottom:4px;">${c.title}</h3><p style="font-size:12px;color:var(--text-light);">${new Date(c.publishedAt).toLocaleDateString('es')} | <span class="badge badge-${c.type}">${c.type}</span> | ${c.author ? c.author.username : 'Anonimo'}</p></div>` + (Auth.isLeader() ? `<div class="actions-cell"><button class="btn btn-secondary btn-sm" onclick="showContentForm('${c._id}')">Editar</button>` + (Auth.isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteContent('${c._id}')">Eliminar</button>` : '') + '</div>' : '') + `</div><div class="content-body" style="margin-top:12px;">${c.body}</div></div>`).join('');
  } catch (error) {
    console.error(error);
  }
}

async function showContentForm(id = null) {
  let item = { title: '', body: '', type: 'news' };

  if (id) {
    try {
      item = await API.get(`/content/${id}`);
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  const isEdit = id ? true : false;
  showModal(`<h2>${isEdit ? 'Editar' : 'Nuevo'} Contenido</h2><form onsubmit="saveContent(event, '${id || ''}')"><div class="form-group"><label>Titulo</label><input type="text" id="ctTitle" value="${item.title}" required></div><div class="form-group"><label>Tipo</label><select id="ctType"><option value="news" ${item.type === 'news' ? 'selected' : ''}>Noticia</option><option value="sermon" ${item.type === 'sermon' ? 'selected' : ''}>Sermon</option><option value="announcement" ${item.type === 'announcement' ? 'selected' : ''}>Anuncio</option><option value="gallery" ${item.type === 'gallery' ? 'selected' : ''}>Galeria</option></select></div><div class="form-group"><label>Contenido</label><textarea id="ctBody" rows="8" required>${item.body}</textarea></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button type="submit" class="btn btn-primary">Guardar</button></div></form>`);
}

async function saveContent(e, id) {
  e.preventDefault();
  const data = {
    title: document.getElementById('ctTitle').value,
    body: document.getElementById('ctBody').value,
    type: document.getElementById('ctType').value
  };

  try {
    if (id) {
      await API.put(`/content/${id}`, data);
    } else {
      await API.post('/content', data);
    }
    closeModal();
    loadContentList();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteContent(id) {
  if (!confirm('¿Eliminar este contenido?')) return;
  try {
    await API.delete(`/content/${id}`);
    loadContentList();
  } catch (error) {
    alert(error.message);
  }
}
