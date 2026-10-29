# prep-texto

**Arquivo de texto longo → índice de uma página, pra ler só a parte que importa.** Mostra o tamanho (caracteres, tokens estimados, linhas) e, para cada título Markdown (`#` a `####`), o número da linha e a primeira linha de conteúdo. Depois o agente usa `Read` com `offset`/`limit` na seção certa.

```bash
prep-texto relatorio.md            # até 40 títulos
prep-texto relatorio.md --max 80
```

Medido: 42 KB → 5 KB de índice.

## Quando não usar

- Arquivos de **regras e instruções** (CLAUDE.md, SKILL.md, pipelines, memória do agente): leia inteiros. Resumir regra é perder regra.
- Arquivo sem títulos Markdown: o índice fica pobre; use `grep -n` pelo termo.

Só precisa de Python 3 (stdlib).
