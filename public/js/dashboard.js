document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.init()) return;

  const user = API.getUser();
  document.getElementById('userName').textContent = user.username;
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrador' : user.role === 'leader' ? 'Lider' : 'Miembro';

  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      loadPage(page);
    });
  });

  loadPage('dashboard');
});

function loadPage(page) {
  const main = document.getElementById('mainContent');
  switch (page) {
    case 'dashboard':
      renderDashboard(main);
      break;
    case 'members':
      renderMembers(main);
      break;
    case 'events':
      renderEvents(main);
      break;
    case 'contributions':
      renderContributions(main);
      break;
    case 'groups':
      renderGroups(main);
      break;
    case 'content':
      renderContent(main);
      break;
  }
}

async function renderDashboard(container) {
  container.innerHTML = '<h1>Dashboard</h1><p style="color:var(--text-light);margin-bottom:24px;">Resumen general de la iglesia</p><div class="stats-grid" id="statsGrid"><div class="stat-card"><div class="stat-icon">&#9787;</div><div class="stat-value" id="statMembers">-</div><div class="stat-label">Miembros Activos</div></div><div class="stat-card"><div class="stat-icon">&#9733;</div><div class="stat-value" id="statEvents">-</div><div class="stat-label">Proximos Eventos</div></div><div class="stat-card"><div class="stat-icon">$</div><div class="stat-value" id="statContributions">-</div><div class="stat-label">Contribuciones del Mes</div></div><div class="stat-card"><div class="stat-icon">&#9823;</div><div class="stat-value" id="statGroups">-</div><div class="stat-label">Grupos Activos</div></div></div><div class="card"><h2 style="margin-bottom:16px;">Proximos Eventos</h2><div id="upcomingEvents"><p>Cargando...</p></div></div>';

  try {
    const [memberStats, events, contributions, groups] = await Promise.all([
      API.get('/members/stats'),
      API.get('/events'),
      API.get('/contributions/stats'),
      API.get('/groups')
    ]);

    document.getElementById('statMembers').textContent = memberStats.active;
    document.getElementById('statGroups').textContent = groups.length;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthlyStats = await API.get(`/contributions/stats?from=${monthStart.toISOString()}&to=${monthEnd.toISOString()}`);
    document.getElementById('statContributions').textContent = '$' + monthlyStats.grandTotal.toLocaleString();

    const today = new Date();
    const futureEvents = events.filter(e => new Date(e.date) >= today).slice(0, 5);
    document.getElementById('statEvents').textContent = futureEvents.length;

    const eventsContainer = document.getElementById('upcomingEvents');
    if (futureEvents.length === 0) {
      eventsContainer.innerHTML = '<div class="empty-state"><div class="icon">&#9733;</div><p>No hay eventos programados</p></div>';
    } else {
      eventsContainer.innerHTML = '<table><thead><tr><th>Evento</th><th>Fecha</th><th>Hora</th><th>Lugar</th><th>Tipo</th></tr></thead><tbody>' + futureEvents.map(e => `<tr><td>${e.title}</td><td>${new Date(e.date).toLocaleDateString('es')}</td><td>${e.time}</td><td>${e.location || '-'}</td><td><span class="badge badge-${e.type}">${e.type}</span></td></tr>`).join('') + '</tbody></table>';
    }
  } catch (error) {
    console.error(error);
  }
}

function showModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
