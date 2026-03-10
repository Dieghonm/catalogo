# 🛍️ MeuCatálogo — Catálogo de Produtos React

Catálogo de produtos com filtros, busca, carrinho de compras e páginas de detalhe.
Feito com React + Vite, pronto para publicar no **GitHub Pages**.

---

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em modo desenvolvimento

```bash
npm run dev
```

Abra `http://localhost:5173` no navegador.

---

## 📦 Como publicar no GitHub Pages

### 1. Crie o repositório no GitHub

- Vá em [github.com/new](https://github.com/new) e crie um repositório **público**
- Ex: `catalogo-produtos`

### 2. Ajuste o nome do repositório no `vite.config.js`

Abra o arquivo `vite.config.js` e altere:

```js
const REPO_NAME = 'catalogo-produtos' // ← coloque o nome EXATO do seu repositório
```

### 3. Faça o primeiro push

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git push -u origin main
```

### 4. Publique no GitHub Pages

```bash
npm run deploy
```

Isso vai:
- Buildar o projeto (`npm run build`)
- Publicar a pasta `dist/` no branch `gh-pages` automaticamente

### 5. Ative o GitHub Pages

- Vá em **Settings → Pages** no seu repositório
- Em **Branch**, selecione `gh-pages` e clique em Save
- Aguarde 1-2 minutos e acesse: `https://SEU_USUARIO.github.io/NOME_DO_REPO/`

---

## ✏️ Como editar os produtos

Abra o arquivo **`src/data/produtos.js`** — ele tem instruções detalhadas no topo.

### Adicionar um produto

```js
{
  id: 13,                           // número único (não repita!)
  nome: 'Meu Novo Produto',
  descricao: 'Descrição do produto.',
  preco: 49.90,
  imagem: 'https://link-da-imagem.com/foto.jpg',
  categoria: 'Utensílios',          // Utensílios | Brinquedos | Colecionáveis | Pelúcias
  fabrica: 'Fábrica Alpha',         // um dos 12 nomes em FABRICAS
  destaque: false,                  // true = aparece no banner
},
```

### Alterar nomes das fábricas

Edite o array `FABRICAS` no mesmo arquivo:

```js
export const FABRICAS = [
  'Nome da Fábrica 1',
  'Nome da Fábrica 2',
  // ...
]
```

### Adicionar categorias

Edite o array `CATEGORIAS`:

```js
export const CATEGORIAS = ['Utensílios', 'Brinquedos', 'Colecionáveis', 'Pelúcias', 'Nova Categoria']
```

---

## 📁 Estrutura do projeto

```
src/
  data/
    produtos.js       ← ✏️ EDITE AQUI: todos os produtos, fábricas e categorias
  components/
    Header.jsx        ← barra de navegação com busca e ícone do carrinho
    Filtros.jsx       ← sidebar com filtros de categoria e fábrica
    ProdutoCard.jsx   ← card de produto na grade
  pages/
    Home.jsx          ← página principal com hero e grade de produtos
    Produto.jsx       ← página de detalhe do produto
    Carrinho.jsx      ← página do carrinho de compras
  CartContext.jsx     ← estado global do carrinho
  App.jsx             ← roteamento
  styles.css          ← todos os estilos
```
