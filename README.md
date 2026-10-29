# token-kit

**Gaste menos token do Claude Code ao ler arquivo grande.** Três ferramentas que transformam vídeo, imagem e texto longo num resumo de uma página *antes* de o agente ler o original, mais um hook que recusa a leitura crua e aponta pro resumo.

| ferramenta | entrada → saída | ganho medido |
|---|---|---|
| [`prep-frames`](prep-frames) | vídeo ou imagem → contact sheet (`sheet.jpg`) + `resumo.md` com OCR e rostos por frame | ~37k → ~2k tokens num vídeo de 25 frames |
| [`prep-texto`](prep-texto) | arquivo longo → índice com nº de linha + 1ª linha de cada seção | 42 KB → 5 KB |
| [`token-saver`](token-saver) | hook do Claude Code: na 1ª leitura crua de arquivo grande, recusa e indica `prep-frames`/`prep-texto` | repetir a chamada passa |

## Por que existe

Auditoria de 41 sessões de Claude Code (assumindo ~1.500 tokens por imagem): os maiores gastos eram docs `.md` lidos inteiros ou com `cat` (~440k tokens), frames e overlays PNG/JPG (~243k), screenshots do Chrome (~199k), `notion-fetch` (~113k, 4,7k cada) e `grep`/`.txt` longos (~180k). A maior parte era leitura de coisa grande que o agente só precisava *localizar*.

Nenhuma dependência nova: só `ffmpeg`, `swiftc`, `sips` e Python, que já vêm no Mac ou no Homebrew.

## Instalar

```bash
git clone https://github.com/SafeMantella/token-kit.git
cd token-kit
chmod +x prep-frames/prep-frames prep-texto/prep-texto
```

Requisitos: **macOS** (o OCR e a detecção de rosto usam o Apple Vision, compilado de `vision.swift` pelo `swiftc` na primeira execução) e `ffmpeg`/`ffprobe` (`brew install ffmpeg`).

## Usar

```bash
# vídeo -> sheet.jpg (grade 3x3) + resumo.md
prep-frames/prep-frames video.mp4 -n 9 -o /tmp/revisao
# imagem também funciona
prep-frames/prep-frames print.png

# texto longo -> índice; depois leia só a seção que importa (Read com offset/limit)
prep-texto/prep-texto relatorio.md --max 40
```

- `prep-frames <video|imagem> [-n 9] [-o pasta]`: saída padrão em `/tmp/prep-frames/<nome>/` com `sheet.jpg`, `resumo.md` e `frames/` (abra um frame cheio só pra ajuste fino).
- `prep-texto <arquivo> [--max 40]`: devolve o índice; o agente lê a seção certa em seguida.
- **Regra de bolso:** revisão visual de vídeo começa por `prep-frames`; documento longo de consulta começa por `prep-texto`. Arquivos de **regras** (CLAUDE.md, SKILL.md, memória do agente) se leem inteiros, nunca resumidos.

## Hook `token-saver`

Plugin do Claude Code (hook `tool.call`). Recusa **uma vez** e aponta o resumo; repetir a mesma chamada passa, então nunca bloqueia de verdade:

- `Read` de imagem > 150 KB ou texto > 30 KB, e `cat` de arquivo > 30 KB no Bash (que furaria o hook do Read);
- `Read` de `*.json` que tem um `.leitura.txt` ao lado (versão compacta de transcrição: 15.894 → 1.618 bytes medidos);
- o 2º `notion-fetch` da mesma página na sessão (libera após `notion-update-page` nela ou na 3ª tentativa);
- ignora `memory/`, `CLAUDE.md` e `SKILL.md`.

Instalar, uma vez por projeto (ajuste o caminho pra onde clonou):

```bash
claude plugin marketplace add ./token-kit/token-saver --scope project
claude plugin install token-saver@pedro-social-tools --scope project
```

Validar e testar (8 testes): `claude plugin validate token-kit/token-saver && claude plugin test token-kit/token-saver`. No stub de teste, `fs.stat` é `on('fs.stat', (_, a) => ({ value }|{ deny }))`; `$.fs` não existe no `$` do teste.

## Limites

- `prep-frames` é só macOS. Em Linux/Windows daria pra trocar o `vision.swift` por Tesseract; não está feito.
- Os limites de tamanho e as exceções ficam em `token-saver/hooks/register.ts`; ajuste ao seu gosto.
- Os números acima vieram de um projeto e de um conjunto de sessões; o seu pode variar.

## Repos relacionados

Do mesmo kit do [@SafeMantella](https://github.com/SafeMantella): [transcrever-ptbr](https://github.com/SafeMantella/transcrever-ptbr) gera o `.leitura.txt` que o hook prefere; [video-cut-pipeline](https://github.com/SafeMantella/video-cut-pipeline), [social-toolbox](https://github.com/SafeMantella/social-toolbox), [video-tools](https://github.com/SafeMantella/video-tools), [sau-tools](https://github.com/SafeMantella/sau-tools).
