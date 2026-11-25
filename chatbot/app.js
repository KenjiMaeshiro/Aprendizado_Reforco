// A página consulta os valores Q exportados localmente; não implementa aprendizado próprio.
const $ = (id) => document.getElementById(id);
const form = $('query-form');
let config, mode = 'item', busy = false;
const number = (v, digits = 2) => Number(v).toLocaleString('pt-BR', { maximumFractionDigits: digits });
const qNumber = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
const initialMessage = $('messages').firstElementChild.cloneNode(true);
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function option(value, label) { const el = node('option', '', label); el.value = value; return el; }
function inventory() { return [...$('items').querySelectorAll('input:checked')].map(el => Number(el.value)); }
function heroData() { return config.herois.find(h => h.nome === $('heroi').value); }
function maxHealth() { return heroData().vida + config.itens.filter(i => inventory().includes(i.id)).reduce((s, i) => s + i.vida_extra, 0); }
function health(fill = false) {
  if (!config) return;
  if (fill) $('vida').value = '100';
  const max = maxHealth(), pct = Number($('vida').value);
  $('vida-max').textContent = `${number(max*pct/100)} / ${number(max)} HP`;
  $('health-fill').style.width = `${pct}%`;
  const count = inventory().length;
  $('inventory-count').textContent = `${count} / ${config.max_itens} itens`;
  for (const el of $('items').querySelectorAll('input')) el.disabled = mode !== 'item' || (!el.checked && count >= config.max_itens);
}
function updateEnemies() {
  if (!config) return;
  const previous = $('adversario').value || 'Abrams';
  const candidates = config.herois.filter(h => mode === 'heroi' || h.nome !== $('heroi').value);
  $('adversario').replaceChildren(...candidates.map(h => option(h.nome, h.nome)));
  if (candidates.some(h => h.nome === previous)) $('adversario').value = previous;
}
function setMode(value) {
  mode = value;
  const itemMode = mode === 'item';
  $('mode-item').classList.toggle('active', itemMode);
  $('mode-hero').classList.toggle('active', !itemMode);
  $('mode-item').setAttribute('aria-pressed', String(itemMode));
  $('mode-hero').setAttribute('aria-pressed', String(!itemMode));
  $('hero-field').hidden = !itemMode;
  $('item-fields').hidden = !itemMode;
  $('hero-info').hidden = itemMode;
  $('item-fields').querySelectorAll('input,select').forEach(el => el.disabled = !itemMode);
  $('heroi').disabled = !itemMode;
  $('submit').textContent = itemMode ? 'Consultar agente ↗' : 'Comparar heróis ↗';
  $('form-error').hidden = true;
  updateEnemies();
  if (itemMode) health();
}
function addMessage(kind, text) {
  const message = node('div', `message ${kind}`);
  if (kind === 'bot') message.append(node('div', 'avatar', 'Q'));
  const bubble = node('div', 'bubble');
  bubble.append(node('div', 'sender', kind === 'bot' ? 'ASSISTENTE' : 'VOCÊ'));
  if (text) bubble.append(node('p', '', text));
  message.append(bubble);
  $('messages').append(message);
  $('messages').scrollTop = $('messages').scrollHeight;
  return bubble;
}
function resumoDuelo(d) {
  const resultado = d.vitoria ? 'Vitória simulada' : d.empate ? 'Empate no duelo' : 'Derrota simulada';
  return `${resultado} · Vida final: ${number(d.vida_restante)} / ${number(d.vida_maxima)} HP · Inimigo: ${number(d.vida_inimigo)} / ${number(d.vida_max_inimigo)} HP · ${number(d.duracao)} s`;
}
function showResult(result) {
  const bubble = addMessage('bot', result.mensagem);
  if (!result.conhecido) return;
  const item = result.tipo === 'item';
  bubble.append(node('div', 'result-heading', item ? 'Recomendação de compra' : 'Heróis recomendados · 1 duelo'));
  const tied = result.melhores.length > 1;
  const title = item ? `${result.sugerida.nome}${tied ? ' (menor custo entre empatadas)' : ''}` : result.melhores.map(r => r.nome).join(' / ');
  bubble.append(node('div', 'recommendation', title));
  if (tied) bubble.append(node('p', 'muted', item ? `${result.melhores.length} ações têm retorno equivalente na tolerância do modelo. Priorizamos a de menor custo, sem alterar os valores Q. Consulte todas no ranking.` : 'Há heróis com retorno equivalente. Veja o ranking.'));
  bubble.append(node('span', 'metric', `Melhor valor Q: ${qNumber(result.valor_q)}`));
  if (item) {
    bubble.append(node('p', '', resumoDuelo(result.sugerida.duelo)));
    bubble.append(node('p', 'muted', `Diferença de Q vs. guardar almas: ${qNumber(result.sugerida.delta_guardar)}. Chance base de acerto estimada: jogador ${number(100*result.prob_acerto,1)}%, inimigo ${number(100*result.prob_acerto_inimigo,1)}% (antes do voo).`));
  } else {
    for (const row of result.melhores) bubble.append(node('p', '', `${row.nome} — ${row.acao_sugerida}. ${resumoDuelo(row.duelo)}`));
  }
  bubble.append(node('p', 'muted', item ? `${result.acoes_conhecidas} de ${result.acoes_validas} ações válidas cobertas pelo treinamento e replay.` : `${result.herois_conhecidos} de ${result.herois_validos} heróis elegíveis têm dados para esta comparação.`));
  if (result.valor_q < 0) bubble.append(node('p', 'muted', 'Atenção: mesmo a melhor alternativa tem retorno estimado negativo. A recomendação não garante vitória.'));
  bubble.append(node('p', 'muted', 'Q combina resultado, vida restante ou dano líquido e recompensas futuras descontadas. Não é uma chance de vitória. A simulação utiliza dano esperado pela chance de acerto, não sorteia cada tiro.'));
  const details = node('details', 'ranking');
  details.append(node('summary', '', `Ver ranking (${result.ranking.length})`));
  for (const row of result.ranking) {
    const line = node('div', 'rank-row');
    const desc = node('div', '', row.nome);
    desc.append(node('small', '', item ? `${number(row.custo)} almas · ΔQ vs guardar: ${qNumber(row.delta_guardar)} · ${number(row.visitas_episodios)} visitas em episódios + ${number(row.lotes_replay)} lotes de replay` : `${row.acao_sugerida} · Chance base de acerto: ${number(100*row.prob_acerto,1)}%`));
    desc.append(node('small', '', resumoDuelo(row.duelo)));
    if (result.melhores.some(best => item ? best.id === row.id : best.nome === row.nome)) desc.append(node('small', '', 'Melhor valor Q (inclui empates)'));
    line.append(desc, node('span', 'rank-value', qNumber(row.valor_q)));
    details.append(line);
  }
  bubble.append(details);
  $('messages').scrollTop = $('messages').scrollHeight;
}
$('mode-item').addEventListener('click', () => setMode('item'));
$('mode-hero').addEventListener('click', () => setMode('heroi'));
$('heroi').addEventListener('change', () => { updateEnemies(); health(); });
$('items').addEventListener('change', () => health());
$('vida').addEventListener('change', () => health());
$('vida-cheia').addEventListener('click', () => health(true));
$('clear-chat').addEventListener('click', () => $('messages').replaceChildren(initialMessage.cloneNode(true)));
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!config || busy) return;
  $('form-error').hidden = true;
  const payload = { tipo: mode, adversario: $('adversario').value, distancia: Number($('distancia').value) };
  let text = `Qual herói devo escolher contra ${payload.adversario} a ${payload.distancia} m?`;
  if (mode === 'item') {
    Object.assign(payload, { heroi: $('heroi').value, almas: Number($('almas').value), etapas_restantes: Number($('etapas').value), vida_pct: Number($('vida').value), inventario: inventory() });
    const names = config.itens.filter(i => payload.inventario.includes(i.id)).map(i => i.nome);
    text = `Qual item devo escolher para ${payload.heroi} contra ${payload.adversario} a ${payload.distancia} m? Tenho ${number(payload.almas)} almas, ${payload.vida_pct}% de vida, ${payload.etapas_restantes} duelos restantes e ${names.length ? names.join(', ') : 'nenhum item'}.`;
  }
  addMessage('user', text);
  busy = true; $('submit').disabled = true;
  try {
    const data = DeadlockLocal.responder(payload);
    showResult(data);
  } catch (error) {
    addMessage('bot', `Não foi possível completar a consulta: ${error.message}`);
  } finally { busy = false; $('submit').disabled = false; }
});
async function init() {
  try {
    config = DeadlockLocal.iniciar();
    $('heroi').replaceChildren(...config.herois.map(h => option(h.nome, h.nome)));
    $('distancia').replaceChildren(...config.distancias.map(d => option(d, `${d} m — ${d === 2 ? 'curto' : d === 15 ? 'médio' : 'longo'}`)));
    $('distancia').value = '15';
    $('items').replaceChildren(...config.itens.map(i => {
      const label = node('label', 'item');
      const input = node('input'); input.type = 'checkbox'; input.value = i.id;
      label.append(input, node('span', '', i.nome), node('span', 'cost', number(i.custo)));
      return label;
    }));
    $('hero-count').textContent = number(config.herois.length);
    $('item-count').textContent = number(config.itens.length);
    $('match-count').textContent = number(config.herois.length * (config.herois.length - 1) * config.distancias.length);
    $('almas').replaceChildren(...config.saldos.map(s => option(s, number(s))));
    $('almas').value = String(config.almas_iniciais);
    $('vida').replaceChildren(...config.vidas_pct.map(p => option(p, `${p}%`)));
    $('vida').value = '100';
    $('status').replaceChildren(node('i'), document.createTextNode('Modelo local pronto'));
    $('status').classList.add('ready');
    $('model-info').textContent = `Q-learning · ${number(config.episodios_por_heroi * config.herois.length)} episódios · ${number(config.estados)} cenários na interface · ${number(config.cobertura_pct)}% de cobertura das ações`;
    setMode('item'); health(true); $('submit').disabled = false;
  } catch (error) {
    $('status').replaceChildren(node('i'), document.createTextNode('Modelo indisponível'));
    $('status').classList.add('failed');
    $('form-error').textContent = 'Extraia todo o ZIP, mantenha a pasta modelo junto do index.html e permita JavaScript no navegador.';
    $('form-error').hidden = false;
  }
}
init();
