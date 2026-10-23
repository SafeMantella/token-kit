// OCR + contagem de rostos via Vision. Uso: vision img1 img2 ...  -> uma linha por imagem
import Vision
import Foundation
for p in CommandLine.arguments.dropFirst() {
    let h = VNImageRequestHandler(url: URL(fileURLWithPath: p))
    let t = VNRecognizeTextRequest(); t.recognitionLanguages = ["pt-BR", "en-US"]
    let f = VNDetectFaceRectanglesRequest()
    try? h.perform([t, f])
    let txt = (t.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: " | ")
    print("\(URL(fileURLWithPath: p).lastPathComponent)\t\(f.results?.count ?? 0)\t\(txt)")
}
