async function renderContributions(container) {
  container.innerHTML = '<div class="page-header"><h1>Diezmos y Ofrendas</h1>' + (Auth.isLeader() ? '<button class="btn btn-primary" onclick="showContributionForm()">+ Nueva Contribucion</button>' : '') + '</div><div class="stats-grid" id="contribStats"></div><div class="search-bar"><select id="contribType" onchange="loadContributions()"><option value="">Todos los tipos</option><option value="tithe">Diezmo</option><option value="offering">Ofrenda</option><option value="special">Especial</option><option value="other">Otro</option></select><input type="date" id="contribFrom" onchange="loadContributions()"><input type="date" id="contribTo" onchange="loadContributions()"></div><div class="card"><div class="table-container" id="contribTable"><p>Cargando...</p></div></div>';

  loadContribStats();
  loadContributions();
}

async function loadContribStats() {
  try {
    const from = document.getElementById('contribFrom')?.value || '';
    const to = document.getElementById('contribTo')?.value || '';
    let query = '?';
    if (from) query += `from=${from}&`;
    if (to) query += `to=${to}&`;

    const stats = await API.get('/contributions/stats' + query);
    const container = document.getElementById('contribStats');
    container.innerHTML = `<div class="stat-card"><div class="stat-icon">$</div><div class="stat-value">$${stats.grandTotal.toLocaleString()}</div><div class="stat-label">Total General</div></div>` + stats.byType.map(s => `<div class="stat-card"><div class="stat-icon">$</div><div class="stat-value">$${s.total.toLocaleString()}</div><div class="stat-label">${s._id} (${s.count})</div></div>`).join('');
  } catch (error) {
    console.error(error);
  }
}

async function loadContributions() {
  try {
    const type = document.getElementById('contribType')?.value || '';
    const from = document.getElementById('contribFrom')?.value || '';
    const to = document.getElementById('contribTo')?.value || '';
    let query = '?';
    if (type) query += `type=${type}&`;
    if (from) query += `from=${from}&`;
    if (to) query += `to=${to}&`;

    const contributions = await API.get('/contributions' + query);
    const table = document.getElementById('contribTable');

    if (contributions.length === 0) {
      table.innerHTML = '<div class="empty-state"><div class="icon">$</div><p>No hay contribuciones registradas</p></div>';
      return;
    }

    table.innerHTML = '<table><thead><tr><th>Miembro</th><th>Monto</th><th>Tipo</th><th>Fecha</th><th>Notas</th>' + (Auth.isAdmin() ? '<th>Acciones</th>' : '') + '</tr></thead><tbody>' + contributions.map(c => `<tr><td>${c.memberId ? c.memberId.firstName + ' ' + c.memberId.lastName : '-'}</td><td>$${c.amount.toLocaleString()}</td><td><span class="badge badge-${c.type}">${c.type}</span></td><td>${new Date(c.date).toLocaleDateString('es')}</td><td>${c.notes || '-'}</td>` + (Auth.isAdmin() ? `<td class="actions-cell"><button class="btn btn-secondary btn-sm" onclick="showContributionForm('${c._id}')">Editar</button><button class="btn btn-danger btn-sm" onclick="deleteContribution('${c._id}')">Eliminar</button></td>` : '') + '</tr>').join('') + '</tbody></table>';
  } catch (error) {
    console.error(error);
  }
}

async function showContributionForm(id = null) {
  let contrib = { amount: '', type: 'tithe', date: new Date().toISOString().split('T')[0], notes: '', memberId: '' };

  if (id) {
    try {
      const data = await API.get(`/contributions/${id}`);
      contrib = { ...data, memberId: data.memberId?._id || '', date: data.date ? data.date.split('T')[0] : '' };
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
  showModal(`<h2>${isEdit ? 'Editar' : 'Nueva'} Contribucion</h2><form onsubmit="saveContribution(event, '${id || ''}')"><div class="form-group"><label>Miembro</label><select id="cMemberId" required><option value="">Seleccionar miembro</option>${members.map(m => `<option value="${m._id}" ${contrib.memberId === m._id ? 'selected' : ''}>${m.firstName} ${m.lastName}</option>`).join('')}</select></div><div class="form-group"><label>Monto ($)</label><input type="number" id="cAmount" value="${contrib.amount}" required min="0" step="0.01"></div><div class="form-group"><label>Tipo</label><select id="cType"><option value="tithe" ${contrib.type === 'tithe' ? 'selected' : ''}>Diezmo</option><option value="offering" ${contrib.type === 'offering' ? 'selected' : ''}>Ofrenda</option><option value="special" ${contrib.type === 'special' ? 'selected' : ''}>Especial</option><option value="other" ${contrib.type === 'other' ? 'selected' : ''}>Otro</option></select></div><div class="form-group"><label>Fecha</label><input type="date" id="cDate" value="${contrib.date}"></div><div class="form-group"><label>Notas</label><textarea id="cNotes" rows="2">${contrib.notes || ''}</textarea></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button type="submit" class="btn btn-primary">Guardar</button></div></form>`);
}

async function saveContribution(e, id) {
  e.preventDefault();
  const data = {
    memberId: document.getElementById('cMemberId').value,
    amount: parseFloat(document.getElementById('cAmount').value),
    type: document.getElementById('cType').value,
    date: document.getElementById('cDate').value,
    notes: document.getElementById('cNotes').value
  };

  try {
    if (id) {
      await API.put(`/contributions/${id}`, data);
    } else {
      await API.post('/contributions', data);
    }
    closeModal();
    loadContributions();
    loadContribStats();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteContribution(id) {
  if (!confirm('¿Eliminar esta contribucion?')) return;
  try {
    await API.delete(`/contributions/${id}`);
    loadContributions();
    loadContribStats();
  } catch (error) {
    alert(error.message);
  }
}
