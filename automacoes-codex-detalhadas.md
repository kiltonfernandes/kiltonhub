# Automacoes Codex - Documentacao Completa

Documento gerado em 2026-05-11 para registrar todas as automacoes locais encontradas em `C:\Users\kilto\.codex\automations`.

Foram encontradas **6 automacoes**, todas com status `ACTIVE`, todas do tipo `cron`, todas usando o workspace `C:\Users\kilto\Documents\New project`, modelo `gpt-5.2` e `reasoning_effort = "medium"`.

## Sumario Executivo

| # | Nome | ID | Frequencia | Horario | Status |
|---|---|---|---|---|---|
| 1 | Aula MAS - Discurso Semanal | `aula-mas-discurso-semanal` | Semanal, segunda-feira | 23:00 | `ACTIVE` |
| 2 | Diario Come Follow Me | `di-rio-come-follow-me` | Diario | 05:00 | `ACTIVE` |
| 3 | Family Home Evening - Come Follow Me | `family-home-evening-come-follow-me` | Semanal, terca-feira | 14:00 | `ACTIVE` |
| 4 | Read AI to Eisenhower Matrix | `read-ai-to-eisenhower-matrix` | Diario | 22:00 | `ACTIVE` |
| 5 | Seminario - Duas Aulas Semanais | `semin-rio-duas-aulas-semanais` | Semanal, segunda-feira | 21:00 | `ACTIVE` |
| 6 | Sunday School - Aula e Infografico | `sunday-school-aula-e-infogr-fico` | Semanal, quinta-feira | 19:00 | `ACTIVE` |

## Decisoes Globais Observadas

- Todas as automacoes sao `cron`, ou seja, rodam em agenda recorrente independente do thread atual.
- Todas rodam em ambiente `local`, dentro do workspace `C:\Users\kilto\Documents\New project`.
- Todas usam o modelo `gpt-5.2` com esforco de raciocinio `medium`.
- As automacoes de conteudo da Igreja usam portugues do Brasil (`pt-BR`) e priorizam fontes oficiais.
- As automacoes que publicam aulas e estudos exigem entrega valida no Notion, nao apenas arquivo local.
- Quase todas incluem regra anti-duplicacao: antes de criar, verificar se ja existe pagina equivalente e pular ou atualizar somente se estiver incompleta.
- Todas as automacoes relevantes usam a timezone `America/Sao_Paulo`.
- Todas as automacoes de conteudo religioso proibem imagens.

## 1. Aula MAS - Discurso Semanal

### Identidade

- Nome: `Aula MAS - Discurso Semanal`
- ID: `aula-mas-discurso-semanal`
- Tipo: `cron`
- Status: `ACTIVE`
- Modelo: `gpt-5.2`
- Reasoning effort: `medium`
- Ambiente: `local`
- Workspace: `C:\Users\kilto\Documents\New project`
- Arquivo de configuracao: `C:\Users\kilto\.codex\automations\aula-mas-discurso-semanal\automation.toml`
- Criada em: 2026-05-03 18:29:27 America/Sao_Paulo
- Atualizada em: 2026-05-06 07:12:13 America/Sao_Paulo

### Agenda

- RRULE: `FREQ=WEEKLY;BYDAY=MO;BYHOUR=23;BYMINUTE=0;BYSECOND=0`
- Frequencia: semanal
- Dia: segunda-feira
- Horario: 23:00
- Timezone operacional indicada no prompt: `America/Sao_Paulo`

### Objetivo

Criar uma aula semanal em portugues do Brasil para jovens solteiros de 18 a 30 anos, usando uma fonte oficial da Igreja.

### Destino

- Plataforma: Notion
- Raiz: `Professora do MAS`
- URL raiz: `https://www.notion.so/31a195bb0be880eaa37ffa97bd1d188d`
- Estrutura obrigatoria: `Ano -> Quarter -> Mes`
- Pagina final: filha do mes correspondente a data da execucao.

### Regras de Entrega

- Nunca parar pedindo link ou titulo.
- Nunca deixar apenas arquivo local.
- A entrega valida e uma pagina criada ou atualizada no Notion.
- Ao terminar, registrar no resumo a URL da pagina Notion criada ou atualizada e a fonte usada.

