async function renderEvents(container) {
  container.innerHTML = '<div class="page-header"><h1>Eventos</h1>' + (Auth.isLeader() ? '<button class="btn btn-primary" onclick="showEventForm()">+ Nuevo Evento</button>' : '') + '</div><div class="search-bar"><select id="eventType" onchange="loadEventsList()"><option value="">Todos los tipos</option><option value="service">Servicio</option><option value="meeting">Reunion</option><option value="special">Especial</option><option value="other">Otro</option></select></div><div class="card"><div class="table-container" id="eventsTable"><p>Cargando...</p></div></div>';

  loadEventsList();
}

async function loadEventsList() {
  try {
    const type = document.getElementById('eventType')?.value || '';
    let query = '?';
    if (type) query += `type=${type}&`;

    const events = await API.get('/events' + query);
    const table = document.getElementById('eventsTable');

    if (events.length === 0) {
      table.innerHTML = '<div class="empty-state"><div class="icon">&#9733;</div><p>No hay eventos programados</p></div>';
      return;
    }

    table.innerHTML = '<table><thead><tr><th>Evento</th><th>Fecha</th><th>Hora</th><th>Lugar</th><th>Tipo</th><th>Recurrencia</th>' + (Auth.isLeader() ? '<th>Acciones</th>' : '') + '</tr></thead><tbody>' + events.map(e => `<tr><td>${e.title}</td><td>${new Date(e.date).toLocaleDateString('es')}</td><td>${e.time}</td><td>${e.location || '-'}</td><td><span class="badge badge-${e.type}">${e.type}</span></td><td>${e.recurrence === 'none' ? 'Ninguna' : e.recurrence}</td>` + (Auth.isLeader() ? `<td class="actions-cell"><button class="btn btn-secondary btn-sm" onclick="showEventForm('${e._id}')">Editar</button>` + (Auth.isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteEvent('${e._id}')">Eliminar</button>` : '') + '</td>' : '') + '</tr>').join('') + '</tbody></table>';
  } catch (error) {
    console.error(error);
  }
}

async function showEventForm(id = null) {
  let event = { title: '', description: '', date: '', time: '', location: '', type: 'service', recurrence: 'none' };

  if (id) {
    try {
      event = await API.get(`/events/${id}`);
      event.date = event.date ? event.date.split('T')[0] : '';
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  const isEdit = id ? true : false;
  showModal(`<h2>${isEdit ? 'Editar' : 'Nuevo'} Evento</h2><form onsubmit="saveEvent(event, '${id || ''}')"><div class="form-group"><label>Titulo</label><input type="text" id="eTitle" value="${event.title}" required></div><div class="form-group"><label>Descripcion</label><textarea id="eDescription" rows="3">${event.description || ''}</textarea></div><div class="form-group"><label>Fecha</label><input type="date" id="eDate" value="${event.date}" required></div><div class="form-group"><label>Hora</label><input type="time" id="eTime" value="${event.time}" required></div><div class="form-group"><label>Lugar</label><input type="text" id="eLocation" value="${event.location || ''}"></div><div class="form-group"><label>Tipo</label><select id="eType"><option value="service" ${event.type === 'service' ? 'selected' : ''}>Servicio</option><option value="meeting" ${event.type === 'meeting' ? 'selected' : ''}>Reunion</option><option value="special" ${event.type === 'special' ? 'selected' : ''}>Especial</option><option value="other" ${event.type === 'other' ? 'selected' : ''}>Otro</option></select></div><div class="form-group"><label>Recurrencia</label><select id="eRecurrence"><option value="none" ${event.recurrence === 'none' ? 'selected' : ''}>Ninguna</option><option value="weekly" ${event.recurrence === 'weekly' ? 'selected' : ''}>Semanal</option><option value="biweekly" ${event.recurrence === 'biweekly' ? 'selected' : ''}>Quincenal</option><option value="monthly" ${event.recurrence === 'monthly' ? 'selected' : ''}>Mensual</option></select></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button type="submit" class="btn btn-primary">Guardar</button></div></form>`);
}

async function saveEvent(e, id) {
  e.preventDefault();
  const data = {
    title: document.getElementById('eTitle').value,
    description: document.getElementById('eDescription').value,
    date: document.getElementById('eDate').value,
    time: document.getElementById('eTime').value,
    location: document.getElementById('eLocation').value,
    type: document.getElementById('eType').value,
    recurrence: document.getElementById('eRecurrence').value
  };

  try {
    if (id) {
      await API.put(`/events/${id}`, data);
    } else {
      await API.post('/events', data);
    }
    closeModal();
    loadEventsList();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteEvent(id) {
  if (!confirm('¿Eliminar este evento?')) return;
  try {
    await API.delete(`/events/${id}`);
    loadEventsList();
  } catch (error) {
    alert(error.message);
  }
}
