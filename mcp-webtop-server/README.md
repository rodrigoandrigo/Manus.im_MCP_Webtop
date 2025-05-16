# Servidor MCP para Controle do Docker-Webtop com Puppeteer e Robot.js

## Visão Geral

Este projeto implementa um servidor MCP (Machine Control Program) projetado para permitir que um agente de IA (ou qualquer cliente HTTP) controle uma instância do `docker-webtop` (um ambiente de desktop Linux acessível via navegador). O servidor expõe uma API HTTP RESTful para interagir com o webtop, utilizando Puppeteer para gerenciar a sessão do navegador que acessa o webtop e Robot.js para simular interações de mouse, teclado e realizar operações de tela dentro do ambiente webtop.

O objetivo principal é fornecer uma ponte programática para automação de tarefas em um ambiente de desktop gráfico remoto.

## Funcionalidades

O servidor MCP oferece os seguintes recursos:

*   **Gerenciamento do Webtop:**
    *   Inicializar a conexão com a instância `docker-webtop` via Puppeteer.
    *   Encerrar a conexão com o `docker-webtop` (fechar o navegador Puppeteer).
*   **Controle do Mouse:**
    *   Mover o cursor do mouse para coordenadas específicas dentro do viewport do webtop.
    *   Executar cliques do mouse (esquerdo, direito, meio, clique simples ou duplo).
    *   Rolar a roda do mouse (para cima ou para baixo).
*   **Controle do Teclado:**
    *   Digitar sequências de texto.
    *   Pressionar teclas específicas, incluindo teclas modificadoras (Ctrl, Alt, Shift, Command/Super).
*   **Operações de Tela:**
    *   Obter as dimensões do viewport do webtop.
    *   Capturar uma imagem (screenshot) de todo o viewport do webtop ou de uma região específica.

## Pré-requisitos

Antes de executar este servidor, certifique-se de que os seguintes componentes estão instalados e configurados em sua máquina local (onde o servidor MCP será executado):

1.  **Node.js e npm:**
    *   Node.js (versão 18.x ou superior recomendada).
    *   npm (geralmente vem com o Node.js).
2.  **Docker:**
    *   Docker Desktop ou Docker Engine.
3.  **Instância `docker-webtop` em execução:**
    *   Você deve ter uma instância do `docker-webtop` configurada e rodando, acessível em `http://localhost:3000/` (ou a URL configurada).
4.  **Dependências de Sistema para Robot.js (Linux):**
    *   `libxtst-dev`
    *   `libpng++-dev`
    *   `build-essential` (contém `make` e compiladores C/C++ necessários para compilar módulos nativos como Robot.js).
    *   Comando para instalar no Ubuntu/Debian: `sudo apt-get update && sudo apt-get install -y libxtst-dev libpng++-dev build-essential`

## Configuração e Instalação

1.  **Obtenha o Projeto:**
    *   Clone este repositório ou baixe os arquivos para sua máquina local.

2.  **Navegue até o Diretório do Projeto:**
    ```bash
    cd caminho/para/mcp-webtop-server
    ```

3.  **Instale as Dependências do Projeto Node.js:**
    ```bash
    npm install
    ```
    Este comando instalará `express`, `puppeteer`, `robotjs`, `typescript` e outras dependências de desenvolvimento.

## Configuração do Servidor

O servidor pode ser configurado através de variáveis de ambiente. As principais configurações são:

*   `WEBTOP_URL`: A URL da sua instância `docker-webtop`. (Padrão: `http://localhost:3000/`)
*   `MCP_SERVER_PORT`: A porta na qual o servidor MCP será executado. (Padrão: `3030`)

Você pode definir essas variáveis diretamente no seu ambiente ou criar um arquivo `.env` na raiz do projeto (este projeto não inclui `dotenv` por padrão, mas você pode adicioná-lo se desejar).

O arquivo `src/config.ts` lê essas variáveis de ambiente.

## Executando o Servidor

