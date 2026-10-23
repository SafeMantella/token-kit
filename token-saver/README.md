# token-saver (mod do Claude Code)
Hook `tool.call` em `Read`: recusa uma vez a leitura crua de imagem >150 KB / texto >30 KB e aponta `prep-frames` / `prep-texto`. Repetir o Read passa. Ignora memory/, CLAUDE.md, SKILL.md.
Registro (rodar 1x no terminal): `claude plugin marketplace add ./ferramentas/token-saver --scope project && claude plugin install token-saver@pedro-social-tools --scope project`
Validar/testar: `claude plugin validate ferramentas/token-saver && claude plugin test ferramentas/token-saver`.
