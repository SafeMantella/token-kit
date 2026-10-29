# token-saver

**Plugin do Claude Code que impede o agente de ler arquivo grande cru sem querer.** Hook `tool.call`: na primeira tentativa de ler uma imagem pesada, um texto longo ou uma transcrição JSON, recusa e diz qual comando usar no lugar. Se o agente realmente precisa do arquivo inteiro, repete a chamada e ela passa. É um empurrão, não uma trava.

| situação | o que o hook faz |
|---|---|
| `Read` de imagem > 150 KB ou texto > 30 KB | recusa 1x e indica `prep-frames` / `prep-texto` |
| `cat` de arquivo > 30 KB no Bash | idem (fecha o atalho que fura o hook do Read) |
| `Read` de `*.json` com `.leitura.txt` ao lado | indica o `.leitura.txt` (15.894 → 1.618 bytes medidos) |
| 2º `notion-fetch` da mesma página | recusa; libera após `notion-update-page` nela ou na 3ª tentativa |
| `memory/`, `CLAUDE.md`, `SKILL.md` | nunca bloqueia |

## Instalar (uma vez por projeto)

```bash
claude plugin marketplace add ./token-kit/token-saver --scope project
claude plugin install token-saver@pedro-social-tools --scope project
```

Ajuste o caminho pra onde clonou o [token-kit](https://github.com/SafeMantella/token-kit). Isso altera os settings do projeto: instale só onde quiser o hook ligado.

## Validar e testar

```bash
claude plugin validate token-kit/token-saver
claude plugin test token-kit/token-saver    # 8 testes
```

No stub de teste, `fs.stat` é `on('fs.stat', (_, a) => ({ value }|{ deny }))`; `$.fs` não existe no `$` do teste.

## Arquivos

`hooks/register.ts` (a lógica e os limites), `hooks/register.test.ts`, `hooks/hooks.json`, `.claude-plugin/plugin.json` e `marketplace.json`.
