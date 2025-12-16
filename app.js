/**
 * JM Cookies — Caixa & Gestão (Static PRO)
 * Funciona 100% em cPanel/Apache (site estático), sem build.
 * Salva dados no navegador (LocalStorage).
 */

const KEY_AUTH = 'jm_auth_static_v1';
const KEY_DATA = 'jm_data_static_v1';

const DEMO_USERS = [
  { username:'admin', password:'jm123', role:'admin' },
  { username:'caixa', password:'jm123', role:'cashier' },
];

function uid(){ return Math.random().toString(16).slice(2) + Date.now().toString(16); }
function brl(n){ const v = Number.isFinite(n) ? n : 0; return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function num(v){ const n = Number(String(v ?? '').replace(',','.')); return Number.isFinite(n) ? n : 0; }
function todayISO(){
  const d=new Date(); const yyyy=d.getFullYear();
  const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}
function monthKey(s){ return (s||'').slice(0,7); }

function loadData(){
  const defaults = {
    products: [
      { id: uid(), name:'Açúcar refinado', unit:'kg' },
      { id: uid(), name:'Açúcar mascavo', unit:'kg' },
      { id: uid(), name:'Farinha de trigo', unit:'kg' },
      { id: uid(), name:'Manteiga sem sal', unit:'g' },
      { id: uid(), name:'Gotas de chocolate', unit:'g' },
      { id: uid(), name:'Chocolate em pó', unit:'g' },
      { id: uid(), name:'Ovos', unit:'un' },
      { id: uid(), name:'Essência de baunilha', unit:'ml' },
    ],
    fillings: [
      'Nutella','Doce de leite','Brigadeiro','Ninho','Ninho + Nutella',
      'Pistache','Paçoca','Caramelo salgado','Ovomaltine','Chocolate branco'
    ].map(name=>({ id: uid(), name, unit:'g' })),
    utensils: [
      { id: uid(), name:'Embalagens (saco + lacre)', unit:'un' },
      { id: uid(), name:'Assadeira', unit:'un' },
      { id: uid(), name:'Espátula', unit:'un' },
      { id: uid(), name:'Balança', unit:'un' },
    ],
    purchases: [],
    sales: [],
  };
  try{
    const raw = localStorage.getItem(KEY_DATA);
    if(!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  }catch{
    return defaults;
  }
}
function saveData(data){ localStorage.setItem(KEY_DATA, JSON.stringify(data)); }

function getSession(){
  try{ return JSON.parse(localStorage.getItem(KEY_AUTH) || 'null'); }catch{ return null; }
}
function setSession(s){ localStorage.setItem(KEY_AUTH, JSON.stringify(s)); }
function clearSession(){ localStorage.removeItem(KEY_AUTH); }

const app = document.getElementById('app');

function renderLogin(error=''){
  app.innerHTML = `
  <div class="login">
    <form class="loginbox" onsubmit="return false;">
      <div class="top">
        <img src="./assets/logo.png" alt="JM Cookies" />
        <div>
          <h2>Entrar no Caixa</h2>
          <p>Compras, vendas e lucro — do jeito certo.</p>
        </div>
      </div>
      <div class="fields">
        <div>
          <label>Usuário</label>
          <input id="lg_user" value="admin" placeholder="admin" />
        </div>
        <div>
          <label>Senha</label>
          <input id="lg_pass" type="password" value="jm123" placeholder="jm123" />
        </div>
        ${error ? `<div class="notice"><b>Ops:</b> ${error}</div>` : ``}
        <button class="btn primary" onclick="doLogin()" type="button">Entrar</button>
        <div class="small">Padrão: <b>admin</b> / <b>jm123</b> • ou <b>caixa</b> / <b>jm123</b></div>
      </div>
    </form>
  </div>`;
}

function doLogin(){
  const u = document.getElementById('lg_user').value.trim();
  const p = document.getElementById('lg_pass').value;
  const found = DEMO_USERS.find(x=>x.username===u && x.password===p);
  if(!found) return renderLogin('Usuário ou senha inválidos.');
  setSession({ username: found.username, role: found.role, ts: Date.now() });
  renderApp('resumo');
}

function logout(){
  clearSession();
  renderLogin();
}

function headerHTML(session){
  return `
  <div class="topbar">
    <div class="brand">
      <img src="./assets/logo.png" alt="JM Cookies" />
      <div>
        <h1>JM Cookies — Caixa & Gestão</h1>
        <p>Usuário: <b>${session.username}</b> • diário → mensal</p>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn danger" onclick="logout()" type="button">Sair</button>
    </div>
  </div>`;
}

function tabsHTML(active){
  const tabs = [
    ['resumo','Resumo'],
    ['produtos','Produtos'],
    ['recheios','Recheios'],
    ['utensilios','Utensílios'],
    ['compras','Compras'],
    ['vendas','Vendas do dia'],
  ];
  return `
  <div class="tabs">
    ${tabs.map(([k,label])=>`
      <div class="tab ${active===k?'active':''}" onclick="renderApp('${k}')">${label}</div>
    `).join('')}
  </div>`;
}

function card(title, subtitle, inner){
  return `
  <div class="card"><div class="pad">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap">
      <div>
        <h3 class="title">${title}</h3>
        ${subtitle ? `<div class="sub">${subtitle}</div>` : ``}
      </div>
    </div>
    <div style="margin-top:12px">${inner}</div>
  </div></div>`;
}

function renderResumo(data){
  const cm = monthKey(todayISO());
  const rev = data.sales.filter(s=>monthKey(s.day)===cm).reduce((a,b)=>a+(b.gross||0),0);
  const exp = data.purchases.filter(p=>monthKey(p.day)===cm).reduce((a,b)=>a+(b.total||0),0);
  const prof = rev-exp;

  // consolidate months
  const months = Array.from(new Set([
    ...data.sales.map(s=>monthKey(s.day)),
    ...data.purchases.map(p=>monthKey(p.day))
  ].filter(Boolean))).sort((a,b)=>b.localeCompare(a));

  const rows = months.map(m=>{
    const r = data.sales.filter(s=>monthKey(s.day)===m).reduce((a,b)=>a+(b.gross||0),0);
    const e = data.purchases.filter(p=>monthKey(p.day)===m).reduce((a,b)=>a+(b.total||0),0);
    const p = r-e;
    return `<tr><td><strong>${m}</strong></td><td><strong>${brl(r)}</strong></td><td>${brl(e)}</td><td><strong style="color:${p<0?'#8c2b2b':'inherit'}">${brl(p)}</strong></td></tr>`;
  }).join('') || `<tr><td colspan="4" class="small">Sem lançamentos ainda.</td></tr>`;

  return `
  <div class="grid cards3">
    <div class="card"><div class="pad"><div class="sub">Receita (mês) • ${cm}</div><div class="kpi">${brl(rev)}</div></div></div>
    <div class="card"><div class="pad"><div class="sub">Despesas (mês) • ${cm}</div><div class="kpi">${brl(exp)}</div></div></div>
    <div class="card"><div class="pad"><div class="sub">Lucro / Liquidez (mês)</div><div class="kpi ${prof<0?'neg':''}">${brl(prof)}</div></div></div>
  </div>

  ${card('Painel tipo caixa', 'Ações rápidas pra testar e/ou zerar os dados.', `
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" type="button" onclick="demoSeed()">Carregar exemplo</button>
      <button class="btn danger" type="button" onclick="resetAll()">Zerar dados</button>
    </div>
    <div class="hr"></div>
    <div class="notice"><b>Regra do jogo:</b> compras = despesa • vendas = receita • resumo mostra a liquidez do mês.</div>
  `)}

  ${card('Consolidado por mês', 'Somatório automático para fechar o mês sem planilha torta.', `
    <div class="tablewrap">
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesas</th><th>Lucro</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `)}
  `;
}

function renderCatalog(kind, key, data){
  const items = data[key] || [];
  const defaultUnit = (key==='utensils') ? 'un' : 'g';
  const helper = {
    products:'Açúcar, farinha, manteiga… o que entra na receita.',
    fillings:'Variedades de recheio (no mínimo 10).',
    utensils:'Embalagens, assadeiras, materiais de apoio.'
  }[key] || '';

  const rows = items.map(it=>`
    <tr>
      <td><strong>${it.name}</strong></td>
      <td><span class="badge">${it.unit}</span></td>
      <td style="text-align:right"><button class="btn danger" type="button" onclick="removeCatalogItem('${key}','${it.id}')">Excluir</button></td>
    </tr>
  `).join('') || `<tr><td colspan="3" class="small">Sem itens ainda.</td></tr>`;

  return card(`Cadastro de ${kind}`, helper, `
    <div class="row cols12">
      <div class="col-7">
        <label>Nome</label>
        <input id="cat_name" placeholder="Ex: Creme de avelã" />
      </div>
      <div class="col-3">
        <label>Unidade</label>
        <input id="cat_unit" value="${defaultUnit}" placeholder="Ex: g, kg, un" />
      </div>
      <div class="col-2" style="display:flex;align-items:end">
        <button class="btn primary" style="width:100%" type="button" onclick="addCatalogItem('${key}')">Adicionar</button>
      </div>
    </div>
    <div class="hr"></div>
    <div class="tablewrap">
      <table>
        <thead><tr><th>Item</th><th style="width:140">Unidade</th><th style="width:120;text-align:right">Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `);
}

function allItems(data){
  const tag = (arr, kind) => (arr||[]).map(x=>({...x, kind}));
  return [...tag(data.products,'Produto'), ...tag(data.fillings,'Recheio'), ...tag(data.utensils,'Utensílio')]
    .sort((a,b)=>a.name.localeCompare(b.name));
}

function renderCompras(data){
  const items = allItems(data);
  const d = todayISO();
  const dayTotal = data.purchases.filter(p=>p.day===d).reduce((a,b)=>a+(b.total||0),0);
  const monthTotal = data.purchases.reduce((a,b)=>a+(b.total||0),0);

  const options = items.map(it=>`<option value="${it.id}">${it.name} — ${it.kind} (${it.unit})</option>`).join('');

  const rows = data.purchases.map(p=>`
    <tr>
      <td><strong>${p.day}</strong></td>
      <td><span class="badge">${p.itemKind}</span></td>
      <td>
        <div><strong>${p.itemName}</strong></div>
        ${p.note ? `<div class="small">${p.note}</div>` : ``}
      </td>
      <td>${p.qty} ${p.unit}</td>
      <td>${brl(p.unitPrice)}</td>
      <td><strong>${brl(p.total)}</strong></td>
      <td style="text-align:right"><button class="btn danger" type="button" onclick="removePurchase('${p.id}')">Excluir</button></td>
    </tr>
  `).join('') || `<tr><td colspan="7" class="small">Nenhuma compra registrada ainda.</td></tr>`;

  return card('Compras (despesas)', 'Lance compras diárias (insumos/recheios/utensílios). Isso impacta o lucro.', `
    <div class="row cols12">
      <div class="col-3">
        <label>Data</label>
        <input id="buy_day" type="date" value="${d}" />
      </div>
      <div class="col-5">
        <label>Item</label>
        <select id="buy_item">${options}</select>
      </div>
      <div class="col-2">
        <label>Qtd</label>
        <input id="buy_qty" value="0" />
      </div>
      <div class="col-2">
        <label>Preço unit.</label>
        <input id="buy_unit" value="0" />
      </div>
      <div class="col-10">
        <label>Observação</label>
        <input id="buy_note" placeholder="Ex: compra no atacado" />
      </div>
      <div class="col-2" style="display:flex;align-items:end">
        <button class="btn primary" style="width:100%" type="button" onclick="addPurchase()">Lançar</button>
      </div>
    </div>

    <div class="grid cards3" style="margin-top:14px">
      <div class="card"><div class="pad"><div class="sub">Despesa do dia • hoje</div><div class="kpi">${brl(dayTotal)}</div></div></div>
      <div class="card"><div class="pad"><div class="sub">Total em compras (mês)</div><div class="kpi">${brl(monthTotal)}</div></div></div>
      <div class="card"><div class="pad"><div class="sub">Itens lançados</div><div class="kpi">${data.purchases.length}</div></div></div>
    </div>

    <div class="hr"></div>

    <div class="tablewrap">
      <table>
        <thead><tr><th>Data</th><th>Tipo</th><th>Item</th><th>Qtd</th><th>Preço</th><th>Total</th><th style="width:120;text-align:right">Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `);
}

function renderVendas(data){
  const d = todayISO();
  const dayTotal = data.sales.filter(s=>s.day===d).reduce((a,b)=>a+(b.gross||0),0);
  const monthTotal = data.sales.reduce((a,b)=>a+(b.gross||0),0);

  const rows = data.sales.map(s=>`
    <tr>
      <td><strong>${s.day}</strong></td>
      <td>${s.qty}</td>
      <td>${brl(s.ticket)}</td>
      <td><strong>${brl(s.gross)}</strong></td>
      <td>${brl(s.pix)}</td>
      <td>${brl(s.cash)}</td>
      <td>${brl(s.card)}</td>
      <td style="text-align:right"><button class="btn danger" type="button" onclick="removeSale('${s.id}')">Excluir</button></td>
    </tr>
  `).join('') || `<tr><td colspan="8" class="small">Nenhuma venda registrada ainda.</td></tr>`;

  return card('Vendas do dia (caixa)', 'Registre quantidade vendida e recebimentos por Pix/Dinheiro/Cartão.', `
    <div class="row cols12">
      <div class="col-3">
        <label>Data</label>
        <input id="sale_day" type="date" value="${d}" />
      </div>
      <div class="col-2">
        <label>Qtd vendida</label>
        <input id="sale_qty" value="0" />
      </div>
      <div class="col-2">
        <label>Ticket (R$)</label>
        <input id="sale_ticket" value="15" />
      </div>
      <div class="col-5">
        <label>Observação</label>
        <input id="sale_note" placeholder="Ex: entrega no prédio" />
      </div>

      <div class="col-4">
        <label>Recebido no Pix</label>
        <input id="sale_pix" value="0" />
      </div>
      <div class="col-4">
        <label>Recebido em dinheiro</label>
        <input id="sale_cash" value="0" />
      </div>
      <div class="col-4">
        <label>Recebido no cartão</label>
        <input id="sale_card" value="0" />
      </div>

      <div class="col-10">
        <div class="notice" id="sale_notice">Preencha os campos e clique em <b>Lançar</b>.</div>
      </div>
      <div class="col-2" style="display:flex;align-items:end">
        <button class="btn primary" style="width:100%" type="button" onclick="addSale()">Lançar</button>
      </div>
    </div>

    <div class="grid cards3" style="margin-top:14px">
      <div class="card"><div class="pad"><div class="sub">Receita do dia • hoje</div><div class="kpi">${brl(dayTotal)}</div></div></div>
      <div class="card"><div class="pad"><div class="sub">Receita (mês)</div><div class="kpi">${brl(monthTotal)}</div></div></div>
      <div class="card"><div class="pad"><div class="sub">Dias lançados</div><div class="kpi">${data.sales.length}</div></div></div>
    </div>

    <div class="hr"></div>

    <div class="tablewrap">
      <table>
        <thead><tr><th>Data</th><th>Qtd</th><th>Ticket</th><th>Bruto</th><th>Pix</th><th>Dinheiro</th><th>Cartão</th><th style="width:120;text-align:right">Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `);
}

function renderApp(tab){
  const session = getSession();
  if(!session) return renderLogin();

  window.__tab = tab;
  const data = loadData();

  let content = '';
  if(tab==='resumo') content = renderResumo(data);
  if(tab==='produtos') content = renderCatalog('Produtos (insumos)','products',data);
  if(tab==='recheios') content = renderCatalog('Recheios','fillings',data);
  if(tab==='utensilios') content = renderCatalog('Utensílios','utensils',data);
  if(tab==='compras') content = renderCompras(data);
  if(tab==='vendas') content = renderVendas(data);

  app.innerHTML = `
    <div class="container">
      ${headerHTML(session)}
      ${tabsHTML(tab)}
      ${content}
      <div class="small" style="margin-top:16px">
        Hospedagem: cPanel • Dica: para trocar usuários/senha, edite <b>app.js</b> (DEMO_USERS).
      </div>
    </div>
  `;

  // attach live notice update for sales
  if(tab==='vendas'){
    const inputs = ['sale_qty','sale_ticket','sale_pix','sale_cash','sale_card'];
    inputs.forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.addEventListener('input', updateSaleNotice);
    });
    updateSaleNotice();
  }
}

