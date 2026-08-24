"use strict";
/* =============================================================================
   LIFE INTELLIGENCE ENGINE (LIE)
   -----------------------------------------------------------------------------
   Motor analítico do Vinicius OS. Funções puras, sem DOM e sem rede.
   Recebe um contexto (perfil, dias, tarefas, eventos, saúde, objetivos, falhas)
   e produz: capacidade, orçamento de tempo, plano de sono, nutrição, projeção
   de peso, tendências, correlações, Pareto, riscos, previsões e replanejamento.

   Regra de ouro: o motor nunca inventa número sem explicar a origem.
   Toda saída relevante carrega `drivers` — a lista de fatores que a formaram.
   ============================================================================= */

const LIE = (function () {

  /* ---------------------------------------------------------------------------
     CONSTANTES E TABELAS DE DOMÍNIO
     --------------------------------------------------------------------------- */
  const FATOR_ATIVIDADE = { sedentario: 1.2, leve: 1.375, moderado: 1.55, alto: 1.725, atleta: 1.9 };

  // kcal por kg de gordura corporal (padrão nutricional clássico)
  const KCAL_POR_KG = 7700;

  // Custo fixo do dia em minutos (higiene, refeições, transições)
  const CUSTO_FIXO_MIN = 135;

  const TIPOS_EVENTO = {
    consulta:    { label: 'Consulta',      icone: 'heart',     intensidade: 2, cor: 'rose',    fisico: 5,  cognitivo: 10, emocional: 12 },
    presencial:  { label: 'Trabalho presencial', icone: 'briefcase', intensidade: 3, cor: 'amber', fisico: 12, cognitivo: 18, emocional: 8 },
    viagem:      { label: 'Viagem',        icone: 'plane',     intensidade: 5, cor: 'violet',  fisico: 25, cognitivo: 22, emocional: 15 },
    casamento:   { label: 'Casamento / evento social', icone: 'heart', intensidade: 4, cor: 'rose', fisico: 18, cognitivo: 8, emocional: -5 },
    treinamento: { label: 'Treinamento',   icone: 'book',      intensidade: 3, cor: 'blue',    fisico: 5,  cognitivo: 25, emocional: 6 },
    curso:       { label: 'Curso',         icone: 'book',      intensidade: 3, cor: 'blue',    fisico: 4,  cognitivo: 22, emocional: 5 },
    ferias:      { label: 'Férias',        icone: 'sun',       intensidade: 1, cor: 'emerald', fisico: -10, cognitivo: -15, emocional: -20 },
    compromisso: { label: 'Compromisso',   icone: 'calendar',  intensidade: 2, cor: 'slate',   fisico: 6,  cognitivo: 8,  emocional: 6 },
  };

  const MOTIVOS_FALHA = {
    energia:      { label: 'Falta de energia',   cor: 'amber'   },
    tempo:        { label: 'Falta de tempo',     cor: 'blue'    },
    saude:        { label: 'Saúde / dor',        cor: 'rose'    },
    interrupcao:  { label: 'Interrupção externa', cor: 'violet' },
    desmotivacao: { label: 'Desmotivação',       cor: 'slate'   },
    prioridade:   { label: 'Outra prioridade',   cor: 'emerald' },
  };

  // Duração padrão por pilar quando a tarefa não declara tempo explícito
  const DURACAO_PADRAO = {
    espiritual: 10, carreira: 45, saude: 45, casa: 15,
    sono: 15, financas: 20, relacionamento: 90, trabalho: 0,
  };

  /* ---------------------------------------------------------------------------
     UTILITÁRIOS
     --------------------------------------------------------------------------- */
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function round(v, d) { const p = Math.pow(10, d || 0); return Math.round(v * p) / p; }

  function toMin(hhmm) {
    if (!hhmm || typeof hhmm !== 'string') return null;
    const p = hhmm.split(':');
    const h = parseInt(p[0], 10), m = parseInt(p[1] || '0', 10);
    if (isNaN(h)) return null;
    return h * 60 + m;
  }
  function toHHMM(min) {
    let m = Math.round(min);
    while (m < 0) m += 1440;
    m = m % 1440;
    const h = Math.floor(m / 60), r = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (r < 10 ? '0' : '') + r;
  }
  function fmtDur(min) {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    if (h && m) return h + 'h ' + m + 'min';
    if (h) return h + 'h';
    return m + 'min';
  }

  // PRNG determinístico — o mesmo dia sempre gera o mesmo cardápio
  function seeded(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  /* Extrai a duração de uma tarefa a partir do texto ("45 min", "1h20") */
  function taskMinutes(task) {
    if (!task) return 0;
    if (task.duracao_min) return Number(task.duracao_min);
    const txt = ((task.meta || '') + ' ' + (task.title || '')).toLowerCase();
    let m = txt.match(/(\d+)\s*h\s*(\d+)?/);
    if (m) return parseInt(m[1], 10) * 60 + (m[2] ? parseInt(m[2], 10) : 0);
    m = txt.match(/(\d+)\s*min/);
    if (m) return parseInt(m[1], 10);
    return DURACAO_PADRAO[task.cat] != null ? DURACAO_PADRAO[task.cat] : 30;
  }

  /* Prioridade da tarefa: 1 = inegociável … 5 = descartável */
  function taskPriority(task) {
    if (task.prioridade) return Number(task.prioridade);
    if (task.cat === 'trabalho') return 1;
    if (task.cat === 'sono') return 1;
    if (task.cat === 'saude') return 2;
    if (task.cat === 'carreira') return 2;
    if (task.cat === 'espiritual') return 3;
    if (task.cat === 'relacionamento') return 3;
    return 4;
  }

  /* ---------------------------------------------------------------------------
     CONTEXTO
     ctx = { profile, days[], week[], events[], health{}, objectives[],
             failures[], aportes[], todayIndex }
     --------------------------------------------------------------------------- */
  function eventsOfDay(ctx, i) {
    const iso = ctx.week[i] && ctx.week[i].iso;
    return (ctx.events || []).filter(function (e) { return e.data === iso; });
  }
  function healthOfDay(ctx, i) {
    const iso = ctx.week[i] && ctx.week[i].iso;
    return (ctx.health || {})[iso] || null;
  }
  function tasksOfDay(ctx, i) {
    return (ctx.days[i] && ctx.days[i].tasks) || [];
  }

  /* ---------------------------------------------------------------------------
     1. SONO — plano e dívida
     Considera o primeiro compromisso do dia seguinte e o deslocamento.
     --------------------------------------------------------------------------- */
  /* Todos os cálculos em minutos relativos à meia-noite do dia de ACORDAR.
     Valores negativos representam a noite anterior — toHHMM já trata o wrap. */
  function sleepPlan(ctx, i) {
    const p = ctx.profile;
    const metaMin = (p.sono_meta_h || 7.5) * 60;
    const prep = p.prep_min != null ? p.prep_min : 60;
    const desloc = p.deslocamento_min != null ? p.deslocamento_min : 0;

    // Primeiro compromisso do DIA SEGUINTE define a hora de acordar
    const prox = (i + 1) % 7;
    const evsProx = eventsOfDay(ctx, prox);
    let inicioProx = toMin(p.trabalho_inicio || '09:00');
    let deslocProx = desloc;
    let origem = 'início do expediente';

    if (isFimDeSemana(prox) && !evsProx.length) {
      inicioProx = toMin('09:00');
      deslocProx = 0;
      origem = 'sem compromisso fixo (fim de semana)';
    }

    evsProx.forEach(function (e) {
      const ini = toMin(e.inicio);
      if (ini != null && ini < inicioProx) {
        inicioProx = ini;
        deslocProx = e.deslocamento_min != null ? e.deslocamento_min : desloc;
        origem = (TIPOS_EVENTO[e.tipo] ? TIPOS_EVENTO[e.tipo].label : 'evento') + ' — ' + e.titulo;
      }
    });

    const saida = inicioProx - deslocProx;   // pode ser negativo: saída de madrugada
    const acordar = saida - prep;
    const dormirIdeal = acordar - metaMin;   // normalmente negativo = noite do dia i

    // Retorno do DIA ATUAL, convertido para o mesmo eixo (dia i = -1440)
    const evsHoje = eventsOfDay(ctx, i);
    let retornoRel = null, eventoRetorno = null, deslocRetorno = 0;
    evsHoje.forEach(function (e) {
      const fim = toMin(e.fim);
      if (fim != null) {
        const dv = e.deslocamento_min != null ? e.deslocamento_min : desloc;
        const rel = fim + dv - 1440;
        if (retornoRel == null || rel > retornoRel) { retornoRel = rel; eventoRetorno = e; deslocRetorno = dv; }
      }
    });

    let dormirReal = dormirIdeal;
    let conflito = false;
    if (retornoRel != null) {
      const minimoParaDeitar = retornoRel + 45;   // descompressão pós-chegada
      if (minimoParaDeitar > dormirIdeal) { dormirReal = minimoParaDeitar; conflito = true; }
    }

    const sonoPossivelMin = Math.max(0, acordar - dormirReal);
    const deficitMin = Math.max(0, metaMin - sonoPossivelMin);

    return {
      metaH: metaMin / 60,
      origem: origem,
      saida: toHHMM(saida),
      acordar: toHHMM(acordar),
      dormir: toHHMM(dormirReal),
      dormirIdeal: toHHMM(dormirIdeal),
      desligamento: toHHMM(dormirReal - 45),
      retorno: retornoRel != null ? toHHMM(retornoRel) : null,
      eventoRetorno: eventoRetorno,
      deslocamentoMin: deslocProx,
      deslocamentoRetornoMin: deslocRetorno,
      conflito: conflito,
      deficitMin: deficitMin,
      sonoPossivelH: round(sonoPossivelMin / 60, 1),
      viavel: deficitMin <= 15,
    };
  }

  /* Dívida de sono acumulada nos últimos N dias registrados */
  function sleepDebt(ctx, dias) {
    const p = ctx.profile;
    const meta = p.sono_meta_h || 7.5;
    const isos = Object.keys(ctx.health || {}).sort();
    const ult = isos.slice(-(dias || 7));
    let debito = 0, n = 0;
    ult.forEach(function (iso) {
      const h = ctx.health[iso];
      if (h && h.sono_h != null) { debito += (meta - Number(h.sono_h)); n++; }
    });
    return { horas: round(debito, 1), dias: n, media: n ? round((meta * n - debito) / n, 1) : null };
  }

  /* ---------------------------------------------------------------------------
     2. CAPACIDADE — física, cognitiva e emocional (0 a 100)
     --------------------------------------------------------------------------- */
  function capacity(ctx, i) {
    const p = ctx.profile;
    const meta = p.sono_meta_h || 7.5;
    const h = healthOfDay(ctx, i);
    const evs = eventsOfDay(ctx, i);
    const drivers = [];

    // Sono: medido se houver check-in, senão projetado pelo plano
    let sono;
    if (h && h.sono_h != null) { sono = Number(h.sono_h); }
    else { sono = sleepPlan(ctx, (i + 6) % 7).sonoPossivelH; }
    const debito = Math.max(0, meta - sono);

    let fisica = 100, cognitiva = 100, emocional = 100;

    if (debito > 0) {
      const df = round(debito * 9, 0), dc = round(debito * 12, 0), de = round(debito * 7, 0);
      fisica -= df; cognitiva -= dc; emocional -= de;
      drivers.push({ label: 'Dívida de sono (' + round(debito, 1) + 'h abaixo da meta)', f: -df, c: -dc, e: -de });
    } else if (sono >= meta) {
      fisica += 3; cognitiva += 3;
      drivers.push({ label: 'Sono na meta (' + round(sono, 1) + 'h)', f: 3, c: 3, e: 0 });
    }

    // Fadiga acumulada de treino nos 2 dias anteriores
    let fadiga = 0;
    for (let k = 1; k <= 2; k++) {
      const d = (i - k + 7) % 7;
      const treinou = tasksOfDay(ctx, d).some(function (t) { return t.cat === 'saude' && t.done; });
      if (treinou) fadiga += (k === 1 ? 9 : 4);
    }
    if (fadiga) { fisica -= fadiga; drivers.push({ label: 'Fadiga de treinos recentes', f: -fadiga, c: 0, e: 0 }); }

    // Carga mental: blocos exigentes planejados no dia
    const exigentes = tasksOfDay(ctx, i).filter(function (t) {
      return (t.cat === 'carreira' || t.cat === 'trabalho') && !t.done;
    }).length;
    if (exigentes > 2) {
      const dc = (exigentes - 2) * 6;
      cognitiva -= dc;
      drivers.push({ label: exigentes + ' blocos cognitivos exigentes', f: 0, c: -dc, e: 0 });
    }

    // Deslocamento do dia
    let desloc = 0;
    evs.forEach(function (e) { desloc += (e.deslocamento_min != null ? e.deslocamento_min : (p.deslocamento_min || 0)); });
    if (!evs.length && !isFimDeSemana(i)) desloc = (p.deslocamento_min || 0) * 2;
    if (desloc > 60) {
      const d = round((desloc - 60) / 12, 0);
      fisica -= d; emocional -= round(d / 2, 0);
      drivers.push({ label: 'Deslocamento de ' + fmtDur(desloc), f: -d, c: 0, e: -round(d / 2, 0) });
    }

    // Impacto dos eventos
    evs.forEach(function (e) {
      const t = TIPOS_EVENTO[e.tipo] || TIPOS_EVENTO.compromisso;
      const mult = (e.intensidade || t.intensidade) / t.intensidade;
      const f = round(t.fisico * mult, 0), c = round(t.cognitivo * mult, 0), em = round(t.emocional * mult, 0);
      fisica -= f; cognitiva -= c; emocional -= em;
      drivers.push({ label: t.label + ': ' + e.titulo, f: -f, c: -c, e: -em });
    });

    // Check-in subjetivo do dia (escala 1..5)
    if (h) {
      if (h.estresse != null) {
        const s = (Number(h.estresse) - 3) * 6;
        if (s) { emocional -= s; cognitiva -= round(s / 2, 0); drivers.push({ label: 'Estresse relatado ' + h.estresse + '/5', f: 0, c: -round(s / 2, 0), e: -s }); }
      }
      if (h.humor != null) {
        const m = (Number(h.humor) - 3) * 5;
        if (m) { emocional += m; drivers.push({ label: 'Humor relatado ' + h.humor + '/5', f: 0, c: 0, e: m }); }
      }
      if (h.energia != null) {
        const en = (Number(h.energia) - 3) * 5;
        if (en) { fisica += en; drivers.push({ label: 'Energia relatada ' + h.energia + '/5', f: en, c: 0, e: 0 }); }
      }
    }

    // Isolamento: dias seguidos sem relacionamento nem espiritual
    let secos = 0;
    for (let k = 0; k < 4; k++) {
      const d = (i - k + 7) % 7;
      const teve = tasksOfDay(ctx, d).some(function (t) {
        return (t.cat === 'relacionamento' || t.cat === 'espiritual') && t.done;
      });
      if (teve) break;
      secos++;
    }
    if (secos >= 3) {
      emocional -= secos * 4;
      drivers.push({ label: secos + ' dias sem pilar espiritual/relacional', f: 0, c: 0, e: -secos * 4 });
    }

    fisica = clamp(round(fisica, 0), 0, 100);
    cognitiva = clamp(round(cognitiva, 0), 0, 100);
    emocional = clamp(round(emocional, 0), 0, 100);
    const geral = clamp(round(fisica * 0.30 + cognitiva * 0.45 + emocional * 0.25, 0), 0, 100);

    return {
      fisica: fisica, cognitiva: cognitiva, emocional: emocional, geral: geral,
      sonoH: round(sono, 1), medido: !!(h && h.sono_h != null),
      drivers: drivers.filter(function (d) { return d.f || d.c || d.e; }),
      faixa: geral >= 80 ? 'Ideal' : geral >= 60 ? 'Normal' : geral >= 40 ? 'Ruim' : 'Mínimo viável',
    };
  }

  function isFimDeSemana(i) { return i === 5 || i === 6; }

  /* ---------------------------------------------------------------------------
     3. ORÇAMENTO DE TEMPO E VIABILIDADE DA AGENDA
     --------------------------------------------------------------------------- */
  function timeBudget(ctx, i) {
    const p = ctx.profile;
    const sono = (p.sono_meta_h || 7.5) * 60;
    const evs = eventsOfDay(ctx, i);
    const fds = isFimDeSemana(i);

    let trabalho = 0, desloc = 0, evento = 0;
    const feriasHoje = evs.some(function (e) { return e.tipo === 'ferias'; });

    if (!fds && !feriasHoje) {
      const ini = toMin(p.trabalho_inicio || '09:00');
      const fim = toMin(p.trabalho_fim || '18:00');
      trabalho = Math.max(0, fim - ini);
      desloc = (p.deslocamento_min || 0) * 2;
    }

    evs.forEach(function (e) {
      const ini = toMin(e.inicio), fim = toMin(e.fim);
      if (ini != null && fim != null && fim > ini) evento += (fim - ini);
      if (e.deslocamento_min != null) desloc = Math.max(desloc, e.deslocamento_min * 2);
      // Evento presencial substitui o expediente padrão, não soma
      if (e.tipo === 'presencial' || e.tipo === 'viagem') trabalho = 0;
    });

    const ocupado = sono + trabalho + desloc + evento + CUSTO_FIXO_MIN;
    const livre = Math.max(0, 1440 - ocupado);

    const tarefas = tasksOfDay(ctx, i).filter(function (t) { return !t.done && t.cat !== 'trabalho'; });
    let demanda = 0;
    tarefas.forEach(function (t) { demanda += taskMinutes(t); });

    const buffer = 0.85;                 // 15% de folga para imprevistos
    const capacidadeUtil = livre * buffer;
    const excedente = Math.max(0, demanda - capacidadeUtil);

    return {
      sono: sono, trabalho: trabalho, deslocamento: desloc, eventos: evento, fixo: CUSTO_FIXO_MIN,
      ocupado: ocupado, livre: livre, capacidadeUtil: round(capacidadeUtil, 0),
      demanda: demanda, excedente: round(excedente, 0),
      viavel: excedente <= 0,
      ocupacao: livre ? clamp(round((demanda / capacidadeUtil) * 100, 0), 0, 999) : 100,
      tarefasAbertas: tarefas.length,
    };
  }

  /* ---------------------------------------------------------------------------
     4. REPLANEJAMENTO AUTOMÁTICO
     Move o excedente para os dias com maior folga, respeitando prioridade.
     --------------------------------------------------------------------------- */
  function replan(ctx) {
    const folgas = [];
    for (let i = 0; i < 7; i++) {
      const b = timeBudget(ctx, i);
      const c = capacity(ctx, i);
      folgas.push({ dia: i, folga: b.capacidadeUtil - b.demanda, budget: b, cap: c });
    }

    const movimentos = [];
    folgas.forEach(function (d) {
      if (d.folga >= 0) return;
      let deficit = -d.folga;

      // Candidatas: âncoras diárias (trabalho, sono, espiritual) nunca se movem.
      // As demais saem por ordem de dispensabilidade.
      const cands = tasksOfDay(ctx, d.dia)
        .filter(function (t) {
          if (t.done) return false;
          return ['trabalho', 'sono', 'espiritual'].indexOf(t.cat) < 0;
        })
        .sort(function (a, b) {
          const pa = taskPriority(a), pb = taskPriority(b);
          if (pa !== pb) return pb - pa;
          return taskMinutes(b) - taskMinutes(a);
        });

      cands.forEach(function (t) {
        if (deficit <= 0) return;
        const dur = taskMinutes(t);
        // Destino: dia futuro da semana com folga suficiente e boa capacidade
        const destino = folgas
          .filter(function (x) { return x.dia !== d.dia && x.folga >= dur + 15; })
          .sort(function (a, b) { return (b.folga + b.cap.geral) - (a.folga + a.cap.geral); })[0];
        if (!destino) return;
        movimentos.push({
          tarefa: t, de: d.dia, para: destino.dia, minutos: dur,
          motivo: 'Dia ' + (d.budget.ocupacao) + '% ocupado, excedente de ' + fmtDur(-d.folga)
                + '. Destino com ' + fmtDur(destino.folga) + ' livres e capacidade ' + destino.cap.geral + '%.',
        });
        destino.folga -= dur;
        deficit -= dur;
      });
    });
    return movimentos;
  }

  /* ---------------------------------------------------------------------------
     5. NUTRIÇÃO OPERACIONAL
     --------------------------------------------------------------------------- */
  function nutritionTargets(ctx, i) {
    const p = ctx.profile;
    const peso = Number(p.peso_kg) || 80;
    const alt = Number(p.altura_cm) || 175;
    const idade = Number(p.idade) || 30;
    const metaPeso = Number(p.meta_peso_kg) || peso;

    const bmr = 10 * peso + 6.25 * alt - 5 * idade + (p.sexo === 'F' ? -161 : 5);
    const fator = FATOR_ATIVIDADE[p.atividade || 'moderado'] || 1.55;
    const tdee = bmr * fator;

    const perder = metaPeso < peso;
    // Déficit seguro: 20% do TDEE, limitado a 700 kcal e nunca abaixo de 1.1x BMR
    let alvo = perder ? Math.max(bmr * 1.1, tdee - Math.min(700, tdee * 0.20))
                      : tdee + (metaPeso > peso ? 300 : 0);

    // Dia de treino de força ganha um ajuste para cima
    const treinou = tasksOfDay(ctx, i != null ? i : 0).some(function (t) {
      return t.cat === 'saude' && /academia|for[çc]a/i.test(t.title || '');
    });
    if (treinou) alvo += 120;

    const proteina = Math.round((perder ? 2.0 : 1.8) * metaPeso);
    const gordura = Math.round(0.8 * metaPeso);
    const carbo = Math.max(60, Math.round((alvo - proteina * 4 - gordura * 9) / 4));
    const horasTreino = treinou ? 1 : 0.5;
    const agua = clamp(Math.round((35 * peso + 500 * horasTreino) / 50) * 50, 1500, 4000);

    return {
      bmr: Math.round(bmr), tdee: Math.round(tdee), alvo: Math.round(alvo),
      deficit: Math.round(tdee - alvo),
      proteina_g: proteina, carbo_g: carbo, gordura_g: gordura, agua_ml: agua,
      diaDeTreino: treinou,
    };
  }

  // Banco de alimentos (macros por 100 g) com porções mínimas e máximas realistas
  const ALIMENTOS = {
    proteina: [
      { n: 'ovos',            p: 13, c: 1,  g: 11, min: 100, max: 200, refeicoes: ['Café da manhã'] },
      { n: 'whey protein',    p: 78, c: 8,  g: 6,  min: 25,  max: 45,  refeicoes: ['Café da manhã', 'Lanche'] },
      { n: 'iogurte natural', p: 10, c: 5,  g: 3,  min: 150, max: 250, refeicoes: ['Café da manhã', 'Lanche'] },
      { n: 'frango grelhado', p: 31, c: 0,  g: 4,  min: 120, max: 250, refeicoes: ['Almoço', 'Jantar', 'Lanche'] },
      { n: 'patinho moído',   p: 27, c: 0,  g: 8,  min: 120, max: 220, refeicoes: ['Almoço', 'Jantar'] },
      { n: 'tilápia',         p: 26, c: 0,  g: 3,  min: 130, max: 240, refeicoes: ['Almoço', 'Jantar'] },
    ],
    carbo: [
      { n: 'arroz cozido',      p: 3,  c: 28, g: 0, min: 80,  max: 400, refeicoes: ['Almoço', 'Jantar'] },
      { n: 'batata doce',       p: 2,  c: 20, g: 0, min: 100, max: 450, refeicoes: ['Almoço', 'Jantar', 'Lanche'] },
      { n: 'macarrão integral', p: 5,  c: 30, g: 1, min: 80,  max: 350, refeicoes: ['Almoço', 'Jantar'] },
      { n: 'aveia',             p: 14, c: 58, g: 7, min: 30,  max: 120, refeicoes: ['Café da manhã', 'Lanche'] },
      { n: 'pão integral',      p: 9,  c: 43, g: 4, min: 50,  max: 180, refeicoes: ['Café da manhã', 'Lanche'] },
      { n: 'banana',            p: 1,  c: 23, g: 0, min: 80,  max: 240, refeicoes: ['Café da manhã', 'Lanche'] },
    ],
    vegetal: [
      { n: 'brócolis',     p: 3, c: 7,  g: 0, min: 100, max: 180, refeicoes: ['Almoço', 'Jantar'] },
      { n: 'legumes',      p: 2, c: 8,  g: 0, min: 100, max: 180, refeicoes: ['Almoço', 'Jantar'] },
      { n: 'salada verde', p: 1, c: 3,  g: 0, min: 100, max: 180, refeicoes: ['Almoço', 'Jantar'] },
      { n: 'abobrinha',    p: 1, c: 3,  g: 0, min: 100, max: 180, refeicoes: ['Almoço', 'Jantar'] },
      { n: 'cenoura',      p: 1, c: 10, g: 0, min: 80,  max: 150, refeicoes: ['Almoço', 'Jantar'] },
    ],
  };

  const REFEICOES = [
    { nome: 'Café da manhã', hora: '06:40', share: 0.25, tipos: ['proteina', 'carbo'] },
    { nome: 'Almoço',        hora: '12:15', share: 0.35, tipos: ['proteina', 'carbo', 'vegetal'] },
    { nome: 'Lanche',        hora: '16:00', share: 0.15, tipos: ['proteina', 'carbo'] },
    { nome: 'Jantar',        hora: '20:15', share: 0.25, tipos: ['proteina', 'vegetal', 'carbo'] },
  ];

  function mealPlan(ctx, i) {
    const alvo = nutritionTargets(ctx, i);
    const rnd = seeded((i + 1) * 97 + Math.round(Number(ctx.profile.peso_kg) || 80));
    const usados = [];

    /* Escolhe um alimento adequado à refeição, evitando repetir no mesmo dia */
    const pick = function (tipo, refeicao) {
      const aptos = ALIMENTOS[tipo].filter(function (x) {
        return !x.refeicoes || x.refeicoes.indexOf(refeicao) >= 0;
      });
      const base = aptos.length ? aptos : ALIMENTOS[tipo];
      const novos = base.filter(function (x) { return usados.indexOf(x.n) < 0; });
      const pool = novos.length ? novos : base;
      return pool[Math.floor(rnd() * pool.length)];
    };

    /* Gramas para atingir a meta do macro, sempre dentro da porção realista */
    const gramasPara = function (item, metaG, macro) {
      const densidade = item[macro];
      let g = densidade > 0 ? (metaG / densidade) * 100 : item.min;
      g = clamp(g, item.min, item.max);
      return Math.round(g / 10) * 10;
    };

    const refeicoes = REFEICOES.map(function (r) {
      const pAlvo = alvo.proteina_g * r.share;
      const cAlvo = alvo.carbo_g * r.share;
      const itens = [];

      r.tipos.forEach(function (tipo) {
        const item = pick(tipo, r.nome);
        usados.push(item.n);
        let gramas;
        if (tipo === 'proteina') {
          // desconta a proteína que virá do carboidrato da mesma refeição
          gramas = gramasPara(item, pAlvo * 0.85, 'p');
        } else if (tipo === 'carbo') {
          gramas = gramasPara(item, cAlvo, 'c');
        } else {
          gramas = item.min;
        }
        itens.push({ ref: item, nome: item.n, gramas: gramas });
      });

      return { nome: r.nome, hora: r.hora, itens: itens };
    });

    /* Balanceamento: fecha o resíduo calórico ajustando os carboidratos
       dentro das porções permitidas, em vez de entregar um plano furado. */
    const kcalDe = function (item, g) { return (item.p * 4 + item.c * 4 + item.g * 9) * g / 100; };
    const somaKcal = function () {
      return refeicoes.reduce(function (a, r) {
        return a + r.itens.reduce(function (s, x) { return s + kcalDe(x.ref, x.gramas); }, 0);
      }, 0);
    };

    for (let passo = 0; passo < 6; passo++) {
      const gap = alvo.alvo - somaKcal();
      if (Math.abs(gap) <= 60) break;
      const carbos = [];
      refeicoes.forEach(function (r) {
        r.itens.forEach(function (x) {
          const temFolga = gap > 0 ? x.gramas < x.ref.max : x.gramas > x.ref.min;
          if (x.ref.c >= 15 && temFolga) carbos.push(x);
        });
      });
      if (!carbos.length) break;
      const porItem = gap / carbos.length;
      carbos.forEach(function (x) {
        const dens = (x.ref.p * 4 + x.ref.c * 4 + x.ref.g * 9) / 100;
        const delta = dens ? porItem / dens : 0;
        x.gramas = Math.round(clamp(x.gramas + delta, x.ref.min, x.ref.max) / 10) * 10;
      });
    }

    /* Materializa os macros finais */
    refeicoes.forEach(function (r) {
      r.itens = r.itens.map(function (x) {
        const it = x.ref, g = x.gramas;
        return {
          nome: it.n, gramas: g,
          p: round(it.p * g / 100, 0), c: round(it.c * g / 100, 0),
          g: round(it.g * g / 100, 0), kcal: round(kcalDe(it, g), 0),
        };
      });
      r.total = r.itens.reduce(function (a, x) {
        return { p: a.p + x.p, c: a.c + x.c, g: a.g + x.g, kcal: a.kcal + x.kcal };
      }, { p: 0, c: 0, g: 0, kcal: 0 });
    });

    const total = refeicoes.reduce(function (a, r) {
      return { p: a.p + r.total.p, c: a.c + r.total.c, g: a.g + r.total.g, kcal: a.kcal + r.total.kcal };
    }, { p: 0, c: 0, g: 0, kcal: 0 });

    // Diferença residual entre o cardápio montado e o alvo teórico
    const desvio = {
      kcal: total.kcal - alvo.alvo,
      proteina: total.p - alvo.proteina_g,
      pctKcal: alvo.alvo ? round(((total.kcal - alvo.alvo) / alvo.alvo) * 100, 0) : 0,
    };

    return { alvo: alvo, refeicoes: refeicoes, total: total, desvio: desvio };
  }

  /* ---------------------------------------------------------------------------
     6. PROJEÇÃO DE PESO
     --------------------------------------------------------------------------- */
  function weightProjection(ctx) {
    const p = ctx.profile;
    const peso = Number(p.peso_kg) || 80;
    const meta = Number(p.meta_peso_kg) || peso;
    const alvo = nutritionTargets(ctx, ctx.todayIndex || 0);

    // Aderência real observada nos pilares que movem o peso.
    // A dieta responde pela maior parte do resultado; o treino modula o restante.
    const ad = adherence(ctx);
    const fatorAderencia = clamp(0.6 + (ad.saude / 100) * 0.4, 0.6, 1);

    const deficitEfetivo = alvo.deficit * fatorAderencia;
    const kgSemana = (deficitEfetivo * 7) / KCAL_POR_KG;
    const kgMes = kgSemana * 4.345;
    const delta = peso - meta;

    const projecao = [];
    let atual = peso;
    const hoje = new Date();
    for (let m = 1; m <= 12 && (kgMes > 0.05); m++) {
      atual = Math.max(meta, round(atual - kgMes, 1));
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + m, 1);
      projecao.push({
        mes: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        peso: atual,
        atingiu: atual <= meta + 0.05,
      });
      if (atual <= meta + 0.05) break;
    }

    const semanasNecessarias = kgSemana > 0 ? Math.ceil(delta / kgSemana) : null;
    let dataProjetada = null;
    if (semanasNecessarias != null && semanasNecessarias < 520) {
      const d = new Date(hoje.getTime() + semanasNecessarias * 7 * 86400000);
      dataProjetada = d;
    }

    const dataMeta = p.meta_data ? new Date(p.meta_data + 'T00:00:00') : null;
    let atrasoSemanas = null;
    if (dataProjetada && dataMeta) {
      atrasoSemanas = Math.round((dataProjetada - dataMeta) / (7 * 86400000));
    }

    // Probabilidade: aderência + sustentabilidade do ritmo + tamanho do desafio
    let prob = 40 + ad.saude * 0.35 + ad.geral * 0.15;
    const ritmoPct = peso ? (kgSemana / peso) * 100 : 0;
    if (ritmoPct > 1) prob -= (ritmoPct - 1) * 25;          // ritmo insustentável
    if (alvo.deficit > 750) prob -= 12;
    if (delta > 20) prob -= 8;
    if (atrasoSemanas != null && atrasoSemanas > 0) prob -= Math.min(20, atrasoSemanas);
    prob = clamp(round(prob, 0), 5, 95);

    return {
      pesoAtual: peso, meta: meta, delta: round(delta, 1),
      kgSemana: round(kgSemana, 2), kgMes: round(kgMes, 1),
      deficitAlvo: alvo.deficit, deficitEfetivo: Math.round(deficitEfetivo),
      aderenciaSaude: ad.saude,
      projecao: projecao,
      semanas: semanasNecessarias,
      dataProjetada: dataProjetada,
      dataMeta: dataMeta,
      atrasoSemanas: atrasoSemanas,
      probabilidade: prob,
      sustentavel: ritmoPct <= 1 && alvo.deficit <= 750,
    };
  }

  /* ---------------------------------------------------------------------------
     7. ADERÊNCIA E RITMO
     --------------------------------------------------------------------------- */
  function adherence(ctx) {
    const hoje = ctx.todayIndex || 0;
    let done = 0, total = 0, esperado = 0;
    const porPilar = {};

    for (let i = 0; i < 7; i++) {
      tasksOfDay(ctx, i).forEach(function (t) {
        total++;
        if (i <= hoje) esperado++;
        if (t.done) done++;
        const k = t.cat;
        porPilar[k] = porPilar[k] || { done: 0, total: 0, esperado: 0 };
        porPilar[k].total++;
        if (i <= hoje) porPilar[k].esperado++;
        if (t.done) porPilar[k].done++;
      });
    }

    const pilarPct = {};
    Object.keys(porPilar).forEach(function (k) {
      const x = porPilar[k];
      pilarPct[k] = x.esperado ? clamp(Math.round((x.done / x.esperado) * 100), 0, 100) : 0;
    });

    const hojeTasks = tasksOfDay(ctx, hoje);
    const hojeDone = hojeTasks.filter(function (t) { return t.done; }).length;

    return {
      done: done, total: total, esperado: esperado,
      geral: esperado ? clamp(Math.round((done / esperado) * 100), 0, 100) : 0,
      semanal: total ? Math.round((done / total) * 100) : 0,
      hoje: hojeTasks.length ? Math.round((hojeDone / hojeTasks.length) * 100) : 0,
      hojeDone: hojeDone, hojeTotal: hojeTasks.length,
      pilares: pilarPct,
      saude: pilarPct.saude != null ? pilarPct.saude : 0,
      carreira: pilarPct.carreira != null ? pilarPct.carreira : 0,
    };
  }

  /* Probabilidade de bater as metas da semana */
  function weekProbability(ctx) {
    const hoje = ctx.todayIndex || 0;
    const ad = adherence(ctx);
    let restante = 0, capacidadeRestante = 0;
    for (let i = hoje; i < 7; i++) {
      const b = timeBudget(ctx, i);
      restante += b.demanda;
      capacidadeRestante += b.capacidadeUtil;
    }
    const folga = capacidadeRestante - restante;
    let prob = 45 + ad.geral * 0.4;
    if (folga < 0) prob -= Math.min(35, (-folga / 60) * 6);
    else prob += Math.min(15, (folga / 60) * 2);
    const capMedia = mediaCapacidade(ctx, hoje);
    prob += (capMedia - 70) * 0.25;
    return clamp(round(prob, 0), 5, 97);
  }

  function mediaCapacidade(ctx, de) {
    let s = 0, n = 0;
    for (let i = de || 0; i < 7; i++) { s += capacity(ctx, i).geral; n++; }
    return n ? s / n : 70;
  }

  /* ---------------------------------------------------------------------------
     8. ANALYTICS — tendência, correlação, heatmap, Pareto
     --------------------------------------------------------------------------- */
  function serie(ctx, metrica, dias) {
    const isos = Object.keys(ctx.health || {}).sort();
    const ult = isos.slice(-(dias || 30));
    return ult.map(function (iso) {
      const h = ctx.health[iso];
      return { iso: iso, v: h && h[metrica] != null ? Number(h[metrica]) : null };
    }).filter(function (x) { return x.v != null; });
  }

  function trend(pontos) {
    const n = pontos.length;
    if (n < 2) return { media: n ? round(pontos[0].v, 1) : null, slope: 0, direcao: 'estável', delta: 0, n: n };
    let sx = 0, sy = 0, sxy = 0, sxx = 0;
    pontos.forEach(function (p, i) { sx += i; sy += p.v; sxy += i * p.v; sxx += i * i; });
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1);
    const media = sy / n;
    const delta = slope * (n - 1);
    return {
      media: round(media, 1), slope: round(slope, 3), delta: round(delta, 1), n: n,
      direcao: Math.abs(delta) < 0.15 ? 'estável' : (delta > 0 ? 'subindo' : 'caindo'),
    };
  }

  function pearson(xs, ys) {
    const n = Math.min(xs.length, ys.length);
    if (n < 3) return null;
    let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) {
      sx += xs[i]; sy += ys[i]; sxy += xs[i] * ys[i];
      sxx += xs[i] * xs[i]; syy += ys[i] * ys[i];
    }
    const num = n * sxy - sx * sy;
    const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
    if (!den) return null;
    return round(num / den, 2);
  }

  function correlation(ctx, mx, my) {
    const isos = Object.keys(ctx.health || {}).sort();
    const xs = [], ys = [];
    isos.forEach(function (iso) {
      const h = ctx.health[iso];
      if (!h) return;
      let a = h[mx], b = h[my];
      if (my === 'aderencia') b = aderenciaDoDia(ctx, iso);
      if (mx === 'aderencia') a = aderenciaDoDia(ctx, iso);
      if (a == null || b == null) return;
      xs.push(Number(a)); ys.push(Number(b));
    });
    const r = pearson(xs, ys);
    return { r: r, n: xs.length, forca: forcaCorrelacao(r), texto: textoCorrelacao(r) };
  }

  function aderenciaDoDia(ctx, iso) {
    const idx = ctx.week.findIndex(function (w) { return w.iso === iso; });
    if (idx < 0) return null;
    const ts = tasksOfDay(ctx, idx);
    if (!ts.length) return null;
    return Math.round((ts.filter(function (t) { return t.done; }).length / ts.length) * 100);
  }

  function forcaCorrelacao(r) {
    if (r == null) return 'sem dados';
    const a = Math.abs(r);
    if (a >= 0.7) return 'forte';
    if (a >= 0.4) return 'moderada';
    if (a >= 0.2) return 'fraca';
    return 'desprezível';
  }
  function textoCorrelacao(r) {
    if (r == null) return 'Registre pelo menos 3 dias de check-in para calcular.';
    if (Math.abs(r) < 0.2) return 'Sem relação estatística relevante nos dados atuais.';
    return r > 0 ? 'Quando um sobe, o outro tende a subir.' : 'Quando um sobe, o outro tende a cair.';
  }

  const FAIXAS = [
    { label: 'Madrugada', de: 0,    ate: 359  },
    { label: 'Manhã',     de: 360,  ate: 719  },
    { label: 'Tarde',     de: 720,  ate: 1079 },
    { label: 'Noite',     de: 1080, ate: 1439 },
  ];

  function heatmap(ctx) {
    const linhas = FAIXAS.map(function (f) {
      const cels = [];
      for (let i = 0; i < 7; i++) {
        const ts = tasksOfDay(ctx, i).filter(function (t) {
          const m = toMin(t.time);
          return m != null && m >= f.de && m <= f.ate;
        });
        const done = ts.filter(function (t) { return t.done; }).length;
        cels.push({ dia: i, total: ts.length, done: done, pct: ts.length ? Math.round((done / ts.length) * 100) : null });
      }
      return { faixa: f.label, celulas: cels };
    });
    return linhas;
  }

  function heatmapPilar(ctx) {
    const cats = {};
    for (let i = 0; i < 7; i++) {
      tasksOfDay(ctx, i).forEach(function (t) {
        cats[t.cat] = cats[t.cat] || [];
        cats[t.cat][i] = cats[t.cat][i] || { total: 0, done: 0 };
        cats[t.cat][i].total++;
        if (t.done) cats[t.cat][i].done++;
      });
    }
    return Object.keys(cats).map(function (k) {
      const cels = [];
      for (let i = 0; i < 7; i++) {
        const c = cats[k][i];
        cels.push({ dia: i, pct: c && c.total ? Math.round((c.done / c.total) * 100) : null, total: c ? c.total : 0 });
      }
      return { pilar: k, celulas: cels };
    });
  }

  function pareto(ctx) {
    const cont = {};
    (ctx.failures || []).forEach(function (f) {
      cont[f.motivo] = (cont[f.motivo] || 0) + 1;
    });
    const total = Object.keys(cont).reduce(function (a, k) { return a + cont[k]; }, 0);
    if (!total) return { total: 0, itens: [], vital: [] };
    const itens = Object.keys(cont).map(function (k) {
      return { motivo: k, label: (MOTIVOS_FALHA[k] || { label: k }).label, cor: (MOTIVOS_FALHA[k] || {}).cor || 'slate', n: cont[k], pct: Math.round((cont[k] / total) * 100) };
    }).sort(function (a, b) { return b.n - a.n; });
    let acc = 0;
    itens.forEach(function (it) { acc += it.pct; it.acumulado = Math.min(100, acc); });
    const vital = itens.filter(function (it, i) { return i === 0 || it.acumulado - it.pct < 80; });
    return { total: total, itens: itens, vital: vital };
  }

  /* ---------------------------------------------------------------------------
     9. OBJETIVOS E OKRs — progresso automático
     --------------------------------------------------------------------------- */
  function okrProgress(ctx) {
    return (ctx.objectives || []).map(function (o) {
      const krs = (o.krs || []).map(function (k) {
        const ini = Number(k.inicio) || 0;
        const alvoV = Number(k.alvo);
        let atual = Number(k.atual) || 0;

        // KR automático: lê o próprio sistema em vez de depender de digitação
        if (k.fonte === 'tarefas' && k.filtro) {
          atual = 0;
          for (let i = 0; i < 7; i++) {
            atual += tasksOfDay(ctx, i).filter(function (t) { return t.cat === k.filtro && t.done; }).length;
          }
        } else if (k.fonte === 'peso') {
          atual = Number(ctx.profile.peso_kg) || ini;
        } else if (k.fonte === 'aportes') {
          atual = (ctx.aportes || []).filter(function (a) { return a.ok; })
            .reduce(function (s, a) { return s + Number(a.v || 0); }, 0);
        }

        const span = (alvoV - ini) || 1;
        const pct = clamp(Math.round(((atual - ini) / span) * 100), 0, 100);
        return Object.assign({}, k, { atual: atual, pct: pct });
      });

      const pct = krs.length ? Math.round(krs.reduce(function (a, k) { return a + k.pct; }, 0) / krs.length) : 0;
      const risco = pct < 40 ? 'alto' : pct < 70 ? 'médio' : 'baixo';
      return Object.assign({}, o, { krs: krs, pct: pct, risco: risco });
    });
  }

  /* ---------------------------------------------------------------------------
     10. RISCOS, ALERTAS E INSIGHTS
     --------------------------------------------------------------------------- */
  function insights(ctx) {
    const out = [];
    const hoje = ctx.todayIndex || 0;
    const ad = adherence(ctx);

    // Sobrecarga de agenda
    for (let i = hoje; i < 7; i++) {
      const b = timeBudget(ctx, i);
      if (!b.viavel) {
        out.push({
          sev: b.excedente > 90 ? 'alto' : 'medio', tipo: 'capacidade', dia: i,
          titulo: 'Agenda inviável em ' + ctx.week[i].full,
          texto: 'Demanda de ' + fmtDur(b.demanda) + ' contra ' + fmtDur(b.capacidadeUtil)
               + ' de capacidade útil. Excedente de ' + fmtDur(b.excedente) + '.',
          acao: 'Replanejar automaticamente',
        });
      }
    }

    // Sono comprometido
    for (let i = hoje; i < 7; i++) {
      const sp = sleepPlan(ctx, i);
      if (!sp.viavel) {
        out.push({
          sev: sp.deficitMin > 60 ? 'alto' : 'medio', tipo: 'sono', dia: i,
          titulo: 'Sono abaixo da meta em ' + ctx.week[i].full,
          texto: 'Retorno às ' + (sp.retorno || '—') + ' e saída às ' + sp.saida
               + ' deixam apenas ' + sp.sonoPossivelH + 'h de janela. Déficit de ' + fmtDur(sp.deficitMin) + '.',
          acao: 'Antecipar desligamento para ' + sp.desligamento,
        });
      }
    }

    // Capacidade crítica
    for (let i = hoje; i < 7; i++) {
      const c = capacity(ctx, i);
      if (c.geral < 45) {
        out.push({
          sev: 'alto', tipo: 'energia', dia: i,
          titulo: 'Capacidade crítica em ' + ctx.week[i].full + ' (' + c.geral + '%)',
          texto: 'Física ' + c.fisica + '%, cognitiva ' + c.cognitiva + '%, emocional ' + c.emocional + '%. '
               + (c.drivers[0] ? 'Principal fator: ' + c.drivers[0].label + '.' : ''),
          acao: 'Operar no modo mínimo viável',
        });
      }
    }

    // Aderência
    if (ad.geral < 80 && ad.esperado >= 3) {
      out.push({
        sev: ad.geral < 60 ? 'alto' : 'medio', tipo: 'aderencia',
        titulo: 'Aderência em ' + ad.geral + '%, abaixo da meta de 80%',
        texto: ad.done + ' de ' + ad.esperado + ' ações esperadas até aqui foram concluídas.',
        acao: 'Revisar causa raiz das falhas',
      });
    }

    // Pareto de causa raiz
    const p = pareto(ctx);
    if (p.total >= 3) {
      const top = p.itens[0];
      out.push({
        sev: 'medio', tipo: 'causa',
        titulo: 'Causa raiz dominante: ' + top.label,
        texto: top.n + ' de ' + p.total + ' falhas (' + top.pct + '%) têm a mesma origem. '
             + 'Atacar essa causa resolve a maior parte do problema.',
        acao: 'Definir contramedida para ' + top.label.toLowerCase(),
      });
    }

    // Peso fora de rota
    const w = weightProjection(ctx);
    if (w.atrasoSemanas != null && w.atrasoSemanas > 2) {
      out.push({
        sev: w.atrasoSemanas > 8 ? 'alto' : 'medio', tipo: 'peso',
        titulo: 'Meta de peso atrasada em ' + w.atrasoSemanas + ' semanas',
        texto: 'No ritmo atual (' + w.kgSemana + ' kg/semana, aderência de ' + w.aderenciaSaude
             + '% em saúde) a meta de ' + w.meta + ' kg chega depois do prazo.',
        acao: 'Elevar aderência aos treinos ou revisar o alvo',
      });
    }

    // Correlação relevante detectada nos dados
    const cs = correlation(ctx, 'sono_h', 'aderencia');
    if (cs.r != null && Math.abs(cs.r) >= 0.4) {
      out.push({
        sev: 'info', tipo: 'correlacao',
        titulo: 'Sono explica parte da sua aderência (r = ' + cs.r + ')',
        texto: 'Correlação ' + cs.forca + ' em ' + cs.n + ' dias registrados. ' + cs.texto,
        acao: 'Proteger a janela de sono como métrica primária',
      });
    }

    const ordem = { alto: 0, medio: 1, info: 2 };
    return out.sort(function (a, b) { return (ordem[a.sev] || 3) - (ordem[b.sev] || 3); });
  }

  /* ---------------------------------------------------------------------------
     11. BRIEFING MATINAL — a experiência-alvo do produto
     --------------------------------------------------------------------------- */
  function briefing(ctx) {
    const hoje = ctx.todayIndex || 0;
    const cap = capacity(ctx, hoje);
    const bud = timeBudget(ctx, hoje);
    const sp = sleepPlan(ctx, hoje);
    const nut = nutritionTargets(ctx, hoje);
    const ins = insights(ctx);
    const movs = replan(ctx);
    const prob = weekProbability(ctx);

    const abertas = tasksOfDay(ctx, hoje).filter(function (t) { return !t.done; });
    const prioridade = abertas.slice().sort(function (a, b) { return taskPriority(a) - taskPriority(b); })[0] || null;
    const treino = tasksOfDay(ctx, hoje).filter(function (t) { return t.cat === 'saude'; })[0] || null;
    const risco = ins.filter(function (x) { return x.sev === 'alto'; })[0] || ins[0] || null;
    const mov = movs[0] || null;

    return {
      capacidade: cap, orcamento: bud, sono: sp, nutricao: nut,
      prioridade: prioridade, treino: treino, risco: risco, movimento: mov,
      probabilidadeSemana: prob, insights: ins, movimentos: movs,
      linhas: montarLinhas(ctx, cap, sp, nut, prioridade, treino, risco, mov, prob),
    };
  }

  function montarLinhas(ctx, cap, sp, nut, prioridade, treino, risco, mov, prob) {
    const L = [];
    L.push({ icone: 'zap',    texto: 'Sua capacidade estimada hoje é <b>' + cap.geral + '%</b> (física ' + cap.fisica + '%, cognitiva ' + cap.cognitiva + '%, emocional ' + cap.emocional + '%).' });
    L.push({ icone: 'moon',   texto: (cap.medido ? 'Sono registrado: <b>' : 'Sono projetado: <b>') + cap.sonoH + 'h</b>. Meta de ' + sp.metaH + 'h — desligamento às <b>' + sp.desligamento + '</b>.' });
    if (prioridade) L.push({ icone: 'target', texto: 'Principal prioridade: <b>' + prioridade.title + '</b> às ' + prioridade.time + '.' });
    if (treino)     L.push({ icone: 'dumbbell', texto: 'Treino recomendado: <b>' + treino.title + '</b> às ' + treino.time + (treino.done ? ' — já concluído.' : '.') });
    L.push({ icone: 'flame',  texto: 'Alimentação: <b>' + nut.proteina_g + 'g de proteína</b>, ' + nut.carbo_g + 'g de carboidrato e ' + nut.alvo + ' kcal. Água: ' + (nut.agua_ml / 1000).toFixed(1).replace('.', ',') + ' L.' });
    if (risco)      L.push({ icone: 'shield', texto: 'Risco principal: <b>' + risco.titulo + '</b>. ' + risco.texto });
    if (mov)        L.push({ icone: 'refresh', texto: 'Recomenda-se mover <b>' + mov.tarefa.title + '</b> de ' + ctx.week[mov.de].short + ' para ' + ctx.week[mov.para].short + '.' });
    L.push({ icone: 'trending', texto: 'Probabilidade de atingir as metas da semana: <b>' + prob + '%</b>.' });
    return L;
  }

  /* ---------------------------------------------------------------------------
     API PÚBLICA
     --------------------------------------------------------------------------- */
  return {
    TIPOS_EVENTO: TIPOS_EVENTO,
    MOTIVOS_FALHA: MOTIVOS_FALHA,
    FATOR_ATIVIDADE: FATOR_ATIVIDADE,
    FAIXAS: FAIXAS,
    toMin: toMin, toHHMM: toHHMM, fmtDur: fmtDur, clamp: clamp, round: round,
    taskMinutes: taskMinutes, taskPriority: taskPriority,
    eventsOfDay: eventsOfDay, healthOfDay: healthOfDay,
    sleepPlan: sleepPlan, sleepDebt: sleepDebt,
    capacity: capacity, timeBudget: timeBudget, replan: replan,
    nutritionTargets: nutritionTargets, mealPlan: mealPlan,
    weightProjection: weightProjection,
    adherence: adherence, weekProbability: weekProbability,
    serie: serie, trend: trend, correlation: correlation, pearson: pearson,
    heatmap: heatmap, heatmapPilar: heatmapPilar, pareto: pareto,
    okrProgress: okrProgress,
    insights: insights, briefing: briefing,
  };
})();
