const AUTH_KEY = 'jm_auth_pro_v1'

// Troque aqui se quiser:
const DEMO_USERS = [
  { username: 'admin', password: 'jm123', role: 'admin' },
  { username: 'caixa', password: 'jm123', role: 'cashier' },
]

export function getSession(){
  try{
    const raw = localStorage.getItem(AUTH_KEY)
    if(!raw) return null
    return JSON.parse(raw)
  }catch{
    return null
  }
}

export function logout(){
  localStorage.removeItem(AUTH_KEY)
}

export function login(username, password){
  const u = DEMO_USERS.find(x => x.username === username && x.password === password)
  if(!u) return { ok:false, error:'Usuário ou senha inválidos.' }
  const session = { username: u.username, role: u.role, ts: Date.now() }
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
  return { ok:true, session }
}
