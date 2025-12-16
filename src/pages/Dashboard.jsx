import { useMemo, useState } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import { TableWrap } from '../components/Table'
import { brl, num, uid, todayISO, monthKey } from '../services/util'
import { loadState, saveState, clearState } from '../services/storage'

function Catalog({ title, helper, items, onAdd, onRemove, defaultUnit='un' }){
  const [name, setName] = useState('')
  const [unit, setUnit] = useState(defaultUnit)

  return (
    <Card title={title} subtitle={helper}>
      <div className="row cols12">
        <div className="col-span-7">
          <label>Nome</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Ex: Creme de avelã" />
        </div>
        <div className="col-span-3">
          <label>Unidade</label>
          <input value={unit} onChange={(e)=>setUnit(e.target.value)} placeholder="Ex: g, kg, un" />
        </div>
        <div className="col-span-2" style={{display:'flex', alignItems:'end'}}>
          <button className="btn primary" style={{width:'100%'}} onClick={()=>{
            const n=name.trim()
            if(!n) return
            onAdd({ id: uid(), name:n, unit: unit.trim() || defaultUnit })
            setName('')
          }}>Adicionar</button>
        </div>
      </div>

      <div className="hr" />

      <TableWrap>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style={{width:140}}>Unidade</th>
              <th style={{width:90, textAlign:'right'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="3" className="small">Sem itens ainda.</td></tr>
            ) : items.map(it => (
              <tr key={it.id}>
                <td><strong>{it.name}</strong></td>
                <td><span className="badge">{it.unit}</span></td>
                <td style={{textAlign:'right'}}>
                  <button className="btn danger" onClick={()=>onRemove(it.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </Card>
  )
}

function Purchases({ catalogs, purchases, addPurchase, removePurchase }){
  const allItems = useMemo(() => {
    const tag = (arr, kind) => arr.map(x => ({...x, kind}))
    return [...tag(catalogs.products,'Produto'), ...tag(catalogs.fillings,'Recheio'), ...tag(catalogs.utensils,'Utensílio')]
      .sort((a,b)=>a.name.localeCompare(b.name))
  }, [catalogs])

  const [day, setDay] = useState(todayISO())
  const [itemId, setItemId] = useState(allItems[0]?.id || '')
  const [qty, setQty] = useState('0')
  const [unitPrice, setUnitPrice] = useState('0')
  const [note, setNote] = useState('')

  const dayTotal = useMemo(()=> purchases.filter(p=>p.day===day).reduce((a,b)=>a+(b.total||0),0), [purchases, day])
  const monthTotal = useMemo(()=> purchases.reduce((a,b)=>a+(b.total||0),0), [purchases])

  return (
    <Card title="Compras (despesas)" subtitle="Lance compras diárias (insumos/recheios/utensílios). Isso impacta o lucro do mês.">
      <div className="row cols12">
        <div className="col-span-3">
          <label>Data</label>
          <input type="date" value={day} onChange={(e)=>setDay(e.target.value)} />
        </div>
        <div className="col-span-5">
          <label>Item</label>
          <select value={itemId} onChange={(e)=>setItemId(e.target.value)}>
            {allItems.map(it => (
              <option key={it.id} value={it.id}>{it.name} — {it.kind} ({it.unit})</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label>Qtd</label>
          <input value={qty} onChange={(e)=>setQty(e.target.value)} placeholder="Ex: 1" />
        </div>
        <div className="col-span-2">
          <label>Preço unit.</label>
          <input value={unitPrice} onChange={(e)=>setUnitPrice(e.target.value)} placeholder="Ex: 12,90" />
        </div>
        <div className="col-span-10">
          <label>Observação (opcional)</label>
          <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Ex: compra no atacado" />
        </div>
        <div className="col-span-2" style={{display:'flex', alignItems:'end'}}>
          <button className="btn primary" style={{width:'100%'}} onClick={()=>{
            const selected = allItems.find(x=>x.id===itemId)
            if(!selected) return
            const q = num(qty), up = num(unitPrice)
            addPurchase({
              id: uid(),
              day,
              itemId,
              itemName: selected.name,
              itemKind: selected.kind,
              unit: selected.unit,
              qty: q,
              unitPrice: up,
              total: q*up,
              note: note.trim()
            })
            setQty('0'); setUnitPrice('0'); setNote('')
          }}>Lançar</button>
        </div>
      </div>

      <div className="grid cards3" style={{marginTop:14}}>
        <div className="card"><div className="pad"><div className="sub">Despesa do dia • {day}</div><div className="kpi">{brl(dayTotal)}</div></div></div>
        <div className="card"><div className="pad"><div className="sub">Total em compras (mês)</div><div className="kpi">{brl(monthTotal)}</div></div></div>
        <div className="card"><div className="pad"><div className="sub">Itens lançados</div><div className="kpi">{purchases.length}</div></div></div>
      </div>

      <div className="hr" />

      <TableWrap>
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Tipo</th><th>Item</th><th>Qtd</th><th>Preço</th><th>Total</th><th style={{width:110, textAlign:'right'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length===0 ? (
              <tr><td colSpan="7" className="small">Nenhuma compra registrada ainda.</td></tr>
            ) : purchases.map(p => (
              <tr key={p.id}>
                <td><strong>{p.day}</strong></td>
                <td><span className="badge">{p.itemKind}</span></td>
                <td>
                  <div><strong>{p.itemName}</strong></div>
                  {p.note ? <div className="small">{p.note}</div> : null}
                </td>
                <td>{p.qty} {p.unit}</td>
                <td>{brl(p.unitPrice)}</td>
                <td><strong>{brl(p.total)}</strong></td>
                <td style={{textAlign:'right'}}><button className="btn danger" onClick={()=>removePurchase(p.id)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </Card>
  )
}

function Sales({ sales, addSale, removeSale, defaultPrice=15 }){
  const [day, setDay] = useState(todayISO())
  const [qty, setQty] = useState('0')
  const [ticket, setTicket] = useState(String(defaultPrice))
  const [pix, setPix] = useState('0')
  const [cash, setCash] = useState('0')
  const [card, setCard] = useState('0')
  const [note, setNote] = useState('')

  const gross = useMemo(()=> num(qty)*num(ticket), [qty,ticket])
  const paySum = useMemo(()=> num(pix)+num(cash)+num(card), [pix,cash,card])
  const dayTotal = useMemo(()=> sales.filter(s=>s.day===day).reduce((a,b)=>a+(b.gross||0),0), [sales, day])
  const monthTotal = useMemo(()=> sales.reduce((a,b)=>a+(b.gross||0),0), [sales])

  return (
    <Card title="Vendas do dia (caixa)" subtitle="Registre quantidade vendida e recebimentos por Pix/Dinheiro/Cartão.">
      <div className="row cols12">
        <div className="col-span-3">
          <label>Data</label>
          <input type="date" value={day} onChange={(e)=>setDay(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label>Qtd vendida</label>
          <input value={qty} onChange={(e)=>setQty(e.target.value)} placeholder="Ex: 10" />
        </div>
        <div className="col-span-2">
          <label>Ticket (R$)</label>
          <input value={ticket} onChange={(e)=>setTicket(e.target.value)} placeholder="Ex: 15" />
        </div>
        <div className="col-span-5">
          <label>Observação (opcional)</label>
          <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Ex: entrega no prédio" />
        </div>

        <div className="col-span-4">
          <label>Recebido no Pix</label>
          <input value={pix} onChange={(e)=>setPix(e.target.value)} placeholder="Ex: 120" />
        </div>
        <div className="col-span-4">
          <label>Recebido em dinheiro</label>
          <input value={cash} onChange={(e)=>setCash(e.target.value)} placeholder="Ex: 30" />
        </div>
        <div className="col-span-4">
          <label>Recebido no cartão</label>
          <input value={card} onChange={(e)=>setCard(e.target.value)} placeholder="Ex: 0" />
        </div>

        <div className="col-span-10">
          {Math.abs(gross - paySum) < 0.01 ? (
            <div className="notice">✅ Fechou certinho. Receita: <b>{brl(gross)}</b></div>
          ) : (
            <div className="notice">
              ⚠️ Diferença de <b>{brl(gross - paySum)}</b> — ajuste Pix/Dinheiro/Cartão para bater com <b>{brl(gross)}</b>.
            </div>
          )}
        </div>
        <div className="col-span-2" style={{display:'flex', alignItems:'end'}}>
          <button className="btn primary" style={{width:'100%'}} onClick={()=>{
            addSale({
              id: uid(),
              day,
              qty: num(qty),
              ticket: num(ticket),
              gross,
              pix: num(pix),
              cash: num(cash),
              card: num(card),
              note: note.trim()
            })
            setQty('0'); setPix('0'); setCash('0'); setCard('0'); setNote('')
          }}>Lançar</button>
        </div>
      </div>

      <div className="grid cards3" style={{marginTop:14}}>
        <div className="card"><div className="pad"><div className="sub">Receita do dia • {day}</div><div className="kpi">{brl(dayTotal)}</div></div></div>
        <div className="card"><div className="pad"><div className="sub">Receita (mês)</div><div className="kpi">{brl(monthTotal)}</div></div></div>
        <div className="card"><div className="pad"><div className="sub">Dias lançados</div><div className="kpi">{sales.length}</div></div></div>
      </div>

      <div className="hr" />

      <TableWrap>
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Qtd</th><th>Ticket</th><th>Bruto</th><th>Pix</th><th>Dinheiro</th><th>Cartão</th><th style={{width:110, textAlign:'right'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.length===0 ? (
              <tr><td colSpan="8" className="small">Nenhuma venda registrada ainda.</td></tr>
            ) : sales.map(s => (
              <tr key={s.id}>
                <td><strong>{s.day}</strong></td>
                <td>{s.qty}</td>
                <td>{brl(s.ticket)}</td>
                <td><strong>{brl(s.gross)}</strong></td>
                <td>{brl(s.pix)}</td>
                <td>{brl(s.cash)}</td>
                <td>{brl(s.card)}</td>
                <td style={{textAlign:'right'}}><button className="btn danger" onClick={()=>removeSale(s.id)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </Card>
  )
}

function Summary({ purchases, sales, onDemo, onClear }){
  const purchaseByMonth = useMemo(()=>{
    const m=new Map()
    purchases.forEach(p=>{
      const k=monthKey(p.day)
      m.set(k,(m.get(k)||0)+(p.total||0))
    })
    return m
  },[purchases])

  const salesByMonth = useMemo(()=>{
    const m=new Map()
    sales.forEach(s=>{
      const k=monthKey(s.day)
      m.set(k,(m.get(k)||0)+(s.gross||0))
    })
    return m
  },[sales])

  const months = useMemo(()=>{
    const set = new Set([...purchaseByMonth.keys(), ...salesByMonth.keys()])
    return Array.from(set).sort((a,b)=>b.localeCompare(a))
  },[purchaseByMonth,salesByMonth])

  const currentMonth = monthKey(todayISO())
  const rev = salesByMonth.get(currentMonth)||0
  const exp = purchaseByMonth.get(currentMonth)||0
  const prof = rev-exp

  return (
    <div className="grid" style={{gap:14}}>
      <div className="grid cards3">
        <div className="card"><div className="pad"><div className="sub">Receita (mês) • {currentMonth}</div><div className="kpi">{brl(rev)}</div></div></div>
        <div className="card"><div className="pad"><div className="sub">Despesas (mês) • {currentMonth}</div><div className="kpi">{brl(exp)}</div></div></div>
        <div className="card"><div className="pad"><div className="sub">Lucro / Liquidez (mês)</div><div className={"kpi "+(prof<0?'neg':'')}>{brl(prof)}</div></div></div>
      </div>

      <Card
        title="Painel tipo caixa (ações rápidas)"
        subtitle="Carrega exemplo em 1 clique ou zera tudo para começar o mês do zero."
        right={
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className="btn" onClick={onDemo}>Carregar exemplo</button>
            <button className="btn danger" onClick={onClear}>Zerar dados</button>
          </div>
        }
      >
        <div className="notice">
          <b>Regra do jogo:</b> compras entram como <b>despesa</b>, vendas entram como <b>receita</b>. No resumo você enxerga a liquidez do mês.
        </div>
      </Card>

      <Card title="Consolidado por mês" subtitle="Somatório automático para você ter o resultado do mês sem planilha torta.">
        <TableWrap>
          <table>
            <thead><tr><th>Mês</th><th>Receita</th><th>Despesas</th><th>Lucro</th></tr></thead>
            <tbody>
              {months.length===0 ? (
                <tr><td colSpan="4" className="small">Sem lançamentos ainda.</td></tr>
              ) : months.map(m=>{
                const r=salesByMonth.get(m)||0
                const e=purchaseByMonth.get(m)||0
                const p=r-e
                return (
                  <tr key={m}>
                    <td><strong>{m}</strong></td>
                    <td><strong>{brl(r)}</strong></td>
                    <td>{brl(e)}</td>
                    <td><strong className={p<0?'kpi neg':''}>{brl(p)}</strong></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </div>
  )
}

export default function Dashboard({ session, onLogout }){
  const [tab, setTab] = useState('resumo')
  const [state, setState] = useState(()=>loadState())

  function update(patch){
    setState(prev=>{
      const next = { ...prev, ...patch }
      saveState(next)
      return next
    })
  }

  function addCatalogItem(key, item){
    update({ [key]: [item, ...state[key]] })
  }
  function removeCatalogItem(key, id){
    update({ [key]: state[key].filter(x=>x.id!==id) })
  }

  function addPurchase(p){
    update({ purchases: [p, ...state.purchases] })
  }
  function removePurchase(id){
    update({ purchases: state.purchases.filter(x=>x.id!==id) })
  }
  function addSale(s){
    update({ sales: [s, ...state.sales] })
  }
  function removeSale(id){
    update({ sales: state.sales.filter(x=>x.id!==id) })
  }

  function demo(){
    const d = todayISO()
    const examplePurchases = [
      { id: uid(), day:d, itemId:'', itemName:'Açúcar refinado', itemKind:'Produto', unit:'kg', qty:1, unitPrice:2.98, total:2.98, note:'reposição' },
      { id: uid(), day:d, itemId:'', itemName:'Nutella', itemKind:'Recheio', unit:'g', qty:350, unitPrice:0.052, total:18.2, note:'pote fracionado (exemplo)' },
      { id: uid(), day:d, itemId:'', itemName:'Embalagens (saco + lacre)', itemKind:'Utensílio', unit:'un', qty:10, unitPrice:0.35, total:3.5, note:'10 unidades' },
    ]
    const exampleSales = [
      { id: uid(), day:d, qty:10, ticket:15, gross:150, pix:120, cash:30, card:0, note:'cookies do prédio' }
    ]
    update({ purchases: examplePurchases, sales: exampleSales })
  }

  function clearAll(){
    clearState()
    setState(loadState())
  }

  return (
    <div className="container">
      <Header session={session} onLogout={onLogout} activeTab={tab} setActiveTab={setTab} />

      {tab === 'resumo' ? (
        <Summary purchases={state.purchases} sales={state.sales} onDemo={demo} onClear={clearAll} />
      ) : null}

      {tab === 'produtos' ? (
        <Catalog
          title="Cadastro de Produtos (insumos)"
          helper="Açúcar, farinha, manteiga… o que entra na receita."
          items={state.products}
          onAdd={(item)=>addCatalogItem('products', item)}
          onRemove={(id)=>removeCatalogItem('products', id)}
          defaultUnit="g"
        />
      ) : null}

      {tab === 'recheios' ? (
        <Catalog
          title="Cadastro de Recheios"
          helper="Variedades de recheio (no mínimo 10)."
          items={state.fillings}
          onAdd={(item)=>addCatalogItem('fillings', item)}
          onRemove={(id)=>removeCatalogItem('fillings', id)}
          defaultUnit="g"
        />
      ) : null}

      {tab === 'utensilios' ? (
        <Catalog
          title="Cadastro de Utensílios"
          helper="Embalagens, assadeiras, materiais de apoio."
          items={state.utensils}
          onAdd={(item)=>addCatalogItem('utensils', item)}
          onRemove={(id)=>removeCatalogItem('utensils', id)}
          defaultUnit="un"
        />
      ) : null}

      {tab === 'compras' ? (
        <Purchases
          catalogs={{ products: state.products, fillings: state.fillings, utensils: state.utensils }}
          purchases={state.purchases}
          addPurchase={addPurchase}
          removePurchase={removePurchase}
        />
      ) : null}

      {tab === 'vendas' ? (
        <Sales sales={state.sales} addSale={addSale} removeSale={removeSale} defaultPrice={15} />
      ) : null}

      <div style={{marginTop:18}} className="small">
        PRO tip: para subir no servidor, rode <b>npm run build</b> e envie a pasta <b>dist/</b>.
      </div>
    </div>
  )
}
