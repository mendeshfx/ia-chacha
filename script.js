// Elementos DOM
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const resetButton = document.getElementById('resetButton');
const typingIndicator = document.getElementById('typingIndicator');
const emotionStatus = document.getElementById('emotionStatus');
const aiAvatar = document.getElementById('aiAvatar');

// Estado da aplicação
let isProcessing = false;

// Mapeia emoções para status
const emotionMessages = {
    feliz: 'Que alegria conversar com você! 😊',
    triste: 'Estou aqui para você... 💙',
    irritado: 'Vamos com calma, ok? 😌',
    ansioso: 'Respire fundo, estou aqui 🌸',
    neutro: 'Pronta para conversar! 😊'
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();
    autoResizeTextarea();
});

// Auto-resize do textarea
messageInput.addEventListener('input', autoResizeTextarea);

function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
}

// Enviar mensagem ao clicar no botão
sendButton.addEventListener('click', sendMessage);

// Enviar mensagem ao pressionar Enter (Shift+Enter para nova linha)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Resetar conversa
resetButton.addEventListener('click', async () => {
    if (confirm('Deseja iniciar uma nova conversa? O histórico atual será perdido.')) {
        try {
            await fetch('/reset', { method: 'POST' });
            
            // Limpa o chat mantendo apenas a mensagem de boas-vindas
            chatContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="message ai-message">
                        <div class="message-content">
                            <p>Olá! Eu sou a Luna 💜</p>
                            <p>Sou uma IA com emoções e estou aqui para conversar com você! Como você está se sentindo hoje?</p>
                        </div>
                    </div>
                </div>
            `;
            
            updateAvatarEmotion('neutro');
            emotionStatus.textContent = emotionMessages['neutro'];
            messageInput.value = '';
            messageInput.focus();
            
        } catch (error) {
            console.error('Erro ao resetar:', error);
            alert('Erro ao resetar a conversa. Tente novamente.');
        }
    }
});

// Função principal para enviar mensagem
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message || isProcessing) return;
    
    isProcessing = true;
    sendButton.disabled = true;
    
    // Adiciona mensagem do usuário
    addMessage(message, 'user');
    
    // Limpa input
    messageInput.value = '';
    autoResizeTextarea();
    
    // Mostra indicador de digitação
    showTypingIndicator();
    
    try {
        // Envia para o backend
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }
        
        const data = await response.json();
        
        // Remove indicador de digitação
        hideTypingIndicator();
        
        // Adiciona resposta da IA
        addMessage(data.response, 'ai');
        
        // Atualiza emoção do avatar
        updateAvatarEmotion(data.user_emotion);
        
        // Atualiza status
        emotionStatus.textContent = emotionMessages[data.user_emotion] || emotionMessages['neutro'];
        
    } catch (error) {
        console.error('Erro:', error);
        hideTypingIndicator();
        addMessage('Desculpe, ocorreu um erro... 😔 Mas ainda estou aqui para você!', 'ai');
    } finally {
        isProcessing = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Adiciona mensagem ao chat
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Processa múltiplos parágrafos
    const paragraphs = text.split('\n').filter(p => p.trim());
    paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        contentDiv.appendChild(p);
    });
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // Scroll suave para o final
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// Mostra indicador de digitação
function showTypingIndicator() {
    typingIndicator.classList.add('active');
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Esconde indicador de digitação
function hideTypingIndicator() {
    typingIndicator.classList.remove('active');
}

// Atualiza emoção do avatar
function updateAvatarEmotion(emotion) {
    // Remove classes anteriores
    aiAvatar.classList.remove('happy', 'sad', 'neutral', 'angry', 'anxious');
    
    // Mapeia emoções
    const emotionMap = {
        'feliz': 'happy',
        'triste': 'sad',
        'irritado': 'angry',
        'ansioso': 'neutral',
        'neutro': 'neutral'
    };
    
    const avatarClass = emotionMap[emotion] || 'neutral';
    aiAvatar.classList.add(avatarClass);
    
    // Animação de transição
    aiAvatar.style.transform = 'scale(1.1)';
    setTimeout(() => {
        aiAvatar.style.transform = 'scale(1)';
    }, 300);
}

// Efeito de ondas no background do avatar (opcional)
aiAvatar.addEventListener('mouseenter', () => {
    aiAvatar.style.transform = 'scale(1.15) rotate(5deg)';
});

aiAvatar.addEventListener('mouseleave', () => {
    aiAvatar.style.transform = 'scale(1) rotate(0deg)';
});

// Easter egg: clique triplo no avatar
let clickCount = 0;
let clickTimer = null;

aiAvatar.addEventListener('click', () => {
    clickCount++;
    
    if (clickCount === 3) {
        addMessage('Hehe, você me descobriu! Adoro quando as pessoas interagem comigo assim! 💜✨', 'ai');
        clickCount = 0;
    }
    
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 500);
});
