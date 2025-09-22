const API_URL = 'http://localhost:3000';

const form = document.getElementById('form');
const emailInput = document.getElementById('Email');
const nomeInput = document.getElementById('Nome');
const idInput = document.getElementById('id');
const dadosBody = document.getElementById('dados-body');

const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const emailNome = document.getElementById('loginEmail');
const loginSenha = document.getElementById('loginSenha');
const loginStatus = document.getElementById('loginStatus');

let token = localStorage.getItem('token') || null;
let userId = null;

// Funções de login/logout
const setLoggedIn = (id) => {
  userId = id;
  loginStatus.textContent = `Logado como usuário ID: ${id}`;
  btnLogin.style.display = 'none';
  btnLogout.style.display = 'inline';
};

const setLoggedOut = () => {
  userId = null;
  token = null;
  localStorage.removeItem('token');
  loginStatus.textContent = 'Desconectado';
  btnLogin.style.display = 'inline';
  btnLogout.style.display = 'none';
};

// Carregar e renderizar dados
async function carregarDados() {
  try {
    const res = await fetch(`${API_URL}/users`);
    const dados = await res.json();
    dadosBody.innerHTML = '';
    dados.forEach(dado => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dado.id}</td>
        <td>${dado.email}</td>
        <td>${dado.nome}</td>
        <td class="actions">
          <button onclick="editarDado(${dado.id}, '${dado.email}', ${dado.nome})">Editar</button>
          <button onclick="excluirDado(${dado.id})">Excluir</button>
        </td>
      `;
      dadosBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// Editar dado (apenas se for o próprio usuário)
window.editarDado = (id, email, nome) => {
  if (userId !== id) {
    alert('Você só pode editar seu próprio usuário!');
    return;
  }
  idInput.value = id;
  emailInput.value = email;
  nomeInput.value = nome;
};

// Excluir dado (apenas se for o próprio usuário)
window.excluirDado = async (id) => {
  if (userId !== id) {
    alert('Você só pode excluir seu próprio usuário!');
    return;
  }
  if (confirm('Tem certeza que deseja excluir?')) {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.message);
        return;
      }
      carregarDados();
      setLoggedOut(); // desloga ao excluir conta
    } catch (error) {
      alert('Erro ao excluir usuário.');
      console.error(error);
    }
  }
};

// Formulário (criar ou editar usuário)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = idInput.value;
  const email = emailInput.value.trim();
  const idade = emailInput.value;
  const senha = document.getElementById('senha')?.value;

  if (!email || !idade) {
    alert('Preencha email e idade!');
    return;
  }

  const dado = { email, idade: String(idade) };

  try {
    if (!id) {
      if (!senha) {
        alert('Para criar um usuário, a senha é obrigatória!');
        return;
      }
      dado.senha = senha;
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dado)
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.message || 'Erro ao criar usuário.');
        return;
      }
    } else {
      if (!token) {
        alert('Você precisa estar logado para editar.');
        return;
      }
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(dado)
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.message || 'Erro ao editar usuário.');
        return;
      }
    }

    form.reset();
    idInput.value = '';
    carregarDados();

  } catch (error) {
    alert('Erro na operação.');
    console.error(error);
  }
});

// Campo de senha (somente criação)
const senhaInput = document.createElement('input');
senhaInput.type = 'password';
senhaInput.id = 'senha';
senhaInput.placeholder = 'Senha (somente criação)';
form.insertBefore(senhaInput, form.querySelector('button'));

// Login
btnLogin.addEventListener('click', async () => {
  const email = emailNome.value.trim();
  const senha = loginSenha.value;
  if (!email || !senha) {
    alert('Preencha email e senha');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, senha })
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.message);
      return;
    }

    const data = await res.json();
    token = data.token;
    localStorage.setItem('token', token);

    // Decodificar token para pegar id do usuário
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const payload = JSON.parse(jsonPayload);
    setLoggedIn(payload.id);

    carregarDados();
  } catch (error) {
    alert('Erro no login.');
    console.error(error);
  }
});

// Logout
btnLogout.addEventListener('click', () => {
  setLoggedOut();
  carregarDados();
});

// Inicializar
if (token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const payload = JSON.parse(jsonPayload);
    setLoggedIn(payload.id);
  } catch {
    setLoggedOut();
  }
}

carregarDados();
