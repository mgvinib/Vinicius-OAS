# Vinicius OS — Life Operating System

Sistema operacional pessoal com **Life Intelligence Engine**: capacity planning,
nutrição operacional, projeção de peso, OKRs automáticos, analytics (tendência,
correlação, heatmap, Pareto) e 9 agentes que leem os seus dados reais.

**Stack:** HTML + CSS + JavaScript puro + Supabase + PWA. Sem build, sem framework,
sem servidor próprio, custo zero.

---

## 📁 Onde ficam os arquivos

Todos na mesma pasta:

```
C:\Users\leomarques\OneDrive - Microsoft\Desktop\Vini
```

| Arquivo | O que é | Mexer? |
|---|---|---|
| `index.html` | Página principal | Raramente |
| `config.js` | **Suas chaves do Supabase** | ✅ Sim, na instalação |
| `engine.js` | Life Intelligence Engine (todos os cálculos) | Só para ajustar fórmulas |
| `app.js` | Telas, estado e persistência | Para mudar a interface |
| `style.css` | Visual | Para mudar o design |
| `sw.js` | Service worker (offline) | Não |
| `manifest.webmanifest` | Instalação como app | Não |
| `supabase_schema.sql` | **Script do banco** | Rodar 1x no Supabase |
| `Prompt.docx` | Sua especificação original | Não é usado pelo sistema |

> ⚠️ Os 7 primeiros arquivos precisam ficar **sempre juntos na mesma pasta**.
> Se separar, o sistema não abre.

---

## ✅ ANTES DE USAR — 4 passos obrigatórios

Sem isso o sistema abre mas não salva nada.

### Passo 1 — Criar o projeto no Supabase (grátis, ~3 min)

1. Acesse **https://supabase.com** e crie uma conta
2. Clique em **New project**
3. Dê um nome (ex.: `vinicius-os`), crie uma senha para o banco e escolha a região
   **South America (São Paulo)**
4. Aguarde ~2 minutos até o projeto ficar pronto

### Passo 2 — Criar as tabelas

1. No painel do Supabase, menu lateral → **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo `supabase_schema.sql` no Bloco de Notas, **copie tudo** e cole
4. Clique em **Run** (ou `Ctrl+Enter`)
5. Deve aparecer *Success. No rows returned* — está certo

Isso cria **11 tabelas** com segurança por usuário (RLS), gatilhos e views.
O script é seguro de rodar mais de uma vez.

### Passo 3 — Colar suas chaves no `config.js`

1. No Supabase: **Project Settings** (engrenagem) → **API**
2. Copie os dois valores:
   - **Project URL** → algo como `https://xxxxx.supabase.co`
   - **anon / public key** → chave longa
3. Abra `config.js` no Bloco de Notas e preencha:

```javascript
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "sua_chave_anon_aqui";
```

> 🚨 **Erros que quebram tudo:**
> - Esquecer as **aspas** → o app inteiro para de funcionar
> - Deixar `/rest/v1/` no fim da URL → tem que ser só `https://xxxxx.supabase.co`
>
> A chave `anon` é pública por design — ela é protegida pelo RLS do banco.
> Nunca use a chave `service_role` aqui.

### Passo 4 — Liberar o login por e-mail

Por padrão o Supabase exige confirmar o e-mail antes do primeiro login.

Para testar rápido: **Authentication** → **Providers** → **Email** →
desmarque **Confirm email** → **Save**.

Se preferir manter a confirmação, é só clicar no link que chega no seu e-mail
depois de criar a conta.

---

## ▶️ Como abrir o sistema

### Opção A — No seu computador (para testar)

⚠️ **Não funciona dando duplo clique no `index.html`.** O login do Supabase e o
modo offline exigem um servidor. Use este comando:

1. Abra o **PowerShell**
2. Cole e execute:

```powershell
cd "C:\Users\leomarques\OneDrive - Microsoft\Desktop\Vini"
python -m http.server 8080
```

3. Abra no navegador: **http://localhost:8080**
4. Para parar: `Ctrl+C` no PowerShell

> Não tem Python? Instale pela Microsoft Store (busque "Python") ou use
> `npx serve` se tiver Node.js.

### Opção B — Publicar no GitHub Pages (para usar no celular)

