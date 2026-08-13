# Sistema de Controle de Ferramentas - Qualidade & Chão de Fábrica

Sistema completo para gestão de ferramentas com duas interfaces separadas:
- **Dashboard de Qualidade**: Visualização completa, KPIs, histórico e análise
- **Chão de Fábrica**: Interface simplificada para retirada e devolução de ferramentas

## Funcionalidades

### Dashboard de Qualidade
- Visualização em tempo real de ferramentas em uso
- KPIs e métricas de utilização
- Histórico completo de movimentações
- Heatmap de utilização por setor
- **Atualização automática a cada 5 minutos**

### Chão de Fábrica
- Interface simplificada para tablets
- Retirada rápida de ferramentas
- Transferência entre operadores
- Prorrogação de tempo de uso
- Devolução de ferramentas

## URLs Disponíveis

O sistema suporta múltiplas formas de acesso:

### Via Rotas (Configurado no vercel.json)
- `https://seu-dominio.vercel.app/` → Dashboard de Qualidade (padrão)
- `https://seu-dominio.vercel.app/qualidade` → Dashboard de Qualidade
- `https://seu-dominio.vercel.app/chaodefabrica` → Chão de Fábrica
- `https://seu-dominio.vercel.app/chao` → Chão de Fábrica

### Via Parâmetros de URL
- `https://seu-dominio.vercel.app/?acesso=qualidade` → Dashboard de Qualidade
- `https://seu-dominio.vercel.app/?acesso=chao` → Chão de Fábrica

### Via Subdomínios (Requer configuração adicional no Vercel)
- `qualidade.seu-dominio.com` → Dashboard de Qualidade
- `chaodefabrica.seu-dominio.com` → Chão de Fábrica

## Deploy no Vercel

### Pré-requisitos
- Node.js instalado
- Conta no Vercel

### Passos para Deploy

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Testar localmente:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`

3. **Build para produção:**
   ```bash
   npm run build
   ```

4. **Deploy no Vercel:**
   
   **Opção A: Via CLI**
   ```bash
   npm install -g vercel
   vercel
   ```
   
   **Opção B: Via Dashboard Vercel**
   - Conecte seu repositório GitHub
   - Importe este projeto
   - Configure as variáveis de ambiente (se necessário)
   - Deploy automático

### Configuração de Subdomínios (Opcional)

Para usar subdomínios separados:

1. No Dashboard do Vercel, vá em **Settings > Domains**
2. Adicione os subdomínios:
   - `qualidade.seu-dominio.com`
   - `chaodefabrica.seu-dominio.com`
3. Configure DNS conforme instruções do Vercel
4. Adicione regras de redirecionamento no `vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/",
         "has": [
           {
             "type": "host",
             "value": "chaodefabrica.seu-dominio.com"
           }
         ],
         "destination": "/?acesso=chao"
       }
     ]
   }
   ```

## Atualização Automática

O Dashboard de Qualidade atualiza automaticamente os dados a cada 5 minutos para manter sincronização com as operações do Chão de Fábrica. Isso é feito via polling do localStorage.

Para alterar o intervalo de atualização, edite o arquivo `src/App.tsx`:
```typescript
const refreshInterval = 5 * 60 * 1000; // Altere 5 para o valor desejado em minutos
```

## Estrutura do Projeto

```
├── src/
│   ├── App.tsx              # Componente principal com lógica de atualização
│   ├── components/          # Componentes React
│   ├── data/               # Dados mockados
│   ├── types.ts            # Definições TypeScript
│   └── main.tsx            # Entry point
├── vercel.json             # Configuração do Vercel
├── package.json            # Dependências
└── vite.config.ts          # Configuração do Vite
```

## Variáveis de Ambiente

Configure as variáveis de ambiente no arquivo `.env.local` ou nas configurações do projeto Vercel:
- `GEMINI_API_KEY` (se usar integração com Google AI)

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```