### Fontes e Decisao de Fonte

1. Prioridade principal: discurso oficial recente de `churchofjesuschrist.org/Liahona`, desde que seja claramente adequado para jovens solteiros.
2. Fallback obrigatorio: se nenhum discurso especifico estiver definido, usar a licao atual do Come Follow Me em `churchofjesuschrist.org`, preferencialmente em pt-BR quando disponivel.

Nuance importante: essa automacao tem uma decisao editorial embutida. Ela nao usa automaticamente qualquer discurso recente; precisa avaliar se o discurso e adequado ao publico de jovens solteiros. Se nao houver uma escolha clara, deve cair para Come Follow Me.

### Regras de Execucao

- Usar `America/Sao_Paulo`.
- Antes de criar, verificar se ja existe uma pagina MAS da mesma semana/fonte no mes de destino.
- Se existir pagina equivalente, pular ou atualizar somente se estiver incompleta.

### Conteudo Esperado

- Ler a fonte inteira.
- Dividir o conteudo em tres partes coerentes.
- Trazer FAQ.
- Incluir perguntas abertas com opcoes de resposta.
- Incluir contextos e aplicacoes para a vida real.
- Usar formato Notion legivel com H1/H2/H3/H4.
- Usar paragrafos curtos.
- Usar callouts simulados.
- Usar no maximo 3 quote blocks.
- Nao usar imagens.

### Prompt Integral

```text
Você vai criar uma aula semanal em pt-BR para jovens solteiros de 18 a 30 anos usando fonte oficial da Igreja.

Destino obrigatório no Notion:
- Raiz: Professora do MAS — https://www.notion.so/31a195bb0be880eaa37ffa97bd1d188d
- Use a árvore Ano -> Quarter -> Mês. Crie nós faltantes se necessário.
- Publique a página como filha do mês correspondente à data da execução.
- Nunca pare pedindo link/título e nunca deixe apenas arquivo local. A entrega válida é página criada/atualizada no Notion.

Fonte:
- Prioridade 1: se houver um discurso oficial recente do churchofjesuschrist.org/Liahona claramente adequado para jovens solteiros, use-o e registre a URL.
- Fallback obrigatório: se nenhum discurso específico estiver definido, use a lição atual do Come Follow Me em churchofjesuschrist.org, idioma pt-BR quando disponível.

Regra de execução:
- Use America/Sao_Paulo.
- Antes de criar, verifique se já existe página MAS da mesma semana/fonte no mês de destino. Se existir, pule ou atualize somente se incompleta.

Conteúdo:
- Leia a fonte inteira, divida o conteúdo em três partes coerentes, traga FAQ, perguntas abertas com opções de resposta, contextos e aplicações para a vida real.
- Use formato Notion legível com H1/H2/H3/H4, parágrafos curtos, callouts simulados e no máximo 3 quote blocks.
- Não use imagens.

Ao terminar, registre no resumo a URL da página Notion criada/atualizada e a fonte usada.
```

## 2. Diario Come Follow Me

### Identidade

- Nome: `Diario Come Follow Me`
- ID: `di-rio-come-follow-me`
- Tipo: `cron`
- Status: `ACTIVE`
- Modelo: `gpt-5.2`
- Reasoning effort: `medium`
- Ambiente: `local`
- Workspace: `C:\Users\kilto\Documents\New project`
- Arquivo de configuracao: `C:\Users\kilto\.codex\automations\di-rio-come-follow-me\automation.toml`
- Criada em: 2026-05-03 20:12:13 America/Sao_Paulo
- Atualizada em: 2026-05-06 07:11:47 America/Sao_Paulo

### Agenda

- RRULE: `FREQ=DAILY;BYHOUR=5;BYMINUTE=0;BYSECOND=0`
- Frequencia: diaria
- Horario: 05:00
- Timezone operacional indicada no prompt: `America/Sao_Paulo`

### Objetivo

Criar paginas diarias em portugues do Brasil a partir da licao semanal atual do Come Follow Me.

### Destino

- Plataforma: Notion
- Raiz: `Come Follow Me`
- URL raiz: `https://www.notion.so/f2734aa2347a42bc9b5b19f32e03144c`
- Estrutura obrigatoria: `Ano -> Quarter -> Mes -> Semana`
- Pagina final: cada pagina diaria deve ser filha da pagina da semana correspondente.

