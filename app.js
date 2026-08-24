"use strict";

/* =========================================================
   0. SUPABASE CLIENT
   ========================================================= */
let supa = null;
let currentUser = null;

function initSupabase(){
  if(typeof SUPABASE_URL === 'undefined' || SUPABASE_URL.indexOf('COLE_AQUI') === 0){
    document.getElementById('auth-msg').textContent = 'Configure o config.js com suas chaves do Supabase antes de usar.';
    return false;
  }
  supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

/* =========================================================
   1. ÍCONES (SVG inline, sem dependências externas)
   ========================================================= */
const ICONS = {
  dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  calendar:'<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  wallet:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M16.5 14.5h.01"/>',
  chart:'<path d="M3 3v18h18"/><path d="M8 17v-4M13 17V7M18 17v-7"/>',
  bot:'<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2.5"/><path d="M2 14h2M20 14h2M9 13v2M15 13v2"/>',
  book:'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  dumbbell:'<path d="M3.5 9v6M6.5 6.5v11M17.5 6.5v11M20.5 9v6M6.5 12h11"/>',
  home:'<path d="m3 9.5 9-7 9 7V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9.5 22v-9h5v9"/>',
  moon:'<path d="M12 3a6.5 6.5 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>',
  dollar:'<circle cx="12" cy="12" r="9.5"/><path d="M15.5 8.5h-5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4h-5M12 6.5v11"/>',
  clock:'<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5.3l3.4 2"/>',
  shield:'<path d="M20 12.5c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20 4 17.5 4 12.5V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  sparkles:'<path d="m12 3.2-1.6 4.6a2 2 0 0 1-1.25 1.25L4.5 10.7l4.65 1.6a2 2 0 0 1 1.25 1.25l1.6 4.65 1.6-4.65a2 2 0 0 1 1.25-1.25l4.65-1.6-4.65-1.65a2 2 0 0 1-1.25-1.25z"/><path d="M18.5 3v3M20 4.5h-3M5.5 17v3M7 18.5H4"/>',
  trending:'<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  search:'<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  settings:'<path d="M20 7h-9M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
  check:'<path d="m20 6-11 11-5-5"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  plus:'<path d="M5 12h14M12 5v14"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  more:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  play:'<path d="M6.5 4.2 19 12 6.5 19.8z"/>',
  zap:'<path d="M12.5 2 4 13.5h6.5L11 22l8.5-11.5H13z"/>',
  trash:'<path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/>',
  download:'<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 20v-4h4"/>',
  flame:'<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4.5-9.5C14 4 13 3 12 2c-.5 3-2 4.5-3.5 6.5C7 10.5 5 12.5 5 15a7 7 0 0 0 7 7Z"/><path d="M12 22a3 3 0 0 0 3-3c0-1.8-1.5-2.6-2-4-1 1.2-1.7 1.7-2.3 2.6-.4.6-.7 1-.7 1.6a3 3 0 0 0 2 2.8Z"/>',
  plane:'<path d="M17.8 19.8 16 14l-4.5 1.5-1 3.5-2 .5.8-4.2-3.6 1.2-.7 1.9-1.5.4.6-2.6-1.6-1.1 1.5-.5 1.7 1 3.6-1.2-3.3-2.7 1.5-1.6 4.9 2.6L16 9l1.8-5.8a1.4 1.4 0 0 1 2.6.9L19 9.6l2.6 1.4a1.5 1.5 0 0 1 0 2.6L19 15l1.4 4.9a1.4 1.4 0 0 1-2.6-.1Z"/>',
  sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
  scale:'<path d="M12 3v18M7 21h10"/><path d="M12 6 4 9l3 6a3.2 3.2 0 0 0 6 0z" opacity=".55"/><path d="M12 6l8 3-3 6a3.2 3.2 0 0 1-6 0z" opacity=".55"/>',
  drop:'<path d="M12 2.7 6.8 9.4a7 7 0 1 0 10.4 0z"/>',
  utensils:'<path d="M4 2v7a2.5 2.5 0 0 0 5 0V2M6.5 9v13M18 2c-1.8 1.2-2.5 3-2.5 5.5S16 12 18 12.5V22"/>',
  flag:'<path d="M4 22V3M4 4h11l-1.5 3.5L15 11H4"/>',
  brain:'<path d="M9.5 3A2.5 2.5 0 0 0 7 5.5 2.5 2.5 0 0 0 5 8a2.5 2.5 0 0 0 .6 1.6A2.6 2.6 0 0 0 5 12a2.6 2.6 0 0 0 1 2 2.5 2.5 0 0 0 .4 3.4A2.5 2.5 0 0 0 9 21a3 3 0 0 0 3-3V4.8A2 2 0 0 0 9.5 3Z"/><path d="M14.5 3A2.5 2.5 0 0 1 17 5.5 2.5 2.5 0 0 1 19 8a2.5 2.5 0 0 1-.6 1.6A2.6 2.6 0 0 1 19 12a2.6 2.6 0 0 1-1 2 2.5 2.5 0 0 1-.4 3.4A2.5 2.5 0 0 1 15 21a3 3 0 0 1-3-3V4.8A2 2 0 0 1 14.5 3Z"/>',
  alert:'<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4M12 17.2h.01"/>',
  steps:'<path d="M6.5 3.5c1.7 0 2.6 1.3 2.6 3 0 1.2-.4 2.4-.4 3.4 0 1.6.9 2.1.9 3.4 0 1.5-1.2 2.2-2.6 2.2s-2.6-.7-2.6-2.2c0-1.3.9-1.8.9-3.4 0-1-.4-2.2-.4-3.4 0-1.7.9-3 1.6-3ZM6 17.5c1.6 0 2.5.7 2.5 1.6S7.6 21 6.2 21 4 20.3 4 19.3s.4-1.8 2-1.8Z"/><path d="M17 6.5c1.7 0 2.6 1.3 2.6 3 0 1.2-.4 2.4-.4 3.4 0 1.6.9 2.1.9 3.4 0 1.5-1.2 2.2-2.6 2.2s-2.6-.7-2.6-2.2c0-1.3.9-1.8.9-3.4 0-1-.4-2.2-.4-3.4 0-1.7.9-3 1.6-3Z" opacity=".6"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
};
function icon(name, size, opts){
  size = size || 20; opts = opts || {};
  const body = ICONS[name] || '';
  const fill = opts.fill ? 'currentColor' : 'none';
  const sw = opts.sw || 2;
  return '<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="'+fill+'" stroke="currentColor" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round">'+body+'</svg>';
}

/* =========================================================
   2. DADOS DO SISTEMA
   ========================================================= */
const COLORS = { emerald:'#10b981', blue:'#3b82f6', violet:'#8b5cf6', amber:'#f59e0b', rose:'#f43f5e', indigo:'#6366f1', cyan:'#06b6d4', slate:'#64748b' };

const NAV = [
  { id:'dashboard', label:'Briefing',     icon:'dashboard' },
  { id:'planner',   label:'Planner',      icon:'calendar' },
  { id:'agenda',    label:'Agenda e Eventos', icon:'plane' },
  { id:'saude',     label:'Saúde',        icon:'activity' },
  { id:'nutricao',  label:'Nutrição',     icon:'utensils' },
  { id:'carreira',  label:'Carreira',     icon:'briefcase' },
  { id:'financas',  label:'Finanças',     icon:'wallet' },
  { id:'objetivos', label:'Objetivos e OKRs', icon:'flag' },
  { id:'analytics', label:'Analytics',    icon:'chart' },
  { id:'ia',        label:'Central de IA', icon:'bot' },
];

const CATS = {
  espiritual:    { label:'Espiritual',      color:'violet',  icon:'book' },
  carreira:      { label:'Carreira',        color:'blue',    icon:'briefcase' },
  trabalho:      { label:'Trabalho',        color:'amber',   icon:'target' },
  saude:         { label:'Saúde',           color:'emerald', icon:'dumbbell' },
  casa:          { label:'Casa',            color:'rose',    icon:'home' },
  sono:          { label:'Sono',            color:'indigo',  icon:'moon' },
  financas:      { label:'Finanças',        color:'amber',   icon:'dollar' },
  relacionamento:{ label:'Relacionamento',  color:'rose',    icon:'heart' },
};

const CICLO_INICIO = '2026-08-24';   /* segunda-feira da Semana 1 */

function isoDoDia(i){
  const d = new Date(CICLO_INICIO + 'T00:00:00');
  d.setDate(d.getDate() + i);
  return d.toISOString().slice(0, 10);
}

const WEEK = [
  { short:'SEG', full:'Segunda-feira', day:24, date:'24/08', workout:'Academia A',        wmeta:'Saúde • força • 45 min',      study:'SQL: SELECT, WHERE e ORDER BY', smeta:'Carreira • 3 consultas',        home:'Reset da cozinha',        work:'Entrega crítica e revisão de SLA' },
  { short:'TER', full:'Terça-feira',   day:25, date:'25/08', workout:'Corrida 6x 1:2',    wmeta:'Saúde • cardio • 30 min',     study:'Modelo estrela',                smeta:'Carreira • fato e dimensão',    home:'Lavanderia',              work:'Pareto operacional' },
  { short:'QUA', full:'Quarta-feira',  day:26, date:'26/08', workout:'Academia B',        wmeta:'Saúde • força • 45 min',      study:'Estatística descritiva',        smeta:'Carreira • média e desvio',     home:'Repor refeições',         work:'Melhorar controle de fila' },
  { short:'QUI', full:'Quinta-feira',  day:27, date:'27/08', workout:'Mobilidade 15 min', wmeta:'Saúde • recuperação',         study:'Power Query: tratar nulos',     smeta:'Carreira • limpeza de dados',   home:'Banheiro',                work:'Validar evidências' },
  { short:'SEX', full:'Sexta-feira',   day:28, date:'28/08', workout:'Caminhada 20 min',  wmeta:'Saúde • movimento leve',      study:'Power Automate: fluxo 1',       smeta:'Carreira • automação básica',   home:'Revisão financeira',      work:'Fechar entregas da semana' },
  { short:'SÁB', full:'Sábado',        day:29, date:'29/08', workout:'Academia C',        wmeta:'Saúde • força • 45 min',      study:'Projeto Qualidade',             smeta:'Carreira • artefato do ciclo',  home:'Compras + encontro',      work:'Bloco livre' },
  { short:'DOM', full:'Domingo',       day:30, date:'30/08', workout:'Corrida 6x 1:2',    wmeta:'Saúde • cardio • 30 min',     study:'Revisão semanal',               smeta:'Carreira • consolidar notas',   home:'Preparo + planejamento',  work:'Definir 3 prioridades' },
];
WEEK.forEach(function(w, i){ w.iso = isoDoDia(i); });

const PILLARS = [
  { key:'saude',          label:'Saúde',           target:'3 treinos/sem',   icon:'activity',  color:'#10b981' },
  { key:'carreira',       label:'Carreira',        target:'5 blocos/sem',    icon:'briefcase', color:'#3b82f6' },
  { key:'espiritual',     label:'Espiritual',      target:'7 orações/sem',   icon:'book',      color:'#8b5cf6' },
  { key:'relacionamento', label:'Relacionamento',  target:'1 encontro/sem',  icon:'heart',     color:'#f43f5e' },
  { key:'financas',       label:'Finanças',        target:'R$ 300/mês',      icon:'dollar',    color:'#f59e0b' },
  { key:'casa',           label:'Casa',            target:'6 resets/sem',    icon:'home',      color:'#06b6d4' },
];

const AGENTS = [
  { name:'Mentor',     desc:'Converte metas em decisões práticas e protege sua capacidade semanal.',        icon:'sparkles', color:'violet',  prompt:'Qual é minha maior prioridade agora?' },
  { name:'Auditor',    desc:'Identifica desvios, evidências ausentes, riscos e causa raiz das falhas.',      icon:'shield',   color:'emerald', prompt:'Onde estou falhando?' },
  { name:'Planejador', desc:'Recalcula a semana pela capacidade real e propõe o replanejamento.',            icon:'calendar', color:'blue',    prompt:'Como reorganizar minha semana?' },
  { name:'Analista',   desc:'Lê tendências, correlações e Pareto para explicar o porquê dos números.',       icon:'chart',    color:'amber',   prompt:'Quais tendências existem nos meus dados?' },
  { name:'Nutricionista', desc:'Traduz peso, meta e treino em calorias, macros e cardápio operacional.',     icon:'utensils', color:'rose',    prompt:'O que devo comer hoje?' },
  { name:'Personal Trainer', desc:'Define o treino do dia pela fadiga acumulada e capacidade física.',       icon:'dumbbell', color:'emerald', prompt:'Qual treino é ideal para hoje?' },
  { name:'Especialista em Sono', desc:'Calcula desligamento e janela de sono a partir da agenda futura.',    icon:'moon',     color:'indigo',  prompt:'Qual horário devo dormir?' },
  { name:'Conselheiro Financeiro', desc:'Verifica aportes, reserva e aderência ao plano financeiro.',        icon:'dollar',   color:'amber',   prompt:'Estou dentro do plano financeiro?' },
  { name:'Coach de Carreira', desc:'Acelera a trilha técnica e conecta estudo a objetivos e OKRs.',          icon:'briefcase', color:'blue',   prompt:'Como atingir meus objetivos profissionais mais rápido?' },
];

const MODES = {
  'Ideal':          { badge:'badge-emerald', bar:'#34d399', text:'Agenda completa, com até 2 blocos exigentes.' },
  'Normal':         { badge:'badge-blue',    bar:'#3b82f6', text:'Entregar 80%, preservando treino ou caminhada e estudo focado.' },
  'Ruim':           { badge:'badge-amber',   bar:'#fbbf24', text:'Manter a cadeia com movimento, 10 min de estudo e reset curto.' },
  'Mínimo viável':  { badge:'badge-rose',    bar:'#fb7185', text:'Não zerar. Execute uma ação essencial por pilar prioritário.' },
};

const SLEEP = [
  { d:'SEG', h:6.9 }, { d:'TER', h:7.4 }, { d:'QUA', h:6.6 }, { d:'QUI', h:7.1 },
  { d:'SEX', h:7.0 }, { d:'SÁB', h:8.1 }, { d:'DOM', h:6.8 },
];

const TRILHA = [
  { n:'Fundamentos de SQL',            s:'doing' },
  { n:'Modelagem dimensional',         s:'todo'  },
  { n:'Power Query e limpeza',         s:'todo'  },
  { n:'Power BI: primeiro dashboard',  s:'todo'  },
  { n:'Projeto Qualidade ponta a ponta', s:'todo' },
  { n:'Portfólio e revisão final',     s:'todo'  },
];

const APORTES_DEFAULT = [
  { m:'Ago/26', v:300, ok:true },  { m:'Set/26', v:300, ok:false }, { m:'Out/26', v:300, ok:false },
  { m:'Nov/26', v:300, ok:false }, { m:'Dez/26', v:300, ok:false }, { m:'Jan/27', v:300, ok:false },
];

const TODAY = 0;   /* índice do dia atual no ciclo (segunda) */

/* Perfil operacional: alimenta capacidade, sono, nutrição e projeção de peso */
const PROFILE_DEFAULT = {
  nome:'Vinicius', sexo:'M', idade:30, altura_cm:178,
  peso_kg:105, meta_peso_kg:90, meta_data:'2027-02-21',
  atividade:'moderado', objetivo:'emagrecimento',
  sono_meta_h:7.5, prep_min:60, deslocamento_min:80,
  trabalho_inicio:'09:00', trabalho_fim:'18:00',
};

/* Objetivos → Metas → Projetos → Tarefas, com KRs de progresso automático */
const OBJETIVOS_DEFAULT = [
  { id:'o-carreira', titulo:'Virar analista de dados empregável', pilar:'carreira', horizonte:'Ciclo de 26 semanas', prazo:'2027-02-21',
    krs:[
      { id:'kr-1', titulo:'Blocos de estudo concluídos', unidade:'blocos', inicio:0, alvo:14, atual:0, fonte:'tarefas', filtro:'carreira' },
      { id:'kr-2', titulo:'Artefatos no portfólio',       unidade:'projetos', inicio:0, alvo:4, atual:1, fonte:'manual' },
    ],
    projetos:[ { titulo:'Projeto Qualidade ponta a ponta', status:'doing' }, { titulo:'Dashboard de operação', status:'todo' } ] },
  { id:'o-saude', titulo:'Chegar a 90 kg com saúde e constância', pilar:'saude', horizonte:'6 meses', prazo:'2027-02-21',
    krs:[
      { id:'kr-3', titulo:'Peso corporal',        unidade:'kg', inicio:105, alvo:90, atual:105, fonte:'peso' },
      { id:'kr-4', titulo:'Sessões de treino',    unidade:'sessões', inicio:0, alvo:7, atual:0, fonte:'tarefas', filtro:'saude' },
    ],
    projetos:[ { titulo:'Cardápio A e rotina de treino', status:'doing' } ] },
  { id:'o-financas', titulo:'Construir reserva de emergência', pilar:'financas', horizonte:'6 meses', prazo:'2027-01-31',
    krs:[
      { id:'kr-5', titulo:'Reserva acumulada', unidade:'R$', inicio:0, alvo:1800, atual:0, fonte:'aportes' },
    ],
    projetos:[ { titulo:'Aporte mensal automático', status:'doing' } ] },
];

/* Eventos de exemplo — o diferencial pedido: agenda futura com impacto calculado */
const EVENTOS_DEFAULT = [
  { id:'ev-1', data:isoDoDia(1), tipo:'consulta',   titulo:'Consulta médica',    inicio:'08:00', fim:'09:30', deslocamento_min:50, intensidade:2, nota:'Levar exames anteriores' },
  { id:'ev-2', data:isoDoDia(2), tipo:'presencial', titulo:'Trabalho presencial', inicio:'09:00', fim:'18:00', deslocamento_min:80, intensidade:3, nota:'Escritório — dia cheio' },
  { id:'ev-3', data:isoDoDia(4), tipo:'viagem',     titulo:'Viagem a trabalho',   inicio:'07:20', fim:'21:20', deslocamento_min:80, intensidade:5, nota:'Saída de casa 06:00, retorno 22:40' },
];

/* =========================================================
   3. ESTADO + PERSISTÊNCIA (Supabase, com fallback local)
   ========================================================= */
function buildWeek(){
  return WEEK.map(function(d, i){
    return {
      tasks: [
        { id:i+'-a', time:'06:00', title:'Oração e início consciente',            meta:'Espiritual • 10 min',            cat:'espiritual', done:false },
        { id:i+'-b', time:'07:10', title:'Revisar flashcards no deslocamento',    meta:'Carreira • conteúdo leve • 15 min', cat:'carreira',   done:false },
        { id:i+'-c', time:'09:00', title:d.work,                                  meta:'Trabalho • foco principal',      cat:'trabalho',   done:false },
        { id:i+'-d', time:'19:10', title:d.workout,                               meta:d.wmeta,                          cat:'saude',      done:false },
        { id:i+'-e', time:'20:45', title:d.study,                                 meta:d.smeta,                          cat:'carreira',   ic:'book', done:false },
        { id:i+'-f', time:'21:45', title:d.home,                                  meta:'Casa • reset de 10 min',         cat:'casa',       done:false },
        { id:i+'-g', time:'22:15', title:'Desligamento e preparação para dormir', meta:'Sono • meta 22:30',              cat:'sono',       done:false },
      ]
    };
  });
}

const state = {
  active:'dashboard', sidebar:true, mobileOpen:false, dayIndex:TODAY,
  mode:'Normal', search:'', agentOpen:null, agentText:'', agentAnswer:'', agentBusy:false,
  modal:null, days:buildWeek(), aportes: APORTES_DEFAULT.slice(),
  flags:{ gastos:false, encontro:false },
  syncing:false, lastSync:null,
  /* --- Life Intelligence Engine --- */
  profile: Object.assign({}, PROFILE_DEFAULT),
  events: EVENTOS_DEFAULT.slice(),
  health: {},          /* { '2026-08-24': { peso_kg, cintura_cm, pa_sis, pa_dia, agua_ml, passos, sono_h, energia, humor, estresse, foco } } */
  objectives: JSON.parse(JSON.stringify(OBJETIVOS_DEFAULT)),
  failures: [],        /* { id, task_id, dia, iso, motivo, nota } */
  analyticsRange: 30,
};

/* Contexto consumido pelo motor — sempre derivado do state atual */
function ctx(){
  return {
    profile: state.profile, days: state.days, week: WEEK,
    events: state.events, health: state.health, objectives: state.objectives,
    failures: state.failures, aportes: state.aportes, todayIndex: TODAY,
  };
}

const STORE_KEY = 'vinicius-os-v3';

function saveLocal(){
  try{
    localStorage.setItem(STORE_KEY, JSON.stringify({
      active:state.active, sidebar:state.sidebar, dayIndex:state.dayIndex,
      mode:state.mode, days:state.days, flags:state.flags, aportes:state.aportes,
      profile:state.profile, events:state.events, health:state.health,
      objectives:state.objectives, failures:state.failures
    }));
  }catch(e){ /* ignore */ }
}
function loadLocal(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return;
    const s = JSON.parse(raw);
    if(s && Array.isArray(s.days) && s.days.length === 7){
      state.days = s.days;
      state.mode = MODES[s.mode] ? s.mode : state.mode;
      state.active = NAV.some(function(n){ return n.id === s.active; }) ? s.active : state.active;
      state.dayIndex = (typeof s.dayIndex === 'number' && s.dayIndex >= 0 && s.dayIndex < 7) ? s.dayIndex : TODAY;
      state.sidebar = s.sidebar !== false;
      state.flags = Object.assign({ gastos:false, encontro:false }, s.flags || {});
      if(Array.isArray(s.aportes)) state.aportes = s.aportes;
    }
    if(s.profile)   state.profile = Object.assign({}, PROFILE_DEFAULT, s.profile);
    if(Array.isArray(s.events))     state.events = s.events;
    if(s.health && typeof s.health === 'object') state.health = s.health;
    if(Array.isArray(s.objectives) && s.objectives.length) state.objectives = s.objectives;
    if(Array.isArray(s.failures))   state.failures = s.failures;
  }catch(e){ /* ignore */ }
}