1.  **Compile o Código TypeScript:**
    ```bash
    npm run build
    ```
    Este comando transpila os arquivos TypeScript de `src/` para JavaScript em `dist/`.

2.  **Inicie o Servidor:**
    ```bash
    npm run start
    ```
    O servidor MCP começará a escutar na porta configurada (padrão: 3030).

3.  **Para Desenvolvimento (com reinício automático):**
    ```bash
    npm run dev
    ```
    Este comando usa `nodemon` e `ts-node` para executar o servidor em modo de desenvolvimento, reiniciando automaticamente em caso de alterações nos arquivos TypeScript.

## API Endpoints

Todos os endpoints da API estão prefixados com `/api/v1`.

### 1. Webtop

*   **Inicializar Webtop**
    *   **Método:** `POST`
    *   **URL:** `/api/v1/webtop/initialize`
    *   **Payload:** Nenhum
    *   **Descrição:** Inicia o Puppeteer, abre um navegador, navega para a URL do `docker-webtop` e foca a página. Essencial para ser chamado antes de qualquer outra operação de controle.
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "message": "Puppeteer initialized successfully, Webtop page loaded and focused."
        }
        ```
    *   **Resposta de Erro (e.g., 500 Internal Server Error):**
        ```json
        {
          "status": "error",
          "message": "Error initializing Puppeteer: <detalhes do erro>"
        }
        ```

*   **Encerrar Webtop**
    *   **Método:** `POST`
    *   **URL:** `/api/v1/webtop/shutdown`
    *   **Payload:** Nenhum
    *   **Descrição:** Fecha o navegador Puppeteer, encerrando a sessão com o webtop.
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "message": "Webtop (Puppeteer) shutdown successfully."
        }
        ```

### 2. Mouse

*   **Mover Mouse**
    *   **Método:** `POST`
    *   **URL:** `/api/v1/mouse/move`
    *   **Payload:**
        ```json
        {
          "x": 100, // Coordenada X (relativa ao viewport do webtop)
          "y": 150  // Coordenada Y (relativa ao viewport do webtop)
        }
        ```
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "message": "Mouse moved to (100, 150)"
        }
        ```

*   **Clicar Mouse**
    *   **Método:** `POST`
    *   **URL:** `/api/v1/mouse/click`
    *   **Payload (Opcional x, y para mover antes de clicar):**
        ```json
        {
          "button": "left", // "left", "right", ou "middle" (padrão: "left")
          "double": false,  // true para clique duplo (padrão: false)
          "x": 200,        // Coordenada X opcional
          "y": 250         // Coordenada Y opcional
        }
        ```
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "message": "Mouse left clicked"
        }
        ```

*   **Rolar Mouse**
    *   **Método:** `POST`
    *   **URL:** `/api/v1/mouse/scroll`
    *   **Payload:**
        ```json
        {
          "direction": "down", // "up" ou "down"
          "amount": 10        // Quantidade de "ticks" para rolar
        }
        ```
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "message": "Mouse scrolled down by 10"
        }
        ```

### 3. Teclado

*   **Digitar Texto**
    *   **Método:** `POST`
    *   **URL:** `/api/v1/keyboard/type`
    *   **Payload:**
        ```json
        {
          "text": "Olá, mundo!"
        }
        ```
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "message": "Text typed: Olá, mundo!"
        }
        ```

*   **Pressionar Tecla**
    *   **Método:** `POST`
    *   **URL:** `/api/v1/keyboard/press`
    *   **Payload:**
        ```json
        {
          "key": "enter", // Nome da tecla (e.g., "a", "enter", "f1", "space")
          "modifiers": ["control", "shift"] // Array opcional de modificadores ("alt", "control", "shift", "command")
        }
        ```
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "message": "Key pressed: enter with modifiers: control+shift"
        }
        ```

### 4. Tela

*   **Obter Tamanho da Tela (Viewport do Webtop)**
    *   **Método:** `GET`
    *   **URL:** `/api/v1/screen/size`
    *   **Payload:** Nenhum
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "width": 1280,
            "height": 720
          },
          "message": "Viewport dimensions retrieved"
        }
        ```

