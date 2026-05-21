# Integracao Glasp Export

Esta pasta ja esta configurada para exportar highlights do Glasp via GitHub Actions, sem servidor.

## Arquivos criados

- `.github/workflows/glasp_to_slack.yml`
- `.github/workflows/glasp_to_sheets.yml`
- `.github/workflows/glasp_to_airtable.yml`
- `.github/workflows/glasp_to_notion.yml`
- `scripts/glasp_export.py`
- `scripts/glasp_to_slack.py`
- `scripts/glasp_to_sheets.py`
- `scripts/glasp_to_airtable.py`
- `scripts/glasp_to_notion.py`

Cada workflow roda diariamente as 09:00 UTC e tambem pode ser executado manualmente pela aba Actions do GitHub.

## Secret obrigatorio

Adicione no GitHub em `Settings > Secrets and variables > Actions > New repository secret`:

| Nome | Valor |
| --- | --- |
| `GLASP_ACCESS_TOKEN` | Token do Glasp em `https://glasp.co/settings/access_token` |

## Destinos opcionais

Voce pode habilitar um ou mais destinos ao mesmo tempo. O workflow pula automaticamente se os secrets daquele destino nao existirem.

### Slack

| Nome | Valor |
| --- | --- |
| `SLACK_WEBHOOK_URL` | Incoming Webhook URL do Slack |

Depois rode `Actions > Glasp -> Slack > Run workflow`.

### Google Sheets

| Nome | Valor |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Conteudo completo do JSON da service account |
| `GOOGLE_SHEET_ID` | ID da planilha no URL do Google Sheets |

Compartilhe a planilha com o `client_email` da service account como Editor. Depois rode `Actions > Glasp -> Google Sheets > Run workflow`.

### Airtable

| Nome | Valor |
| --- | --- |
| `AIRTABLE_API_KEY` | Personal Access Token do Airtable |
| `AIRTABLE_BASE_ID` | ID da base, com prefixo `app` |

A tabela padrao deve se chamar `Highlights` e conter os campos: `Timestamp`, `Document Title`, `Document URL`, `Glasp URL`, `Highlight Text`, `Note`, `Tags`, `Color`, `Highlighted At`.

### Notion

| Nome | Valor |
| --- | --- |
| `NOTION_API_KEY` | Internal Integration Token do Notion |
| `NOTION_DATABASE_ID` | ID do database do Notion |

O database deve ter as propriedades: `Name`, `URL`, `Glasp URL`, `Tags`, `Highlighted At`, `Highlights Count`.

## Ajustar horario

Edite o `cron` no workflow desejado:

```yaml
schedule:
  - cron: "0 9 * * *"
```

Se mudar a frequencia, ajuste tambem `LOOKBACK_HOURS` no mesmo workflow para cobrir a janela correta.
