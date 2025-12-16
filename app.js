const app = document.getElementById('app');

function loginView(){
  app.innerHTML = `
    <div class="login">
      <div class="loginbox">
        <img src="assets/logo.png" width="80"/><h2>JM Cookies</h2>
        <p class="small">Login do Caixa</p>
        <input id="user" placeholder="Usuário" value="admin"/>
        <input id="pass" placeholder="Senha" type="password" value="jm123"/>
        <button onclick="login()">Entrar</button>
      </div>
    </div>`;
}

function login(){
  const u = document.getElementById('user').value;
  const p = document.getElementById('pass').value;
  if((u==='admin'||u==='caixa') && p==='jm123'){
    localStorage.setItem('jm_user',u);
    dashboard();
  }else alert('Login inválido');
}

function dashboard(){
  app.innerHTML = `
    <div class="header">
      <img src="assets/logo.png"/>
      <b>JM Cookies — Caixa</b>
      <button onclick="logout()">Sair</button>
    </div>
    <div class="tabs">
      <div class="tab active">Resumo</div>
      <div class="tab">Vendas</div>
      <div class="tab">Compras</div>
    </div>
    <div class="card">
      <h3>Resumo</h3>
      <p>Sistema estático funcionando no GitHub Pages ✔</p>
      <p class="small">Depois migramos para React + Actions sem dor.</p>
    </div>`;
}

function logout(){
  localStorage.removeItem('jm_user');
  loginView();
}

if(localStorage.getItem('jm_user')) dashboard();
else loginView();