function addCatalogItem(key){
  const data = loadData();
  const name = (document.getElementById('cat_name')?.value || '').trim();
  const unit = (document.getElementById('cat_unit')?.value || '').trim() || 'un';
  if(!name) return alert('Informe o nome do item.');
  data[key] = [{ id: uid(), name, unit }, ...(data[key]||[])];
  saveData(data);
  renderApp(window.__tab);
}
function removeCatalogItem(key, id){
  const data = loadData();
  data[key] = (data[key]||[]).filter(x=>x.id!==id);
  saveData(data);
  renderApp(window.__tab);
}

function addPurchase(){
  const data = loadData();
  const day = document.getElementById('buy_day').value;
  const itemId = document.getElementById('buy_item').value;
  const qty = num(document.getElementById('buy_qty').value);
  const unitPrice = num(document.getElementById('buy_unit').value);
  const note = (document.getElementById('buy_note').value || '').trim();

  const selected = allItems(data).find(x=>x.id===itemId);
  if(!selected) return alert('Selecione um item válido.');

  const p = {
    id: uid(),
    day,
    itemId,
    itemName: selected.name,
    itemKind: selected.kind,
    unit: selected.unit,
    qty,
    unitPrice,
    total: qty * unitPrice,
    note
  };
  data.purchases = [p, ...(data.purchases||[])];
  saveData(data);
  renderApp('compras');
}
function removePurchase(id){
  const data = loadData();
  data.purchases = (data.purchases||[]).filter(x=>x.id!==id);
  saveData(data);
  renderApp('compras');
}

