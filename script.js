/**
 * =========================================================
 * FORMULÁRIO AUDAX - CLONE RESPONDI
 * =========================================================
 */

// ===== CONFIGURAÇÕES =====
const CONFIG = {
  // Número do WhatsApp de atendimento (com DDI e DDD, ex: 5562985114144)
  WHATSAPP_NUMBER: '5562985114144',

  // Webhook opcional (Forminit, Make, n8n, Zapier, Webhook customizado)
  WEBHOOK_URL: 'https://forminit.com/f/p4qc17jp2py',

  // Mensagem inicial de saudação no WhatsApp
  WA_TITLE: 'Olá! Acabei de responder à Sessão Estratégica Gratuita:',

  TOTAL_STEPS: 7 // de 0 (Boas-vindas) a 7 (Obrigado)
};

// ===== ESTADO DO FORMULÁRIO =====
let currentStep = 0;
const formData = {
  nome: '',
  whatsapp: '',
  instagram: '',
  email: '',
  busca_audax: '',
  faturamento: ''
};

// Elementos DOM
const slides = document.querySelectorAll('.slide-item');
const progressBar = document.getElementById('progressBar');
const btnNavPrev = document.getElementById('btn-nav-prev');
const btnNavNext = document.getElementById('btn-nav-next');
const navArrows = document.getElementById('navArrows');

// =========================================================
// INICIALIZAÇÃO
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Carrega respostas salvas se houver
  loadSavedData();

  // Aplica máscara de telefone
  setupPhoneMask();

  // Configura atalhos de teclado globais
  setupKeyboardNavigation();

  // Atualiza estado visual inicial
  updateProgress();
  updateNavButtons();
  focusCurrentInput();
});

// =========================================================
// NAVEGAÇÃO ENTRE ETAPAS
// =========================================================
function goToStep(targetStep, direction = 'next') {
  if (targetStep < 0 || targetStep > CONFIG.TOTAL_STEPS) return;
  if (targetStep === currentStep) return;

  const currentSlide = document.querySelector(`.slide-item[data-step="${currentStep}"]`);
  const targetSlide = document.querySelector(`.slide-item[data-step="${targetStep}"]`);

  if (!currentSlide || !targetSlide) return;

  // Animação de saída
  if (direction === 'next') {
    currentSlide.classList.add('slide-up-exit');
  } else {
    currentSlide.classList.add('slide-down-exit');
  }

  currentSlide.classList.remove('active');

  setTimeout(() => {
    currentSlide.classList.remove('slide-up-exit', 'slide-down-exit');
  }, 400);

  // Ativa próxima etapa
  currentStep = targetStep;
  targetSlide.classList.add('active');

  // Atualiza barra de progresso e controles
  updateProgress();
  updateNavButtons();

  // Foco no campo do novo passo
  setTimeout(() => {
    focusCurrentInput();
  }, 100);

  // Se chegou na tela de agradecimento, submete
  if (currentStep === 7) {
    onFormComplete();
  }
}

function nextStep() {
  if (currentStep < CONFIG.TOTAL_STEPS) {
    goToStep(currentStep + 1, 'next');
  }
}

function prevStep() {
  if (currentStep > 0 && currentStep < 7) {
    goToStep(currentStep - 1, 'prev');
  }
}

// Submissão / Validação do Passo Atual
function submitCurrentStep() {
  clearErrors();

  if (currentStep === 0) {
    nextStep();
    return;
  }

  // Validação Passo 1: Nome
  if (currentStep === 1) {
    const input = document.getElementById('input-nome');
    const val = input.value.trim();
    if (!val || val.length < 2) {
      showError('nome', 'Por favor, digite seu nome completo.');
      input.focus();
      return;
    }
    formData.nome = val;
    saveData();
    nextStep();
    return;
  }

  // Validação Passo 2: WhatsApp
  if (currentStep === 2) {
    const input = document.getElementById('input-whatsapp');
    const val = input.value.trim();
    const digits = val.replace(/\D/g, '');
    if (digits.length < 10) {
      showError('whatsapp', 'Por favor, digite um número de WhatsApp válido com DDD.');
      input.focus();
      return;
    }
    formData.whatsapp = val;
    saveData();
    nextStep();
    return;
  }

  // Validação Passo 3: Instagram
  if (currentStep === 3) {
    const input = document.getElementById('input-instagram');
    let val = input.value.trim();
    if (!val) {
      showError('instagram', 'Por favor, informe seu @ do Instagram.');
      input.focus();
      return;
    }
    if (!val.startsWith('@')) {
      val = '@' + val;
      input.value = val;
    }
    formData.instagram = val;
    saveData();
    nextStep();
    return;
  }

  // Validação Passo 4: E-mail
  if (currentStep === 4) {
    const input = document.getElementById('input-email');
    const val = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val || !emailRegex.test(val)) {
      showError('email', 'Por favor, insira um e-mail válido.');
      input.focus();
      return;
    }
    formData.email = val;
    saveData();
    nextStep();
    return;
  }

  // Validação Passo 5: Busca Audax
  if (currentStep === 5) {
    if (!formData.busca_audax) {
      showError('busca_audax', 'Selecione uma das opções para continuar.');
      return;
    }
    nextStep();
    return;
  }

  // Validação Passo 6: Faturamento
  if (currentStep === 6) {
    if (!formData.faturamento) {
      showError('faturamento', 'Selecione sua faixa de faturamento.');
      return;
    }
    nextStep();
    return;
  }
}