*   **Capturar Tela (Screenshot)**
    *   **Método:** `GET`
    *   **URL:** `/api/v1/screen/capture`
    *   **Parâmetros de Query (Opcionais para capturar uma região específica):**
        *   `x` (número): Coordenada X inicial da região (relativa ao viewport).
        *   `y` (número): Coordenada Y inicial da região.
        *   `width` (número): Largura da região.
        *   `height` (número): Altura da região.
        *   Exemplo: `/api/v1/screen/capture?x=10&y=20&width=100&height=150`
    *   **Payload:** Nenhum
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "image": "<base64_string_da_imagem>"
          },
          "message": "Screen captured successfully (raw BGRA buffer as base64)."
        }
        ```
        **Nota sobre a imagem:** A string `image` é uma representação base64 do buffer de imagem bruto (BGRA). Para visualização direta como PNG, pode ser necessário processamento adicional no lado do cliente ou uma biblioteca de imagem no servidor para converter para o formato PNG padrão (RGBA).

### 5. Health Check

*   **Verificar Saúde do Servidor**
    *   **Método:** `GET`
    *   **URL:** `/health` (Note: este endpoint não está sob `/api/v1`)
    *   **Payload:** Nenhum
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "status": "ok",
          "message": "MCP Server is running"
        }
        ```

## Exemplos de Uso (com `curl`)

1.  **Inicializar o Webtop:**
    ```bash
    curl -X POST http://localhost:3030/api/v1/webtop/initialize
    ```

2.  **Mover o Mouse:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"x": 500, "y": 300}' http://localhost:3030/api/v1/mouse/move
    ```

3.  **Digitar Texto:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"text": "Hello from MCP!"}' http://localhost:3030/api/v1/keyboard/type
    ```

4.  **Capturar a Tela Inteira:**
    ```bash
    curl -X GET http://localhost:3030/api/v1/screen/capture
    ```

## Notas Importantes

*   **Visibilidade do Navegador Puppeteer:** Para que Robot.js funcione corretamente, a janela do navegador lançada pelo Puppeteer (que exibe o webtop) deve estar visível e em foco no ambiente onde o servidor MCP está rodando. O Puppeteer é configurado para rodar em modo `headless: false`.
*   **Tradução de Coordenadas:** As coordenadas para operações de mouse e captura de tela são relativas ao viewport da página do webtop dentro do navegador. O servidor tenta calcular a posição absoluta na tela, mas isso pode precisar de ajustes dependendo do sistema operacional e configuração do gerenciador de janelas.
*   **Estabilidade:** A interação com GUIs remotas pode ser sensível a timing e layout. Testes e ajustes podem ser necessários para cenários de automação complexos.
*   **Segurança:** Este servidor expõe controle direto sobre um ambiente de desktop. Execute-o em um ambiente seguro e considere adicionar autenticação/autorização se for exposto a redes não confiáveis.

## Troubleshooting

*   **Erro de compilação do Robot.js:** Certifique-se de que todas as dependências de sistema (`libxtst-dev`, `libpng++-dev`, `build-essential`) estão instaladas antes de rodar `npm install`.
*   **Puppeteer não consegue iniciar o navegador:** Pode haver problemas com dependências do Chromium ausentes no sistema. Consulte a documentação do Puppeteer para dependências específicas do seu SO. Em ambientes headless Linux, pode ser necessário configurar `DISPLAY` ou usar `xvfb`.
*   **Comandos do Robot.js não funcionam:** Verifique se a janela do navegador Puppeteer está visível, em foco e não minimizada. Além disso, certifique-se de que o servidor MCP tem as permissões necessárias para controlar o mouse e o teclado no sistema operacional (especialmente no macOS).

Este README fornece uma base para usar e entender o servidor MCP. Sinta-se à vontade para expandi-lo conforme necessário.

