# token-kit

Três ferramentas pra gastar menos token do Claude Code ao ler arquivo grande.

| pasta | o que faz |
|---|---|
| `prep-frames` | vídeo → contact sheet + OCR/rostos (Apple Vision) → `resumo.md` de 1 página |
| `prep-texto` | arquivo longo → índice + 1ª linha por seção |
| `token-saver` | hook do Claude Code que recusa 1x a leitura crua de arquivo grande e aponta as duas acima |

> Feito pro meu projeto de redes sociais (macOS). Os scripts assumem a pasta `ferramentas/` do projeto e alguns têm caminho absoluto `/Volumes/1TB Mac/...`: ajuste antes de usar em outro lugar.

## Por que existe

Auditoria de 41 sessões (assumindo ~1.500 tokens por imagem): os maiores gastos eram docs `.md`/`cat` (~440k), frames e overlays PNG/JPG (~243k), screenshots do Chrome (~199k), `notion-fetch` (~113k, 4,7k cada) e grep/`.txt` longos (~180k). Nada foi instalado: só ffmpeg, swiftc, sips e python.

## Uso

- `prep-frames <video|imagem> [-n 9]` → `sheet.jpg` (contact sheet 3x3) + `resumo.md` (OCR e rostos por frame, Apple Vision). Ler esses dois em vez de N frames; frame cheio só pra ajuste fino de overlay. ~37k → ~2k tokens num vídeo de 25 frames.
- `prep-texto <arquivo> [--max 40]` → índice com nº de linha; depois ler só a seção com offset/limit. Medido: 42 KB → 5 KB.
- **Regra de uso:** revisão visual de vídeo começa por `prep-frames`; doc longo só de consulta começa por `prep-texto`. Docs de regras (CLAUDE.md, SKILL.md, `memory/`) se leem inteiros, nunca resumir.

## Hook `token-saver`

Mod do Claude Code (hook `tool.call`). Recusa **uma vez** e aponta o prep; repetir a chamada passa:

- `Read` de imagem >150 KB ou texto >30 KB; `cat` de arquivo >30 KB no Bash (que fura o hook do Read).
- `Read` de `*.json` com `.leitura.txt` ao lado (versão compacta da transcrição: medido 15.894 → 1.618 bytes).
- O 2º `notion-fetch` da mesma página na sessão (libera após `notion-update-page` nela ou na 3ª tentativa).
- Ignora `memory/`, CLAUDE.md e SKILL.md.

Registro permanente, uma vez por projeto:

```bash
claude plugin marketplace add ./ferramentas/token-saver --scope project
claude plugin install token-saver@pedro-social-tools --scope project
```

Testes: `claude plugin test` (8 testes; o stub de `fs.stat` é `on('fs.stat', (_, a) => ({ value }|{ deny }))`, `$.fs` não existe no `$` do teste).
