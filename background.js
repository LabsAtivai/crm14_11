// background.js

// Listener para a instalação da extensão
chrome.runtime.onInstalled.addListener(() => {
  console.log("Ativa CRM extension installed!");
});

// Função para autenticar e obter o token OAuth2
function authenticateUser(callback) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
          console.error("Erro de autenticação:", chrome.runtime.lastError?.message);
          return;
      }
      callback(token);
  });
}

// Função para buscar o histórico de e-mails de um contato específico
async function fetchEmailHistory(email, token) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${email}`;

  try {
      const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.messages) {
          console.log("Nenhuma mensagem encontrada para esse contato.");
          return;
      }

      const emailHistory = await Promise.all(
          data.messages.map((msg) => fetchMessageDetails(msg.id, token))
      );

      // Envia o histórico para o popup.js
      chrome.runtime.sendMessage({ type: "displayEmailHistory", history: emailHistory });
  } catch (error) {
      console.error("Erro ao buscar histórico de e-mails:", error.message);
  }
}

// Função para buscar detalhes de uma mensagem específica
async function fetchMessageDetails(messageId, token) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`;

  try {
      const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      const from = data.payload.headers.find(header => header.name === "From")?.value || "Remetente desconhecido";
      const subject = data.payload.headers.find(header => header.name === "Subject")?.value || "Sem assunto";
      const date = data.payload.headers.find(header => header.name === "Date")?.value || "Data desconhecida";
      const snippet = data.snippet || "";

      return { from, subject, date, snippet };
  } catch (error) {
      console.error(`Erro ao obter detalhes do e-mail ID ${messageId}:`, error.message);
  }
}

// Listener para mensagens do content.js ou popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getContactEmailHistory" && message.email) {
      authenticateUser((token) => {
          fetchEmailHistory(message.email, token);
          sendResponse({ success: true });
      });
      return true; // Mantém o canal aberto para resposta assíncrona
  }
});
