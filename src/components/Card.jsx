export default function Card({ title, subtitle, children, right }){
  return (
    <div className="card">
      <div className="pad">
        <div style={{display:'flex', justifyContent:'space-between', gap:12, alignItems:'baseline', flexWrap:'wrap'}}>
          <div>
            <h3 className="title">{title}</h3>
            {subtitle ? <div className="sub">{subtitle}</div> : null}
          </div>
          {right ? <div>{right}</div> : null}
        </div>
        <div className="section">{children}</div>
      </div>
    </div>
  )
}
