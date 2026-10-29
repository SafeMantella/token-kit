# prep-frames

**Vídeo ou imagem → uma página que o agente lê no lugar de dezenas de frames.** Extrai N frames, monta um *contact sheet* e roda OCR e detecção de rosto em cada frame com o Apple Vision. O agente lê `sheet.jpg` + `resumo.md` (~2k tokens) em vez de N imagens cruas (~37k tokens num vídeo de 25 frames).

```bash
prep-frames video.mp4                  # 9 frames -> /tmp/prep-frames/video/
prep-frames video.mp4 -n 16 -o saida/  # 16 frames, pasta de saída escolhida
prep-frames print.png                  # uma imagem
```

## Saída

| arquivo | conteúdo |
|---|---|
| `sheet.jpg` | grade 3x3 de frames, lidos da esquerda pra direita |
| `resumo.md` | tabela com, por frame: tempo (s), rostos detectados e texto lido por OCR |
| `frames/fNN.jpg` | frames individuais; abra um só pra ajuste fino (posição de overlay, cor) |

## Requisitos

macOS, `ffmpeg`/`ffprobe` e `swiftc` (Xcode Command Line Tools). Na primeira execução, o `vision.swift` é compilado para `.vision` ao lado do script (e recompilado se o `.swift` mudar). Sem dependência de pip.

## Quando usar

Revisão visual de vídeo: "o texto está legível? o rosto ficou na zona livre? o overlay entrou no frame certo?" Se a pergunta exige o pixel exato, abra o frame cheio.