### Regras de Entrega

- Nunca deixar apenas arquivo local.
- A entrega valida e pagina criada ou atualizada no Notion.
- Ao terminar, registrar quais paginas do Notion foram criadas ou puladas por ja existirem.

### Fonte

- Licao semanal atual do Come Follow Me em `churchofjesuschrist.org`.
- Usar idioma pt-BR quando disponivel.

### Regras de Execucao e Backfill

- Usar data local em `America/Sao_Paulo`.
- Em cada execucao, verificar as paginas ja existentes na semana atual.
- Criar todas as paginas diarias faltantes desde a segunda-feira da semana ate hoje, inclusive.
- Exemplo do proprio prompt: se rodar em 06/05 e so existir 04/05, criar 05/05 e 06/05.
- Nao duplicar paginas se ja existir uma pagina com a mesma data ou titulo equivalente.

Nuance importante: essa automacao nao e apenas "criar a pagina de hoje". Ela e uma automacao com backfill. Se dias anteriores da semana estiverem faltando, ela deve preencher a lacuna ate a data da execucao.

### Conteudo Esperado

- Escolher um foco novo para cada data faltante.
- Evitar repetir focos ja criados naquela semana.
- Produzir 500 a 1000 palavras por pagina.
- Usar H1/H2/H3.
- Usar paragrafos curtos.
- Usar tabelas ou Mermaid quando fizer sentido.
- Usar callouts simulados.
- Usar no maximo 3 quote blocks.
- Incluir no topo a fonte semanal e a data do estudo.
- Nao usar imagens.

### Prompt Integral

```text
Você vai criar páginas diárias em pt-BR a partir da lição semanal atual do Come Follow Me.

Destino obrigatório no Notion:
- Raiz: Come Follow Me — https://www.notion.so/f2734aa2347a42bc9b5b19f32e03144c
- Use a árvore Ano -> Quarter -> Mês -> Semana. Crie nós faltantes se necessário.
- Para a semana atual, publique cada página diária como filha da página da semana correspondente.
- Nunca deixe apenas arquivo local. A entrega válida é página criada/atualizada no Notion.

Regra de execução/backfill:
- Use a data local America/Sao_Paulo.
- Em cada execução, verifique as páginas já existentes na semana atual.
- Crie todas as páginas diárias faltantes desde a segunda-feira da semana até hoje, inclusive. Ex.: se rodar em 06/05 e só existir 04/05, crie 05/05 e 06/05.
- Não duplique páginas se já existir uma página com a mesma data ou título equivalente.

Conteúdo:
- Fonte: lição semanal atual do Come Follow Me em churchofjesuschrist.org, idioma pt-BR quando disponível.
- Escolha um foco novo para cada data faltante, evitando repetir os focos já criados naquela semana.
- Produza 500 a 1000 palavras por página com H1/H2/H3, parágrafos curtos, tabelas ou Mermaid quando fizer sentido, callouts simulados e no máximo 3 quote blocks.
- Inclua no topo a fonte semanal e a data do estudo.
- Não use imagens.

Ao terminar, registre no resumo quais páginas do Notion foram criadas ou puladas por já existirem.
```

## 3. Family Home Evening - Come Follow Me

### Identidade

- Nome: `Family Home Evening - Come Follow Me`
- ID: `family-home-evening-come-follow-me`
- Tipo: `cron`
- Status: `ACTIVE`
- Modelo: `gpt-5.2`
- Reasoning effort: `medium`
- Ambiente: `local`
- Workspace: `C:\Users\kilto\Documents\New project`
- Arquivo de configuracao: `C:\Users\kilto\.codex\automations\family-home-evening-come-follow-me\automation.toml`
- Criada em: 2026-05-03 18:03:53 America/Sao_Paulo
- Atualizada em: 2026-05-06 07:11:59 America/Sao_Paulo

### Agenda

- RRULE: `FREQ=WEEKLY;BYDAY=TU;BYHOUR=14;BYMINUTE=0;BYSECOND=0`
- Frequencia: semanal
- Dia: terca-feira
- Horario: 14:00
- Timezone operacional indicada no prompt: `America/Sao_Paulo`

