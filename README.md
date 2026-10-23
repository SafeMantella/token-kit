# token-kit

Três ferramentas pra gastar menos token do Claude Code ao ler arquivo grande.

| pasta | o que faz |
|---|---|
| `prep-frames` | vídeo → contact sheet + OCR/rostos (Apple Vision) → `resumo.md` de 1 página |
| `prep-texto` | arquivo longo → índice + 1ª linha por seção |
| `token-saver` | hook do Claude Code que recusa 1x a leitura crua de arquivo grande e aponta as duas acima |

> Feito pro meu projeto de redes sociais (macOS). Os scripts assumem a pasta `ferramentas/` do projeto e alguns têm caminho absoluto `/Volumes/1TB Mac/...`: ajuste antes de usar em outro lugar.
