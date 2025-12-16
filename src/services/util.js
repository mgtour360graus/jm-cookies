export function brl(n){
  const v = Number.isFinite(n) ? n : 0
  return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
}
export function num(v){
  const n = Number(String(v ?? '').replace(',','.'))
  return Number.isFinite(n) ? n : 0
}
export function uid(){
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}
export function todayISO(){
  const d=new Date()
  const yyyy=d.getFullYear()
  const mm=String(d.getMonth()+1).padStart(2,'0')
  const dd=String(d.getDate()).padStart(2,'0')
  return `${yyyy}-${mm}-${dd}`
}
export function monthKey(dateStr){
  return (dateStr || '').slice(0,7)
}
