# ia-chacha

O que é?
É tipo um chatbot, mas diferente! A Luna percebe se você tá triste, feliz ou bravo e muda o jeito de falar. 
Ela:
 -Detecta suas emoções através das palavras que você usa
 -Muda o jeito de falar dependendo do seu humor
 -Muda a carinha dela (o avatar) conforme a conversa
 -Lembra do contexto das últimas mensagens
 -Conversa de forma natural e acolhedora

Tecnologias usadas
Esse projeto usa:
-Python 3.8+ 
-FastAPI 
-Gemini API 
-httpx 
-HTML5, CSS3 e JavaScript 
-Jinja2 

Como rodar?
Antes:
*Python instalado
*Internet funcionando

Instalar:
*bash:
pip install fastapi uvicorn httpx

Rodar:
bashpython main.py

Abrir:
Vai em http://localhost:8000

Como usar a Luna?
É bem intuitivo, mas vou explicar as funcionalidades:
Conversando

Escreve sua mensagem no campo de texto
1-Aperta Enter ou clica no botão de enviar (setinha)
2-A Luna detecta como você tá se sentindo
3-O rostinho dela muda conforme sua emoção
4-Ela responde de forma empática

Atalhos do teclado ⌨️
Pra facilitar sua vida:

1-Enter → Envia a mensagem
2-Shift + Enter → Quebra linha (pra escrever mais)
3-Ctrl + K (ou Cmd + K no Mac) → Foca no campo de texto
4-Ctrl + R (ou Cmd + R no Mac) → Começa conversa nova

 Estrutura do projeto
Vou explicar o que cada arquivo faz:
📁 luna-ia-emotiva/
│
├── 📄 main.py          → Servidor FastAPI + lógica da IA
│                         • Define as rotas (/chat, /reset)
│                         • Detecta emoções
│                         • Se comunica com Gemini API
│                         • Gerencia histórico de conversas
│
├── 📄 index.html       → Interface visual
│                         • Estrutura da página
│                         • Avatar animado
│                         • Área de chat
│                         • Campo de input
│
├── 📄 style.css        → Estilos e animações
│                         • Design moderno com gradientes
│                         • Animações do avatar
│                         • Responsividade mobile
│                         • Tema roxo/lilás
│
└── 📄 script.js        → Lógica do front-end
                          • Envia mensagens pro servidor
                          • Atualiza interface dinamicamente
                          • Controla animações
                          • Gerencia interações do usuário

                          
Fluxo de funcionamento:
1-Você digita → script.js captura → 
2-Envia pro main.py → Detecta emoção → 
3-Chama Gemini API → Recebe resposta → 
4-Volta pro script.js → Atualiza tela
🎯 Funcionalidades completas

✅ Chat em tempo real com WebSockets simulado
✅ Detecção automática de emoções (5 tipos diferentes)
✅ Respostas personalizadas baseadas no contexto
✅ Avatar animado com 5 expressões faciais
✅ Histórico de conversas (últimas 30 mensagens)
✅ Indicador "digitando..." com animação
✅ Timestamps em cada mensagem
✅ Interface responsiva (funciona no celular!)
✅ Auto-resize do campo de texto
✅ Botão de reset pra começar nova conversa
✅ Scroll automático sempre pro final
✅ Atalhos de teclado pra produtividade
✅ Easter egg interativo

🧠 Conceitos de POO aplicados
Como o projeto usa Programação Orientada a Objetos:

Encapsulamento: Dados da conversa protegidos
Abstração: Funções específicas pra cada tarefa
Reutilização: Código organizado em funções
Modularidade: Separação front/back

🔧 Configuração da API
A chave do Gemini já tá configurada no código (linha 12 do main.py):
pythonGEMINI_API_KEY = "AIzaSyBIvF_im3KLIzNoVkG9UA7n5ri2Du0p3dk"
