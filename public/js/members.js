async function renderMembers(container) {
  container.innerHTML = '<div class="page-header"><h1>Miembros</h1>' + (Auth.isLeader() ? '<button class="btn btn-primary" onclick="showMemberForm()">+ Nuevo Miembro</button>' : '') + '</div><div class="search-bar"><input type="text" id="memberSearch" placeholder="Buscar miembro..." oninput="searchMembers()"><select id="memberStatus" onchange="searchMembers()"><option value="">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></div><div class="card"><div class="table-container" id="membersTable"><p>Cargando...</p></div></div>';

  loadMembers();
}

async function loadMembers() {
  try {
    const search = document.getElementById('memberSearch')?.value || '';
    const status = document.getElementById('memberStatus')?.value || '';
    let query = '?';
    if (search) query += `search=${search}&`;
    if (status) query += `status=${status}&`;

    const members = await API.get('/members' + query);
    const table = document.getElementById('membersTable');

    if (members.length === 0) {
      table.innerHTML = '<div class="empty-state"><div class="icon">&#9787;</div><p>No hay miembros registrados</p></div>';
      return;
    }

    table.innerHTML = '<table><thead><tr><th>Nombre</th><th>Email</th><th>Telefono</th><th>Fecha Ingreso</th><th>Estado</th>' + (Auth.isLeader() ? '<th>Acciones</th>' : '') + '</tr></thead><tbody>' + members.map(m => `<tr><td>${m.firstName} ${m.lastName}</td><td>${m.email || '-'}</td><td>${m.phone || '-'}</td><td>${new Date(m.joinDate).toLocaleDateString('es')}</td><td><span class="badge badge-${m.status}">${m.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>` + (Auth.isLeader() ? `<td class="actions-cell"><button class="btn btn-secondary btn-sm" onclick="showMemberForm('${m._id}')">Editar</button>` + (Auth.isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteMember('${m._id}')">Eliminar</button>` : '') + '</td>' : '') + '</tr>').join('') + '</tbody></table>';
  } catch (error) {
    console.error(error);
  }
}

function searchMembers() {
  loadMembers();
}

async function showMemberForm(id = null) {
  let member = { firstName: '', lastName: '', email: '', phone: '', address: '', birthDate: '', status: 'active' };

  if (id) {
    try {
      member = await API.get(`/members/${id}`);
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  const isEdit = id ? true : false;
  showModal(`<h2>${isEdit ? 'Editar' : 'Nuevo'} Miembro</h2><form onsubmit="saveMember(event, '${id || ''}')"><div class="form-group"><label>Nombre</label><input type="text" id="mFirstName" value="${member.firstName}" required></div><div class="form-group"><label>Apellido</label><input type="text" id="mLastName" value="${member.lastName}" required></div><div class="form-group"><label>Email</label><input type="email" id="mEmail" value="${member.email || ''}"></div><div class="form-group"><label>Telefono</label><input type="text" id="mPhone" value="${member.phone || ''}"></div><div class="form-group"><label>Direccion</label><input type="text" id="mAddress" value="${member.address || ''}"></div><div class="form-group"><label>Fecha de Nacimiento</label><input type="date" id="mBirthDate" value="${member.birthDate ? member.birthDate.split('T')[0] : ''}"></div><div class="form-group"><label>Estado</label><select id="mStatus"><option value="active" ${member.status === 'active' ? 'selected' : ''}>Activo</option><option value="inactive" ${member.status === 'inactive' ? 'selected' : ''}>Inactivo</option></select></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button type="submit" class="btn btn-primary">Guardar</button></div></form>`);
}

async function saveMember(e, id) {
  e.preventDefault();
  const data = {
    firstName: document.getElementById('mFirstName').value,
    lastName: document.getElementById('mLastName').value,
    email: document.getElementById('mEmail').value,
    phone: document.getElementById('mPhone').value,
    address: document.getElementById('mAddress').value,
    birthDate: document.getElementById('mBirthDate').value || undefined,
    status: document.getElementById('mStatus').value
  };

  try {
    if (id) {
      await API.put(`/members/${id}`, data);
    } else {
      await API.post('/members', data);
    }
    closeModal();
    loadMembers();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteMember(id) {
  if (!confirm('¿Eliminar este miembro?')) return;
  try {
    await API.delete(`/members/${id}`);
    loadMembers();
  } catch (error) {
    alert(error.message);
  }
}
