# Vitrine de Portfólios · Oficina de DIW (PUC Minas)

Site vitrine para exibir os portfólios desenvolvidos pelos alunos na **Oficina de Desenvolvimento de Interfaces Web (DIW)** da **PUC Minas**, com preview estático e ao vivo (`iframe`).

---

## Como publicar na Vercel (Plano Free)

1. Suba este projeto para um repositório no GitHub (privado ou público).
2. Em **Settings → Collaborators** no GitHub, adicione apenas você e o professor com permissão de escrita (*Write*).
3. Na [Vercel](https://vercel.com), clique em **Add New → Project** e importe o repositório:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. A partir daí, todo `git push` (ou edição feita direto pelo GitHub Web) na branch principal dispara um novo deploy automático na Vercel.

---

## Como atualizar os portfólios e repositórios

Todos os sites exibidos vêm de [`public/portfolios.json`](public/portfolios.json). Existem duas formas de atualizar:

### Opção 1: Editar direto pelo navegador no GitHub (mais rápida)
1. Abra o arquivo `public/portfolios.json` no GitHub.
2. Clique no ícone de lápis (**Edit this file**).
3. Adicione o `repoUrl` do aluno ou um novo objeto seguindo o formato:
   ```json
   {
     "id": "exemplo",
     "nome": "Nome do Aluno",
     "link": "https://exemplo.dev",
     "periodo": "2026/2",
     "repoUrl": "https://github.com/usuario/portfolio",
     "embeddable": true
   }
   ```
4. Clique em **Commit changes**. A Vercel atualizará o site automaticamente.

### Opção 2: Editar visualmente pelo Painel Admin local
No site publicado na Vercel, o botão **Painel Admin** fica oculto para visitantes. Para usá-lo localmente:

```bash
npm install
npm run dev
```

1. Clique em **Painel Admin** no topo (disponível em ambiente local).
2. Edite os links de repositórios, períodos ou adicione novos alunos e clique em **Salvar alterações** — isso grava direto em `public/portfolios.json`.
3. Se adicionou um novo site e quiser gerar a captura de preview local:
   ```bash
   npm run capture-previews
   ```
4. Envie as alterações para o GitHub:
   ```bash
   git add public/portfolios.json public/previews
   git commit -m "Atualiza portfólios e repositórios"
   git push
   ```
