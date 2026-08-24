-- =============================================================================
-- VINICIUS OS — ESQUEMA SUPABASE
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- É idempotente: pode rodar novamente sem quebrar nada.
--
-- Modelo:
--   profiles        perfil operacional (base de capacidade, sono e nutrição)
--   tasks           ações do planner por dia da semana
--   task_failures   causa raiz de toda ação não realizada  -> Pareto
--   events          agenda futura (consulta, viagem, presencial...) -> capacidade
--   health_logs     check-in diário (peso, sono, energia, humor...) -> correlações
--   objectives      objetivos do ciclo
--   key_results     KRs com progresso automático
--   aportes         plano financeiro
--   app_state       preferências de UI
--   agent_logs      auditoria das respostas dos agentes
--   insights        saída persistida do Life Intelligence Engine
--
-- Segurança: RLS ligado em todas as tabelas. Cada usuário só enxerga
-- as próprias linhas (auth.uid() = user_id).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PERFIL
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  dados       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id)
);

-- ---------------------------------------------------------------------------
-- 2. TAREFAS
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  day_index     smallint not null check (day_index between 0 and 6),
  time          text not null,
  title         text not null,
  meta          text,
  cat           text not null,
  icon          text,
  done          boolean not null default false,
  duracao_min   integer,
  prioridade    smallint,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists tasks_user_day_idx on public.tasks (user_id, day_index);

-- Colunas novas em bases já existentes
alter table public.tasks add column if not exists duracao_min integer;
alter table public.tasks add column if not exists prioridade  smallint;

-- ---------------------------------------------------------------------------
-- 3. CAUSA RAIZ DAS FALHAS  (alimenta o Pareto)
-- ---------------------------------------------------------------------------
create table if not exists public.task_failures (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  task_id     uuid references public.tasks(id) on delete set null,
  data        date not null,
  motivo      text not null check (motivo in
                ('energia','tempo','saude','interrupcao','desmotivacao','prioridade')),
  nota        text,
  created_at  timestamptz not null default now()
);
create index if not exists task_failures_user_idx on public.task_failures (user_id, data);

-- ---------------------------------------------------------------------------
-- 4. EVENTOS  (agenda futura que altera capacidade, sono e viabilidade)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  data              date not null,
  tipo              text not null check (tipo in
                      ('consulta','presencial','viagem','casamento',
                       'treinamento','curso','ferias','compromisso')),
  titulo            text not null,
  inicio            text,
  fim               text,
  deslocamento_min  integer default 0,
  intensidade       smallint default 2 check (intensidade between 1 and 5),
  nota              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists events_user_data_idx on public.events (user_id, data);

-- ---------------------------------------------------------------------------
-- 5. CHECK-IN DE SAÚDE  (alimenta capacidade, correlações e projeção de peso)
-- ---------------------------------------------------------------------------
create table if not exists public.health_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  data        date not null,
  peso_kg     numeric(5,2),
  cintura_cm  numeric(5,1),
  pa_sis      smallint,
  pa_dia      smallint,
  agua_ml     integer,
  passos      integer,
  sono_h      numeric(4,2),
  energia     smallint check (energia  between 1 and 5),
  humor       smallint check (humor    between 1 and 5),
  estresse    smallint check (estresse between 1 and 5),
  foco        smallint check (foco     between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, data)
);
create index if not exists health_logs_user_data_idx on public.health_logs (user_id, data desc);