### Objetivo

Criar uma pagina de reuniao familiar em portugues do Brasil para Amanda, Kilton, Aurora e Augusto, a partir da licao da semana seguinte do Come Follow Me.

### Destino

- Plataforma: Notion
- Raiz: `Family home evening`
- URL raiz: `https://www.notion.so/fe3751fcbdd64ab5a63a204937b7de38`
- Estrutura obrigatoria: `Ano -> Quarter -> Mes`
- Pagina final: filha do mes correspondente a semana preparada.

### Regras de Entrega

- Nunca deixar apenas arquivo local.
- A entrega valida e pagina criada ou atualizada no Notion.
- Ao terminar, registrar no resumo a URL da pagina Notion criada ou atualizada.

### Fonte e Decisao de Semana

- Fonte: licao Come Follow Me da semana seguinte em `churchofjesuschrist.org`.
- Usar idioma pt-BR quando disponivel.
- A automacao roda semanalmente e prepara a semana seguinte, nao a semana atual.

Nuance importante: essa automacao e prospectiva. Mesmo rodando na terca-feira, ela prepara a proxima semana de estudo familiar.

### Regras de Execucao

- Usar `America/Sao_Paulo`.
- Verificar se ja existe uma pagina para a mesma semana no mes de destino.
- Se existir e estiver incompleta, atualizar.
- Se existir e estiver completa, pular para evitar duplicacao.

### Conteudo Esperado

- Escolher o tema mais relevante para a familia.
- Citar escrituras em blockquotes curtos.
- Trazer resumo simples para Aurora.
- Incluir perguntas abertas com respostas possiveis.
- Incluir uma atividade com pouca ou nenhuma preparacao.
- Usar formato Notion legivel com H1/H2/H3/H4.
- Usar paragrafos curtos.
- Usar callouts simulados.
- Usar no maximo 3 quote blocks.
- Nao usar imagens.

### Prompt Integral

```text
Você vai criar uma página de reunião familiar em pt-BR para Amanda, Kilton, Aurora e Augusto a partir da lição da semana seguinte do Come Follow Me.

Destino obrigatório no Notion:
- Raiz: Family home evening — https://www.notion.so/fe3751fcbdd64ab5a63a204937b7de38
- Use a árvore Ano -> Quarter -> Mês. Crie nós faltantes se necessário.
- Publique a página como filha do mês correspondente à semana preparada.
- Nunca deixe apenas arquivo local. A entrega válida é página criada/atualizada no Notion.

Regra de execução:
- Use America/Sao_Paulo.
- Rode semanalmente e prepare a semana seguinte.
- Antes de criar, verifique se já existe uma página para a mesma semana no mês de destino. Se existir, atualize somente se estiver incompleta; caso contrário, pule para evitar duplicação.

Conteúdo:
- Fonte: lição Come Follow Me da semana seguinte em churchofjesuschrist.org, idioma pt-BR quando disponível.
- Escolha o tema mais relevante para a família.
- Cite as escrituras em blockquotes curtos, traga resumo simples para Aurora, perguntas abertas com respostas possíveis e uma atividade com pouca ou nenhuma preparação.
- Use formato Notion legível com H1/H2/H3/H4, parágrafos curtos, callouts simulados e no máximo 3 quote blocks.
- Não use imagens.

Ao terminar, registre no resumo a URL da página Notion criada/atualizada.
```

## 4. Read AI to Eisenhower Matrix

### Identidade

- Nome: `Read AI to Eisenhower Matrix`
- ID: `read-ai-to-eisenhower-matrix`
- Tipo: `cron`
- Status: `ACTIVE`
- Modelo: `gpt-5.2`
- Reasoning effort: `medium`
- Ambiente: `local`
- Workspace: `C:\Users\kilto\Documents\New project`
- Arquivo de configuracao: `C:\Users\kilto\.codex\automations\read-ai-to-eisenhower-matrix\automation.toml`
- Criada em: 2026-05-04 07:38:11 America/Sao_Paulo
- Atualizada em: 2026-05-06 07:11:35 America/Sao_Paulo

### Agenda