1. Crie um repositório em **https://github.com/new** (pode ser público)
2. Envie **todos os arquivos** da pasta (menos o `Prompt.docx`)
3. No repositório: **Settings** → **Pages**
4. Em *Source*, escolha **Deploy from a branch** → branch `main` → pasta `/ (root)`
5. Salve e aguarde ~1 minuto
6. Seu link fica: `https://SEU-USUARIO.github.io/NOME-DO-REPO`

**No celular:** abra esse link → menu do navegador → **Adicionar à tela inicial**.
Vira um app de verdade, com ícone e funcionando offline.

---

## 🔐 Primeiro acesso

1. Na tela de login clique em **"Não tem conta? Criar agora"**
2. Informe e-mail e senha (mínimo 6 caracteres)
3. Pronto — seus dados ficam no **seu** Supabase, acessíveis de qualquer aparelho

---

## ⚙️ Configure seu perfil (faça isso primeiro!)

O perfil é a **base de todos os cálculos**. Com dados errados, tudo fica errado.

Vá em **Nutrição** → botão **Editar perfil** e preencha:

| Campo | Para que serve |
|---|---|
| Peso, altura, idade, sexo | Calorias (Mifflin-St Jeor) e macros |
| Peso meta + data | Projeção de peso e probabilidade |
| Nível de atividade | Multiplicador do gasto calórico |
| **Meta de sono** | Insumo de maior peso na capacidade |
| **Deslocamento padrão** | Quanto tempo o trânsito consome do dia |
| Início/fim do expediente | Orçamento de tempo do dia |
| Tempo de preparo | Da hora de acordar até sair de casa |

---

## 🧭 As 10 telas

### 1. Briefing
Sua tela de abertura. Mostra capacidade estimada de hoje (física, cognitiva,
emocional), sono, prioridade, treino, alimentação, risco principal e a
probabilidade de bater a semana. Tem também o **capacity planning dos 7 dias** e
os **riscos detectados**.

### 2. Planner
As ações do dia. **Clique na ação** para concluir. Passando o mouse aparecem
dois botões:
- 🚩 **Bandeira** — "não consegui fazer" → registra o **motivo** (isso alimenta o Pareto)
- 🗑️ **Lixeira** — remove a ação

### 3. Agenda e Eventos ⭐
O grande diferencial. Cadastre compromissos futuros (consulta, viagem, trabalho
presencial, curso, férias…) e o sistema **recalcula sozinho**:
- Capacidade daquele dia
- Horário de dormir e acordar
- Se a agenda ainda é viável
- O que precisa ser remanejado

Tem o painel **"Por que a capacidade é X%"**, que mostra cada fator e quantos
pontos ele tirou ou somou.

### 4. Saúde
**Check-in diário**: peso, cintura, pressão, água, passos, sono, energia, humor,
estresse e foco. Quanto mais você registra, mais preciso o sistema fica.
Sem check-in, ele trabalha com estimativa.

### 5. Nutrição
Meta calórica, macros, água e **cardápio do dia** com gramaturas. O cardápio é
determinístico — o mesmo dia sempre gera o mesmo plano. Traz também a
**projeção de peso** com data estimada e probabilidade de sucesso.

### 6. Carreira
Blocos de estudo da semana e trilha do ciclo (SQL → Modelagem → Power Query →
Power BI → Projetos → Portfólio).

### 7. Finanças
Aportes, reserva acumulada e regras não negociáveis.

### 8. Objetivos e OKRs
Objetivos → Metas → Projetos → Tarefas. Os KRs marcados como
**"automático"** se atualizam sozinhos lendo a execução real — sem digitação.

### 9. Analytics
- **Heatmap**: dia × faixa horária e dia × pilar
- **Pareto de causa raiz**: onde 80% das falhas se concentram
- **Correlações**: sono × aderência, humor × performance… (Pearson real)
- **Tendências**: médias em 7 / 30 / 90 / 365 dias

### 10. Central de IA — 9 agentes
Todos leem seus dados reais, não são respostas prontas:

| Agente | Responde |
|---|---|
| Mentor | Qual é minha maior prioridade? |
| Auditor | Onde estou falhando? |
| Planejador | Como reorganizar minha semana? |
| Analista | Quais tendências existem? |
| Nutricionista | O que devo comer? |
| Personal Trainer | Qual treino é ideal hoje? |
| Especialista em Sono | Que horas devo dormir? |
| Conselheiro Financeiro | Estou dentro do plano? |
| Coach de Carreira | Como acelerar minha carreira? |

---