-- ---------------------------------------------------------------------------
-- 6. OBJETIVOS E KEY RESULTS
-- ---------------------------------------------------------------------------
create table if not exists public.objectives (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  titulo      text not null,
  pilar       text not null,
  horizonte   text,
  prazo       date,
  projetos    jsonb not null default '[]'::jsonb,
  status      text not null default 'ativo',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.key_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  objective_id  uuid not null references public.objectives(id) on delete cascade,
  titulo        text not null,
  unidade       text,
  inicio        numeric not null default 0,
  alvo          numeric not null default 1,
  atual         numeric not null default 0,
  -- 'manual' | 'tarefas' | 'peso' | 'aportes' : define se o KR é calculado
  fonte         text not null default 'manual',
  filtro        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists key_results_obj_idx on public.key_results (objective_id);

-- ---------------------------------------------------------------------------
-- 7. FINANCEIRO
-- ---------------------------------------------------------------------------
create table if not exists public.aportes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  mes         text not null,
  valor       numeric(10,2) not null default 0,
  confirmado  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. ESTADO DA APLICAÇÃO
-- ---------------------------------------------------------------------------
create table if not exists public.app_state (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  active_view  text,
  day_index    smallint,
  mode         text,
  flags        jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. AGENTES E INSIGHTS
-- ---------------------------------------------------------------------------
create table if not exists public.agent_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  agent       text not null,
  prompt      text,
  answer      text,
  created_at  timestamptz not null default now()
);
create index if not exists agent_logs_user_idx on public.agent_logs (user_id, created_at desc);

create table if not exists public.insights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  data        date not null default current_date,
  tipo        text not null,
  severidade  text not null default 'info',
  titulo      text not null,
  texto       text,
  acao        text,
  created_at  timestamptz not null default now()
);
create index if not exists insights_user_idx on public.insights (user_id, data desc);

-- =============================================================================
-- ROW LEVEL SECURITY
-- Cada usuário só acessa as próprias linhas.
-- =============================================================================
do $$
declare
  t text;
  tabelas text[] := array[
    'profiles','tasks','task_failures','events','health_logs',
    'objectives','key_results','aportes','app_state','agent_logs','insights'
  ];
begin
  foreach t in array tabelas loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "%s_select" on public.%I', t, t);
    execute format('drop policy if exists "%s_insert" on public.%I', t, t);
    execute format('drop policy if exists "%s_update" on public.%I', t, t);
    execute format('drop policy if exists "%s_delete" on public.%I', t, t);

    execute format(
      'create policy "%s_select" on public.%I for select using (auth.uid() = user_id)', t, t);
    execute format(
      'create policy "%s_insert" on public.%I for insert with check (auth.uid() = user_id)', t, t);
    execute format(
      'create policy "%s_update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t, t);
    execute format(
      'create policy "%s_delete" on public.%I for delete using (auth.uid() = user_id)', t, t);
  end loop;
end $$;

-- =============================================================================
-- updated_at automático
-- =============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare
  t text;
  tabelas text[] := array[
    'profiles','tasks','events','health_logs','objectives','key_results','app_state'
  ];
begin
  foreach t in array tabelas loop
    execute format('drop trigger if exists trg_touch_%s on public.%I', t, t);
    execute format(
      'create trigger trg_touch_%s before update on public.%I
       for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- =============================================================================
-- VIEWS DE APOIO (opcionais, úteis para dashboards externos / Power BI)
-- security_invoker = true é OBRIGATÓRIO: sem isso a view roda como o dono e
-- ignora o RLS das tabelas base, expondo dados de outros usuários.
-- =============================================================================

-- Aderência diária consolidada
create or replace view public.v_aderencia_diaria
with (security_invoker = true) as
select
  user_id,
  day_index,
  count(*)                                   as total,
  count(*) filter (where done)               as concluidas,
  round(100.0 * count(*) filter (where done) / nullif(count(*), 0), 1) as pct
from public.tasks
group by user_id, day_index;

-- Pareto de causa raiz
create or replace view public.v_pareto_falhas
with (security_invoker = true) as
select
  user_id,
  motivo,
  count(*) as ocorrencias,
  round(100.0 * count(*) / sum(count(*)) over (partition by user_id), 1) as pct
from public.task_failures
group by user_id, motivo
order by ocorrencias desc;

-- Série de saúde com dívida de sono (meta lida do perfil)
create or replace view public.v_saude_diaria
with (security_invoker = true) as
select
  h.user_id,
  h.data,
  h.sono_h,
  h.peso_kg,
  h.energia,
  h.humor,
  h.estresse,
  h.foco,
  h.passos,
  h.agua_ml,
  coalesce((p.dados->>'sono_meta_h')::numeric, 7.5) - coalesce(h.sono_h, 0) as divida_sono_h
from public.health_logs h
left join public.profiles p on p.user_id = h.user_id;