- RRULE: `FREQ=DAILY;BYHOUR=22;BYMINUTE=0;BYSECOND=0`
- Frequencia: diaria
- Horario: 22:00
- Timezone operacional indicada no prompt: `America/Sao_Paulo`

### Objetivo

Processar meeting notes do Read AI das ultimas 24 horas e converter action items acionaveis em tarefas na database `✅ Eisenhower Matrix`.

### Escopo Exclusivo

- O prompt declara que esta e a unica automacao ativa de Read AI -> Eisenhower Matrix.
- Deve processar somente meeting notes das ultimas 24 horas.
- Deve converter apenas action items realmente acionaveis.

### Fontes Obrigatorias

- Database origem: `Read AI Meeting Notes`
- Database destino: `✅ Eisenhower Matrix`
- Janela de elegibilidade: ultimas 24 horas em `America/Sao_Paulo`
- Conteudo a ler: pagina inteira de cada note elegivel, incluindo transcricao completa, secao `✅ Action Items`, metadados, report link e contexto relevante.

### Deduplicacao

- Nao reprocessar meeting notes que ja tenham qualquer tarefa na Eisenhower Matrix relacionada ao mesmo `Source (Read AI)`.
- Para cada action item, tentar deduplicar por titulo muito parecido mais mesma origem.
- Se houver duvida, criar nova linha em vez de sobrescrever a linha errada.
- Se a mesma tarefa aparecer novamente em outra meeting note, preferir atualizar a linha existente e anexar contexto em `Notes`.

Nuance importante: a regra de duvida favorece preservacao de dados. Quando nao houver certeza, a automacao deve criar nova tarefa em vez de arriscar sobrescrever algo incorreto.

### Campos da Tarefa

Para cada acao identificada, criar ou atualizar uma linha na Eisenhower Matrix com:

- `Task`: titulo curto e acionavel em pt-BR, comecando por verbo.
- `Deadline`: data/hora explicita quando existir; se nao existir, inferir com base no contexto e registrar a inferencia em `Notes`.
- `Importance`: `Important` ou `Not important`.
- `Urgency`: `Urgent` ou `Not urgent`.
- `Quadrant`: derivado de `Importance` + `Urgency`.
- `Notes`: contexto breve, pessoas envolvidas, suposicoes, dependencias e justificativa da classificacao.
- `Source (Read AI)`: relacionamento para a nota de reuniao de origem.
- `Status`: `To do`.

### Fallback de Deadline

Quando nao houver prazo explicito:

| Quadrante | Condicao | Deadline fallback |
|---|---|---|
| Do | Important + Urgent | Hoje + 1 dia |
| Schedule | Important + Not urgent | Hoje + 7 dias |
| Delegate | Not important + Urgent | Hoje + 3 dias |
| Eliminate | Not important + Not urgent | Vazio |

### Corpo da Pagina da Tarefa

Cada tarefa deve incluir no corpo da pagina:

- Um paragrafo inicial de contexto em pt-BR.
- Citacoes curtas do transcript original que sustentem a tarefa.
- Link do Read AI report.
- Mencao da pagina de origem do meeting note.

### Restricoes

- Capturar somente tarefas realmente acionaveis.
- Nao inventar compromissos alem do que estiver presente na reuniao ou claramente inferivel do transcript.
- Nao usar imagens.
- Manter saida concisa, com foco em execucao e rastreabilidade.

### Prompt Integral