function updateSaleNotice(){
  const qty = num(document.getElementById('sale_qty')?.value);
  const ticket = num(document.getElementById('sale_ticket')?.value);
  const pix = num(document.getElementById('sale_pix')?.value);
  const cash = num(document.getElementById('sale_cash')?.value);
  const card = num(document.getElementById('sale_card')?.value);
  const gross = qty * ticket;
  const paySum = pix + cash + card;
  const el = document.getElementById('sale_notice');
  if(!el) return;
  if(Math.abs(gross - paySum) < 0.01){
    el.innerHTML = `✅ Fechou certinho. Receita: <b>${brl(gross)}</b>`;
  }else{
    el.innerHTML = `⚠️ Diferença de <b>${brl(gross - paySum)}</b> — ajuste Pix/Dinheiro/Cartão para bater com <b>${brl(gross)}</b>.`;
  }
}

function addSale(){
  const data = loadData();
  const day = document.getElementById('sale_day').value;
  const qty = num(document.getElementById('sale_qty').value);
  const ticket = num(document.getElementById('sale_ticket').value);
  const pix = num(document.getElementById('sale_pix').value);
  const cash = num(document.getElementById('sale_cash').value);
  const card = num(document.getElementById('sale_card').value);
  const note = (document.getElementById('sale_note').value || '').trim();

  const gross = qty * ticket;
  const s = { id: uid(), day, qty, ticket, gross, pix, cash, card, note };
  data.sales = [s, ...(data.sales||[])];
  saveData(data);
  renderApp('vendas');
}
function removeSale(id){
  const data = loadData();
  data.sales = (data.sales||[]).filter(x=>x.id!==id);
  saveData(data);
  renderApp('vendas');
}

