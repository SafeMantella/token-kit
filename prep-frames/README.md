# prep-frames
Contact sheet (ffmpeg) + OCR/rostos (Apple Vision, `vision.swift` compilado em `.vision` na 1ª execução) → `resumo.md` de 1 página. Ler `resumo.md` + `sheet.jpg` em vez de N frames crus (~37k → ~2k tokens). Abrir um `frames/fNN.jpg` só pra ajuste fino de overlay.
Uso: `ferramentas/prep-frames/prep-frames video.mp4 [-n 9] [-o pasta]`. Sem dependência nova (ffmpeg, swiftc, sips).