```text
Você é a única automação ativa de Read AI -> Eisenhower Matrix. Todo dia, processe somente meeting notes do Read AI das últimas 24 horas e converta action items acionáveis em tarefas na database "✅ Eisenhower Matrix".

Fontes obrigatórias:
- Database origem: "Read AI Meeting Notes".
- Database destino: "✅ Eisenhower Matrix".
- Use apenas notes elegíveis dentro da janela das últimas 24 horas em America/Sao_Paulo.
- Leia a página inteira de cada note elegível, incluindo transcrição completa, seção "✅ Action Items", metadados, report link e contexto relevante.

Deduplicação obrigatória:
- Não reprocesse meeting notes que já tenham qualquer tarefa na Eisenhower Matrix relacionada ao mesmo "Source (Read AI)".
- Para cada action item, tente deduplicar por título muito parecido + mesma origem.
- Se houver dúvida, crie uma nova linha em vez de sobrescrever a errada.
- Se a mesma tarefa aparecer novamente em outra meeting note, prefira atualizar a linha existente e anexar contexto em Notes.

Para cada ação identificada, crie ou atualize uma linha na Eisenhower Matrix com:
- Task: título curto e acionável em pt-BR, começando por verbo.
- Deadline: use data/hora explícita quando existir; se não existir, infira com base no contexto e registre a inferência em Notes.
- Importance: Important / Not important.
- Urgency: Urgent / Not urgent.
- Quadrant: derivado de Importance + Urgency.
- Notes: contexto breve, pessoas envolvidas, suposições, dependências e justificativa da classificação.
- Source (Read AI): relacionamento para a nota de reunião de origem.
- Status: To do.

Deadline fallback quando não houver prazo explícito:
- Do (Important + Urgent) -> hoje + 1 dia.
- Schedule (Important + Not urgent) -> hoje + 7 dias.
- Delegate (Not important + Urgent) -> hoje + 3 dias.
- Eliminate (Not important + Not urgent) -> vazio.

No corpo da página da tarefa, inclua:
- 1 parágrafo inicial de contexto em pt-BR.
- Citações curtas do transcript original que sustentem a tarefa.
- Link do Read AI report.
- Menção da página de origem do meeting note.

Restrições:
- Capture somente tarefas realmente acionáveis.
- Não invente compromissos além do que estiver presente na reunião ou claramente inferível do transcript.
- Não use imagens.
- Mantenha a saída concisa, com foco em execução e rastreabilidade.
```

## 5. Seminario - Duas Aulas Semanais

### Identidade

- Nome: `Seminario - Duas Aulas Semanais`
- ID: `semin-rio-duas-aulas-semanais`
- Tipo: `cron`
- Status: `ACTIVE`
- Modelo: `gpt-5.2`
- Reasoning effort: `medium`
- Ambiente: `local`
- Workspace: `C:\Users\kilto\Documents\New project`
- Arquivo de configuracao: `C:\Users\kilto\.codex\automations\semin-rio-duas-aulas-semanais\automation.toml`
- Criada em: 2026-05-03 20:05:55 America/Sao_Paulo
- Atualizada em: 2026-05-06 07:12:26 America/Sao_Paulo

### Agenda

- RRULE: `FREQ=WEEKLY;BYDAY=MO;BYHOUR=21;BYMINUTE=0;BYSECOND=0`
- Frequencia: semanal
- Dia: segunda-feira
- Horario: 21:00
- Timezone operacional indicada no prompt: `America/Sao_Paulo`

### Objetivo

Criar duas aulas semanais em portugues do Brasil para adolescentes de 14 a 18 anos, a partir do conteudo semanal oficial do Come Follow Me.

### Destino

- Plataforma: Notion
- Raiz: `Professora Seminario`
- URL raiz: `https://www.notion.so/31a195bb0be88051867fece209c28997`
- Estrutura obrigatoria: `Ano -> Quarter -> Mes -> Semana`
- Paginas finais: duas paginas filhas da pagina da semana correspondente.

### Regras de Entrega

- Nunca parar pedindo link.
- Nunca deixar apenas arquivo local.
- A entrega valida e pagina criada ou atualizada no Notion.
- Ao terminar, registrar no resumo as URLs das paginas Notion criadas ou atualizadas.

### Fonte

- Licao atual do Come Follow Me em `churchofjesuschrist.org`.
- Usar idioma pt-BR quando disponivel.

### Regras de Execucao

- Usar `America/Sao_Paulo`.
- Toda segunda as 21:00, preparar duas paginas para a semana atual:
  - uma para quarta-feira;
  - outra para sexta-feira.
- Antes de criar, verificar se ja existem paginas equivalentes para quarta/sexta naquela semana.
- Se existirem, pular ou atualizar somente se incompletas.

Nuance importante: a automacao cria duas aulas com papeis pedagogicos diferentes, nao duas versoes repetidas da mesma aula.

### Estrutura Pedagogica

- Aula de quarta-feira: estabelece contexto, principios-base e primeira metade da licao.
- Aula de sexta-feira: aprofunda a doutrina, aplicacao pratica e fechamento da semana.

