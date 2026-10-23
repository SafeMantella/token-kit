import type { Register } from 'claude-code'

const TOOLS = '/Volumes/1TB Mac/Desktop/social media/ferramentas'
const IMG = /\.(png|jpe?g)$/i
const TEXT = /\.(md|txt|json|csv)$/i
const SKIP = /(\/memory\/|\/\.claude\/|\/prep-frames\/|CLAUDE\.md$|AGENTS\.md$|SKILL\.md$)/ // docs de regras: ler inteiros
const IMG_MIN = 150_000 // bytes
const TEXT_MIN = 30_000

export const register: Register = on => {
  const nudged = new Set<string>() // ponytail: por sessão do módulo; reload zera

  on('tool.call', { tool: 'Read' }, async ($, e, next) => {
    const p = e.file_path
    const isRaw = e.offset === undefined && e.limit === undefined
    if (!isRaw || nudged.has(p) || SKIP.test(p)) return next(e)
    if (/\.json$/i.test(p)) { // transcrição palavra-a-palavra: existe versão compacta ao lado
      const lt = p.replace(/\.json$/i, '.leitura.txt')
      if (await $.fs.stat(lt).catch(() => undefined)) { nudged.add(p); return { deny: `token-saver: há versão compacta (~90% menos tokens): leia "${lt}". Precisa do JSON mesmo? Repita o Read e ele passa.` } }
    }
    const kind = IMG.test(p) ? 'img' : TEXT.test(p) ? 'txt' : undefined
    if (!kind) return next(e)
    const st = await $.fs.stat(p).catch(() => undefined)
    if (!st || st.size < (kind === 'img' ? IMG_MIN : TEXT_MIN)) return next(e)
    nudged.add(p)
    const hint = kind === 'img'
      ? `prep-frames "${p}" → leia o resumo.md + sheet.jpg (${TOOLS}/prep-frames/prep-frames)`
      : `prep-texto "${p}" → índice; depois Read com offset/limit na seção (${TOOLS}/prep-texto/prep-texto)`
    return { deny: `token-saver: leitura crua de ${Math.round(st.size / 1000)} KB. Rode antes: ${hint}. Precisa mesmo do arquivo inteiro? Repita o Read e ele passa.` }
  }).catch(($, e, next) => next(e)) // falha aberta: nunca bloqueia leitura por erro do mod

  // `cat` de arquivo grande no Bash fura o hook do Read: mesma regra, 1 aviso por comando.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const cmd = e.command.trim()
    if (nudged.has(cmd) || !/^cat\s/.test(cmd) || /[|<>;&$`]/.test(cmd)) return next(e)
    const files = (cmd.match(/"[^"]*"|'[^']*'|\S+/g) ?? []).slice(1).map(t => t.replace(/^["']|["']$/g, ''))
    if (files.some(f => f.startsWith('-') || SKIP.test(f))) return next(e)
    let total = 0
    for (const f of files) total += (await $.fs.stat(f).catch(() => undefined))?.size ?? 0
    if (total < TEXT_MIN) return next(e)
    nudged.add(cmd)
    return { deny: `token-saver: cat de ${Math.round(total / 1000)} KB. Use prep-texto "<arquivo>" (índice) e Read com offset/limit, ou head/grep. Precisa mesmo de tudo? Repita o comando e ele passa.` }
  }).catch(($, e, next) => next(e))

  // Mesma página do Notion buscada de novo na mesma sessão (4,7k–9,8k tokens cada): avisa 1x.
  const fetched = new Set<string>()
  on('tool.call', { tool: 'mcp__claude_ai_Notion__notion-fetch' }, ($, e, next) => {
    const id = String((e as { id?: string }).id ?? '')
    if (!id) return next(e)
    if (!fetched.has(id)) { fetched.add(id); return next(e) }
    fetched.delete(id) // próxima tentativa passa (pode ter mudado / saído do contexto por compactação)
    return { deny: `token-saver: a página ${id} já foi lida nesta sessão; use o conteúdo que já está no contexto. Se mudou ou foi compactado, repita a chamada e ela passa.` }
  }).catch(($, e, next) => next(e))
  on('tool.call', { tool: 'mcp__claude_ai_Notion__notion-update-page' }, ($, e, next) => {
    fetched.delete(String((e as { page_id?: string }).page_id ?? '')) // editou: o conteúdo mudou, refetch liberado
    return next(e)
  }).catch(($, e, next) => next(e))
}
