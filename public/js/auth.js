const Auth = {
  init() {
    const token = API.getToken();
    const user = API.getUser();
    if (token && user && !window.location.pathname.includes('index.html')) {
      return true;
    }
    if (!window.location.pathname.includes('index.html') && !token) {
      window.location.href = '/index.html';
      return false;
    }
    return true;
  },

  async login(email, password) {
    const data = await API.post('/auth/login', { email, password });
    API.setToken(data.token);
    API.setUser(data);
    return data;
  },

  async register(username, email, password, role) {
    const data = await API.post('/auth/register', { username, email, password, role });
    API.setToken(data.token);
    API.setUser(data);
    return data;
  },

  logout() {
    API.removeToken();
    window.location.href = '/index.html';
  },

  isAdmin() {
    const user = API.getUser();
    return user && user.role === 'admin';
  },

  isLeader() {
    const user = API.getUser();
    return user && (user.role === 'admin' || user.role === 'leader');
  }
};
