// popup.js

// Controle de paginação
let emailHistory = [];
let currentPage = 0;
const pageSize = 5; // Número de mensagens por página

// Botão de login para autenticação no Google
document.getElementById("btnGoogleLogin").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "googleLogin" });
});

// Função para exibir o histórico de e-mails com paginação
function renderEmailHistory() {
    const emailHistoryList = document.getElementById("email-history-list");
    emailHistoryList.innerHTML = ""; // Limpa o histórico anterior

    const start = currentPage * pageSize;
    const end = start + pageSize;
    const pageMessages = emailHistory.slice(start, end);

    pageMessages.forEach((email) => {
        const listItem = document.createElement("li");
        listItem.classList.add("email-item");
        listItem.innerHTML = `
            <div class="email-header">
                <strong>De:</strong> ${email.from}
                <span class="email-date">${email.date}</span>
            </div>
            <div class="email-subject"><strong>Assunto:</strong> ${email.subject}</div>
            <div class="email-snippet">${email.snippet}</div>
        `;
        emailHistoryList.appendChild(listItem);
    });

    // Exibe ou oculta o botão "Carregar mais" conforme necessário
    document.getElementById("load-more-btn").style.display =
        end < emailHistory.length ? "block" : "none";
}

// Função para carregar mais mensagens
function loadMoreEmails() {
    currentPage++;
    renderEmailHistory();
}

// Adiciona o evento ao botão "Carregar mais mensagens"
document.getElementById("load-more-btn").addEventListener("click", loadMoreEmails);

// Escuta as mensagens enviadas pelo background.js e exibe o histórico de e-mails
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "displayEmailHistory") {
        emailHistory = message.history; // Armazena o histórico completo
        currentPage = 0; // Reseta a página ao receber novo histórico
        renderEmailHistory(); // Renderiza a primeira página
    }
});
