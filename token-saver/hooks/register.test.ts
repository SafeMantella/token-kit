import { test, expect } from 'claude-code/testing'

// $.fs não existe no $ do teste: o mundo abaixo dos plugins é simulado por `on('fs.stat', ...)`.
const tamanhos = (m: Record<string, number>) => (_: unknown, a: { path: string }) =>
  a.path in m ? ({ value: { kind: 'file', size: m[a.path], mtimeMs: 0 } } as never) : ({ deny: 'ENOENT' } as never)
const read = ($: any, file_path: string, extra = {}) => $.tool.call({ tool: 'Read', file_path, ...extra })
const stubRead = (on: any) => on('tool.call', { tool: 'Read' }, () => ({ result: 'ok' }))

test('arquivo inexistente passa direto (falha aberta)', async ($, on) => {
  stubRead(on); on('fs.stat', tamanhos({}))
  expect((await read($, '/nao/existe.png')).deny).toBeUndefined()
})

test('json com .leitura.txt ao lado: 1ª leitura recusada apontando o txt, 2ª passa', async ($, on) => {
  stubRead(on); on('fs.stat', tamanhos({ '/t/x.leitura.txt': 100, '/t/x.json': 100 }))
  const r1 = await read($, '/t/x.json')
  expect(r1.deny).toContain('x.leitura.txt')
  expect((await read($, '/t/x.json')).deny).toBeUndefined()
})

test('json sem .leitura.txt e pequeno passa', async ($, on) => {
  stubRead(on); on('fs.stat', tamanhos({ '/t/y.json': 100 }))
  expect((await read($, '/t/y.json')).deny).toBeUndefined()
})

test('texto grande: recusa 1x apontando prep-texto; pequeno e com offset passam', async ($, on) => {
  stubRead(on); on('fs.stat', tamanhos({ '/t/grande.md': 50_000, '/t/pequeno.md': 1_000 }))
  expect((await read($, '/t/pequeno.md')).deny).toBeUndefined()
  expect((await read($, '/t/grande.md', { offset: 1, limit: 50 })).deny).toBeUndefined()
  expect((await read($, '/t/grande.md')).deny).toContain('prep-texto')
  expect((await read($, '/t/grande.md')).deny).toBeUndefined()
})

test('imagem grande: recusa 1x apontando prep-frames', async ($, on) => {
  stubRead(on); on('fs.stat', tamanhos({ '/t/f.png': 400_000 }))
  expect((await read($, '/t/f.png')).deny).toContain('prep-frames')
  expect((await read($, '/t/f.png')).deny).toBeUndefined()
})

test('docs de regras (memory/, SKILL.md, CLAUDE.md) são lidos inteiros', async ($, on) => {
  stubRead(on); on('fs.stat', tamanhos({ '/p/memory/a.md': 90_000, '/p/x/SKILL.md': 90_000, '/p/CLAUDE.md': 90_000 }))
  for (const f of ['/p/memory/a.md', '/p/x/SKILL.md', '/p/CLAUDE.md']) expect((await read($, f)).deny).toBeUndefined()
})

test('notion-fetch repetido: 2ª chamada recusada, 3ª passa', async ($, on) => {
  on('tool.call', { tool: 'mcp__claude_ai_Notion__notion-fetch' }, () => ({ result: 'ok' }) as never)
  const call = () => $.tool.call({ tool: 'mcp__claude_ai_Notion__notion-fetch', id: 'abc' } as never)
  expect((await call()).deny).toBeUndefined()
  expect((await call()).deny).toBeDefined()
  expect((await call()).deny).toBeUndefined()
})

test('cat de arquivo grande recusado 1x; com pipe ou pequeno passa', async ($, on) => {
  on('tool.call', { tool: 'Bash' }, () => ({ result: 'ok' }) as never)
  on('fs.stat', tamanhos({ '/t/g.txt': 60_000, '/t/p.txt': 100 }))
  const sh = (command: string) => $.tool.call({ tool: 'Bash', command } as never) as Promise<{ deny?: string }>
  expect((await sh('cat /t/p.txt')).deny).toBeUndefined()
  expect((await sh('cat /t/g.txt | head')).deny).toBeUndefined()
  expect((await sh('cat /t/g.txt')).deny).toContain('prep-texto')
  expect((await sh('cat /t/g.txt')).deny).toBeUndefined()
})
