chrome.runtime.onInstalled.addListener(() => {
    console.log("Ativa CRM extension installed!");
  });
  
  // Função para iniciar o processo de login e obter o token
  function authenticateUser(callback) {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Erro de autenticação:", chrome.runtime.lastError.message);
        return;
      }
      callback(token);
    });
  }
  
  // Função para buscar histórico de e-mails usando o Gmail API
  function fetchEmailHistory(email, token) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${email}`;
  
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.messages) {
          console.log("IDs das mensagens:", data.messages);
          // Para cada mensagem encontrada, busca os detalhes da mensagem
          data.messages.forEach((msg) => fetchMessageDetails(msg.id, token));
        } else {
          console.log("Nenhuma mensagem encontrada para esse contato.");
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar histórico de e-mails:", error);
      });
  }
  
  // Função para buscar detalhes de uma mensagem específica
  function fetchMessageDetails(messageId, token) {
    fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((response) => response.json())
      .then((msgData) => {
        const from = msgData.payload.headers.find(
          (header) => header.name === "From"
        ).value;
        const subject = msgData.payload.headers.find(
          (header) => header.name === "Subject"
        ).value;
        const date = msgData.payload.headers.find(
          (header) => header.name === "Date"
        ).value;
        const snippet = msgData.snippet;
  
        // Mostra as informações da mensagem no console (ou você pode enviar para o content script)
        console.log({
          from,
          subject,
          date,
          snippet,
        });
  
        // Aqui você pode enviar as informações da mensagem para o content script ou popup.js
        chrome.runtime.sendMessage({
          type: "displayEmailHistory",
          message: { from, subject, date, snippet },
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar detalhes da mensagem:", error);
      });
  }
  
  // Listener para mensagens do content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getContactEmailHistory" && message.email) {
      authenticateUser((token) => {
        fetchEmailHistory(message.email, token);
        sendResponse({ success: true });
      });
      return true; // Mantém o canal aberto para resposta assíncrona
    }
  });
  
  // Função para buscar histórico de e-mails usando o Gmail API
  function fetchEmailHistory(email, token) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${email}`;
  
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Dados de histórico de e-mails:", data);
        // Processar e enviar os dados para content.js ou popup.js
      })
      .catch((error) => {
        console.error("Erro ao buscar histórico de e-mails:", error);
      });
  }
  
  // Escuta as mensagens enviadas pelo content.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getContactEmailHistory") {
      authenticateUser((token) => {
        fetchEmailHistory(message.email, token);
      });
    }
  });
  
  // Função para iniciar o processo de login e obter o token
  function authenticateUser(callback) {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Erro de autenticação:", chrome.runtime.lastError.message);
        return;
      }
      callback(token);
    });
  }
  
  // Função para buscar histórico de e-mails usando o Gmail API
  function fetchEmailHistory(email, token) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${email}`;
  
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Dados de histórico de e-mails:", data);
        // Processar e enviar os dados para content.js ou popup.js
      })
      .catch((error) => {
        console.error("Erro ao buscar histórico de e-mails:", error);
      });
  }
  
  function getUserEmailAddress() {
    const headElement = document.querySelector("head");
    if (headElement) {
      const emailAddress = headElement.getAttribute(
        "data-inboxsdk-user-email-address"
      );
      return emailAddress;
    }
    return null;
  }
  
  // Escuta as mensagens enviadas pelo content.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getContactEmailHistory") {
      authenticateUser((token) => {
        fetchEmailHistory(message.email, token);
      });
    }
  });
  
  async function getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          console.error("Auth token error:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        console.log("Token obtained:", token);
        resolve(token);
      });
    });
  }
  
  // Função para buscar o histórico geral de e-mails
  async function getEmailHistory() {
    const token = await getAuthToken();
    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
  
    const emailHistory = [];
    for (const message of data.messages) {
      const msgDetail = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const msgData = await msgDetail.json();
      emailHistory.push({
        from: msgData.payload.headers.find((header) => header.name === "From")
          .value,
        subject: msgData.payload.headers.find(
          (header) => header.name === "Subject"
        ).value,
        date: msgData.payload.headers.find((header) => header.name === "Date")
          .value,
        snippet: msgData.snippet,
      });
    }
    return emailHistory;
  }
  
  // Função para buscar o histórico de e-mails de um contato específico
  async function getContactEmailHistoryS(contactEmail) {
    const token = await getAuthToken();
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${contactEmail}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  
    const data = await response.json();
    if (!data.messages) {
      console.log("Nenhuma mensagem encontrada para esse contato.");
      return [];
    }
  
    const emailHistory = [];
    for (const message of data.messages) {
      const msgDetail = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const msgData = await msgDetail.json();
      emailHistory.push({
        from: msgData.payload.headers.find((header) => header.name === "From")
          .value,
        subject: msgData.payload.headers.find(
          (header) => header.name === "Subject"
        ).value,
        date: msgData.payload.headers.find((header) => header.name === "Date")
          .value,
        snippet: msgData.snippet,
      });
    }
    return emailHistory;
  }
  
  // Listener para mensagens do content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getEmailHistory") {
      getEmailHistory()
        .then((history) => {
          sendResponse({ history });
        })
        .catch((error) => {
          console.error("Error fetching email history:", error);
          sendResponse({ error: error.message });
        });
      return true; // Mantém o canal aberto para resposta assíncrona
    } else if (message.type === "login") {
      getAuthToken()
        .then((token) => {
          console.log("Token obtained:", token);
          sendResponse({ success: true, token });
        })
        .catch((error) => {
          console.error("Login failed:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
  
  // Função para obter a lista de contatos
  async function fetchContacts(token) {
    const response = await fetch(
      "https://people.googleapis.com/v1/people/me/connections?personFields=emailAddresses,names",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    if (!response.ok) {
      throw new Error("Erro ao obter contatos");
    }
  
    const data = await response.json();
    return data.connections || [];
  }
  
  
  // Função para obter o histórico de e-mails de um contato específico
  async function getContactEmailHistoryS(contactEmail) {
    const token = await getAuthToken();
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${contactEmail}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  
    const data = await response.json();
    if (!data.messages) {
      console.log("Nenhuma mensagem encontrada para esse contato.");
      return [];
    }
  
    const emailHistory = [];
    for (const message of data.messages) {
      const msgDetail = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Função para obter detalhes de cada mensagem por ID
  async function fetchEmailDetails(token, messageId) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
  
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(`Erro ao obter detalhes do e-mail com ID: ${messageId}`);
    }
  
    const data = await response.json();
  
    const from = data.payload.headers.find((header) => header.name === "From")?.value || "Remetente desconhecido";
    const subject = data.payload.headers.find((header) => header.name === "Subject")?.value || "Sem assunto";
    const date = data.payload.headers.find((header) => header.name === "Date")?.value || "Data desconhecida";
    const snippet = data.snippet || "";
  
    return {
      id: messageId,
      from,
      subject,
      date,
      snippet,
    };
  }
  
  // Função para obter o histórico completo usando uma lista de message IDs
  async function getEmailHistoryDetails(token, messageIds) {
    const emailHistory = [];
  
    for (const messageId of messageIds) {
      try {
        const emailDetails = await fetchEmailDetails(token, messageId);
        emailHistory.push(emailDetails);
      } catch (error) {
        console.error("Erro ao buscar detalhes do e-mail:", error);
      }
    }
  
    return emailHistory;
  }
  
  // Função principal para chamar
  async function fetchEmailHistory(token, email) {
    // Supondo que `messageIds` seja a lista de IDs de e-mails que você obteve inicialmente
    const messageIds = ["191c761ebf925949", "191c36280608320a", "191c3627488947e2"]; // etc.
  
    // Buscando os detalhes de cada e-mail
    const emailHistory = await getEmailHistoryDetails(token, messageIds);
  
    console.log("Histórico de E-mails Completo:", emailHistory);
    return emailHistory;
  }
  
  
      const msgData = await msgDetail.json();
      emailHistory.push({
        from: msgData.payload.headers.find((header) => header.name === "From").value,
        subject: msgData.payload.headers.find((header) => header.name === "Subject").value,
        date: msgData.payload.headers.find((header) => header.name === "Date").value,
        snippet: msgData.snippet,
      });
    }
    return emailHistory;
  }
  
    } else if (message.type === "getContactEmailHistory" && message.email) {
      getContactEmailHistoryS(message.email)
        .then((history) => {
          sendResponse({ history });
        })
        .catch((error) => {
          console.error("Error fetching contact email history:", error);
          sendResponse({ error: error.message });
        });
      return true; // Mantém o canal aberto para resposta assíncrona
    } else if (message.type == "getContatos" && message.emailLog) {
    }
  });
  chrome.runtime.onInstalled.addListener(() => {
    console.log("Ativa CRM extension installed!");
  });
  
  // Função para iniciar o processo de login e obter o token
  function authenticateUser(callback) {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Erro de autenticação:", chrome.runtime.lastError.message);
        return;
      }
      callback(token);
    });
  }
  
  // Função para buscar detalhes de uma mensagem específica
  async function fetchMessageDetails(messageId, token) {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const msgData = await response.json();
  
    return {
      from: msgData.payload.headers.find((header) => header.name === "From").value,
      subject: msgData.payload.headers.find((header) => header.name === "Subject").value,
      date: msgData.payload.headers.find((header) => header.name === "Date").value,
      snippet: msgData.snippet,
    };
  }
  
  // Função para buscar histórico de e-mails e enviar ao popup.js
  async function fetchEmailHistory(email, token) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${email}`;
  
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
  
    if (data.messages) {
      const emailHistory = await Promise.all(
        data.messages.map((msg) => fetchMessageDetails(msg.id, token))
      );
      chrome.runtime.sendMessage({ type: "displayEmailHistory", history: emailHistory });
    } else {
      console.log("Nenhuma mensagem encontrada para esse contato.");
      chrome.runtime.sendMessage({ type: "displayEmailHistory", history: [] });
    }
  }
  
  // Listener para mensagens do popup.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getContactEmailHistory" && message.email) {
      authenticateUser((token) => {
        fetchEmailHistory(message.email, token);
        sendResponse({ success: true });
      });
      return true; // Mantém o canal aberto para resposta assíncrona
    }
  });
  