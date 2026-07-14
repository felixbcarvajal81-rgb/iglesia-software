async function renderGroups(container) {
  container.innerHTML = '<div class="page-header"><h1>Grupos y Ministerios</h1>' + (Auth.isLeader() ? '<button class="btn btn-primary" onclick="showGroupForm()">+ Nuevo Grupo</button>' : '') + '</div><div class="card"><div class="table-container" id="groupsTable"><p>Cargando...</p></div></div>';

  loadGroups();
}

async function loadGroups() {
  try {
    const groups = await API.get('/groups');
    const table = document.getElementById('groupsTable');

    if (groups.length === 0) {
      table.innerHTML = '<div class="empty-state"><div class="icon">&#9823;</div><p>No hay grupos creados</p></div>';
      return;
    }

    table.innerHTML = '<table><thead><tr><th>Nombre</th><th>Lider</th><th>Dia</th><th>Hora</th><th>Lugar</th><th>Miembros</th>' + (Auth.isLeader() ? '<th>Acciones</th>' : '') + '</tr></thead><tbody>' + groups.map(g => `<tr><td>${g.name}</td><td>${g.leaderId ? g.leaderId.firstName + ' ' + g.leaderId.lastName : '-'}</td><td>${g.meetingDay || '-'}</td><td>${g.meetingTime || '-'}</td><td>${g.location || '-'}</td><td>${g.members ? g.members.length : 0}</td>` + (Auth.isLeader() ? `<td class="actions-cell"><button class="btn btn-secondary btn-sm" onclick="showGroupForm('${g._id}')">Editar</button><button class="btn btn-secondary btn-sm" onclick="showGroupMembers('${g._id}')">Miembros</button>` + (Auth.isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteGroup('${g._id}')">Eliminar</button>` : '') + '</td>' : '') + '</tr>').join('') + '</tbody></table>';
  } catch (error) {
    console.error(error);
  }
}

async function showGroupForm(id = null) {
  let group = { name: '', description: '', meetingDay: '', meetingTime: '', location: '', leaderId: '' };

  if (id) {
    try {
      group = await API.get(`/groups/${id}`);
      group.leaderId = group.leaderId?._id || '';
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  let members = [];
  try {
    members = await API.get('/members?status=active');
  } catch (error) {}

  const isEdit = id ? true : false;
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  showModal(`<h2>${isEdit ? 'Editar' : 'Nuevo'} Grupo</h2><form onsubmit="saveGroup(event, '${id || ''}')"><div class="form-group"><label>Nombre</label><input type="text" id="gName" value="${group.name}" required></div><div class="form-group"><label>Descripcion</label><textarea id="gDescription" rows="2">${group.description || ''}</textarea></div><div class="form-group"><label>Lider</label><select id="gLeaderId"><option value="">Seleccionar lider</option>${members.map(m => `<option value="${m._id}" ${group.leaderId === m._id ? 'selected' : ''}>${m.firstName} ${m.lastName}</option>`).join('')}</select></div><div class="form-group"><label>Dia de reunion</label><select id="gMeetingDay"><option value="">Ninguno</option>${days.map(d => `<option value="${d}" ${group.meetingDay === d ? 'selected' : ''}>${d.charAt(0).toUpperCase() + d.slice(1)}</option>`).join('')}</select></div><div class="form-group"><label>Hora</label><input type="time" id="gMeetingTime" value="${group.meetingTime || ''}"></div><div class="form-group"><label>Lugar</label><input type="text" id="gLocation" value="${group.location || ''}"></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button type="submit" class="btn btn-primary">Guardar</button></div></form>`);
}

async function saveGroup(e, id) {
  e.preventDefault();
  const data = {
    name: document.getElementById('gName').value,
    description: document.getElementById('gDescription').value,
    leaderId: document.getElementById('gLeaderId').value || undefined,
    meetingDay: document.getElementById('gMeetingDay').value || undefined,
    meetingTime: document.getElementById('gMeetingTime').value,
    location: document.getElementById('gLocation').value
  };

  try {
    if (id) {
      await API.put(`/groups/${id}`, data);
    } else {
      await API.post('/groups', data);
    }
    closeModal();
    loadGroups();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteGroup(id) {
  if (!confirm('¿Eliminar este grupo?')) return;
  try {
    await API.delete(`/groups/${id}`);
    loadGroups();
  } catch (error) {
    alert(error.message);
  }
}

async function showGroupMembers(groupId) {
  try {
    const group = await API.get(`/groups/${groupId}`);
    const members = await API.get('/members?status=active');
    const memberIds = group.members.map(m => m._id || m);

    showModal(`<h2>Miembros: ${group.name}</h2><div id="groupMembersList">${group.members.length === 0 ? '<p>No hay miembros en este grupo</p>' : '<ul>' + group.members.map(m => `<li style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">${m.firstName} ${m.lastName}<button class="btn btn-danger btn-sm" onclick="removeFromGroup('${groupId}','${m._id}')">Quitar</button></li>`).join('') + '</ul>'}</div><div class="form-group" style="margin-top:16px;"><label>Agregar miembro</label><select id="addMemberSelect"><option value="">Seleccionar...</option>${members.filter(m => !memberIds.includes(m._id)).map(m => `<option value="${m._id}">${m.firstName} ${m.lastName}</option>`).join('')}</select></div><button class="btn btn-success btn-sm" onclick="addToGroup('${groupId}')">Agregar al grupo</button><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cerrar</button></div>`);
  } catch (error) {
    alert(error.message);
  }
}

async function addToGroup(groupId) {
  const memberId = document.getElementById('addMemberSelect').value;
  if (!memberId) return;
  try {
    await API.post(`/groups/${groupId}/members`, { memberId });
    showGroupMembers(groupId);
  } catch (error) {
    alert(error.message);
  }
}

async function removeFromGroup(groupId, memberId) {
  try {
    await API.delete(`/groups/${groupId}/members/${memberId}`);
    showGroupMembers(groupId);
  } catch (error) {
    alert(error.message);
  }
}