function resetAll(){
  if(!confirm('Tem certeza que deseja zerar todos os dados?')) return;
  localStorage.removeItem(KEY_DATA);
  renderApp('resumo');
}

function demoSeed(){
  const data = loadData();
  const d = todayISO();
  data.purchases = [
    { id: uid(), day:d, itemId:'', itemName:'Açúcar refinado', itemKind:'Produto', unit:'kg', qty:1, unitPrice:2.98, total:2.98, note:'reposição' },
    { id: uid(), day:d, itemId:'', itemName:'Nutella', itemKind:'Recheio', unit:'g', qty:350, unitPrice:0.052, total:18.2, note:'pote fracionado (exemplo)' },
    { id: uid(), day:d, itemId:'', itemName:'Embalagens (saco + lacre)', itemKind:'Utensílio', unit:'un', qty:10, unitPrice:0.35, total:3.5, note:'10 unidades' },
  ];
  data.sales = [
    { id: uid(), day:d, qty:10, ticket:15, gross:150, pix:120, cash:30, card:0, note:'cookies do prédio' }
  ];
  saveData(data);
  renderApp('resumo');
}

// expose functions
window.doLogin = doLogin;
window.logout = logout;
window.renderApp = renderApp;
window.addCatalogItem = addCatalogItem;
window.removeCatalogItem = removeCatalogItem;
window.addPurchase = addPurchase;
window.removePurchase = removePurchase;
window.addSale = addSale;
window.removeSale = removeSale;
window.resetAll = resetAll;
window.demoSeed = demoSeed;

// boot
const session = getSession();
if(session) renderApp('resumo');
else renderLogin();
