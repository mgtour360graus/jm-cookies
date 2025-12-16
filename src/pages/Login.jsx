
export default function Login({ onLogin }){
  function handleLogin(){
    localStorage.setItem('jm_user', 'admin')
    onLogin('admin')
  }

  return (
    <div className="login">
      <img src="/assets/logo.png" alt="JM Cookies" />
      <h1>JM Cookies</h1>
      <button onClick={handleLogin}>Entrar no Caixa</button>
    </div>
  )
}