### Conteudo Esperado

Cada pagina deve conter:

- H1/H2/H3/H4.
- Paragrafos curtos.
- Callouts simulados.
- Perguntas de discussao.
- Uma atividade simples.
- No maximo 3 quote blocks por pagina.
- Nenhuma imagem.

### Prompt Integral

```text
Você vai criar duas aulas semanais em pt-BR para adolescentes de 14 a 18 anos a partir do conteúdo semanal oficial do Come Follow Me.

Destino obrigatório no Notion:
- Raiz: Professora Seminario — https://www.notion.so/31a195bb0be88051867fece209c28997
- Use a árvore Ano -> Quarter -> Mês -> Semana. Crie nós faltantes se necessário.
- Publique as duas páginas como filhas da página da semana correspondente.
- Nunca pare pedindo link e nunca deixe apenas arquivo local. A entrega válida é página criada/atualizada no Notion.

Regra de execução:
- Use America/Sao_Paulo.
- Toda segunda às 21:00, prepare duas páginas para a semana atual: uma para quarta-feira e outra para sexta-feira.
- Antes de criar, verifique se já existem páginas equivalentes para quarta/sexta naquela semana. Se existirem, pule ou atualize somente se incompletas.

Conteúdo:
- Fonte: lição atual do Come Follow Me em churchofjesuschrist.org, idioma pt-BR quando disponível.
- A aula de quarta estabelece contexto, princípios-base e primeira metade da lição.
- A aula de sexta aprofunda a doutrina, aplicação prática e fechamento da semana.
- Cada página deve usar H1/H2/H3/H4, parágrafos curtos, callouts simulados, perguntas de discussão, uma atividade simples e no máximo 3 quote blocks por página.
- Não use imagens.

Ao terminar, registre no resumo as URLs das páginas Notion criadas/atualizadas.
```

## 6. Sunday School - Aula e Infografico

### Identidade

- Nome: `Sunday School - Aula e Infografico`
- ID: `sunday-school-aula-e-infogr-fico`
- Tipo: `cron`
- Status: `ACTIVE`
- Modelo: `gpt-5.2`
- Reasoning effort: `medium`
- Ambiente: `local`
- Workspace: `C:\Users\kilto\Documents\New project`
- Arquivo de configuracao: `C:\Users\kilto\.codex\automations\sunday-school-aula-e-infogr-fico\automation.toml`
- Criada em: 2026-05-03 18:44:43 America/Sao_Paulo
- Atualizada em: 2026-05-06 07:12:40 America/Sao_Paulo

### Agenda

- RRULE: `FREQ=WEEKLY;BYDAY=TH;BYHOUR=19;BYMINUTE=0;BYSECOND=0`
- Frequencia: semanal
- Dia: quinta-feira
- Horario: 19:00
- Timezone operacional indicada no prompt: `America/Sao_Paulo`

### Objetivo

Criar uma aula em portugues do Brasil para jovens solteiros de 18 a 30 anos usando fonte oficial da Igreja.

### Destino

- Plataforma: Notion
- Raiz: `Sunday School Teacher`
- URL raiz: `https://www.notion.so/355195bb0be88017af23c31334ab856a`
- Estrutura obrigatoria: `Ano -> Quarter -> Mes`
- Pagina final: filha do mes correspondente a data da execucao.

### Regras de Entrega

- Nunca parar pedindo link ou titulo.
- Nunca deixar apenas arquivo local.
- A entrega valida e pagina criada ou atualizada no Notion.
- Ao terminar, registrar no resumo a URL da pagina Notion criada ou atualizada e a fonte usada.

### Fontes e Decisao de Fonte

1. Prioridade principal: licao atual do Come Follow Me em `churchofjesuschrist.org`, em pt-BR quando disponivel.
2. Se usar discurso oficial em vez da licao semanal, registrar claramente a URL da fonte.

Nuance importante: apesar do nome mencionar "Infografico", o prompt atual proibe imagens e pede apenas pagina Notion textual. Qualquer infografico, se existir no futuro, precisaria ser textual, tabular ou estruturado sem imagem, a menos que o prompt seja alterado.

### Regras de Execucao

