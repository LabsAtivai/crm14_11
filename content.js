// content.js

// Função para detectar o e-mail do contato aberto e enviar para o background.js
function detectEmailAndSendToBackground() {
  const emailElement = document.querySelector(".gD"); // Seletor do remetente no Gmail
  if (emailElement) {
      const email = emailElement.getAttribute("email"); // Obtém o endereço de e-mail do contato
      if (email) {
          // Envia o e-mail para o background.js
          chrome.runtime.sendMessage({ type: "getContactEmailHistory", email });
      }
  }
}

// Configura o MutationObserver para monitorar mudanças no DOM do Gmail
const observer = new MutationObserver(() => {
  detectEmailAndSendToBackground(); // Verifica se um novo e-mail foi aberto
});

// Inicia o observer no corpo da página do Gmail
observer.observe(document.body, { childList: true, subtree: true });

// Força a detecção de e-mail ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  detectEmailAndSendToBackground();
});