/* ---- Supabase sync: puxa tudo do banco para o state ---- */
async function pullFromCloud(){
  if(!supa || !currentUser) return;
  state.syncing = true;

  const { data: tasksRows } = await supa.from('tasks').select('*').eq('user_id', currentUser.id);
  const { data: stateRow } = await supa.from('app_state').select('*').eq('user_id', currentUser.id).maybeSingle();
  const { data: aportesRows } = await supa.from('aportes').select('*').eq('user_id', currentUser.id).order('created_at');

  if(tasksRows && tasksRows.length){
    const days = buildWeek();
    tasksRows.forEach(function(r){
      const di = r.day_index;
      if(di < 0 || di > 6) return;
      const idx = days[di].tasks.findIndex(function(t){ return t.id === r.id; });
      const task = { id:r.id, time:r.time, title:r.title, meta:r.meta || '', cat:r.cat, ic:r.icon, done:r.done, remote:true };
      if(idx >= 0) days[di].tasks[idx] = task; else days[di].tasks.push(task);
    });
    days.forEach(function(d){ d.tasks.sort(function(a,b){ return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; }); });
    state.days = days;
  } else {
    // primeira vez: semeia o banco com o plano padrão
    await seedCloud();
  }

  if(stateRow){
    state.active = NAV.some(function(n){ return n.id === stateRow.active_view; }) ? stateRow.active_view : state.active;
    state.dayIndex = stateRow.day_index != null ? stateRow.day_index : TODAY;
    state.mode = MODES[stateRow.mode] ? stateRow.mode : state.mode;
    state.flags = Object.assign({ gastos:false, encontro:false }, stateRow.flags || {});
  } else {
    await supa.from('app_state').upsert({ user_id: currentUser.id, active_view: state.active, day_index: state.dayIndex, mode: state.mode, flags: state.flags });
  }

  if(aportesRows && aportesRows.length){
    state.aportes = aportesRows.map(function(r){ return { m:r.mes, v:Number(r.valor), ok:r.confirmado, id:r.id }; });
  } else {
    await seedAportes();
  }

  await pullExtras();

  state.syncing = false;
  state.lastSync = new Date();
}

/* ---- Sincroniza perfil, eventos, saúde, objetivos e falhas ---- */
async function pullExtras(){
  if(!supa || !currentUser) return;
  const uid = currentUser.id;

  const [prof, evs, hl, objs, fails] = await Promise.all([
    supa.from('profiles').select('*').eq('user_id', uid).maybeSingle(),
    supa.from('events').select('*').eq('user_id', uid).order('data'),
    supa.from('health_logs').select('*').eq('user_id', uid).order('data'),
    supa.from('objectives').select('*, key_results(*)').eq('user_id', uid),
    supa.from('task_failures').select('*').eq('user_id', uid).order('created_at'),
  ]);

  if(prof && prof.data){
    state.profile = Object.assign({}, PROFILE_DEFAULT, prof.data.dados || {}, { id: prof.data.id });
  } else {
    await supa.from('profiles').upsert({ user_id: uid, dados: state.profile });
  }

  if(evs && evs.data && evs.data.length){
    state.events = evs.data.map(function(r){
      return { id:r.id, data:r.data, tipo:r.tipo, titulo:r.titulo, inicio:r.inicio,
               fim:r.fim, deslocamento_min:r.deslocamento_min, intensidade:r.intensidade, nota:r.nota };
    });
  }

  if(hl && hl.data && hl.data.length){
    const h = {};
    hl.data.forEach(function(r){
      h[r.data] = { id:r.id, peso_kg:r.peso_kg, cintura_cm:r.cintura_cm, pa_sis:r.pa_sis, pa_dia:r.pa_dia,
                    agua_ml:r.agua_ml, passos:r.passos, sono_h:r.sono_h, energia:r.energia,
                    humor:r.humor, estresse:r.estresse, foco:r.foco };
    });
    state.health = h;
  }

  if(objs && objs.data && objs.data.length){
    state.objectives = objs.data.map(function(o){
      return { id:o.id, titulo:o.titulo, pilar:o.pilar, horizonte:o.horizonte, prazo:o.prazo,
               projetos:o.projetos || [],
               krs:(o.key_results || []).map(function(k){
                 return { id:k.id, titulo:k.titulo, unidade:k.unidade, inicio:Number(k.inicio),
                          alvo:Number(k.alvo), atual:Number(k.atual), fonte:k.fonte, filtro:k.filtro };
               }) };
    });
  }

  if(fails && fails.data){
    state.failures = fails.data.map(function(r){
      return { id:r.id, task_id:r.task_id, iso:r.data, motivo:r.motivo, nota:r.nota };
    });
  }
}