- Usar `America/Sao_Paulo`.
- Antes de criar, verificar se ja existe pagina Sunday School da mesma semana/fonte no mes de destino.
- Se existir, pular ou atualizar somente se incompleta.

### Conteudo Esperado

- Ler a fonte inteira.
- Dividir o conteudo em tres partes coerentes.
- Trazer FAQ.
- Incluir perguntas abertas com opcoes de resposta.
- Incluir contextos e aplicacoes para a vida real.
- Usar formato Notion legivel com H1/H2/H3/H4.
- Usar paragrafos curtos.
- Usar callouts simulados.
- Usar no maximo 3 quote blocks.
- Nao usar imagens.

### Prompt Integral

```text
Você vai criar uma aula em pt-BR para jovens solteiros de 18 a 30 anos usando fonte oficial da Igreja.

Destino obrigatório no Notion:
- Raiz: Sunday School Teacher — https://www.notion.so/355195bb0be88017af23c31334ab856a
- Use a árvore Ano -> Quarter -> Mês. Crie nós faltantes se necessário.
- Publique a página como filha do mês correspondente à data da execução.
- Nunca pare pedindo link/título e nunca deixe apenas arquivo local. A entrega válida é página criada/atualizada no Notion.

Fonte:
- Prioridade 1: lição atual do Come Follow Me em churchofjesuschrist.org, idioma pt-BR quando disponível.
- Se usar discurso oficial em vez da lição semanal, registre claramente a URL da fonte.

Regra de execução:
- Use America/Sao_Paulo.
- Antes de criar, verifique se já existe página Sunday School da mesma semana/fonte no mês de destino. Se existir, pule ou atualize somente se incompleta.

Conteúdo:
- Leia a fonte inteira, divida o conteúdo em três partes coerentes, traga FAQ, perguntas abertas com opções de resposta, contextos e aplicações para a vida real.
- Use formato Notion legível com H1/H2/H3/H4, parágrafos curtos, callouts simulados e no máximo 3 quote blocks.
- Não use imagens.

Ao terminar, registre no resumo a URL da página Notion criada/atualizada e a fonte usada.
```

## Mapa de Horarios

| Dia | Horario | Automacao |
|---|---:|---|
| Segunda | 21:00 | Seminario - Duas Aulas Semanais |
| Segunda | 23:00 | Aula MAS - Discurso Semanal |
| Terca | 14:00 | Family Home Evening - Come Follow Me |
| Quinta | 19:00 | Sunday School - Aula e Infografico |
| Diario | 05:00 | Diario Come Follow Me |
| Diario | 22:00 | Read AI to Eisenhower Matrix |

## Comparativo de Destinos

| Automacao | Destino | Estrutura |
|---|---|---|
| Aula MAS - Discurso Semanal | Professora do MAS | `Ano -> Quarter -> Mes` |
| Diario Come Follow Me | Come Follow Me | `Ano -> Quarter -> Mes -> Semana` |
| Family Home Evening - Come Follow Me | Family home evening | `Ano -> Quarter -> Mes` |
| Read AI to Eisenhower Matrix | Database `✅ Eisenhower Matrix` | Linhas de tarefas relacionadas a `Read AI Meeting Notes` |
| Seminario - Duas Aulas Semanais | Professora Seminario | `Ano -> Quarter -> Mes -> Semana` |
| Sunday School - Aula e Infografico | Sunday School Teacher | `Ano -> Quarter -> Mes` |

## Pontos de Atencao

- Ha 6 automacoes ativas, nao 5.
- Os IDs `di-rio-come-follow-me`, `semin-rio-duas-aulas-semanais` e `sunday-school-aula-e-infogr-fico` parecem ter perdido caracteres acentuados no slug. Isso nao impede execucao, mas vale lembrar se for procurar por nome de pasta.
- A automacao `Sunday School - Aula e Infografico` menciona infografico no nome, mas o prompt atual diz explicitamente `Nao use imagens`.
- A automacao diaria do Come Follow Me faz backfill da semana; portanto, pode criar mais de uma pagina por execucao.
- A automacao Read AI tem logica de inferencia de deadline e classificacao Eisenhower; ela e mais operacional e sensivel a deduplicacao do que as automacoes de aula.
- Todas as automacoes de Notion exigem checagem previa para evitar duplicacao.