## 🔄 Rotina recomendada

**Manhã (2 min)** — Abra o Briefing, veja capacidade e prioridade do dia.

**Durante o dia** — Marque as ações concluídas no Planner. Não deu?
Use a 🚩 e diga o porquê.

**Noite (3 min)** — Faça o **check-in** em Saúde. É o que faz o sistema aprender.

**Domingo (15 min)** — Abra Analytics, veja o Pareto, cadastre os eventos da
semana seguinte em Agenda e converse com o Auditor.

---

## 🧮 Como o motor calcula (para você confiar nos números)

**Capacidade (0–100)** — Começa em 100 e desconta:
cada hora de sono abaixo da meta tira ~9 pontos da física, ~12 da cognitiva e
~7 da emocional; fadiga de treinos recentes; blocos cognitivos acima de 2;
deslocamento acima de 1h; intensidade dos eventos; estresse e humor do check-in;
dias seguidos sem pilar espiritual/relacional.
**Geral = 30% física + 45% cognitiva + 25% emocional.**

**Viabilidade da agenda** — Dos 1.440 minutos do dia subtrai sono, trabalho,
deslocamento, eventos e 135 min de rotina fixa. Sobre o tempo livre aplica uma
folga de 15% para imprevistos. Se a demanda passar disso, o dia é inviável.

**Sono** — Olha o primeiro compromisso de **amanhã**, subtrai o deslocamento e o
preparo para achar a hora de acordar; volta a meta de sono para achar a hora de
deitar; e o desligamento 45 min antes. Se você chega tarde hoje, ele detecta o
conflito e calcula o déficit.

**Nutrição** — Mifflin-St Jeor → TDEE (× fator de atividade) → déficit de 20%
(máx. 700 kcal, nunca abaixo de 1,1× a taxa basal). Proteína 2 g/kg do peso-alvo,
gordura 0,8 g/kg, carboidrato no restante. Água 35 ml/kg + reposição de treino.

**Peso** — Déficit × 7 ÷ 7.700 kcal = kg/semana, corrigido pela sua aderência
real aos treinos. A probabilidade cai se o ritmo passar de 1% do peso por semana.

**Replanejamento** — Nunca move âncoras (trabalho, sono, espiritual). Move o
excedente na ordem casa → carreira → saúde, para o dia com mais folga e melhor
capacidade.

Quer ajustar? Todas as constantes estão no topo do `engine.js`.

---

## 🆘 Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| "Configure o config.js..." | Chave sem aspas ou URL errada. Confira o Passo 3. |
| Login não funciona | Confirmação de e-mail ligada (Passo 4) ou URL com `/rest/v1/`. |
| Abre mas não salva | `supabase_schema.sql` não foi executado. Volte ao Passo 2. |
| Tela branca ao abrir o arquivo direto | Precisa de servidor. Use `python -m http.server 8080`. |
| Alterei o código e nada mudou | Cache do service worker. `Ctrl+Shift+R` ou aba anônima. |
| Capacidade parece errada | Perfil desatualizado. Ajuste em Nutrição → Editar perfil. |
| Probabilidade de peso muito baixa | Normal no início: sem treinos registrados a leitura é pessimista. Sobe conforme você marca as sessões. |
| Quero recomeçar do zero | Configurações → Restaurar plano padrão. |

**Ver o erro real:** aperte `F12` no navegador e abra a aba **Console**.

---

## 💾 Backup

- **Automático:** tudo fica no seu Supabase, acessível de qualquer aparelho
- **Manual:** Configurações → **Exportar dados JSON**
- **Offline:** o sistema também guarda no navegador, então funciona sem internet
  e sincroniza quando voltar

---

## 🔒 Privacidade

Seus dados ficam **no seu próprio projeto Supabase**. O RLS (Row Level Security)
garante que cada usuário só enxerga as próprias linhas — mesmo com a chave `anon`
sendo pública. Nada é enviado para terceiros.

---

## ⌨️ Atalhos

| Tecla | Ação |
|---|---|
| `Ctrl + K` | Buscar ação |
| `Esc` | Fechar janela |
| `F12` | Console (diagnóstico) |
| `Ctrl + Shift + R` | Recarregar ignorando cache |

---

## ⚕️ Aviso

A Nutrição faz **planejamento operacional**, não orientação clínica. Para
mudanças relevantes de dieta, treino ou saúde, procure um profissional
habilitado.