// =========================================================
// SELEÇÃO DE OPÇÕES (MÚLTIPLA ESCOLHA / RADIO)
// =========================================================
function selectChoice(fieldName, value, element) {
  clearErrors();
  formData[fieldName] = value;
  saveData();

  // Marca visualmente o card selecionado
  const parent = element.closest('.choice-list');
  if (parent) {
    parent.querySelectorAll('.choice-card').forEach(btn => btn.classList.remove('selected'));
  }
  element.classList.add('selected');

  // Auto-avanço elegante com delay para feedback visual
  setTimeout(() => {
    nextStep();
  }, 280);
}

// =========================================================
// FEEDBACK DE ERRO
// =========================================================
function showError(fieldName, message) {
  const errorEl = document.getElementById(`error-${fieldName}`);
  if (errorEl) {
    if (message) errorEl.textContent = message;
    errorEl.style.display = 'block';
    const wrap = errorEl.closest('.field-wrap');
    if (wrap) wrap.classList.add('has-error');
  }
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.field-wrap').forEach(el => el.classList.remove('has-error'));
}

// =========================================================
// CONTROLES DE INTERFACE & PROGRESSO
// =========================================================
function updateProgress() {
  // Percentual baseado na etapa
  const progressMap = {
    0: 0,
    1: 15,
    2: 30,
    3: 45,
    4: 60,
    5: 75,
    6: 90,
    7: 100
  };

  const percentage = progressMap[currentStep] || 0;
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
}

function updateNavButtons() {
  if (!btnNavPrev || !btnNavNext) return;

  // Botão Anterior desabilitado no início ou fim
  btnNavPrev.disabled = currentStep === 0 || currentStep === 7;

  // Botão Próximo escondido na última etapa
  if (currentStep === 7) {
    navArrows.style.display = 'none';
  } else {
    navArrows.style.display = 'flex';
    btnNavNext.disabled = false;
  }
}

function focusCurrentInput() {
  const activeSlide = document.querySelector(`.slide-item[data-step="${currentStep}"]`);
  if (!activeSlide) return;

  const input = activeSlide.querySelector('input');
  if (input) {
    input.focus();
    // Posiciona cursor no final
    if (input.value) {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }
}

// =========================================================
// ATALHOS DE TECLADO
// =========================================================
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Se o usuário estiver na tela final, não processa atalhos
    if (currentStep === 7) return;

    // Enter para avançar
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        e.preventDefault();
        prevStep();
      } else {
        e.preventDefault();
        submitCurrentStep();
      }
      return;
    }

    // Atalhos A, B, C, D, E, F nas etapas de múltipla escolha
    if (currentStep === 5 || currentStep === 6) {
      const activeSlide = document.querySelector(`.slide-item[data-step="${currentStep}"]`);
      if (activeSlide) {
        const key = e.key.toUpperCase();
        const targetCard = activeSlide.querySelector(`.choice-card[data-key="${key}"]`);
        if (targetCard) {
          e.preventDefault();
          targetCard.click();
        }
      }
    }
  });
}

// =========================================================
// MÁSCARA DE WHATSAPP (BRASIL)
// =========================================================
function setupPhoneMask() {
  const phoneInput = document.getElementById('input-whatsapp');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      // Formato com 9 dígitos: (11) 99999-9999
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      // Formato inicial: (11) 9999-9999
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      e.target.value = `(${value}`;
    }
  });
}

// =========================================================
// CONCLUSÃO E SUBMISSÃO
// =========================================================
async function onFormComplete() {
  // Salva no LocalStorage
  saveData();

  // Envia para o Webhook se configurado
  if (CONFIG.WEBHOOK_URL) {
    try {
      await fetch(CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          origem: 'Formulário Audax (Respondi Clone)'
        })
      });
      console.log('Formulário enviado com sucesso para o Webhook.');
    } catch (err) {
      console.warn('Erro ao disparar webhook (dados salvos localmente):', err);
    }
  }

  // Prepara o link direto para WhatsApp
  const btnWhatsApp = document.getElementById('btn-whatsapp-direct');
  if (btnWhatsApp) {
    const message = `${CONFIG.WA_TITLE}\n\n` +
      `*Nome:* ${formData.nome}\n` +
      `*WhatsApp:* ${formData.whatsapp}\n` +
      `*Instagram:* ${formData.instagram}\n` +
      `*E-mail:* ${formData.email}\n` +
      `*Busca Audax:* ${formData.busca_audax}\n` +
      `*Faturamento Mensal:* ${formData.faturamento}`;

    btnWhatsApp.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }
}

// =========================================================
// PERSISTÊNCIA LOCAL (LocalStorage)
// =========================================================
function saveData() {
  try {
    localStorage.setItem('audax_form_data', JSON.stringify(formData));
  } catch (e) {
    // Silently fail if localStorage is disabled
  }
}

function loadSavedData() {
  try {
    const saved = localStorage.getItem('audax_form_data');
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(formData, data);

      if (data.nome) {
        const el = document.getElementById('input-nome');
        if (el) el.value = data.nome;
      }
      if (data.whatsapp) {
        const el = document.getElementById('input-whatsapp');
        if (el) el.value = data.whatsapp;
      }
      if (data.instagram) {
        const el = document.getElementById('input-instagram');
        if (el) el.value = data.instagram;
      }
      if (data.email) {
        const el = document.getElementById('input-email');
        if (el) el.value = data.email;
      }
      if (data.busca_audax) {
        const card = document.querySelector(`.choice-list[data-field="busca_audax"] .choice-card[data-value="${data.busca_audax}"]`);
        if (card) card.classList.add('selected');
      }
      if (data.faturamento) {
        const card = document.querySelector(`.choice-list[data-field="faturamento"] .choice-card[data-value="${data.faturamento}"]`);
        if (card) card.classList.add('selected');
      }
    }
  } catch (e) {
    // Silently ignore
  }
}
