// Consulta dos valores Q exportados. Sem treinamento ou requisicoes de rede.
globalThis.DEADLOCK_PARTES=[];
const DeadlockLocal=(()=>{
  let cfg, partes, items, heroes, invs, diagInvs, contexts;
  const key=inv=>[...inv].sort((a,b)=>a-b).join(',');
  const types={f32:Float32Array,f64:Float64Array,u8:Uint8Array,u16:Uint16Array,u32:Uint32Array,i32:Int32Array};
  function decode(b64,type){
    const raw=atob(b64), bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    if(new Uint8Array(new Uint16Array([1]).buffer)[0]!==1){const n=types[type].BYTES_PER_ELEMENT;for(let i=0;i<bytes.length;i+=n)bytes.subarray(i,i+n).reverse();}
    return new types[type](bytes.buffer);
  }
  function iniciar(){
    if(cfg)return cfg;
    const c=globalThis.DEADLOCK_CONFIG,p=globalThis.DEADLOCK_PARTES;
    if(!c||c.formato!=='deadlock-static-v1'||p.length!==c.herois.length)throw Error('Arquivos de modelo incompletos.');
    const nc=(c.herois.length-1)*c.distancias.length;
    const nq=c.etapas*c.saldos.length*c.vidas_pct.length*c.inventarios.length*nc*c.acoes.length, nd=c.vidas_pct.length*c.inventarios_duelo.length*nc*5;
    partes=p.map(x=>{const q=decode(x.q,x.qType),v=decode(x.v,x.vType),d=decode(x.d,'i32');if(q.length!==nq||v.length!==nq||d.length!==nd)throw Error('Modelo incompatível.');return {q,v,d};});
    items=new Map(c.itens.map(i=>[i.id,i])); heroes=new Map(c.herois.map((h,i)=>[h.nome,i]));
    invs=new Map(c.inventarios.map((v,i)=>[key(v),i]));diagInvs=new Map(c.inventarios_duelo.map((v,i)=>[key(v),i]));
    contexts=c.herois.map(h=>c.herois.filter(e=>e.nome!==h.nome).flatMap(e=>c.distancias.map(d=>[e.nome,d])));
    cfg=c;globalThis.DEADLOCK_PARTES.length=0;return cfg;
  }
  const idx=(arr,v)=>{const i=arr.indexOf(v);if(i<0)throw Error('Valor fora das opções treinadas.');return i;};
  const maxHP=(hi,inv)=>cfg.herois[hi].vida+inv.reduce((s,id)=>s+items.get(id).vida_extra,0);
  function validar(p){if(!p||!heroes.has(p.adversario))throw Error('Selecione um adversário válido.');idx(cfg.distancias,p.distancia);}
  function item(p){
    validar(p);if(!heroes.has(p.heroi)||p.heroi===p.adversario)throw Error('Selecione dois heróis diferentes.');
    const hi=heroes.get(p.heroi),en=heroes.get(p.adversario),di=idx(cfg.distancias,p.distancia),e=p.etapas_restantes,si=idx(cfg.saldos,p.almas),pi=idx(cfg.vidas_pct,p.vida_pct),inv=p.inventario;
    if(!Number.isInteger(e)||e<1||e>cfg.etapas)throw Error('Duelos restantes inválidos.');
    if(!Array.isArray(inv)||inv.length>cfg.max_itens||new Set(inv).size!==inv.length||inv.some(id=>!items.has(id)))throw Error('Selecione até dois itens diferentes.');
    const ii=invs.get(key(inv)),c=contexts[hi].findIndex(x=>x[0]===p.adversario&&x[1]===p.distancia),nc=contexts[hi].length,na=cfg.acoes.length;
    const start=((((e-1)*cfg.saldos.length+si)*cfg.vidas_pct.length+pi)*cfg.inventarios.length+ii)*nc*na+c*na;
    const part=partes[hi],ranking=[];
    cfg.acoes.forEach((id,ai)=>{
      const guardar=id===-1,custo=guardar?0:items.get(id).custo;if(custo>p.almas||inv.includes(id))return;
      const novo=guardar?inv:[...inv,id],off=((pi*cfg.inventarios_duelo.length+diagInvs.get(key(novo)))*nc+c)*5;
      const flag=part.d[off],v=part.d[off+1]/100,vi=part.d[off+2]/100,dur=part.d[off+3]/100,max=maxHP(hi,novo),maxI=cfg.herois[en].vida;
      const duelo={vitoria:flag===1,empate:flag===2,vida_restante:v,vida_inimigo:vi,duracao:dur,distancia:p.distancia,vida_maxima:max,vida_max_inimigo:maxI,recompensa_imediata:part.d[off+4]/1e6};
      ranking.push({id,nome:guardar?'Guardar almas':items.get(id).nome,custo,valor_q:part.q[start+ai],visitas_episodios:part.v[start+ai],lotes_replay:cfg.replays[hi][e-1],duelo});
    });
    const qg=ranking.find(r=>r.id===-1).valor_q;ranking.forEach(r=>r.delta_guardar=r.valor_q-qg);
    const cmp=(a,b)=>a<b?-1:a>b?1:0;ranking.sort((a,b)=>b.valor_q-a.valor_q||a.custo-b.custo||cmp(a.nome,b.nome));
    const q=ranking[0].valor_q,melhores=ranking.filter(r=>Math.abs(r.valor_q-q)<=cfg.tolerancia),sugerida=[...melhores].sort((a,b)=>a.custo-b.custo||cmp(a.nome,b.nome))[0];
    return {tipo:'item',conhecido:true,valor_q:q,melhores,sugerida,ranking,acoes_conhecidas:ranking.length,acoes_validas:ranking.length,prob_acerto:cfg.acertos[hi][di],prob_acerto_inimigo:cfg.acertos[en][di],mensagem:'Consulta local da Tabela Q: todas as ações válidas deste cenário receberam treinamento ou replay. O diagnóstico do duelo foi pré-calculado pelo mesmo simulador.'};
  }
  function heroi(p){
    validar(p);
    const ranking=cfg.herois.filter(h=>h.nome!==p.adversario).map(h=>{
      const r=item({heroi:h.nome,adversario:p.adversario,distancia:p.distancia,etapas_restantes:1,almas:cfg.almas_iniciais,vida_pct:100,inventario:[]});
      return {nome:h.nome,valor_q:r.valor_q,primeiras_acoes:r.melhores.map(a=>a.nome),acao_sugerida:r.sugerida.nome,duelo:r.sugerida.duelo,prob_acerto:r.prob_acerto,lotes_replay:r.sugerida.lotes_replay};
    }).sort((a,b)=>b.valor_q-a.valor_q);
    const q=ranking[0].valor_q;
    return {tipo:'heroi',conhecido:true,adversario:p.adversario,distancia:p.distancia,valor_q:q,melhores:ranking.filter(r=>Math.abs(r.valor_q-q)<=cfg.tolerancia),ranking,herois_conhecidos:ranking.length,herois_validos:ranking.length,mensagem:`Comparação a ${p.distancia} m, em um único duelo: vida cheia, 800 almas e inventário vazio. Cada candidato usa a melhor ação aprendida contra este adversário.`};
  }
  function responder(p){iniciar();if(p?.tipo==='item')return item(p);if(p?.tipo==='heroi')return heroi(p);throw Error('Tipo de consulta inválido.');}
  return {iniciar,responder};
})();