async function pushProfile(){
  saveLocal();
  if(!supa || !currentUser) return;
  await supa.from('profiles').upsert({ user_id: currentUser.id, dados: state.profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

async function pushEvent(ev){
  saveLocal();
  if(!supa || !currentUser) return;
  const payload = { user_id: currentUser.id, data: ev.data, tipo: ev.tipo, titulo: ev.titulo,
                    inicio: ev.inicio, fim: ev.fim, deslocamento_min: ev.deslocamento_min,
                    intensidade: ev.intensidade, nota: ev.nota || null };
  if(ev.id && String(ev.id).length === 36){
    await supa.from('events').update(payload).eq('id', ev.id);
  } else {
    const { data } = await supa.from('events').insert(payload).select().single();
    if(data) ev.id = data.id;
  }
}

async function pushHealth(iso, rec){
  saveLocal();
  if(!supa || !currentUser) return;
  const payload = Object.assign({ user_id: currentUser.id, data: iso }, rec);
  delete payload.id;
  const { data } = await supa.from('health_logs').upsert(payload, { onConflict: 'user_id,data' }).select().single();
  if(data) rec.id = data.id;
}

async function pushFailure(f){
  saveLocal();
  if(!supa || !currentUser) return;
  const { data } = await supa.from('task_failures').insert({
    user_id: currentUser.id, task_id: String(f.task_id).length === 36 ? f.task_id : null,
    data: f.iso, motivo: f.motivo, nota: f.nota || null
  }).select().single();
  if(data) f.id = data.id;
}

async function pushObjectives(){
  saveLocal();
  if(!supa || !currentUser) return;
  for(const o of state.objectives){
    const payload = { user_id: currentUser.id, titulo:o.titulo, pilar:o.pilar,
                      horizonte:o.horizonte, prazo:o.prazo, projetos:o.projetos || [] };
    let oid = o.id;
    if(oid && String(oid).length === 36){
      await supa.from('objectives').update(payload).eq('id', oid);
    } else {
      const { data } = await supa.from('objectives').insert(payload).select().single();
      if(data){ oid = data.id; o.id = oid; }
    }
    for(const k of (o.krs || [])){
      const kp = { user_id: currentUser.id, objective_id: oid, titulo:k.titulo, unidade:k.unidade,
                   inicio:k.inicio, alvo:k.alvo, atual:k.atual, fonte:k.fonte || 'manual', filtro:k.filtro || null };
      if(k.id && String(k.id).length === 36){
        await supa.from('key_results').update(kp).eq('id', k.id);
      } else {
        const { data } = await supa.from('key_results').insert(kp).select().single();
        if(data) k.id = data.id;
      }
    }
  }
}

async function seedCloud(){
  const rows = [];
  state.days.forEach(function(day, di){
    day.tasks.forEach(function(t){
      rows.push({ id: t.id.length === 36 ? t.id : undefined, user_id: currentUser.id, day_index: di, time: t.time, title: t.title, meta: t.meta, cat: t.cat, icon: t.ic || null, done: t.done });
    });
  });
  const { data, error } = await supa.from('tasks').insert(rows.map(function(r){ const c = Object.assign({}, r); delete c.id; return c; })).select();
  if(data){
    const days = buildWeek();
    data.forEach(function(r, i){
      const di = r.day_index;
      if(days[di] && days[di].tasks[ i % 7 < days[di].tasks.length ? 0 : 0]){}
    });
    // Reagrupa por day_index preservando ordem de inserção
    const grouped = {};
    data.forEach(function(r){ (grouped[r.day_index] = grouped[r.day_index] || []).push(r); });
    Object.keys(grouped).forEach(function(di){
      days[di].tasks = grouped[di].map(function(r){ return { id:r.id, time:r.time, title:r.title, meta:r.meta||'', cat:r.cat, ic:r.icon, done:r.done }; })
        .sort(function(a,b){ return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });
    });
    state.days = days;
  }
}

async function seedAportes(){
  const rows = APORTES_DEFAULT.map(function(a){ return { user_id: currentUser.id, mes: a.m, valor: a.v, confirmado: a.ok }; });
  const { data } = await supa.from('aportes').insert(rows).select();
  if(data) state.aportes = data.map(function(r){ return { m:r.mes, v:Number(r.valor), ok:r.confirmado, id:r.id }; });
}

async function pushState(){
  if(!supa || !currentUser) return;
  await supa.from('app_state').upsert({
    user_id: currentUser.id, active_view: state.active, day_index: state.dayIndex,
    mode: state.mode, flags: state.flags, updated_at: new Date().toISOString()
  });
}

async function pushTask(dayIdx, task){
  if(!supa || !currentUser) return;
  const payload = { user_id: currentUser.id, day_index: dayIdx, time: task.time, title: task.title, meta: task.meta, cat: task.cat, icon: task.ic || null, done: task.done, updated_at: new Date().toISOString() };
  if(task.id && task.id.length === 36){
    await supa.from('tasks').update(payload).eq('id', task.id);
  } else {
    const { data } = await supa.from('tasks').insert(payload).select().single();
    if(data) task.id = data.id;
  }
}

async function deleteRemoteTask(taskId){
  if(!supa || !currentUser || !taskId || taskId.length !== 36) return;
  await supa.from('tasks').delete().eq('id', taskId);
}

function save(){
  saveLocal();
  pushState();
}

/* =========================================================
   4. HELPERS
   ========================================================= */
function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function pct(done, total){ return total ? Math.round((done / total) * 100) : 0; }
function dayTasks(i){ return state.days[i].tasks; }
function dayDone(i){ return dayTasks(i).filter(function(t){ return t.done; }).length; }
function dayPct(i){ return pct(dayDone(i), dayTasks(i).length); }
function allTasks(){ return state.days.reduce(function(a,d){ return a.concat(d.tasks); }, []); }
function catCount(cat, onlyDone){
  return allTasks().filter(function(t){ return t.cat === cat && (!onlyDone || t.done); }).length;
}
function weekStats(){
  const all = allTasks();
  const done = all.filter(function(t){ return t.done; }).length;
  return { total: all.length, done: done, pct: pct(done, all.length) };
}
function minutesStudied(){
  let m = 0;
  allTasks().forEach(function(t){
    if(t.cat === 'carreira' && t.done) m += (t.time === '07:10' ? 15 : 45);
  });
  return m;
}
function fmtHM(min){
  const h = Math.floor(min / 60), r = Math.round(min % 60);
  if(h > 0) return h + 'h ' + (r < 10 ? '0' + r : r) + 'm';
  return r + 'm';
}
/* Ritmo sempre medido contra HOJE, não contra o dia que estiver selecionado */
function weekPace(){
  const ws = weekStats();
  const esperado = Math.max(1, Math.round(ws.total * (TODAY + 1) / 7));
  return { done: ws.done, total: ws.total, pct: ws.pct, esperado: esperado, ritmo: Math.min(150, pct(ws.done, esperado)) };
}
function ring(value, size, stroke, color, track, txtColor){
  size = size || 84; stroke = stroke || 8; color = color || '#6366f1';
  track = track || '#eef2f7'; txtColor = txtColor || '#1e293b';
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return '<div class="ring" style="width:'+size+'px;height:'+size+'px">'
    + '<svg width="'+size+'" height="'+size+'">'
    + '<circle cx="'+(size/2)+'" cy="'+(size/2)+'" r="'+r+'" fill="none" stroke="'+track+'" stroke-width="'+stroke+'"/>'
    + '<circle class="ring-val" style="--c:'+c+'px;--o:'+off+'px" cx="'+(size/2)+'" cy="'+(size/2)+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+stroke
    + '" stroke-linecap="round" stroke-dasharray="'+c+'"/>'
    + '</svg>'
    + '<span class="ring-txt" style="color:'+txtColor+';font-size:'+Math.max(11, Math.round(size*0.17))+'px">'+value+'%</span></div>';
}
function statCard(label, value, detail, ic, trend, color){
  return '<div class="card"><div class="stat">'
    + '<div class="top"><div><p class="label">'+esc(label)+'</p><p class="value">'+esc(value)+'</p>'
    + '<p class="detail">'+esc(detail)+'</p></div>'
    + '<div class="ic" style="background:'+color+'18;color:'+color+'">'+icon(ic, 20)+'</div></div>'
    + (trend ? '<div class="trend">'+icon('trending',14)+esc(trend)+'</div>' : '')
    + '</div></div>';
}
function taskRow(t, dayIdx, flat){
  const c = CATS[t.cat] || CATS.trabalho;
  const col = COLORS[c.color];
  const dur = LIE.taskMinutes(t);
  const falha = t.falha ? (LIE.MOTIVOS_FALHA[t.falha] || null) : null;
  return '<div class="task'+(flat ? ' flat' : '')+(t.done ? ' done' : '')+(falha ? ' failed' : '')+'" onclick="toggleTask('+dayIdx+',\''+t.id+'\')" '
    + 'role="button" tabindex="0" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleTask('+dayIdx+',\''+t.id+'\')}">'
    + '<span class="task-time">'+esc(t.time)+'</span>'
    + '<span class="task-ic" style="background:'+col+'1a;color:'+col+'">'+icon(t.ic || c.icon, 18)+'</span>'
    + '<span class="task-body"><span class="task-title">'+esc(t.title)+'</span>'
    + '<span class="task-meta">'+esc(t.meta)+(dur ? ' • '+LIE.fmtDur(dur) : '')
    + (falha ? ' • <b class="task-fail">não feito: '+esc(falha.label)+'</b>' : '')+'</span></span>'
    + (t.done ? '' : '<button class="task-flag" title="Não consegui fazer — registrar motivo" onclick="event.stopPropagation();openFalha('+dayIdx+',\''+t.id+'\',\''+esc(t.title).replace(/'/g,'&#39;')+'\')">'+icon('flag',14)+'</button>')
    + '<button class="task-del" title="Remover ação" onclick="event.stopPropagation();delTask('+dayIdx+',\''+t.id+'\')">'+icon('trash',14)+'</button>'
    + '<span class="check">'+icon('check',14,{sw:3})+'</span></div>';
}
function hbar(name, value, color, sub){
  return '<div class="hbar"><div class="lbl"><b>'+esc(name)+'</b><span class="muted">'+(sub ? esc(sub)+' • ' : '')+value+'%</span></div>'
    + '<div class="trk"><i style="width:'+value+'%;background:'+color+'"></i></div></div>';
}
function toast(msg){
  const layer = document.getElementById('layer');
  const old = document.getElementById('toast'); if(old) old.remove();
  const el = document.createElement('div');
  el.id = 'toast'; el.className = 'toast';
  el.innerHTML = icon('check',16,{sw:3}) + '<span>' + esc(msg) + '</span>';
  layer.appendChild(el);
  setTimeout(function(){ if(el.parentNode) el.remove(); }, 2200);
}

/* =========================================================
   5. SHELL (sidebar + topbar)
   ========================================================= */
function renderShell(){
  const nav = NAV.map(function(n){
    const on = state.active === n.id;
    return '<button class="nav-item'+(on ? ' active' : '')+'" onclick="go(\''+n.id+'\')" title="'+esc(n.label)+'">'
      + icon(n.icon, 19) + '<span class="nav-label">'+esc(n.label)+'</span>'
      + (n.id === 'ia' ? '<span class="dot"></span>' : '') + '</button>';
  }).join('');

  const title = (NAV.find(function(n){ return n.id === state.active; }) || NAV[0]).label;
  const emailInitials = currentUser && currentUser.email ? currentUser.email.slice(0,2).toUpperCase() : 'VB';

  return '<div class="scrim" onclick="closeMobile()"></div>'
  + '<aside class="sb">'
    + '<div class="sb-head">'
      + '<div class="sb-logo">'+icon('zap',20,{fill:true,sw:1.2})+'</div>'
      + '<div class="sb-brand"><b>Vinicius OS</b><span>Life Operating System</span></div>'
    + '</div>'
    + '<nav class="sb-nav">'+nav+'</nav>'
    + '<div class="sb-foot">'
      + '<button class="nav-item" onclick="openSettings()" title="Configurações">'+icon('settings',19)+'<span class="nav-label">Configurações</span></button>'
      + '<button class="nav-item" onclick="doLogout()" title="Sair">'+icon('logout',19)+'<span class="nav-label">Sair</span></button>'
      + '<div class="sb-user"><div class="avatar">'+emailInitials+'</div>'
        + '<div class="sb-user-info"><b>'+esc(currentUser ? currentUser.email : 'Visitante')+'</b><span>'+(state.syncing ? 'Sincronizando…' : 'Sincronizado com a nuvem')+'</span></div></div>'
    + '</div>'
  + '</aside>'
  + '<main class="main">'
    + '<header class="topbar">'
      + '<div class="topbar-left">'
        + '<button class="icon-btn" onclick="toggleSidebar()" aria-label="Alternar menu">'+icon('menu',20)+'</button>'
        + '<div><p class="page-kicker">Semana 1 de 26 • Ciclo de 24/08/2026 a 21/02/2027</p><h1 class="page-title">'+esc(title)+'</h1></div>'
      + '</div>'
      + '<div class="row">'
        + '<div class="searchbox">'+icon('search',16)
          + '<input id="q" type="search" placeholder="Buscar ação..." value="'+esc(state.search)+'" oninput="onSearch(this.value)" />'
          + (state.search ? '<button class="clear" onclick="onSearch(\'\');document.getElementById(\'q\').value=\'\'" title="Limpar">'+icon('x',13)+'</button>' : '')
        + '</div>'
        + '<span class="badge badge-emerald"><span class="pulse"></span>Sistema ativo</span>'
      + '</div>'
    + '</header>'
    + '<div class="page" id="view"></div>'
  + '</main>';
}

/* =========================================================
   6. VISÃO GERAL — BRIEFING DO LIFE INTELLIGENCE ENGINE
   ========================================================= */

/* Briefing matinal: a leitura executiva que abre o sistema */
function briefingSection(){
  const b = LIE.briefing(ctx());
  const c = b.capacidade;
  const hora = new Date().getHours();
  const saud = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  const linhas = b.linhas.map(function(l){
    return '<li class="brief-line">'+icon(l.icone, 17)+'<span>'+l.texto+'</span></li>';
  }).join('');

  return '<section class="hero">'
    + '<span class="glow glow-a"></span><span class="glow glow-b"></span>'
    + '<div class="hero-grid">'
      + '<div>'
        + '<span class="badge badge-glass">Briefing de '+esc(WEEK[TODAY].full)+' • '+esc(WEEK[TODAY].date)+'/2026</span>'
        + '<h2 style="margin-top:16px">'+saud+', '+esc(state.profile.nome || 'Vinicius')+'.<br>'
          + '<span>'+capacityHeadline(c)+'</span></h2>'
        + '<ul class="brief-list">'+linhas+'</ul>'
        + '<div class="hero-actions">'
          + '<button class="btn btn-white" onclick="go(\'planner\')">'+icon('play',16,{fill:true,sw:1})+'Abrir meu dia</button>'
          + (b.movimentos.length ? '<button class="btn btn-glass" onclick="applyReplan()">'+icon('refresh',16)+'Aplicar replanejamento ('+b.movimentos.length+')</button>' : '')
          + '<button class="btn btn-glass" onclick="openCheckin('+TODAY+')">'+icon('activity',16)+'Check-in de hoje</button>'
        + '</div>'
      + '</div>'
      + '<div class="hero-panel">'
        + '<div class="top"><div><p class="label" style="color:#94a3b8">Capacidade estimada</p><p class="big">'+c.geral+'%</p></div>'
        + ring(c.geral, 84, 8, capColor(c.geral), 'rgba(255,255,255,.16)', '#fff') + '</div>'
        + '<div class="cap-mini">'
          + capMini('Física', c.fisica) + capMini('Cognitiva', c.cognitiva) + capMini('Emocional', c.emocional)
        + '</div>'
        + '<p class="tiny" style="margin-top:14px;color:#94a3b8">Modo sugerido: <b style="color:#fff">'+esc(c.faixa)+'</b> • probabilidade semanal '+b.probabilidadeSemana+'%</p>'
      + '</div>'
    + '</div>'
  + '</section>';
}

function capacityHeadline(c){
  if(c.geral >= 80) return 'Dia de alta capacidade. Use para o que é difícil.';
  if(c.geral >= 60) return 'Capacidade normal. Entregue o essencial sem lotar a noite.';
  if(c.geral >= 40) return 'Capacidade reduzida. Proteja a cadeia, não o volume.';
  return 'Capacidade crítica. Hoje é mínimo viável — não zere.';
}
function capColor(v){ return v >= 80 ? '#34d399' : v >= 60 ? '#a78bfa' : v >= 40 ? '#fbbf24' : '#fb7185'; }
function capMini(label, v){
  return '<div class="cap-mini-item"><span>'+esc(label)+'</span>'
    + '<div class="cap-mini-track"><i style="width:'+v+'%;background:'+capColor(v)+'"></i></div>'
    + '<b>'+v+'%</b></div>';
}

/* Capacidade projetada dos 7 dias + viabilidade da agenda */
function capacitySection(){
  const c = ctx();
  const cols = WEEK.map(function(w, i){
    const cap = LIE.capacity(c, i);
    const bud = LIE.timeBudget(c, i);
    const evs = LIE.eventsOfDay(c, i);
    return '<button class="capday'+(i === state.dayIndex ? ' active' : '')+(bud.viavel ? '' : ' over')+'" onclick="setDay('+i+');go(\'agenda\')" title="'+esc(w.full)+'">'
      + '<span class="capday-d">'+esc(w.short)+'</span>'
      + '<span class="capday-bar"><i style="height:'+cap.geral+'%;background:'+capColor(cap.geral)+'"></i></span>'
      + '<span class="capday-v">'+cap.geral+'%</span>'
      + '<span class="capday-tag">'+(bud.viavel ? LIE.fmtDur(Math.max(0, bud.capacidadeUtil - bud.demanda))+' livres' : '+'+LIE.fmtDur(bud.excedente))+'</span>'
      + (evs.length ? '<span class="capday-ev">'+evs.length+' evento'+(evs.length>1?'s':'')+'</span>' : '')
      + '</button>';
  }).join('');

  const hojeBud = LIE.timeBudget(c, TODAY);
  return '<section class="card">'
    + '<div class="card-h"><div><h2 class="card-t">Capacity planning da semana</h2>'
    + '<p class="card-sub">Capacidade prevista por dia e viabilidade real da agenda</p></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="go(\'agenda\')">Ver agenda '+icon('right',14)+'</button></div>'
    + '<div class="card-b"><div class="capgrid">'+cols+'</div>'
    + '<div class="budget-bar">'
      + budgetSeg('Sono', hojeBud.sono, '#8b5cf6') + budgetSeg('Trabalho', hojeBud.trabalho, '#f59e0b')
      + budgetSeg('Deslocamento', hojeBud.deslocamento, '#64748b') + budgetSeg('Eventos', hojeBud.eventos, '#f43f5e')
      + budgetSeg('Rotina', hojeBud.fixo, '#94a3b8') + budgetSeg('Livre', hojeBud.livre, '#10b981')
    + '</div>'
    + '<p class="tiny muted" style="margin-top:10px">Hoje: '+LIE.fmtDur(hojeBud.livre)+' livres, '+LIE.fmtDur(hojeBud.demanda)+' de demanda planejada '
    + (hojeBud.viavel ? '— <b style="color:#059669">agenda viável</b>.' : '— <b style="color:#e11d48">excedente de '+LIE.fmtDur(hojeBud.excedente)+'</b>.')
    + '</p></div></section>';
}
function budgetSeg(label, min, cor){
  if(min <= 0) return '';
  return '<span class="bseg" style="flex:'+min+';background:'+cor+'" title="'+esc(label)+': '+LIE.fmtDur(min)+'">'
    + '<b>'+esc(label)+'</b></span>';
}

/* Riscos, alertas e previsões produzidos pelo motor */
function risksSection(){
  const ins = LIE.insights(ctx());
  if(!ins.length){
    return '<section class="card"><div class="card-b"><div class="empty">'
      + 'Nenhum risco detectado. Agenda viável, sono protegido e aderência dentro da meta.</div></div></section>';
  }
  const items = ins.slice(0, 6).map(function(x){
    const sev = x.sev === 'alto' ? 'rose' : x.sev === 'medio' ? 'amber' : 'blue';
    const ic = x.tipo === 'sono' ? 'moon' : x.tipo === 'capacidade' ? 'zap' : x.tipo === 'peso' ? 'scale'
             : x.tipo === 'causa' ? 'alert' : x.tipo === 'correlacao' ? 'chart' : 'shield';
    return '<div class="risk risk-'+sev+'">'
      + '<div class="risk-ic">'+icon(ic, 18)+'</div>'
      + '<div class="risk-body"><b>'+esc(x.titulo)+'</b><p>'+esc(x.texto)+'</p>'
      + (x.acao ? '<span class="risk-act">'+icon('right',12)+esc(x.acao)+'</span>' : '')
      + '</div><span class="badge badge-'+sev+'">'+(x.sev === 'alto' ? 'Alto' : x.sev === 'medio' ? 'Médio' : 'Info')+'</span></div>';
  }).join('');

  return '<section class="card">'
    + '<div class="card-h"><div><h2 class="card-t">Riscos e previsões</h2>'
    + '<p class="card-sub">'+ins.length+' sinal(is) detectado(s) pelo Life Intelligence Engine</p></div>'
    + '<button class="btn btn-ghost btn-sm" onclick="openAgent(1)">Auditar '+icon('right',14)+'</button></div>'
    + '<div class="card-b" style="display:flex;flex-direction:column;gap:10px">'+items+'</div></section>';
}

/* Card de insight com a recomendação de maior impacto */
function insightCard(){
  const b = LIE.briefing(ctx());
  const risco = b.risco;
  const titulo = risco ? risco.titulo : 'Sistema equilibrado';
  const texto = risco ? risco.texto + (risco.acao ? ' Ação sugerida: ' + risco.acao + '.' : '')
                      : 'Nenhum risco relevante. Mantenha o cardápio atual e registre as evidências do dia.';
  return '<div class="insight">'
    + '<div class="top"><div class="ic">'+icon('bot',22)+'</div><span class="badge badge-glass" style="color:#fff">Life Intelligence Engine</span></div>'
    + '<h3>'+esc(titulo)+'</h3><p>'+esc(texto)+'</p>'
    + '<button class="btn btn-white" style="margin-top:20px" onclick="openAgent(0)">Conversar com Mentor</button>'
  + '</div>';
}

/* Resumo de sono para o KPI do topo */
function sonoResumo(){
  const c = ctx();
  const s = LIE.serie(c, 'sono_h', 7);
  if(!s.length){
    const sp = LIE.sleepPlan(c, TODAY);
    return { texto: sp.sonoPossivelH + 'h', detalhe: 'janela projetada para hoje', trend: 'desligamento às ' + sp.desligamento };
  }
  const t = LIE.trend(s);
  const h = Math.floor(t.media), m = Math.round((t.media - h) * 60);
  return {
    texto: h + 'h ' + (m < 10 ? '0' : '') + m + 'm',
    detalhe: 'média de ' + s.length + ' dia(s) registrado(s)',
    trend: 'tendência ' + t.direcao,
  };
}

/* =========================================================
   6b. VISÃO GERAL
   ========================================================= */
function viewDashboard(){
  const tasks = dayTasks(state.dayIndex);
  const done = dayDone(state.dayIndex);
  const adherence = dayPct(state.dayIndex);
  const q = state.search.trim().toLowerCase();
  const filtered = q ? tasks.filter(function(t){
    return t.title.toLowerCase().indexOf(q) > -1 || t.meta.toLowerCase().indexOf(q) > -1;
  }) : tasks;
  const shown = filtered.slice(0, 8);
  const hidden = filtered.length - shown.length;
  const openNight = tasks.filter(function(t){ return !t.done && t.time >= '19:00'; }).length;
  const m = MODES[state.mode];
  const ws = weekStats();

  const pillars = PILLARS.map(function(p){
    const v = pillarPct(p.key);
    return '<div class="card"><div class="pillar">'
      + '<div class="ic" style="background:'+p.color+'16;color:'+p.color+'">'+icon(p.icon,19)+'</div>'
      + ring(v, 68, 7, p.color)
      + '<h3>'+esc(p.label)+'</h3><p>'+esc(p.target)+'</p></div></div>';
  }).join('');

  const semaforoBars = Object.keys(MODES).map(function(k){
    return '<button title="'+esc(k)+'" onclick="setMode(\''+esc(k)+'\')" class="'+(state.mode === k ? 'on' : '')+'" style="background:'+MODES[k].bar+'"></button>';
  }).join('');
  const semaforoChips = Object.keys(MODES).map(function(k){
    return '<button class="chip '+(state.mode === k ? MODES[k].badge : '')+'" onclick="setMode(\''+esc(k)+'\')">'+esc(k)+'</button>';
  }).join('');

  return '<div class="view section">'
  + briefingSection()
  + '<section class="grid g-stats">'
    + statCard('Treinos concluídos', catCount('saude', true) + ' / 7', 'sessões planejadas nesta semana', 'dumbbell', LIE.adherence(ctx()).saude + '% de aderência', '#10b981')
    + statCard('Estudo focado', fmtHM(minutesStudied()), 'meta de 5 blocos semanais', 'clock', catCount('carreira', true) + ' blocos registrados', '#3b82f6')
    + statCard('Reserva financeira', 'R$ ' + state.aportes.filter(function(a){return a.ok;}).reduce(function(s,a){return s+a.v;},0), 'meta acumulada: R$ 1.800', 'dollar', 'aporte mensal confirmado', '#f59e0b')
    + statCard('Sono da semana', sonoResumo().texto, sonoResumo().detalhe, 'moon', sonoResumo().trend, '#8b5cf6')
  + '</section>'
  + capacitySection()
  + risksSection()
  + '<section class="grid g-split">'
    + '<div class="card">'
      + '<div class="card-h"><div><h2 class="card-t">Plano de hoje</h2>'
        + '<p class="card-sub">'+esc(WEEK[state.dayIndex].full)+(q ? ' • filtrando por "'+esc(state.search)+'"' : '')+'</p></div>'
        + '<button class="icon-btn" onclick="openAdd('+state.dayIndex+')" title="Nova ação">'+icon('plus',20)+'</button></div>'
      + '<div class="card-b" style="display:flex;flex-direction:column;gap:8px">'
        + (shown.length ? shown.map(function(t){ return taskRow(t, state.dayIndex, false); }).join('')
                        : '<div class="empty">Nenhuma ação encontrada para este filtro.</div>')
        + (hidden > 0 ? '<p class="tiny muted" style="text-align:center;margin-top:4px">+ '+hidden+' ação(ões) no planner</p>' : '')
        + '<button class="btn btn-ghost btn-block" style="margin-top:6px" onclick="go(\'planner\')">Ver agenda completa '+icon('right',16)+'</button>'
      + '</div>'
    + '</div>'
    + '<div class="stack">'
      + '<div class="card">'
        + '<div class="card-h"><h2 class="card-t">Semáforo do dia</h2><span class="badge '+m.badge+'">'+esc(state.mode)+'</span></div>'
        + '<div class="card-b">'
          + '<div class="mode-bars">'+semaforoBars+'</div>'
          + '<p class="muted" style="margin-top:16px;line-height:1.7">'+esc(m.text)+'</p>'
          + '<div class="mode-chips">'+semaforoChips+'</div>'
        + '</div>'
      + '</div>'
      + insightCard()
      + '<div class="card"><div class="card-h"><h2 class="card-t">Semana em números</h2></div>'
        + '<div class="card-b row" style="gap:20px">'
          + ring(ws.pct, 88, 9, '#6366f1')
          + '<div><p style="font-size:22px;font-weight:800;letter-spacing:-.02em">'+ws.done+' / '+ws.total+'</p>'
          + '<p class="muted" style="font-size:13px">ações concluídas no ciclo semanal</p>'
          + '<button class="btn btn-ghost btn-sm" style="margin-left:-12px;margin-top:6px" onclick="go(\'analytics\')">Abrir analytics '+icon('right',14)+'</button></div>'
        + '</div>'
      + '</div>'
    + '</div>'
  + '</section>'
  + '<section>'
    + '<div class="row-between" style="margin-bottom:16px">'
      + '<div><h2 style="font-size:20px;font-weight:700;letter-spacing:-.02em">Equilíbrio dos pilares</h2>'
      + '<p class="muted" style="font-size:13px">Progresso frente ao esperado até hoje</p></div>'
      + '<button class="btn btn-ghost btn-sm" onclick="go(\'analytics\')">Abrir analytics</button>'
    + '</div>'
    + '<div class="grid g-pillars">'+pillars+'</div>'
  + '</section>'
  + '</div>';
}

function pillarPct(key){
  if(key === 'financas'){
    const total = state.aportes.reduce(function(s,a){return s+a.v;},0);
    const acum = state.aportes.filter(function(a){return a.ok;}).reduce(function(s,a){return s+a.v;},0);
    return pct(acum, total) || 100;
  }
  if(key === 'relacionamento') return state.flags.encontro ? 100 : 50;
  const goals = { saude:7, carreira:14, espiritual:7, casa:7 };
  const goal = goals[key] || 7;
  const esperado = Math.max(1, Math.round(goal * (TODAY + 1) / 7));
  return Math.min(100, pct(catCount(key, true), esperado));
}

/* =========================================================
   7. PLANNER
   ========================================================= */
function viewPlanner(){
  const i = state.dayIndex, d = WEEK[i];
  const q = state.search.trim().toLowerCase();
  const tasks = dayTasks(i).filter(function(t){
    return !q || t.title.toLowerCase().indexOf(q) > -1 || t.meta.toLowerCase().indexOf(q) > -1;
  });
  const ws = weekStats();

  const days = WEEK.map(function(w, k){
    const p = dayPct(k);
    return '<button class="day'+(state.dayIndex === k ? ' active' : '')+'" onclick="setDay('+k+')">'
      + '<div class="head"><span>'+esc(w.short)+'</span><span>'+(k === TODAY ? '<span class="today">hoje</span>' : esc(w.date))+'</span></div>'
      + '<div class="num">'+w.day+'</div>'
      + '<div class="bar"><i style="width:'+p+'%"></i></div></button>';
  }).join('');

  const crit = [
    { t:'Saúde: 5 sessões registradas',        n:catCount('saude', true),      g:5 },
    { t:'Carreira: 5 blocos + 1 artefato',     n:catCount('carreira', true),   g:7 },
    { t:'Espiritual: 7 orações e leituras',    n:catCount('espiritual', true), g:7 },
    { t:'Casa: 6 resets concluídos',           n:catCount('casa', true),       g:6 },
  ].map(function(c){
    const ok = c.n >= c.g;
    return '<div class="crit'+(ok ? ' ok' : '')+'"><div class="box">'+icon(ok ? 'check' : 'clock', 14, { sw: ok ? 3 : 2 })+'</div>'
      + '<div class="txt">'+esc(c.t)+'<small>'+c.n+' de '+c.g+' concluídos</small></div></div>';
  }).join('')
  + ['gastos','encontro'].map(function(f){
      const on = state.flags[f];
      const label = f === 'gastos' ? 'Sem gasto não classificado' : 'Encontro do casal realizado';
      return '<div class="crit'+(on ? ' ok' : '')+'" style="cursor:pointer" onclick="toggleFlag(\''+f+'\')">'
        + '<div class="box">'+icon(on ? 'check' : 'clock', 14, { sw: on ? 3 : 2 })+'</div>'
        + '<div class="txt">'+label+'<small>'+(on ? 'confirmado' : 'clique para confirmar')+'</small></div></div>';
    }).join('');

  return '<div class="view section">'
  + '<div class="row-between">'
    + '<div><span class="badge badge-indigo">Fundamentos • Cardápio A</span>'
      + '<h2 style="margin-top:10px;font-size:30px;font-weight:800;letter-spacing:-.03em">Semana 1</h2>'
      + '<p class="muted" style="font-size:13px">24 a 30 de agosto de 2026 • Foco em consistência e técnica</p></div>'
    + '<div class="row" style="gap:8px">'
      + '<button class="btn btn-outline btn-icon" onclick="setDay('+((i + 6) % 7)+')" title="Dia anterior">'+icon('left',16)+'</button>'
      + '<button class="btn btn-outline" onclick="setDay('+TODAY+')">Hoje</button>'
      + '<button class="btn btn-outline btn-icon" onclick="setDay('+((i + 1) % 7)+')" title="Próximo dia">'+icon('right',16)+'</button>'
    + '</div>'
  + '</div>'
  + '<div class="grid g-week">'+days+'</div>'
  + '<div class="grid g-split">'
    + '<div class="card">'
      + '<div class="card-h"><div><h2 class="card-t">Plano de '+esc(d.full.toLowerCase())+'</h2>'
        + '<p class="card-sub">Clique nas ações para atualizar a execução • '+dayDone(i)+' de '+dayTasks(i).length+' concluídas</p></div>'
        + '<button class="btn btn-primary btn-sm" onclick="openAdd('+i+')">'+icon('plus',15)+'Nova ação</button></div>'
      + '<div class="card-b" style="display:flex;flex-direction:column;gap:10px">'
        + (tasks.length ? tasks.map(function(t){ return taskRow(t, i, true); }).join('')
                        : '<div class="empty">Nenhuma ação para este filtro. Use "Nova ação" para incluir uma.</div>')
      + '</div>'
    + '</div>'
    + '<div class="stack">'
      + '<div class="card"><div class="card-h"><h2 class="card-t">Resultado da semana</h2></div>'
        + '<div class="card-b">'
          + '<div class="row" style="gap:20px">'+ring(ws.pct, 100, 10, '#6366f1')
          + '<div><p style="font-size:24px;font-weight:800;letter-spacing:-.02em">'+ws.done+' / '+ws.total+'</p>'
          + '<p class="muted" style="font-size:13px">ações concluídas</p></div></div>'
          + '<div style="margin-top:24px">'
            + hbar('Saúde', Math.min(100, pct(catCount('saude', true), 7)), '#10b981')
            + hbar('Carreira', Math.min(100, pct(catCount('carreira', true), 14)), '#3b82f6')
            + hbar('Casa e relação', Math.min(100, pct(catCount('casa', true), 7)), '#f43f5e')
            + hbar('Sono e recuperação', Math.min(100, pct(catCount('sono', true), 7)), '#6366f1')
          + '</div>'
        + '</div>'
      + '</div>'
      + '<div class="card"><div class="card-h"><h2 class="card-t">Critérios de aceite</h2></div>'
        + '<div class="card-b" style="display:flex;flex-direction:column;gap:12px">'+crit+'</div></div>'
    + '</div>'
  + '</div></div>';
}

/* =========================================================
   7b. AGENDA E EVENTOS — o diferencial: agenda futura com impacto calculado
   ========================================================= */
function viewAgenda(){
  const c = ctx();
  const i = state.dayIndex;
  const w = WEEK[i];
  const cap = LIE.capacity(c, i);
  const bud = LIE.timeBudget(c, i);
  const sp = LIE.sleepPlan(c, i);
  const evs = LIE.eventsOfDay(c, i);

  const dias = WEEK.map(function(x, k){
    const cp = LIE.capacity(c, k);
    const bd = LIE.timeBudget(c, k);
    const n = LIE.eventsOfDay(c, k).length;
    return '<button class="day'+(state.dayIndex === k ? ' active' : '')+'" onclick="setDay('+k+')">'
      + '<div class="head"><span>'+esc(x.short)+'</span><span>'+esc(x.date)+'</span></div>'
      + '<div class="num">'+x.day+'</div>'
      + '<div class="bar"><i style="width:'+cp.geral+'%;background:'+(state.dayIndex===k?'#fff':capColor(cp.geral))+'"></i></div>'
      + '<div class="day-foot">'+cp.geral+'%'+(n ? ' • '+n+' ev' : '')+(bd.viavel ? '' : ' ⚠')+'</div>'
      + '</button>';
  }).join('');

  const listaEv = evs.length ? evs.map(function(e){
    const t = LIE.TIPOS_EVENTO[e.tipo] || LIE.TIPOS_EVENTO.compromisso;
    const col = COLORS[t.cor] || COLORS.slate;
    return '<div class="event">'
      + '<div class="event-ic" style="background:'+col+'1a;color:'+col+'">'+icon(t.icone, 18)+'</div>'
      + '<div class="event-body"><b>'+esc(e.titulo)+'</b>'
      + '<small>'+esc(t.label)+' • '+esc(e.inicio || '—')+' às '+esc(e.fim || '—')
      + (e.deslocamento_min ? ' • deslocamento '+LIE.fmtDur(e.deslocamento_min) : '')+'</small>'
      + (e.nota ? '<span class="event-note">'+esc(e.nota)+'</span>' : '')
      + '</div>'
      + '<div class="event-acts">'
      + '<span class="badge badge-slate">Int. '+(e.intensidade || t.intensidade)+'/5</span>'
      + '<button class="icon-btn" title="Editar" onclick="openEvent(\''+esc(e.id)+'\')">'+icon('settings',15)+'</button>'
      + '<button class="icon-btn" title="Remover" onclick="delEvent(\''+esc(e.id)+'\')">'+icon('trash',15)+'</button>'
      + '</div></div>';
  }).join('') : '<div class="empty">Nenhum evento neste dia. O motor está usando o expediente padrão do seu perfil.</div>';

  const drivers = cap.drivers.length ? cap.drivers.map(function(d){
    const tot = (d.f || 0) + (d.c || 0) + (d.e || 0);
    return '<div class="driver'+(tot < 0 ? ' neg' : ' pos')+'">'
      + '<span class="driver-l">'+esc(d.label)+'</span>'
      + '<span class="driver-v">'
        + (d.f ? '<b title="Física">F '+(d.f>0?'+':'')+d.f+'</b>' : '')
        + (d.c ? '<b title="Cognitiva">C '+(d.c>0?'+':'')+d.c+'</b>' : '')
        + (d.e ? '<b title="Emocional">E '+(d.e>0?'+':'')+d.e+'</b>' : '')
      + '</span></div>';
  }).join('') : '<div class="empty">Nenhum fator relevante. Capacidade em condições basais.</div>';

  const movs = LIE.replan(c).filter(function(m){ return m.de === i; });

  return '<div class="view section">'
  + '<div class="row-between">'
    + '<div><span class="badge badge-violet">'+icon('plane',13)+'Agenda futura e capacidade</span>'
      + '<h2 style="margin-top:10px;font-size:30px;font-weight:800;letter-spacing:-.03em">'+esc(w.full)+'</h2>'
      + '<p class="muted" style="font-size:13px">'+esc(w.date)+'/2026 • o sistema calcula o impacto de cada evento em sono, treino, estudo e capacidade</p></div>'
    + '<button class="btn btn-primary" onclick="openEvent()">'+icon('plus',16)+'Novo evento</button>'
  + '</div>'
  + '<div class="grid g-week">'+dias+'</div>'

  + '<div class="grid g-3">'
    + statCard('Capacidade do dia', cap.geral + '%', 'F '+cap.fisica+'% • C '+cap.cognitiva+'% • E '+cap.emocional+'%', 'zap', 'modo '+cap.faixa, capColor(cap.geral))
    + statCard('Agenda', bud.viavel ? 'Viável' : 'Inviável', LIE.fmtDur(bud.demanda)+' de demanda para '+LIE.fmtDur(bud.capacidadeUtil)+' úteis', 'clock', bud.ocupacao+'% de ocupação', bud.viavel ? '#10b981' : '#f43f5e')
    + statCard('Janela de sono', sp.sonoPossivelH + 'h', 'dormir '+sp.dormir+' • acordar '+sp.acordar, 'moon', sp.viavel ? 'meta preservada' : 'déficit de '+LIE.fmtDur(sp.deficitMin), sp.viavel ? '#8b5cf6' : '#f43f5e')
  + '</div>'

  + '<div class="grid g-split">'
    + '<div class="stack">'
      + '<div class="card"><div class="card-h"><div><h2 class="card-t">Eventos do dia</h2>'
        + '<p class="card-sub">Cada evento recalcula capacidade, sono e viabilidade</p></div></div>'
        + '<div class="card-b" style="display:flex;flex-direction:column;gap:10px">'+listaEv+'</div></div>'

      + '<div class="card"><div class="card-h"><div><h2 class="card-t">Plano de sono calculado</h2>'
        + '<p class="card-sub">Derivado do primeiro compromisso de amanhã: '+esc(sp.origem)+'</p></div></div>'
        + '<div class="card-b">'
          + '<div class="sleepline">'
            + sleepStep('Desligamento', sp.desligamento, 'moon')
            + sleepStep('Dormir', sp.dormir, 'moon')
            + sleepStep('Acordar', sp.acordar, 'sun')
            + sleepStep('Sair de casa', sp.saida, 'plane')
          + '</div>'
          + '<div class="note" style="margin-top:14px">'
          + (sp.retorno ? 'Retorno previsto às <b>'+esc(sp.retorno)+'</b> (fim do evento + '+LIE.fmtDur(sp.deslocamentoRetornoMin)+' de deslocamento). ' : '')
          + 'Para manter a meta de <b>'+sp.metaH+'h</b>, inicie o desligamento às <b>'+esc(sp.desligamento)+'</b> e durma até <b>'+esc(sp.dormir)+'</b>.'
          + (sp.conflito ? ' <b style="color:#e11d48">O retorno tardio empurrou o horário ideal de '+esc(sp.dormirIdeal)+' — déficit de '+LIE.fmtDur(sp.deficitMin)+'.</b>' : '')
          + '</div></div></div>'
    + '</div>'

    + '<div class="stack">'
      + '<div class="card"><div class="card-h"><div><h2 class="card-t">Por que a capacidade é '+cap.geral+'%</h2>'
        + '<p class="card-sub">Gestão à vista: todo número mostra sua origem</p></div></div>'
        + '<div class="card-b" style="display:flex;flex-direction:column;gap:8px">'+drivers+'</div></div>'

      + '<div class="card"><div class="card-h"><div><h2 class="card-t">Orçamento de tempo</h2>'
        + '<p class="card-sub">1.440 minutos, alocados</p></div></div>'
        + '<div class="card-b">'
        + hbar('Sono', Math.round(bud.sono/14.4), '#8b5cf6', LIE.fmtDur(bud.sono))
        + (bud.trabalho ? hbar('Trabalho', Math.round(bud.trabalho/14.4), '#f59e0b', LIE.fmtDur(bud.trabalho)) : '')
        + (bud.deslocamento ? hbar('Deslocamento', Math.round(bud.deslocamento/14.4), '#64748b', LIE.fmtDur(bud.deslocamento)) : '')
        + (bud.eventos ? hbar('Eventos', Math.round(bud.eventos/14.4), '#f43f5e', LIE.fmtDur(bud.eventos)) : '')
        + hbar('Rotina fixa', Math.round(bud.fixo/14.4), '#94a3b8', LIE.fmtDur(bud.fixo))
        + hbar('Disponível', Math.round(bud.livre/14.4), '#10b981', LIE.fmtDur(bud.livre))
        + '</div></div>'

      + (movs.length ? '<div class="card"><div class="card-h"><div><h2 class="card-t">Replanejamento sugerido</h2>'
          + '<p class="card-sub">O motor identificou excedente neste dia</p></div></div>'
          + '<div class="card-b" style="display:flex;flex-direction:column;gap:10px">'
          + movs.map(function(m){
              return '<div class="move"><div class="move-ic">'+icon('refresh',16)+'</div>'
                + '<div><b>'+esc(m.tarefa.title)+'</b><small>'+esc(WEEK[m.de].short)+' → <b>'+esc(WEEK[m.para].short)+'</b> • '+LIE.fmtDur(m.minutos)+'</small>'
                + '<span class="move-why">'+esc(m.motivo)+'</span></div></div>';
            }).join('')
          + '<button class="btn btn-primary btn-block" onclick="applyReplan()">'+icon('refresh',16)+'Aplicar replanejamento</button>'
          + '</div></div>' : '')
    + '</div>'
  + '</div></div>';
}
function sleepStep(label, hora, ic){
  return '<div class="sleepstep"><div class="sleepstep-ic">'+icon(ic,15)+'</div>'
    + '<b>'+esc(hora)+'</b><small>'+esc(label)+'</small></div>';
}

/* =========================================================
   7c. NUTRIÇÃO OPERACIONAL + PROJEÇÃO DE PESO
   ========================================================= */
function viewNutricao(){
  const c = ctx();
  const i = state.dayIndex;
  const plan = LIE.mealPlan(c, i);
  const alvo = plan.alvo;
  const w = LIE.weightProjection(c);
  const p = state.profile;

  const refeicoes = plan.refeicoes.map(function(r){
    const itens = r.itens.map(function(it){
      return '<li><span class="meal-q">'+it.gramas+'g</span> '+esc(it.nome)
        + '<span class="meal-macro">'+it.p+'g P • '+it.kcal+' kcal</span></li>';
    }).join('');
    return '<div class="meal">'
      + '<div class="meal-h"><b>'+esc(r.nome)+'</b><span class="badge badge-slate">'+esc(r.hora)+'</span></div>'
      + '<ul class="meal-list">'+itens+'</ul>'
      + '<div class="meal-tot">'+r.total.p+'g proteína • '+r.total.c+'g carbo • '+r.total.kcal+' kcal</div>'
      + '</div>';
  }).join('');

  const proj = w.projecao.length ? w.projecao.map(function(x){
    const maxP = w.pesoAtual, minP = w.meta - 2;
    const h = LIE.clamp(Math.round(((x.peso - minP) / (maxP - minP || 1)) * 100), 6, 100);
    return '<div class="col"><span class="val">'+x.peso+'</span>'
      + '<div class="bar'+(x.atingiu ? '' : ' dim')+'" style="height:'+h+'%"></div>'
      + '<span class="cap">'+esc(x.mes)+'</span></div>';
  }).join('') : '';

  return '<div class="view section">'
  + '<div class="row-between">'
    + '<div><span class="badge badge-rose">'+icon('utensils',13)+'Nutrição operacional</span>'
      + '<h2 style="margin-top:10px;font-size:30px;font-weight:800;letter-spacing:-.03em">Cardápio e macros</h2>'
      + '<p class="muted" style="font-size:13px">Planejamento operacional derivado de peso, meta, rotina e treino. Não é orientação clínica.</p></div>'
    + '<button class="btn btn-outline" onclick="openProfile()">'+icon('user',16)+'Editar perfil</button>'
  + '</div>'

  + '<div class="grid g-stats">'
    + statCard('Meta calórica', alvo.alvo + ' kcal', 'TDEE '+alvo.tdee+' kcal • déficit '+alvo.deficit+' kcal', 'flame', alvo.diaDeTreino ? 'dia de treino (+120 kcal)' : 'dia sem treino de força', '#f43f5e')
    + statCard('Proteína diária', alvo.proteina_g + ' g', 'referência de '+p.meta_peso_kg+' kg de peso-alvo', 'dumbbell', 'distribuída em 4 refeições', '#10b981')
    + statCard('Carboidrato', alvo.carbo_g + ' g', 'gordura '+alvo.gordura_g+' g • TMB '+alvo.bmr+' kcal', 'utensils', 'ajustado ao gasto do dia', '#f59e0b')
    + statCard('Água recomendada', (alvo.agua_ml/1000).toFixed(1).replace('.',',') + ' L', '35 ml/kg + reposição de treino', 'drop', 'registre no check-in diário', '#06b6d4')
  + '</div>'

  + '<div class="grid g-split">'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Cardápio de '+esc(WEEK[i].full.toLowerCase())+'</h2>'
      + '<p class="card-sub">Gerado para bater '+alvo.proteina_g+'g de proteína e '+alvo.alvo+' kcal</p></div>'
      + '<div class="row" style="gap:6px">'
      + '<button class="btn btn-outline btn-sm" onclick="setDay('+((i+6)%7)+')">'+icon('left',14)+'</button>'
      + '<button class="btn btn-outline btn-sm" onclick="setDay('+((i+1)%7)+')">'+icon('right',14)+'</button></div></div>'
      + '<div class="card-b"><div class="meals">'+refeicoes+'</div>'
      + '<div class="note" style="margin-top:14px">Total do dia: <b>'+plan.total.p+'g de proteína</b>, '+plan.total.c+'g de carboidrato, '
      + plan.total.g+'g de gordura e '+plan.total.kcal+' kcal. O cardápio é determinístico: o mesmo dia sempre gera o mesmo plano.</div>'
      + '</div></div>'

    + '<div class="stack">'
      + '<div class="card"><div class="card-h"><div><h2 class="card-t">Projeção de peso</h2>'
        + '<p class="card-sub">Ritmo real corrigido pela sua aderência em saúde ('+w.aderenciaSaude+'%)</p></div></div>'
        + '<div class="card-b">'
          + '<div class="row" style="gap:20px;align-items:center">'
            + ring(w.probabilidade, 96, 9, w.probabilidade >= 60 ? '#10b981' : w.probabilidade >= 40 ? '#f59e0b' : '#f43f5e')
            + '<div><p style="font-size:22px;font-weight:800;letter-spacing:-.02em">'+w.pesoAtual+' → '+w.meta+' kg</p>'
            + '<p class="muted" style="font-size:13px">faltam '+w.delta+' kg • '+w.kgSemana+' kg/semana</p>'
            + '<p class="tiny muted" style="margin-top:4px">probabilidade de sucesso no prazo</p></div>'
          + '</div>'
          + (proj ? '<div class="chart" style="margin-top:16px">'+proj+'</div>' : '<div class="empty" style="margin-top:14px">Sem déficit calórico projetado: o peso tende a se manter.</div>')
          + '<div class="note" style="margin-top:12px">'
          + (w.dataProjetada ? 'No ritmo atual a meta chega em <b>'+w.dataProjetada.toLocaleDateString('pt-BR')+'</b>' : 'Ritmo insuficiente para projetar a data')
          + (w.dataMeta ? ' contra o alvo de <b>'+w.dataMeta.toLocaleDateString('pt-BR')+'</b>' : '') + '. '
          + (w.atrasoSemanas != null && w.atrasoSemanas > 0
              ? '<b style="color:#e11d48">Atraso de '+w.atrasoSemanas+' semana(s).</b> A alavanca é aderência aos treinos, não déficit maior.'
              : '<b style="color:#059669">Dentro do prazo.</b>')
          + (w.sustentavel ? '' : ' <b style="color:#b45309">Ritmo acima de 1% do peso por semana — risco de perda de massa magra.</b>')
          + '</div>'
        + '</div></div>'

      + '<div class="card"><div class="card-h"><div><h2 class="card-t">Perfil metabólico</h2>'
        + '<p class="card-sub">Mifflin-St Jeor + fator de atividade</p></div></div>'
        + '<div class="card-b">'
        + moduleList([
            { icon:'user',  color:'indigo',  title:p.altura_cm+' cm • '+p.idade+' anos • '+(p.sexo === 'F' ? 'feminino' : 'masculino'), sub:'dados antropométricos', badge:'Perfil', badgeClass:'badge-indigo' },
            { icon:'flame', color:'rose',    title:'TMB '+alvo.bmr+' kcal', sub:'gasto em repouso', badge:'Basal', badgeClass:'badge-rose' },
            { icon:'activity', color:'emerald', title:'TDEE '+alvo.tdee+' kcal', sub:'nível de atividade: '+esc(p.atividade), badge:'Total', badgeClass:'badge-emerald' },
            { icon:'target', color:'amber',  title:'Déficit de '+alvo.deficit+' kcal/dia', sub:'equivale a '+w.kgSemana+' kg/semana no papel', badge:w.sustentavel ? 'Seguro' : 'Agressivo', badgeClass:w.sustentavel ? 'badge-emerald' : 'badge-amber' },
          ])
        + '</div></div>'
    + '</div>'
  + '</div></div>';
}

/* =========================================================
   7d. OBJETIVOS, METAS, PROJETOS E OKRs
   ========================================================= */
function viewObjetivos(){
  const objs = LIE.okrProgress(ctx());
  const media = objs.length ? Math.round(objs.reduce(function(a,o){ return a + o.pct; }, 0) / objs.length) : 0;

  const cards = objs.map(function(o){
    const pil = PILLARS.find(function(p){ return p.key === o.pilar; }) || { color:'#6366f1', label:o.pilar, icon:'target' };
    const krs = o.krs.map(function(k){
      const auto = k.fonte && k.fonte !== 'manual';
      return '<div class="kr">'
        + '<div class="kr-h"><b>'+esc(k.titulo)+'</b>'
        + '<span class="kr-v">'+k.atual+' / '+k.alvo+' '+esc(k.unidade || '')+'</span></div>'
        + '<div class="kr-trk"><i style="width:'+k.pct+'%;background:'+pil.color+'"></i></div>'
        + '<div class="kr-f"><span class="badge '+(auto ? 'badge-emerald' : 'badge-slate')+'">'
        + (auto ? 'automático • ' + esc(k.fonte) : 'manual') + '</span><b>'+k.pct+'%</b></div>'
        + '</div>';
    }).join('');

    const projs = (o.projetos || []).map(function(pr){
      const st = pr.status === 'done' ? { b:'badge-emerald', l:'Concluído' } : pr.status === 'doing' ? { b:'badge-blue', l:'Em curso' } : { b:'badge-slate', l:'Planejado' };
      return '<div class="list-row"><div class="ic" style="background:'+pil.color+'1a;color:'+pil.color+'">'+icon('grid',16)+'</div>'
        + '<div class="grow"><b>'+esc(pr.titulo)+'</b><small>projeto do objetivo</small></div>'
        + '<span class="badge '+st.b+'">'+st.l+'</span></div>';
    }).join('');

    return '<div class="card"><div class="card-h">'
      + '<div class="row" style="gap:12px">'
        + '<div class="ic" style="background:'+pil.color+'1a;color:'+pil.color+';padding:10px;border-radius:14px">'+icon(pil.icon,18)+'</div>'
        + '<div><h2 class="card-t">'+esc(o.titulo)+'</h2>'
        + '<p class="card-sub">'+esc(pil.label)+' • '+esc(o.horizonte || '')+(o.prazo ? ' • prazo '+new Date(o.prazo+'T00:00:00').toLocaleDateString('pt-BR') : '')+'</p></div>'
      + '</div>'
      + '<span class="badge '+(o.risco === 'alto' ? 'badge-rose' : o.risco === 'médio' ? 'badge-amber' : 'badge-emerald')+'">risco '+esc(o.risco)+'</span></div>'
      + '<div class="card-b">'
        + '<div class="row" style="gap:18px;align-items:center;margin-bottom:16px">'
          + ring(o.pct, 76, 8, pil.color)
          + '<div><p style="font-size:18px;font-weight:800">'+o.pct+'% do objetivo</p>'
          + '<p class="muted tiny">média dos '+o.krs.length+' key results</p></div>'
        + '</div>'
        + '<p class="label" style="margin-bottom:8px">Key results</p>'
        + '<div class="krs">'+krs+'</div>'
        + (projs ? '<p class="label" style="margin:16px 0 4px">Projetos</p>'+projs : '')
      + '</div></div>';
  }).join('');

  return '<div class="view section">'
  + '<div class="row-between">'
    + '<div><span class="badge badge-indigo">'+icon('flag',13)+'Objetivos → Metas → Projetos → Tarefas</span>'
      + '<h2 style="margin-top:10px;font-size:30px;font-weight:800;letter-spacing:-.03em">OKRs do ciclo</h2>'
      + '<p class="muted" style="font-size:13px">Progresso calculado automaticamente a partir da execução real — sem digitação manual.</p></div>'
    + '<button class="btn btn-primary" onclick="openObjetivo()">'+icon('plus',16)+'Novo objetivo</button>'
  + '</div>'
  + '<div class="grid g-3">'
    + statCard('Progresso geral', media + '%', objs.length + ' objetivo(s) ativo(s)', 'flag', media >= 70 ? 'no ritmo' : 'requer atenção', media >= 70 ? '#10b981' : '#f59e0b')
    + statCard('KRs automáticos', objs.reduce(function(a,o){ return a + o.krs.filter(function(k){ return k.fonte && k.fonte !== 'manual'; }).length; }, 0) + '', 'lidos do próprio sistema', 'refresh', 'sem entrada manual', '#6366f1')
    + statCard('Objetivos em risco', objs.filter(function(o){ return o.risco === 'alto'; }).length + '', 'abaixo de 40% de progresso', 'shield', 'revisar no ciclo semanal', '#f43f5e')
  + '</div>'
  + '<div class="grid g-okr">'+cards+'</div>'
  + '</div>';
}

/* =========================================================
   8. MÓDULOS OPERACIONAIS
   ========================================================= */
function moduleHeader(title, sub, dayIdx){
  return '<div class="row-between">'
    + '<div><p style="font-size:13px;font-weight:700;color:#4f46e5">Módulo operacional</p>'
    + '<h2 style="font-size:30px;font-weight:800;letter-spacing:-.03em">'+esc(title)+'</h2>'
    + '<p class="muted" style="font-size:13px;margin-top:4px">'+esc(sub)+'</p></div>'
    + '<button class="btn btn-primary" onclick="openAdd('+dayIdx+')">'+icon('plus',16)+'Registrar</button></div>';
}
function moduleList(items){
  return items.map(function(x){
    const col = COLORS[x.color] || COLORS.indigo;
    return '<div class="list-row">'
      + '<div class="ic" style="background:'+col+'1a;color:'+col+'">'+icon(x.icon, 17)+'</div>'
      + '<div class="grow"><b>'+esc(x.title)+'</b><small>'+esc(x.sub)+'</small></div>'
      + (x.action || '<span class="badge '+(x.badgeClass || 'badge-slate')+'">'+esc(x.badge || '')+'</span>')
      + '</div>';
  }).join('');
}
function viewSaude(){
  const c = ctx();
  const doneW = catCount('saude', true);
  const rows = WEEK.map(function(w, k){
    const t = dayTasks(k).filter(function(x){ return x.cat === 'saude'; })[0];
    const cap = LIE.capacity(c, k);
    return { icon:'dumbbell', color: t && t.done ? 'emerald' : 'slate', title: (t ? t.title : w.workout),
      sub: w.full + ' • capacidade física ' + cap.fisica + '%',
      action:'<button class="btn '+(t && t.done ? 'btn-outline' : 'btn-primary')+' btn-sm" onclick="toggleTask('+k+',\''+(t ? t.id : '')+'\')">'
        + (t && t.done ? 'Concluído' : 'Registrar') + '</button>' };
  });

  /* Sono: usa check-ins reais quando existem, senão a janela projetada */
  const serieSono = LIE.serie(c, 'sono_h', 7);
  const temDados = serieSono.length > 0;
  const dados = WEEK.map(function(w, k){
    const h = LIE.healthOfDay(c, k);
    const real = h && h.sono_h != null ? Number(h.sono_h) : null;
    const proj = LIE.sleepPlan(c, (k + 6) % 7).sonoPossivelH;
    return { d:w.short, h: real != null ? real : proj, real: real != null };
  });
  const meta = state.profile.sono_meta_h || 7.5;
  const sleepChart = dados.map(function(s){
    const alt = LIE.clamp(Math.round((s.h / 10) * 100), 4, 100);
    return '<div class="col"><span class="val">'+s.h.toFixed(1)+'h</span>'
      + '<div class="bar'+(s.h < meta ? ' dim' : '')+(s.real ? '' : ' ghost')+'" style="height:'+alt+'%"></div>'
      + '<span class="cap">'+s.d+'</span></div>';
  }).join('');

  const debt = LIE.sleepDebt(c, 7);
  const hoje = LIE.healthOfDay(c, state.dayIndex);
  const capHoje = LIE.capacity(c, state.dayIndex);

  /* Métricas avançadas do check-in */
  const METRICAS = [
    { k:'peso_kg',    label:'Peso',     un:'kg',   ic:'scale',    cor:'#8b5cf6' },
    { k:'cintura_cm', label:'Cintura',  un:'cm',   ic:'target',   cor:'#f59e0b' },
    { k:'agua_ml',    label:'Água',     un:'ml',   ic:'drop',     cor:'#06b6d4' },
    { k:'passos',     label:'Passos',   un:'',     ic:'steps',    cor:'#10b981' },
    { k:'energia',    label:'Energia',  un:'/5',   ic:'zap',      cor:'#f59e0b' },
    { k:'humor',      label:'Humor',    un:'/5',   ic:'heart',    cor:'#f43f5e' },
    { k:'estresse',   label:'Estresse', un:'/5',   ic:'alert',    cor:'#ef4444' },
    { k:'foco',       label:'Foco',     un:'/5',   ic:'brain',    cor:'#6366f1' },
  ];
  const grade = METRICAS.map(function(m){
    const v = hoje && hoje[m.k] != null ? hoje[m.k] : null;
    const s = LIE.serie(c, m.k, 30);
    const t = s.length ? LIE.trend(s) : null;
    return '<div class="metric">'
      + '<div class="metric-ic" style="background:'+m.cor+'1a;color:'+m.cor+'">'+icon(m.ic,17)+'</div>'
      + '<div class="metric-b"><span class="metric-l">'+esc(m.label)+'</span>'
      + '<b class="metric-v">'+(v != null ? esc(String(v)) + '<small>'+esc(m.un)+'</small>' : '<span class="metric-empty">—</span>')+'</b>'
      + (t && t.n > 1 ? '<span class="metric-t">'+esc(t.direcao)+' • média '+t.media+'</span>' : '<span class="metric-t">sem histórico</span>')
      + '</div></div>';
  }).join('');

  const pa = hoje && hoje.pa_sis ? hoje.pa_sis + '/' + (hoje.pa_dia || '—') + ' mmHg' : 'não registrada';

  return '<div class="view section">'
  + '<div class="row-between">'
    + '<div><p style="font-size:13px;font-weight:700;color:#4f46e5">Módulo operacional</p>'
    + '<h2 style="font-size:30px;font-weight:800;letter-spacing:-.03em">Saúde</h2>'
    + '<p class="muted" style="font-size:13px;margin-top:4px">Biometria, sono, energia e recuperação — a base de todo o cálculo de capacidade.</p></div>'
    + '<button class="btn btn-primary" onclick="openCheckin('+state.dayIndex+')">'+icon('plus',16)+'Check-in de '+esc(WEEK[state.dayIndex].short)+'</button></div>'

  + '<div class="grid g-stats">'
    + statCard('Aderência de treinos', pct(doneW, 7) + '%', doneW + ' de 7 sessões da semana', 'target', 'meta ≥ 70%', '#10b981')
    + statCard('Capacidade física', capHoje.fisica + '%', 'em ' + esc(WEEK[state.dayIndex].full.toLowerCase()), 'zap', 'geral ' + capHoje.geral + '%', capColor(capHoje.fisica))
    + statCard('Dívida de sono', (debt.horas > 0 ? '+' : '') + debt.horas + 'h', debt.dias ? 'em ' + debt.dias + ' dia(s) registrado(s)' : 'sem check-in ainda', 'moon', debt.media ? 'média de ' + debt.media + 'h/noite' : 'registre para calibrar', debt.horas > 2 ? '#f43f5e' : '#8b5cf6')
    + statCard('Pressão arterial', pa, 'último registro do check-in', 'activity', hoje && hoje.pa_sis ? 'monitorado' : 'pendente', '#f43f5e')
  + '</div>'

  + '<div class="card"><div class="card-h"><div><h2 class="card-t">Check-in de '+esc(WEEK[state.dayIndex].full.toLowerCase())+'</h2>'
    + '<p class="card-sub">'+(hoje ? 'Registrado — alimenta capacidade, correlações e projeção de peso' : 'Ainda não registrado. Sem esses dados o motor opera com estimativas.')+'</p></div>'
    + '<div class="row" style="gap:6px">'
    + '<button class="btn btn-outline btn-sm" onclick="setDay('+((state.dayIndex+6)%7)+')">'+icon('left',14)+'</button>'
    + '<button class="btn btn-outline btn-sm" onclick="setDay('+((state.dayIndex+1)%7)+')">'+icon('right',14)+'</button></div></div>'
    + '<div class="card-b"><div class="metrics">'+grade+'</div></div></div>'

  + '<div class="grid g-split">'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Treinos da semana</h2>'
      + '<p class="card-sub">Cardápio A • força, cardio e mobilidade</p></div></div>'
      + '<div class="card-b">'+moduleList(rows)+'</div></div>'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Sono</h2>'
      + '<p class="card-sub">'+(temDados ? serieSono.length + ' noite(s) registrada(s) • meta ' + meta + 'h' : 'Projeção pela agenda — registre o check-in para dados reais')+'</p></div></div>'
      + '<div class="card-b"><div class="chart">'+sleepChart+'</div>'
      + '<div class="note" style="margin-top:14px">Barras claras estão abaixo da meta de '+meta+'h; barras tracejadas são projeções, não medições. '
      + 'O sono é o insumo de maior peso no cálculo de capacidade cognitiva.</div></div></div>'
  + '</div></div>';
}
function viewCarreira(){
  const doneC = catCount('carreira', true);
  const rows = WEEK.map(function(w, k){
    const t = dayTasks(k).filter(function(x){ return x.cat === 'carreira' && x.time === '20:45'; })[0];
    return { icon:'book', color: t && t.done ? 'blue' : 'slate', title:(t ? t.title : w.study),
      sub: w.full + ' • ' + (t ? t.meta : w.smeta),
      action:'<button class="btn '+(t && t.done ? 'btn-outline' : 'btn-primary')+' btn-sm" onclick="toggleTask('+k+',\''+(t ? t.id : '')+'\')">'
        + (t && t.done ? 'Concluído' : 'Registrar') + '</button>' };
  });
  const trilha = TRILHA.map(function(x, k){
    const s = k === 0 ? (doneC >= 5 ? 'done' : 'doing') : (k === 1 && doneC >= 7 ? 'doing' : x.s);
    const map = { done:{ c:'emerald', b:'badge-emerald', l:'Concluído' }, doing:{ c:'blue', b:'badge-blue', l:'Em curso' }, todo:{ c:'slate', b:'badge-slate', l:'Planejado' } };
    return { icon:'target', color:map[s].c, title:x.n, sub:'Semana ' + ((k * 4) + 1) + ' a ' + ((k + 1) * 4) + ' do ciclo', badge:map[s].l, badgeClass:map[s].b };
  });
  return '<div class="view section">'
  + moduleHeader('Carreira', 'Blocos de estudo, artefatos e trilha de dados do ciclo.', state.dayIndex)
  + '<div class="grid g-3">'
    + statCard('Estudo focado', fmtHM(minutesStudied()), doneC + ' blocos concluídos', 'clock', 'meta de 5 blocos/semana', '#3b82f6')
    + statCard('Artefato do ciclo', 'Projeto Qualidade', 'entrega no sábado', 'briefcase', '1 artefato em construção', '#6366f1')
    + statCard('Riscos abertos', '2', 'blocos concentrados às 20h45', 'shield', '', '#f59e0b')
  + '</div>'
  + '<div class="grid g-split">'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Blocos de estudo da semana</h2>'
      + '<p class="card-sub">45 minutos por bloco • evidência obrigatória</p></div></div>'
      + '<div class="card-b">'+moduleList(rows)+'</div></div>'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Trilha do ciclo</h2>'
      + '<p class="card-sub">26 semanas • SQL, modelagem e Power BI</p></div></div>'
      + '<div class="card-b">'+moduleList(trilha)+'</div></div>'
  + '</div></div>';
}
function viewFinancas(){
  const acum = state.aportes.filter(function(a){ return a.ok; }).reduce(function(s,a){ return s + a.v; }, 0);
  const meta = state.aportes.reduce(function(s,a){ return s + a.v; }, 0);
  const rows = state.aportes.map(function(a, idx){
    return { icon:'dollar', color: a.ok ? 'amber' : 'slate', title:'Aporte de R$ ' + a.v, sub:a.m + ' • reserva de emergência',
      action:'<button class="btn '+(a.ok ? 'btn-outline' : 'btn-primary')+' btn-sm" onclick="toggleAporte('+idx+')">'+(a.ok ? 'Confirmado' : 'Confirmar')+'</button>' };
  });
  const regras = [
    { icon:'shield', color:'indigo', title:'Todo gasto classificado em 24h', sub:'sem categoria pendente no fim do dia', badge: state.flags.gastos ? 'Em dia' : 'Pendente', badgeClass: state.flags.gastos ? 'badge-emerald' : 'badge-amber' },
    { icon:'wallet', color:'blue',   title:'Revisão financeira toda sexta',  sub:'bloco de 20 minutos no plano da semana', badge:'Semanal', badgeClass:'badge-blue' },
    { icon:'flame',  color:'rose',   title:'Reserva antes de qualquer upgrade', sub:'meta mínima de R$ 1.800 no ciclo', badge:'Regra fixa', badgeClass:'badge-rose' },
  ];
  return '<div class="view section">'
  + moduleHeader('Finanças', 'Aportes, classificação de gastos e regras do ciclo.', state.dayIndex)
  + '<div class="grid g-3">'
    + statCard('Aderência', pct(acum, meta) + '%', 'aportes confirmados no ciclo', 'target', 'dentro do controle', '#6366f1')
    + statCard('Reserva acumulada', 'R$ ' + acum, 'meta do ciclo: R$ ' + meta.toLocaleString('pt-BR'), 'dollar', 'próximo aporte em set/26', '#f59e0b')
    + statCard('Riscos abertos', state.flags.gastos ? '0' : '1', 'gastos não classificados', 'shield', '', '#f43f5e')
  + '</div>'
  + '<div class="grid g-split">'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Plano de aportes</h2>'
      + '<p class="card-sub">R$ 300 por mês • 6 meses de ciclo</p></div>'
      + '<span class="badge badge-amber">'+pct(acum, meta)+'% da meta</span></div>'
      + '<div class="card-b"><div class="hbar"><div class="lbl"><b>Progresso da reserva</b><span class="muted">R$ '+acum+' de R$ '+meta.toLocaleString('pt-BR')+'</span></div>'
      + '<div class="trk"><i style="width:'+pct(acum, meta)+'%;background:#f59e0b"></i></div></div>'
      + moduleList(rows)+'</div></div>'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Regras não negociáveis</h2>'
      + '<p class="card-sub">Critérios de aceite do pilar</p></div></div>'
      + '<div class="card-b">'+moduleList(regras)
      + '<button class="btn '+(state.flags.gastos ? 'btn-outline' : 'btn-primary')+' btn-block btn-sm" style="margin-top:14px" onclick="toggleFlag(\'gastos\')">'
      + (state.flags.gastos ? 'Gastos classificados hoje' : 'Marcar gastos como classificados')+'</button></div></div>'
  + '</div></div>';
}
function viewAnalytics(){
  const wp = weekPace();
  const bars = WEEK.map(function(w, k){
    const p = dayPct(k);
    return '<div class="col"><span class="val">'+p+'%</span>'
      + '<div class="bar'+(p < 80 ? ' dim' : '')+'" style="height:'+Math.max(4, p)+'%"></div>'
      + '<span class="cap">'+esc(w.short)+'</span></div>';
  }).join('');
  const pil = PILLARS.map(function(p){ return hbar(p.label, pillarPct(p.key), p.color, p.target); }).join('');
  const c = ctx();

  /* Heatmap dia × faixa horária */
  const hm = LIE.heatmap(c);
  const hmHead = '<div class="hm-row hm-head"><span class="hm-lbl"></span>'
    + WEEK.map(function(w){ return '<span class="hm-c">'+esc(w.short)+'</span>'; }).join('') + '</div>';
  const hmBody = hm.map(function(r){
    return '<div class="hm-row"><span class="hm-lbl">'+esc(r.faixa)+'</span>'
      + r.celulas.map(function(x){
          if(x.pct == null) return '<span class="hm-c hm-null" title="sem ações"></span>';
          return '<span class="hm-c" style="background:'+hmColor(x.pct)+'" title="'+esc(WEEK[x.dia].full)+': '+x.done+'/'+x.total+'">'+x.pct+'</span>';
        }).join('') + '</div>';
  }).join('');

  /* Heatmap por pilar */
  const hmp = LIE.heatmapPilar(c);
  const hmpBody = hmp.map(function(r){
    const lbl = (CATS[r.pilar] || { label:r.pilar }).label;
    return '<div class="hm-row"><span class="hm-lbl">'+esc(lbl)+'</span>'
      + r.celulas.map(function(x){
          if(x.pct == null) return '<span class="hm-c hm-null"></span>';
          return '<span class="hm-c" style="background:'+hmColor(x.pct)+'">'+x.pct+'</span>';
        }).join('') + '</div>';
  }).join('');

  /* Pareto de causa raiz */
  const par = LIE.pareto(c);
  const paretoHtml = par.total
    ? '<div class="pareto">' + par.itens.map(function(it){
        const col = COLORS[it.cor] || COLORS.slate;
        return '<div class="pareto-row">'
          + '<span class="pareto-l">'+esc(it.label)+'</span>'
          + '<span class="pareto-trk"><i style="width:'+it.pct+'%;background:'+col+'"></i>'
          + '<u style="left:'+it.acumulado+'%"></u></span>'
          + '<span class="pareto-v">'+it.n+' • '+it.pct+'%</span></div>';
      }).join('') + '</div>'
      + '<div class="note" style="margin-top:12px">Regra 80/20: <b>'+esc(par.vital.map(function(v){return v.label;}).join(', '))
      + '</b> concentra(m) a maior parte das falhas. Atacar essa causa tem mais efeito que aumentar disciplina no geral.</div>'
    : '<div class="empty">Nenhuma falha registrada ainda. Quando uma ação não for concluída, use o botão de bandeira na tarefa para registrar o motivo — é isso que alimenta o Pareto.</div>';

  /* Correlações */
  const CORRS = [
    { a:'sono_h',   b:'aderencia', l:'Sono × Aderência' },
    { a:'sono_h',   b:'foco',      l:'Sono × Produtividade (foco)' },
    { a:'energia',  b:'aderencia', l:'Energia × Resultado' },
    { a:'humor',    b:'foco',      l:'Humor × Performance' },
    { a:'passos',   b:'energia',   l:'Treino/movimento × Energia' },
  ];
  const corrHtml = CORRS.map(function(x){
    const r = LIE.correlation(c, x.a, x.b);
    const força = r.r == null ? 0 : Math.abs(r.r);
    const col = r.r == null ? '#cbd5e1' : (r.r > 0 ? '#10b981' : '#f43f5e');
    return '<div class="corr">'
      + '<div class="corr-h"><b>'+esc(x.l)+'</b><span class="badge '+(r.r == null ? 'badge-slate' : força >= 0.4 ? 'badge-emerald' : 'badge-slate')+'">'
      + (r.r == null ? 'sem dados' : 'r = '+r.r)+'</span></div>'
      + '<div class="corr-trk"><i style="width:'+Math.round(força*100)+'%;background:'+col+'"></i></div>'
      + '<small>'+esc(r.texto)+(r.n ? ' ('+r.n+' dias)' : '')+'</small></div>';
  }).join('');

  /* Tendências multi-janela */
  const JANELAS = [7, 30, 90, 365];
  const METR = [
    { k:'sono_h', l:'Sono', un:'h' },
    { k:'peso_kg', l:'Peso', un:'kg' },
    { k:'energia', l:'Energia', un:'/5' },
    { k:'passos', l:'Passos', un:'' },
  ];
  const trendHtml = METR.map(function(m){
    const cells = JANELAS.map(function(j){
      const s = LIE.serie(c, m.k, j);
      if(!s.length) return '<span class="tr-c tr-null">—</span>';
      const t = LIE.trend(s);
      const cls = t.direcao === 'subindo' ? 'up' : t.direcao === 'caindo' ? 'down' : 'flat';
      return '<span class="tr-c tr-'+cls+'" title="'+s.length+' registro(s)">'+t.media+'</span>';
    }).join('');
    return '<div class="tr-row"><span class="tr-l">'+esc(m.l)+'<small>'+esc(m.un)+'</small></span>'+cells+'</div>';
  }).join('');

  return '<div class="view section">'
  + moduleHeader('Analytics', 'Tendência, correlação, heatmap, Pareto e causa raiz.', state.dayIndex)
  + '<div class="grid g-3">'
    + statCard('Ritmo da semana', wp.ritmo + '%', wp.done + ' de ' + wp.esperado + ' ações esperadas até hoje', 'target', wp.ritmo >= 80 ? 'dentro do ritmo' : 'recuperar no próximo bloco', '#6366f1')
    + statCard('Melhor pilar', bestPillar().label, pillarPct(bestPillar().key) + '% do esperado até hoje', 'trending', 'cadeia preservada', bestPillar().color)
    + statCard('Maior risco', worstPillar().label, 'apenas ' + pillarPct(worstPillar().key) + '% do esperado até hoje', 'shield', '', '#f59e0b')
  + '</div>'

  + '<div class="grid g-split">'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Heatmap de execução</h2>'
      + '<p class="card-sub">Dia × faixa horária — onde o plano quebra primeiro</p></div></div>'
      + '<div class="card-b"><div class="hm">'+hmHead+hmBody+'</div>'
      + '<p class="label" style="margin:18px 0 8px">Por pilar</p>'
      + '<div class="hm">'+hmHead+hmpBody+'</div>'
      + '<div class="hm-legend"><span>0%</span>'
      + [0,25,50,75,100].map(function(v){ return '<i style="background:'+hmColor(v)+'"></i>'; }).join('')
      + '<span>100%</span></div></div></div>'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Aderência por dia</h2>'
      + '<p class="card-sub">Barras claras indicam dias abaixo da meta de 80%</p></div></div>'
      + '<div class="card-b"><div class="chart">'+bars+'</div>'
      + '<p class="label" style="margin:18px 0 8px">Equilíbrio por pilar</p>'+pil+'</div></div>'
  + '</div>'

  + '<div class="grid g-split">'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Pareto de causa raiz</h2>'
      + '<p class="card-sub">'+(par.total ? par.total + ' falha(s) classificada(s)' : 'Nenhuma falha registrada')+'</p></div></div>'
      + '<div class="card-b">'+paretoHtml+'</div></div>'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Correlações</h2>'
      + '<p class="card-sub">Coeficiente de Pearson sobre os check-ins registrados</p></div></div>'
      + '<div class="card-b" style="display:flex;flex-direction:column;gap:14px">'+corrHtml+'</div></div>'
  + '</div>'

  + '<div class="grid g-split">'
    + '<div class="card"><div class="card-h"><div><h2 class="card-t">Tendências</h2>'
      + '<p class="card-sub">Média móvel por janela de tempo</p></div></div>'
      + '<div class="card-b"><div class="trends">'
      + '<div class="tr-row tr-head"><span class="tr-l"></span>'
      + JANELAS.map(function(j){ return '<span class="tr-c">'+j+'d</span>'; }).join('') + '</div>'
      + trendHtml + '</div>'
      + '<div class="note" style="margin-top:12px">Janelas maiores só ganham significado com histórico. Cada check-in diário aumenta a resolução do motor.</div>'
      + '</div></div>'
    + '<div class="card"><div class="card-h"><h2 class="card-t">Leitura executiva</h2></div>'
      + '<div class="card-b"><p class="muted" style="line-height:1.8;font-size:13px">'
      + (wp.ritmo >= 80
          ? 'Semana dentro do padrão: ' + wp.done + ' de ' + wp.esperado + ' ações esperadas até aqui. Mantenha o cardápio atual e aumente a exigência apenas no próximo ciclo.'
          : 'Ritmo abaixo do esperado (' + wp.ritmo + '%). ' + (par.total ? 'A causa dominante registrada é <b>' + esc(par.itens[0].label) + '</b> (' + par.itens[0].pct + '% das falhas).' : 'Registre a causa raiz das falhas para o motor identificar o padrão.'))
      + '</p><div class="note" style="margin-top:16px">Probabilidade de bater as metas da semana: <b>'+LIE.weekProbability(c)+'%</b>. '
      + 'Dados persistidos no seu banco Supabase.</div></div></div>'
  + '</div></div>';
}
function hmColor(pct){
  if(pct == null) return '#f1f5f9';
  if(pct >= 90) return '#059669';
  if(pct >= 70) return '#34d399';
  if(pct >= 50) return '#fbbf24';
  if(pct >= 25) return '#fb923c';
  return '#f87171';
}

/* =========================================================
   9. CENTRAL DE IA
   ========================================================= */
function viewIA(){
  const cards = AGENTS.map(function(a, k){
    const col = COLORS[a.color];
    return '<div class="card agent'+(state.agentOpen === k ? ' active' : '')+'" onclick="openAgent('+k+')">'
      + '<div class="card-b" style="padding:24px">'
      + '<div class="ic" style="background:'+col+'1a;color:'+col+'">'+icon(a.icon,23)+'</div>'
      + '<h3>'+esc(a.name)+'</h3><p>'+esc(a.desc)+'</p>'
      + '<button class="btn btn-ghost btn-sm" style="margin-left:-12px;margin-top:12px">Iniciar conversa '+icon('right',15)+'</button>'
      + '</div></div>';
  }).join('');

  let chat = '';
  if(state.agentOpen !== null){
    const a = AGENTS[state.agentOpen];
    chat = '<div class="card" style="overflow:hidden">'
      + '<div class="chat-head"><div class="row"><div class="ic">'+icon('bot',18)+'</div>'
        + '<div><b>Agente '+esc(a.name)+'</b><small>Contexto da Semana 1 carregado • '+weekStats().done+' ações registradas</small></div></div>'
        + '<button class="icon-btn" style="color:#fff" onclick="closeAgent()" title="Fechar">'+icon('x',19)+'</button></div>'
      + '<div class="card-b">'
        + '<div class="chat-box"><p class="label">Sua solicitação</p>'
        + '<textarea id="agentText" oninput="state.agentText=this.value" placeholder="Descreva o que você precisa decidir...">'+esc(state.agentText)+'</textarea></div>'
        + '<div class="row" style="justify-content:space-between;margin-top:14px;flex-wrap:wrap;gap:10px">'
          + '<div class="row" style="gap:6px;flex-wrap:wrap">'
            + AGENTS.map(function(x, k){ return '<button class="chip'+(state.agentOpen === k ? ' badge-violet' : '')+'" onclick="openAgent('+k+')">'+esc(x.name)+'</button>'; }).join('')
          + '</div>'
          + '<button class="btn btn-primary" onclick="askAgent()">'+icon('sparkles',16)+'Analisar contexto</button>'
        + '</div>'
        + (state.agentBusy
            ? '<div class="answer"><span class="think"><i></i><i></i><i></i></span><p style="margin:0;color:#6d28d9">Lendo indicadores da semana...</p></div>'
            : (state.agentAnswer
              ? '<div class="answer">'+icon('sparkles',18)
                + '<div><b>Recomendação</b><p>'+state.agentAnswer+'</p>'
                + '<p class="src">Resposta calculada a partir do seu plano real, salvo no Supabase.</p></div></div>'
              : ''))
      + '</div></div>';
  }

  return '<div class="view section">'
  + '<div><span class="badge badge-violet">'+icon('sparkles',13)+'Inteligência operacional</span>'
    + '<h2 style="margin-top:12px;font-size:30px;font-weight:800;letter-spacing:-.03em">Central de agentes</h2>'
    + '<p class="muted" style="margin-top:6px;max-width:70ch;line-height:1.7">Agentes especializados leem o contexto, os indicadores e as regras do sistema para apoiar decisões, com base nos dados reais do seu ciclo.</p></div>'
  + '<div class="grid g-agents">'+cards+'</div>'
  + chat + '</div>';
}

function answerFor(name){
  const c = ctx();
  const i = state.dayIndex;
  const t = dayTasks(i);
  const open = t.filter(function(x){ return !x.done; });
  const adh = dayPct(i);
  const cap = LIE.capacity(c, i);
  const bud = LIE.timeBudget(c, i);
  const sp = LIE.sleepPlan(c, i);
  const ins = LIE.insights(c);
  const movs = LIE.replan(c);
  const wp = weekPace();
  const dia = WEEK[i].full.toLowerCase();

  if(name === 'Mentor'){
    const foco = open.slice().sort(function(a,b){ return LIE.taskPriority(a) - LIE.taskPriority(b); })[0];
    const risco = ins[0];
    return 'Capacidade de hoje: <b>' + cap.geral + '%</b> (física ' + cap.fisica + '%, cognitiva ' + cap.cognitiva + '%, emocional ' + cap.emocional + '%) — modo <b>' + cap.faixa + '</b>. '
      + (foco ? 'Sua maior prioridade é <b>' + esc(foco.title) + '</b> às ' + foco.time + ', porque é a ação de menor negociabilidade ainda aberta. '
              : 'Não há ação aberta: o dia já está executado. Proteja o descanso em vez de adicionar volume. ')
      + (bud.viavel ? 'A agenda cabe no dia: ' + LIE.fmtDur(bud.demanda) + ' de demanda para ' + LIE.fmtDur(bud.capacidadeUtil) + ' de capacidade útil. '
                    : '<b>A agenda não cabe:</b> excedente de ' + LIE.fmtDur(bud.excedente) + '. Corte ou mova antes de tentar executar tudo. ')
      + (risco ? 'Risco a vigiar: ' + esc(risco.titulo) + '. ' : '')
      + 'Regra do sistema: não adicione nada novo enquanto houver excedente ou dívida de sono.';
  }

  if(name === 'Auditor'){
    const par = LIE.pareto(c);
    const altos = ins.filter(function(x){ return x.sev === 'alto'; });
    let txt = 'Aderência de hoje: <b>' + adh + '%</b> (' + (t.length - open.length) + ' de ' + t.length + '); ritmo semanal <b>' + wp.ritmo + '%</b> contra meta de 80%. ';
    txt += altos.length ? '<b>' + altos.length + ' risco(s) alto(s):</b> ' + altos.map(function(x){ return esc(x.titulo); }).join('; ') + '. '
                        : 'Nenhum risco de severidade alta em aberto. ';
    txt += par.total ? 'Causa raiz dominante: <b>' + esc(par.itens[0].label) + '</b> com ' + par.itens[0].pct + '% das ' + par.total + ' falhas registradas. '
                     : 'Você ainda não classificou nenhuma falha — sem isso não existe Pareto nem contramedida dirigida. ';
    const semCheckin = 7 - Object.keys(state.health).length;
    if(semCheckin > 0) txt += '<b>Evidência ausente:</b> ' + semCheckin + ' dia(s) da semana sem check-in de saúde, o que força o motor a estimar sono e energia. ';
    txt += 'Evidências obrigatórias: registrar treino, horário real de desligamento e resultado do bloco técnico.';
    return txt;
  }

  if(name === 'Planejador'){
    if(!movs.length && bud.viavel){
      return 'Nenhum replanejamento necessário. Todos os 7 dias cabem na capacidade disponível. '
        + 'Sequência de ' + dia + ': ' + (open.length ? open.map(function(x){ return x.time + ' ' + esc(x.title); }).join(' → ') : 'nada em aberto') + '. '
        + 'Modo <b>' + esc(state.mode) + '</b>: ' + esc(MODES[state.mode].text);
    }
    let txt = 'Detectei ' + movs.length + ' movimento(s) para tornar a semana viável:<br>';
    txt += movs.map(function(m, k){
      return (k+1) + '. <b>' + esc(m.tarefa.title) + '</b> (' + LIE.fmtDur(m.minutos) + ') de <b>' + WEEK[m.de].short + '</b> para <b>' + WEEK[m.para].short + '</b> — ' + esc(m.motivo);
    }).join('<br>');
    txt += '<br>Critério: só movo tarefas de prioridade 3 ou maior, para o dia com mais folga e melhor capacidade. Trabalho e sono nunca são movidos. '
        + 'Use o botão “Aplicar replanejamento” para efetivar.';
    return txt;
  }

  if(name === 'Analista'){
    const cs = LIE.correlation(c, 'sono_h', 'aderencia');
    const ce = LIE.correlation(c, 'energia', 'aderencia');
    const sSono = LIE.serie(c, 'sono_h', 30);
    const tSono = sSono.length ? LIE.trend(sSono) : null;
    let txt = 'Ritmo em <b>' + wp.ritmo + '%</b> (' + wp.done + ' de ' + wp.esperado + ' esperadas). '
      + 'Pilar mais forte: <b>' + esc(bestPillar().label) + '</b> (' + pillarPct(bestPillar().key) + '%); mais fraco: <b>' + esc(worstPillar().label) + '</b> (' + pillarPct(worstPillar().key) + '%). ';
    txt += tSono ? 'Sono: média de ' + tSono.media + 'h em ' + tSono.n + ' registro(s), tendência <b>' + tSono.direcao + '</b>. ' : 'Sem série de sono registrada ainda. ';
    if(cs.r != null) txt += 'Correlação sono × aderência: <b>r = ' + cs.r + '</b> (' + cs.forca + '). ' + cs.texto + ' ';
    if(ce.r != null) txt += 'Energia × aderência: r = ' + ce.r + ' (' + ce.forca + '). ';
    if(cs.r == null && ce.r == null) txt += 'Faça ao menos 3 check-ins para o motor calcular correlações reais em vez de suposições. ';
    txt += 'Probabilidade de bater a semana: <b>' + LIE.weekProbability(c) + '%</b>.';
    return txt;
  }

  if(name === 'Nutricionista'){
    const plan = LIE.mealPlan(c, i);
    const a = plan.alvo;
    const w = LIE.weightProjection(c);
    return 'Alvo de ' + dia + ': <b>' + a.alvo + ' kcal</b>, ' + a.proteina_g + 'g de proteína, ' + a.carbo_g + 'g de carboidrato e ' + a.gordura_g + 'g de gordura. '
      + 'Água: <b>' + (a.agua_ml/1000).toFixed(1).replace('.',',') + ' L</b>. '
      + (a.diaDeTreino ? 'Como há treino de força, adicionei 120 kcal ao alvo. ' : 'Sem treino de força hoje, o alvo fica no patamar base. ')
      + 'Cardápio: ' + plan.refeicoes.map(function(r){
          return '<b>' + esc(r.nome) + '</b> (' + r.hora + ') — ' + r.itens.map(function(x){ return x.gramas + 'g ' + esc(x.nome); }).join(', ');
        }).join('; ') + '. '
      + 'Isso mantém o déficit de ' + a.deficit + ' kcal/dia, equivalente a ' + w.kgSemana + ' kg/semana. '
      + '<i>Planejamento operacional, não orientação clínica.</i>';
  }

  if(name === 'Personal Trainer'){
    const treino = t.filter(function(x){ return x.cat === 'saude'; })[0];
    let txt = 'Capacidade física hoje: <b>' + cap.fisica + '%</b>. ';
    if(cap.fisica >= 75){
      txt += 'Verde para carga alta: execute <b>' + (treino ? esc(treino.title) : 'o treino de força planejado') + '</b> integralmente, com progressão de carga. ';
    } else if(cap.fisica >= 50){
      txt += 'Amarelo: mantenha <b>' + (treino ? esc(treino.title) : 'o treino') + '</b>, mas reduza volume em 30% e preserve a técnica. Não busque recorde hoje. ';
    } else {
      txt += 'Vermelho: substitua por mobilidade de 15 minutos ou caminhada de 20. <b>Manter a cadeia vale mais que a sessão perfeita.</b> ';
    }
    const fadiga = cap.drivers.filter(function(d){ return /Fadiga/.test(d.label); })[0];
    if(fadiga) txt += 'Há fadiga acumulada de treinos recentes descontando ' + Math.abs(fadiga.f) + ' pontos da capacidade física. ';
    if(cap.sonoH < (state.profile.sono_meta_h || 7.5)) txt += 'Com ' + cap.sonoH + 'h de sono, evite falha concêntrica — o risco de lesão sobe e a recuperação cai. ';
    txt += 'Registre a execução para o motor calibrar a fadiga dos próximos dias.';
    return txt;
  }

  if(name === 'Especialista em Sono'){
    return 'Meta de <b>' + sp.metaH + 'h</b>. Amanhã seu primeiro compromisso é <b>' + esc(sp.origem) + '</b>, então: '
      + 'sair de casa às <b>' + sp.saida + '</b> (deslocamento de ' + LIE.fmtDur(sp.deslocamentoMin) + '), '
      + 'acordar às <b>' + sp.acordar + '</b>, dormir até <b>' + sp.dormir + '</b> e iniciar o desligamento às <b>' + sp.desligamento + '</b>. '
      + (sp.retorno ? 'Hoje você retorna às ' + sp.retorno + ', o que já consome parte da janela. ' : '')
      + (sp.viavel ? 'A janela fecha: <b>' + sp.sonoPossivelH + 'h</b> de sono possível. '
                   : '<b>Conflito:</b> só sobram ' + sp.sonoPossivelH + 'h, um déficit de ' + LIE.fmtDur(sp.deficitMin) + ' contra a meta. Antecipe o desligamento ou negocie o horário de saída. ')
      + 'O sono é o insumo de maior peso na capacidade cognitiva — cada hora abaixo da meta custa cerca de 12 pontos.';
  }

  if(name === 'Conselheiro Financeiro'){
    const conf = state.aportes.filter(function(a){ return a.ok; });
    const acum = conf.reduce(function(s,a){ return s + Number(a.v || 0); }, 0);
    const meta = state.aportes.reduce(function(s,a){ return s + Number(a.v || 0); }, 0);
    const pctA = meta ? Math.round((acum/meta)*100) : 0;
    return 'Reserva acumulada: <b>R$ ' + acum + '</b> de R$ ' + meta + ' (' + pctA + '% da meta do ciclo), com ' + conf.length + ' de ' + state.aportes.length + ' aportes confirmados. '
      + (state.flags.gastos ? 'Gastos do dia classificados — critério de aceite em dia. ' : '<b>Pendência:</b> há gasto não classificado. A regra do ciclo é classificar tudo em 24h. ')
      + (pctA >= (100 * (TODAY + 1) / 7) ? 'Você está dentro do plano. ' : 'Aporte em atraso frente ao calendário do ciclo. ')
      + 'Regra fixa: reserva antes de qualquer upgrade de padrão de vida. A revisão financeira é sexta-feira, no bloco já planejado.';
  }

  if(name === 'Coach de Carreira'){
    const okrs = LIE.okrProgress(c);
    const oc = okrs.filter(function(o){ return o.pilar === 'carreira'; })[0];
    const blocos = catCount('carreira', true);
    let txt = 'Blocos de estudo concluídos nesta semana: <b>' + blocos + '</b> ('+ fmtHM(minutesStudied()) +'). ';
    if(oc){
      txt += 'Objetivo <b>' + esc(oc.titulo) + '</b> em <b>' + oc.pct + '%</b>, risco ' + oc.risco + '. ';
      txt += oc.krs.map(function(k){ return esc(k.titulo) + ': ' + k.atual + '/' + k.alvo + ' (' + k.pct + '%)'; }).join('; ') + '. ';
    }
    txt += 'Capacidade cognitiva hoje: ' + cap.cognitiva + '%. ';
    txt += cap.cognitiva >= 70
      ? 'Janela boa para conteúdo novo e difícil — use para o tópico que você vem adiando. '
      : 'Cognição reduzida: hoje faça revisão ou exercício mecânico em vez de teoria nova. ';
    txt += 'Aceleração real vem de artefato publicado, não de horas assistidas: encerre cada bloco com evidência no portfólio.';
    return txt;
  }

  return 'Agente não reconhecido.';
}
function bestPillar(){
  return PILLARS.slice().sort(function(a,b){ return pillarPct(b.key) - pillarPct(a.key); })[0];
}
function worstPillar(){
  return PILLARS.slice().sort(function(a,b){ return pillarPct(a.key) - pillarPct(b.key); })[0];
}

/* =========================================================
   10. MODAIS
   ========================================================= */
function renderLayer(){
  const layer = document.getElementById('layer');
  const toastEl = document.getElementById('toast');
  layer.innerHTML = '';
  if(toastEl) layer.appendChild(toastEl);
  if(!state.modal) return;

  if(state.modal.type === 'add'){
    const i = state.modal.day;
    const opts = WEEK.map(function(w, k){ return '<option value="'+k+'"'+(k === i ? ' selected' : '')+'>'+w.full+' • '+w.date+'</option>'; }).join('');
    const cats = Object.keys(CATS).map(function(c){ return '<option value="'+c+'">'+CATS[c].label+'</option>'; }).join('');
    layer.insertAdjacentHTML('beforeend',
      '<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">'
      + '<div class="modal-h"><h3 class="card-t">Nova ação</h3><button class="icon-btn" onclick="closeModal()">'+icon('x',18)+'</button></div>'
      + '<div class="modal-b">'
        + '<label class="field"><span>Título da ação</span><input id="f-title" placeholder="Ex.: Bloco de SQL — funções de data" autofocus /></label>'
        + '<div class="two"><label class="field"><span>Horário</span><input id="f-time" type="time" value="18:00" /></label>'
        + '<label class="field"><span>Pilar</span><select id="f-cat">'+cats+'</select></label></div>'
        + '<label class="field"><span>Dia</span><select id="f-day">'+opts+'</select></label>'
        + '<label class="field"><span>Detalhe (opcional)</span><input id="f-meta" placeholder="Ex.: 30 min • evidência no repositório" /></label>'
      + '</div>'
      + '<div class="modal-f"><button class="btn btn-outline" onclick="closeModal()">Cancelar</button>'
      + '<button class="btn btn-primary" onclick="saveTask()">'+icon('plus',16)+'Adicionar</button></div>'
      + '</div></div>');
    setTimeout(function(){ const el = document.getElementById('f-title'); if(el) el.focus(); }, 30);
  }

  if(state.modal.type === 'settings'){
    layer.insertAdjacentHTML('beforeend',
      '<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">'
      + '<div class="modal-h"><h3 class="card-t">Configurações</h3><button class="icon-btn" onclick="closeModal()">'+icon('x',18)+'</button></div>'
      + '<div class="modal-b">'
      + '<div class="note">Seus dados estão salvos no seu banco Supabase, vinculados à conta <b>'+esc(currentUser ? currentUser.email : '')+'</b>. Acesse de qualquer dispositivo fazendo login.</div>'
      + '<div class="list-row"><div class="ic" style="background:#6366f11a;color:#6366f1">'+icon('calendar',17)+'</div>'
        + '<div class="grow"><b>Ciclo ativo</b><small>24/08/2026 a 21/02/2027 • 26 semanas</small></div></div>'
      + '<div class="list-row"><div class="ic" style="background:#10b9811a;color:#10b981">'+icon('check',17)+'</div>'
        + '<div class="grow"><b>Progresso salvo</b><small>'+weekStats().done+' de '+weekStats().total+' ações da semana</small></div></div>'
      + '<button class="btn btn-outline btn-block" onclick="exportData()">'+icon('download',16)+'Exportar dados JSON</button>'
      + '<button class="btn btn-outline btn-block" style="color:#e11d48;border-color:#fecdd3" onclick="resetData()">'+icon('refresh',16)+'Restaurar plano padrão</button>'
      + '</div><div class="modal-f"><button class="btn btn-primary" onclick="closeModal()">Fechar</button></div>'
      + '</div></div>');
  }
  if(state.modal.type === 'evento'){
    const ev = state.modal.ev || { tipo:'compromisso', inicio:'09:00', fim:'12:00', deslocamento_min:state.profile.deslocamento_min, intensidade:2, data:WEEK[state.dayIndex].iso };
    const tipos = Object.keys(LIE.TIPOS_EVENTO).map(function(k){
      return '<option value="'+k+'"'+(ev.tipo === k ? ' selected' : '')+'>'+esc(LIE.TIPOS_EVENTO[k].label)+'</option>';
    }).join('');
    const dias = WEEK.map(function(w){
      return '<option value="'+w.iso+'"'+(ev.data === w.iso ? ' selected' : '')+'>'+esc(w.full)+' • '+esc(w.date)+'</option>';
    }).join('');
    layer.insertAdjacentHTML('beforeend',
      '<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">'
      + '<div class="modal-h"><h3 class="card-t">'+(ev.id ? 'Editar evento' : 'Novo evento')+'</h3>'
      + '<button class="icon-btn" onclick="closeModal()">'+icon('x',18)+'</button></div>'
      + '<div class="modal-b">'
        + '<label class="field"><span>Título</span><input id="e-titulo" value="'+esc(ev.titulo || '')+'" placeholder="Ex.: Consulta médica" /></label>'
        + '<div class="two"><label class="field"><span>Tipo</span><select id="e-tipo">'+tipos+'</select></label>'
        + '<label class="field"><span>Dia</span><select id="e-data">'+dias+'</select></label></div>'
        + '<div class="two"><label class="field"><span>Início</span><input id="e-inicio" type="time" value="'+esc(ev.inicio || '09:00')+'" /></label>'
        + '<label class="field"><span>Fim</span><input id="e-fim" type="time" value="'+esc(ev.fim || '12:00')+'" /></label></div>'
        + '<div class="two"><label class="field"><span>Deslocamento (min)</span><input id="e-desloc" type="number" min="0" max="600" value="'+(ev.deslocamento_min != null ? ev.deslocamento_min : 0)+'" /></label>'
        + '<label class="field"><span>Intensidade (1 a 5)</span><input id="e-int" type="number" min="1" max="5" value="'+(ev.intensidade || 2)+'" /></label></div>'
        + '<label class="field"><span>Observação</span><input id="e-nota" value="'+esc(ev.nota || '')+'" placeholder="Opcional" /></label>'
        + '<div class="note">O motor recalcula sono, capacidade e viabilidade da agenda assim que você salvar.</div>'
      + '</div>'
      + '<div class="modal-f">'
      + (ev.id ? '<button class="btn btn-outline" style="color:#e11d48;border-color:#fecdd3" onclick="delEvent(\''+esc(ev.id)+'\')">Excluir</button>' : '')
      + '<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>'
      + '<button class="btn btn-primary" onclick="saveEvent('+(ev.id ? '\''+esc(ev.id)+'\'' : 'null')+')">'+icon('check',16)+'Salvar</button></div>'
      + '</div></div>');
    setTimeout(function(){ const el = document.getElementById('e-titulo'); if(el) el.focus(); }, 30);
  }

  if(state.modal.type === 'checkin'){
    const i = state.modal.day;
    const iso = WEEK[i].iso;
    const h = state.health[iso] || {};
    const num = function(id, label, val, min, max, step, ph){
      return '<label class="field"><span>'+esc(label)+'</span><input id="'+id+'" type="number" min="'+min+'" max="'+max+'" step="'+(step||1)+'" value="'+(val != null ? val : '')+'" placeholder="'+esc(ph||'')+'" /></label>';
    };
    const escala = function(id, label, val){
      const opts = [1,2,3,4,5].map(function(n){ return '<option value="'+n+'"'+(Number(val) === n ? ' selected' : '')+'>'+n+'</option>'; }).join('');
      return '<label class="field"><span>'+esc(label)+' (1 a 5)</span><select id="'+id+'"><option value="">—</option>'+opts+'</select></label>';
    };
    layer.insertAdjacentHTML('beforeend',
      '<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal modal-lg">'
      + '<div class="modal-h"><h3 class="card-t">Check-in • '+esc(WEEK[i].full)+'</h3>'
      + '<button class="icon-btn" onclick="closeModal()">'+icon('x',18)+'</button></div>'
      + '<div class="modal-b">'
        + '<div class="note">Estes números alimentam capacidade, correlações, Pareto e projeção de peso. Deixe em branco o que não medir.</div>'
        + '<div class="two">'+num('h-sono','Sono (horas)', h.sono_h, 0, 14, 0.1, 'ex.: 7.2')+num('h-peso','Peso (kg)', h.peso_kg, 30, 300, 0.1, 'ex.: 104.5')+'</div>'
        + '<div class="two">'+num('h-cintura','Cintura (cm)', h.cintura_cm, 40, 200, 0.5, '')+num('h-agua','Água (ml)', h.agua_ml, 0, 8000, 50, 'ex.: 2500')+'</div>'
        + '<div class="two">'+num('h-passos','Passos', h.passos, 0, 60000, 100, 'ex.: 8000')
        + '<label class="field"><span>Pressão arterial</span><div class="row" style="gap:6px">'
        + '<input id="h-pas" type="number" min="60" max="250" value="'+(h.pa_sis != null ? h.pa_sis : '')+'" placeholder="sis" />'
        + '<input id="h-pad" type="number" min="30" max="160" value="'+(h.pa_dia != null ? h.pa_dia : '')+'" placeholder="dia" /></div></label></div>'
        + '<div class="two">'+escala('h-energia','Energia', h.energia)+escala('h-humor','Humor', h.humor)+'</div>'
        + '<div class="two">'+escala('h-estresse','Estresse', h.estresse)+escala('h-foco','Foco', h.foco)+'</div>'
      + '</div>'
      + '<div class="modal-f"><button class="btn btn-outline" onclick="closeModal()">Cancelar</button>'
      + '<button class="btn btn-primary" onclick="saveCheckin('+i+')">'+icon('check',16)+'Salvar check-in</button></div>'
      + '</div></div>');
  }

  if(state.modal.type === 'perfil'){
    const p = state.profile;
    const ativ = Object.keys(LIE.FATOR_ATIVIDADE).map(function(k){
      return '<option value="'+k+'"'+(p.atividade === k ? ' selected' : '')+'>'+k.charAt(0).toUpperCase()+k.slice(1)+'</option>';
    }).join('');
    layer.insertAdjacentHTML('beforeend',
      '<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal modal-lg">'
      + '<div class="modal-h"><h3 class="card-t">Perfil operacional</h3>'
      + '<button class="icon-btn" onclick="closeModal()">'+icon('x',18)+'</button></div>'
      + '<div class="modal-b">'
        + '<div class="note">Base de cálculo de capacidade, sono, calorias, macros e projeção de peso.</div>'
        + '<div class="two"><label class="field"><span>Nome</span><input id="p-nome" value="'+esc(p.nome)+'" /></label>'
        + '<label class="field"><span>Sexo</span><select id="p-sexo"><option value="M"'+(p.sexo==='M'?' selected':'')+'>Masculino</option><option value="F"'+(p.sexo==='F'?' selected':'')+'>Feminino</option></select></label></div>'
        + '<div class="two"><label class="field"><span>Idade</span><input id="p-idade" type="number" min="12" max="100" value="'+p.idade+'" /></label>'
        + '<label class="field"><span>Altura (cm)</span><input id="p-altura" type="number" min="120" max="230" value="'+p.altura_cm+'" /></label></div>'
        + '<div class="two"><label class="field"><span>Peso atual (kg)</span><input id="p-peso" type="number" min="30" max="300" step="0.1" value="'+p.peso_kg+'" /></label>'
        + '<label class="field"><span>Peso meta (kg)</span><input id="p-metapeso" type="number" min="30" max="300" step="0.1" value="'+p.meta_peso_kg+'" /></label></div>'
        + '<div class="two"><label class="field"><span>Data da meta</span><input id="p-metadata" type="date" value="'+esc(p.meta_data || '')+'" /></label>'
        + '<label class="field"><span>Nível de atividade</span><select id="p-ativ">'+ativ+'</select></label></div>'
        + '<div class="two"><label class="field"><span>Meta de sono (h)</span><input id="p-sono" type="number" min="4" max="12" step="0.25" value="'+p.sono_meta_h+'" /></label>'
        + '<label class="field"><span>Deslocamento padrão (min)</span><input id="p-desloc" type="number" min="0" max="300" value="'+p.deslocamento_min+'" /></label></div>'
        + '<div class="two"><label class="field"><span>Início do expediente</span><input id="p-tini" type="time" value="'+esc(p.trabalho_inicio)+'" /></label>'
        + '<label class="field"><span>Fim do expediente</span><input id="p-tfim" type="time" value="'+esc(p.trabalho_fim)+'" /></label></div>'
        + '<label class="field"><span>Tempo de preparo até sair de casa (min)</span><input id="p-prep" type="number" min="10" max="180" value="'+p.prep_min+'" /></label>'
      + '</div>'
      + '<div class="modal-f"><button class="btn btn-outline" onclick="closeModal()">Cancelar</button>'
      + '<button class="btn btn-primary" onclick="saveProfile()">'+icon('check',16)+'Salvar perfil</button></div>'
      + '</div></div>');
  }

  if(state.modal.type === 'falha'){
    const m = state.modal;
    const opts = Object.keys(LIE.MOTIVOS_FALHA).map(function(k){
      return '<button class="reason" onclick="saveFailure('+m.day+',\''+esc(m.taskId)+'\',\''+k+'\')">'
        + '<b>'+esc(LIE.MOTIVOS_FALHA[k].label)+'</b></button>';
    }).join('');
    layer.insertAdjacentHTML('beforeend',
      '<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">'
      + '<div class="modal-h"><h3 class="card-t">Por que não aconteceu?</h3>'
      + '<button class="icon-btn" onclick="closeModal()">'+icon('x',18)+'</button></div>'
      + '<div class="modal-b">'
        + '<div class="note">Toda tarefa não realizada registra motivo. É isso que alimenta o Pareto e a análise de causa raiz.</div>'
        + '<p class="muted" style="font-size:13px"><b>'+esc(m.taskTitle || '')+'</b></p>'
        + '<div class="reasons">'+opts+'</div>'
      + '</div>'
      + '<div class="modal-f"><button class="btn btn-outline" onclick="closeModal()">Cancelar</button></div>'
      + '</div></div>');
  }

  if(state.modal.type === 'objetivo'){
    const pil = PILLARS.map(function(p){ return '<option value="'+p.key+'">'+esc(p.label)+'</option>'; }).join('');
    layer.insertAdjacentHTML('beforeend',
      '<div class="backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">'
      + '<div class="modal-h"><h3 class="card-t">Novo objetivo</h3>'
      + '<button class="icon-btn" onclick="closeModal()">'+icon('x',18)+'</button></div>'
      + '<div class="modal-b">'
        + '<label class="field"><span>Objetivo</span><input id="o-titulo" placeholder="Ex.: Concluir a trilha de Power BI" /></label>'
        + '<div class="two"><label class="field"><span>Pilar</span><select id="o-pilar">'+pil+'</select></label>'
        + '<label class="field"><span>Prazo</span><input id="o-prazo" type="date" value="2027-02-21" /></label></div>'
        + '<label class="field"><span>Horizonte</span><input id="o-horizonte" value="Ciclo de 26 semanas" /></label>'
        + '<p class="label" style="margin-top:6px">Primeiro key result</p>'
        + '<label class="field"><span>Descrição</span><input id="o-kr" placeholder="Ex.: Dashboards publicados" /></label>'
        + '<div class="two"><label class="field"><span>Valor inicial</span><input id="o-ini" type="number" value="0" /></label>'
        + '<label class="field"><span>Valor alvo</span><input id="o-alvo" type="number" value="4" /></label></div>'
        + '<label class="field"><span>Unidade</span><input id="o-un" placeholder="Ex.: dashboards" /></label>'
      + '</div>'
      + '<div class="modal-f"><button class="btn btn-outline" onclick="closeModal()">Cancelar</button>'
      + '<button class="btn btn-primary" onclick="saveObjetivo()">'+icon('plus',16)+'Criar objetivo</button></div>'
      + '</div></div>');
    setTimeout(function(){ const el = document.getElementById('o-titulo'); if(el) el.focus(); }, 30);
  }
}

/* ---- abertura de modais ---- */
function openEvent(id){
  const ev = id ? state.events.filter(function(e){ return String(e.id) === String(id); })[0] : null;
  state.modal = { type:'evento', ev: ev ? Object.assign({}, ev) : null };
  renderLayer();
}
function openCheckin(day){ state.modal = { type:'checkin', day: day != null ? day : state.dayIndex }; renderLayer(); }
function openProfile(){ state.modal = { type:'perfil' }; renderLayer(); }
function openObjetivo(){ state.modal = { type:'objetivo' }; renderLayer(); }
function openFalha(day, taskId, title){ state.modal = { type:'falha', day: day, taskId: taskId, taskTitle: title }; renderLayer(); }

/* ---- persistência dos novos módulos ---- */
async function saveEvent(id){
  const titulo = document.getElementById('e-titulo').value.trim();
  if(!titulo){ document.getElementById('e-titulo').focus(); return; }
  const ev = {
    id: id || ('ev-' + Date.now().toString(36)),
    titulo: titulo,
    tipo: document.getElementById('e-tipo').value,
    data: document.getElementById('e-data').value,
    inicio: document.getElementById('e-inicio').value || null,
    fim: document.getElementById('e-fim').value || null,
    deslocamento_min: parseInt(document.getElementById('e-desloc').value, 10) || 0,
    intensidade: LIE.clamp(parseInt(document.getElementById('e-int').value, 10) || 2, 1, 5),
    nota: document.getElementById('e-nota').value.trim(),
  };
  const idx = state.events.findIndex(function(x){ return String(x.id) === String(id); });
  if(idx >= 0) state.events[idx] = ev; else state.events.push(ev);
  const di = WEEK.findIndex(function(w){ return w.iso === ev.data; });
  if(di >= 0) state.dayIndex = di;
  closeModal(); saveLocal(); render();
  toast(id ? 'Evento atualizado' : 'Evento criado');
  await pushEvent(ev);
}
async function delEvent(id){
  const idx = state.events.findIndex(function(x){ return String(x.id) === String(id); });
  if(idx < 0) return;
  state.events.splice(idx, 1);
  closeModal(); saveLocal(); render();
  toast('Evento removido');
  if(supa && currentUser && String(id).length === 36) await supa.from('events').delete().eq('id', id);
}
async function saveCheckin(day){
  const iso = WEEK[day].iso;
  const val = function(id){
    const el = document.getElementById(id);
    if(!el || el.value === '') return null;
    const n = Number(el.value);
    return isNaN(n) ? null : n;
  };
  const rec = {
    sono_h: val('h-sono'), peso_kg: val('h-peso'), cintura_cm: val('h-cintura'),
    agua_ml: val('h-agua'), passos: val('h-passos'),
    pa_sis: val('h-pas'), pa_dia: val('h-pad'),
    energia: val('h-energia'), humor: val('h-humor'),
    estresse: val('h-estresse'), foco: val('h-foco'),
  };
  const anterior = state.health[iso] || {};
  state.health[iso] = Object.assign({}, anterior, rec);

  /* Peso do check-in mais recente atualiza o perfil e a projeção */
  if(rec.peso_kg != null){
    state.profile.peso_kg = rec.peso_kg;
    await pushProfile();
  }
  closeModal(); saveLocal(); render();
  toast('Check-in de ' + WEEK[day].short + ' registrado');
  await pushHealth(iso, state.health[iso]);
}
async function saveProfile(){
  const v = function(id){ const el = document.getElementById(id); return el ? el.value : null; };
  const n = function(id){ const x = Number(v(id)); return isNaN(x) ? null : x; };
  state.profile = Object.assign({}, state.profile, {
    nome: v('p-nome') || 'Vinicius', sexo: v('p-sexo'),
    idade: n('p-idade'), altura_cm: n('p-altura'),
    peso_kg: n('p-peso'), meta_peso_kg: n('p-metapeso'), meta_data: v('p-metadata'),
    atividade: v('p-ativ'), sono_meta_h: n('p-sono'),
    deslocamento_min: n('p-desloc'), prep_min: n('p-prep'),
    trabalho_inicio: v('p-tini'), trabalho_fim: v('p-tfim'),
  });
  closeModal(); saveLocal(); render();
  toast('Perfil atualizado — indicadores recalculados');
  await pushProfile();
}
async function saveFailure(day, taskId, motivo){
  const task = state.days[day].tasks.filter(function(t){ return t.id === taskId; })[0];
  if(task){ task.done = false; task.falha = motivo; }
  const f = { id:'f-'+Date.now().toString(36), task_id: taskId, dia: day, iso: WEEK[day].iso, motivo: motivo, nota:'' };
  state.failures.push(f);
  closeModal(); saveLocal(); render();
  toast('Causa registrada: ' + LIE.MOTIVOS_FALHA[motivo].label);
  await pushFailure(f);
}
async function saveObjetivo(){
  const titulo = document.getElementById('o-titulo').value.trim();
  if(!titulo){ document.getElementById('o-titulo').focus(); return; }
  const o = {
    id: 'o-' + Date.now().toString(36),
    titulo: titulo,
    pilar: document.getElementById('o-pilar').value,
    prazo: document.getElementById('o-prazo').value,
    horizonte: document.getElementById('o-horizonte').value.trim(),
    projetos: [],
    krs: [{
      id: 'kr-' + Date.now().toString(36),
      titulo: document.getElementById('o-kr').value.trim() || 'Progresso',
      unidade: document.getElementById('o-un').value.trim(),
      inicio: Number(document.getElementById('o-ini').value) || 0,
      alvo: Number(document.getElementById('o-alvo').value) || 1,
      atual: Number(document.getElementById('o-ini').value) || 0,
      fonte: 'manual',
    }],
  };
  state.objectives.push(o);
  closeModal(); saveLocal(); render();
  toast('Objetivo criado');
  await pushObjectives();
}

/* Aplica o replanejamento proposto pelo motor */
async function applyReplan(){
  const movs = LIE.replan(ctx());
  if(!movs.length){ toast('Nada a replanejar: a semana já é viável'); return; }
  for(const m of movs){
    const origem = state.days[m.de].tasks;
    const idx = origem.findIndex(function(t){ return t.id === m.tarefa.id; });
    if(idx < 0) continue;
    const [task] = origem.splice(idx, 1);
    state.days[m.para].tasks.push(task);
    state.days[m.para].tasks.sort(function(a,b){ return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });
    await pushTask(m.para, task);
  }
  saveLocal(); render();
  toast(movs.length + ' ação(ões) replanejada(s)');
}
function openAdd(day){ state.modal = { type:'add', day: typeof day === 'number' ? day : state.dayIndex }; renderLayer(); }
function openSettings(){ state.modal = { type:'settings' }; renderLayer(); }
function closeModal(){ state.modal = null; renderLayer(); }

async function saveTask(){
  const title = document.getElementById('f-title').value.trim();
  if(!title){ document.getElementById('f-title').focus(); return; }
  const time = document.getElementById('f-time').value || '12:00';
  const cat = document.getElementById('f-cat').value;
  const day = parseInt(document.getElementById('f-day').value, 10);
  const meta = document.getElementById('f-meta').value.trim() || (CATS[cat].label + ' • ação personalizada');

  const newTask = { id:'tmp-'+Date.now().toString(36), time:time, title:title, meta:meta, cat:cat, done:false };
  state.days[day].tasks.push(newTask);
  state.days[day].tasks.sort(function(a,b){ return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });
  state.dayIndex = day;
  closeModal(); save(); render();
  toast('Ação adicionada em ' + WEEK[day].full);
  await pushTask(day, newTask);
  saveLocal();
}

function exportData(){
  const blob = new Blob([JSON.stringify({ ciclo:'24/08/2026-21/02/2027', mode:state.mode, flags:state.flags, days:state.days, aportes:state.aportes }, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'vinicius-os-semana-1.json'; a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  toast('Arquivo JSON exportado');
}
async function resetData(){
  state.days = buildWeek();
  state.flags = { gastos:false, encontro:false };
  state.mode = 'Normal';
  closeModal();
  if(supa && currentUser){
    await supa.from('tasks').delete().eq('user_id', currentUser.id);
    await seedCloud();
  }
  save(); render();
  toast('Plano padrão restaurado');
}

/* =========================================================
   11. AÇÕES
   ========================================================= */
function go(id){
  state.active = id; state.mobileOpen = false;
  if(id !== 'ia'){ state.agentOpen = null; state.agentAnswer=''; }
  save(); render();
  window.scrollTo({ top:0, behavior:'smooth' });
}
function toggleSidebar(){
  if(window.matchMedia('(max-width:1023px)').matches){ state.mobileOpen = !state.mobileOpen; }
  else { state.sidebar = !state.sidebar; saveLocal(); }
  applyChrome();
}
function closeMobile(){ state.mobileOpen = false; applyChrome(); }
function applyChrome(){
  const app = document.getElementById('app-root');
  if(!app) return;
  app.classList.toggle('collapsed', !state.sidebar);
  app.classList.toggle('mobile-open', state.mobileOpen);
}
async function toggleTask(dayIdx, taskId){
  const task = state.days[dayIdx].tasks.find(function(t){ return t.id === taskId; });
  if(!task) return;
  task.done = !task.done;
  save(); render();
  await pushTask(dayIdx, task);
  saveLocal();
}
async function delTask(dayIdx, taskId){
  const idx = state.days[dayIdx].tasks.findIndex(function(t){ return t.id === taskId; });
  if(idx < 0) return;
  state.days[dayIdx].tasks.splice(idx, 1);
  save(); render();
  await deleteRemoteTask(taskId);
  saveLocal();
  toast('Ação removida');
}
function setDay(k){ state.dayIndex = k; save(); render(); }
function setMode(k){ state.mode = k; save(); render(); }
async function toggleFlag(f){
  state.flags[f] = !state.flags[f];
  save(); render();
  toast(state.flags[f] ? 'Marcado como concluído' : 'Desmarcado');
}
async function toggleAporte(idx){
  const a = state.aportes[idx];
  a.ok = !a.ok;
  render(); saveLocal();
  if(supa && currentUser && a.id){
    await supa.from('aportes').update({ confirmado: a.ok }).eq('id', a.id);
  }
  toast(a.ok ? 'Aporte confirmado' : 'Aporte desmarcado');
}
function onSearch(v){ state.search = v; render(); }
function openAgent(k){ state.agentOpen = k; state.agentAnswer=''; render(); }
function closeAgent(){ state.agentOpen = null; state.agentAnswer=''; render(); }
async function askAgent(){
  if(state.agentOpen === null) return;
  const name = AGENTS[state.agentOpen].name;
  state.agentBusy = true; render();
  const logPrompt = state.agentText;
  setTimeout(async function(){
    state.agentAnswer = answerFor(name);
    state.agentBusy = false;
    render();
    if(supa && currentUser){
      await supa.from('agent_logs').insert({ user_id: currentUser.id, agent: name, prompt: logPrompt, answer: state.agentAnswer });
    }
  }, 650);
}

/* =========================================================
   12. RENDER PRINCIPAL
   ========================================================= */
function render(){
  const root = document.getElementById('root');
  if(!document.getElementById('app-root')){
    root.innerHTML = '<div class="app" id="app-root"></div>';
  }
  const app = document.getElementById('app-root');
  app.innerHTML = renderShell();
  applyChrome();

  const view = document.getElementById('view');
  view.classList.add('anim');
  const views = { dashboard:viewDashboard, planner:viewPlanner, agenda:viewAgenda, saude:viewSaude,
                  nutricao:viewNutricao, carreira:viewCarreira, financas:viewFinancas,
                  objetivos:viewObjetivos, analytics:viewAnalytics, ia:viewIA };
  view.innerHTML = (views[state.active] || viewDashboard)();
  renderLayer();
}

/* =========================================================
   13. AUTENTICAÇÃO
   ========================================================= */
let authMode = 'login';

function setupAuthUI(){
  const form = document.getElementById('auth-form');
  const toggleBtn = document.getElementById('auth-toggle');
  const submitBtn = document.getElementById('auth-submit');
  const msg = document.getElementById('auth-msg');

  toggleBtn.addEventListener('click', function(){
    authMode = authMode === 'login' ? 'signup' : 'login';
    submitBtn.textContent = authMode === 'login' ? 'Entrar' : 'Criar conta';
    toggleBtn.textContent = authMode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar';
    msg.textContent = '';
  });

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(!supa){ msg.textContent = 'Supabase não configurado. Edite config.js.'; return; }
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-pass').value;
    submitBtn.textContent = 'Aguarde...';
    msg.className = 'auth-msg'; msg.textContent = '';

    if(authMode === 'signup'){
      const { data, error } = await supa.auth.signUp({ email: email, password: pass });
      if(error){ msg.textContent = error.message; submitBtn.textContent = 'Criar conta'; return; }
      if(data.user && !data.session){
        msg.className = 'auth-msg ok';
        msg.textContent = 'Conta criada! Verifique seu e-mail para confirmar (ou entre direto se a confirmação estiver desativada).';
        submitBtn.textContent = 'Criar conta';
        return;
      }
      await onLoginSuccess(data.user);
    } else {
      const { data, error } = await supa.auth.signInWithPassword({ email: email, password: pass });
      if(error){ msg.textContent = error.message; submitBtn.textContent = 'Entrar'; return; }
      await onLoginSuccess(data.user);
    }
  });
}

async function onLoginSuccess(user){
  currentUser = user;
  document.getElementById('auth-screen').classList.add('hidden');
  loadLocal();
  render();
  await pullFromCloud();
  render();
}

async function doLogout(){
  if(supa) await supa.auth.signOut();
  currentUser = null;
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('root').innerHTML = '';
}

/* =========================================================
   14. ATALHOS DE TECLADO
   ========================================================= */
window.addEventListener('keydown', function(e){
  // Esc fecha modal aberto, senão fecha o menu lateral no celular
  if(e.key === 'Escape'){
    if(state.modal){ closeModal(); return; }
    if(state.mobileOpen){ closeMobile(); return; }
    if(state.agentOpen !== null && state.active === 'ia'){ closeAgent(); }
    return;
  }
  // Ctrl+K / Cmd+K foca a busca
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
    const q = document.getElementById('q');
    if(q){ e.preventDefault(); q.focus(); q.select(); }
  }
});

/* =========================================================
   15. INIT
   ========================================================= */
window.addEventListener('DOMContentLoaded', async function(){
  const ok = initSupabase();
  setupAuthUI();
  if(!ok) return;

  const { data } = await supa.auth.getSession();
  if(data.session && data.session.user){
    await onLoginSuccess(data.session.user);
  }

  supa.auth.onAuthStateChange(function(event, session){
    if(event === 'SIGNED_OUT'){
      currentUser = null;
      document.getElementById('auth-screen').classList.remove('hidden');
      document.getElementById('root').innerHTML = '';
    }
  });
});
