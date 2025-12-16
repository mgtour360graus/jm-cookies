import { logout } from '../services/auth'

export default function Header({ session, onLogout, activeTab, setActiveTab }){
  return (
    <>
      <div className="header">
        <div className="brand">
          <img src="/assets/logo.png" alt="JM Cookies" />
          <div>
            <h1>JM Cookies — Caixa & Gestão PRO</h1>
            <p>Usuário: <b>{session?.username}</b> • Controle diário → resultado do mês</p>
          </div>
        </div>

        <div style={{display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
          <button className="btn" onClick={()=>{ onLogout?.(); logout(); }}>Sair</button>
        </div>
      </div>

      <div className="tabs">
        {[
          ['resumo','Resumo'],
          ['produtos','Produtos'],
          ['recheios','Recheios'],
          ['utensilios','Utensílios'],
          ['compras','Compras'],
          ['vendas','Vendas do dia'],
        ].map(([k,label])=>(
          <button
            key={k}
            className={"tab " + (activeTab===k ? "active":"")}
            onClick={()=>setActiveTab(k)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
