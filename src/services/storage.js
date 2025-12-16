import { uid } from './util'

const KEY = 'jm_finance_pro_v1'

const DEFAULTS = {
  products: [
    { id: uid(), name: 'Açúcar refinado', unit: 'kg' },
    { id: uid(), name: 'Açúcar mascavo', unit: 'kg' },
    { id: uid(), name: 'Farinha de trigo', unit: 'kg' },
    { id: uid(), name: 'Manteiga sem sal', unit: 'g' },
    { id: uid(), name: 'Gotas de chocolate', unit: 'g' },
    { id: uid(), name: 'Chocolate em pó', unit: 'g' },
    { id: uid(), name: 'Ovos', unit: 'un' },
    { id: uid(), name: 'Essência de baunilha', unit: 'ml' },
    { id: uid(), name: 'Fermento', unit: 'g' },
    { id: uid(), name: 'Bicarbonato de sódio', unit: 'g' },
  ],
  fillings: [
    'Nutella','Doce de leite','Brigadeiro','Ninho','Ninho + Nutella',
    'Pistache','Paçoca','Caramelo salgado','Ovomaltine','Chocolate branco'
  ].map((name)=>({ id: uid(), name, unit:'g' })),
  utensils: [
    { id: uid(), name: 'Embalagens (saco + lacre)', unit: 'un' },
    { id: uid(), name: 'Assadeira', unit: 'un' },
    { id: uid(), name: 'Espátula', unit: 'un' },
    { id: uid(), name: 'Balança', unit: 'un' },
  ],
  purchases: [],
  sales: []
}

export function loadState(){
  try{
    const raw = localStorage.getItem(KEY)
    if(!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    return { ...DEFAULTS, ...parsed }
  }catch{
    return DEFAULTS
  }
}

export function saveState(state){
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function clearState(){
  localStorage.removeItem(KEY)
}
