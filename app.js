/* ═══════════════════════════════════════════════════════
   APP.JS — Portfolio Logic
   Orbital projects, modal, skills, navigation, EmailJS
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── PROJECT DATA ───
  const projects = [
    {
      id: 'thinkmate',
      name: 'ThinkMate',
      icon: '🧠',
      short: 'AI Decision Assistant',
      underDev: true,
      description: 'An AI-powered decision assistant that provides structured reasoning and intelligent analysis. Features voice input via Whisper, diagram generation, and a conversational interface for complex decision-making.',
      tech: ['React 19', 'Tailwind 4', 'Express', 'tRPC', 'MySQL', 'TiDB', 'Gemini API', 'Whisper'],
      features: [
        'AI-driven structured reasoning engine',
        'Voice input ready with Whisper integration',
        'Diagram generation support for visual thinking',
        'Real-time conversational decision interface',
        'React 19 + Tailwind 4 modern frontend',
        'Express + tRPC type-safe backend',
      ],
    },
    {
      id: 'voice-rt',
      name: 'Real-Time Voice System',
      icon: '🎙️',
      short: 'Live Voice Pipeline',
      underDev: false,
      description: 'A real-time voice conversation system with WebSocket streaming, handling the complete audio pipeline from speech-to-text through LLM processing to text-to-speech with interruption handling.',
      tech: ['WebSocket', 'STT', 'LLM', 'TTS', 'Streaming Audio', 'Low Latency'],
      features: [
        'WebSocket-based real-time audio streaming',
        'Complete STT → LLM → TTS pipeline',
        'Intelligent interruption handling',
        'Ultra-low latency design',
        'Seamless voice conversation flow',
      ],
    },
    {
      id: 'decision-bot',
      name: 'Decision Chatbot',
      icon: '⚖️',
      short: 'Pros/Cons Engine',
      underDev: false,
      description: 'A conversational chatbot specialized in decision assistance. Provides structured pros and cons analysis with intelligent reasoning to help users make informed decisions.',
      tech: ['Conversational AI', 'NLP', 'Decision Logic', 'Chat Interface'],
      features: [
        'Automated pros and cons analysis',
        'Decision assistance with structured output',
        'Conversational reasoning engine',
        'Contextual follow-up questions',
      ],
    },
    {
      id: 'peerfocus',
      name: 'PeerFocus',
      icon: '📹',
      short: 'WebRTC Study Rooms',
      underDev: false,
      description: 'A WebRTC-based video collaboration platform with Pomodoro timer synchronization, automatic mute/unmute during focus sessions, and real-time peer communication.',
      tech: ['WebRTC', 'Socket.io', 'Pomodoro', 'Web Speech API', 'Mobile Optimized'],
      features: [
        'WebRTC peer-to-peer video system',
        'Synchronized Pomodoro timer across peers',
        'Auto mute/unmute during focus sessions',
        'Real-time Socket.io synchronization',
        'Mobile-optimized responsive design',
      ],
    },
    {
      id: 'smartbanker',
      name: 'SmartBanker',
      icon: '🏦',
      short: 'Full-Stack Banking',
      underDev: false,
      description: 'A comprehensive full-stack banking application featuring OTP authentication via EmailJS, PIN-based security, a voice assistant powered by Web Speech API, PDF statement generation, and an integrated chatbot.',
      tech: ['Full-Stack', 'EmailJS', 'Web Speech API', 'PDF Generation', 'OTP Auth', 'Chatbot'],
      features: [
        'Complete banking UI with transaction management',
        'OTP authentication via EmailJS',
        'PIN-based secure authorization',
        'Voice assistant with Web Speech API',
        'PDF bank statement generation',
        'Integrated chatbot support',
      ],
    },
    {
      id: 'hotel-mgmt',
      name: 'Hotel Management',
      icon: '🏨',
      short: 'Enterprise System',
      underDev: false,
      description: 'An enterprise hotel management system built with Java Swing and MySQL. Features admin dashboard, room allocation engine, and comprehensive employee and customer management.',
      tech: ['Java Swing', 'MySQL', 'JDBC', 'Admin Panel', 'Enterprise'],
      features: [
        'Admin dashboard with analytics',
        'Intelligent room allocation system',
        'Employee management module',
        'Customer records & booking management',
        'MySQL relational database backend',
      ],
    },
  ];

  // ─── SKILLS DATA ───
  const skills = {
    lang: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'HTML/CSS', 'React', 'Next.js', 'Node.js', 'Express', 'tRPC', 'Tailwind CSS', 'Three.js'],
    ai: ['Gemini API', 'OpenAI', 'Whisper', 'LangChain', 'NLP', 'STT / TTS', 'LLM Pipelines', 'Voice AI', 'Decision AI'],
    tools: ['Git', 'Docker', 'MySQL', 'TiDB', 'MongoDB', 'WebRTC', 'Socket.io', 'WebSocket', 'EmailJS', 'Figma', 'VS Code', 'Linux'],
  };

  // ─── DOM REFS ───
  const landing = document.getElementById('landing');
  const enterBtn = document.getElementById('enter-btn');
  const mainExp = document.getElementById('main-experience');
  const orbitSystem = document.getElementById('orbit-system');
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalTag = document.getElementById('modal-tag');
  const modalDesc = document.getElementById('modal-desc');
  const modalTech = document.getElementById('modal-tech');
  const modalFeatures = document.getElementById('modal-features');
  const navLinks = document.querySelectorAll('.nav-link');

  // ─── LANDING → MAIN TRANSITION ───
  enterBtn.addEventListener('click', () => {
    // Trigger galaxy zoom
    if (window.galaxyState) {
      window.galaxyState.entryZoom = true;
      window.galaxyState.entryZoomProgress = 0;
    }
    landing.classList.add('exit');
    setTimeout(() => {
      landing.style.display = 'none';
      mainExp.classList.remove('hidden');
      // Animate sections in
      document.querySelectorAll('.section').forEach((s, i) => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(40px)';
        s.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        setTimeout(() => {
          s.style.opacity = '1';
          s.style.transform = 'translateY(0)';
        }, 200 + i * 150);
      });
    }, 900);
  });

  // ─── ORBITAL PROJECT SYSTEM ───
  let orbitAngle = 0;
  const nodeElements = [];

  // Create project nodes
  projects.forEach((proj, idx) => {
    const node = document.createElement('div');
    node.className = 'project-node glass-panel';
    node.dataset.projectId = proj.id;
    node.innerHTML = `
      <span class="project-node-icon">${proj.icon}</span>
      <span class="project-node-name">${proj.name}</span>
      <span class="project-node-sub">${proj.short}</span>
      ${proj.underDev ? '<span class="project-node-tag">In Dev</span>' : ''}
    `;
    node.addEventListener('click', () => openModal(proj));
    orbitSystem.appendChild(node);
    nodeElements.push({ el: node, idx, angle: (idx / projects.length) * Math.PI * 2 });
  });

  function getOrbitRadius() {
    const w = orbitSystem.offsetWidth;
    return w * 0.42;
  }

  function positionNodes() {
    const cx = orbitSystem.offsetWidth / 2;
    const cy = orbitSystem.offsetHeight / 2;
    const radius = getOrbitRadius();

    nodeElements.forEach((n) => {
      const a = n.angle + orbitAngle;
      const x = cx + Math.cos(a) * radius - n.el.offsetWidth / 2;
      const y = cy + Math.sin(a) * radius - n.el.offsetHeight / 2;

      // Depth simulation
      const depth = (Math.sin(a) + 1) / 2; // 0 (far) to 1 (near)
      const scale = 0.7 + depth * 0.35;
      const opacity = 0.5 + depth * 0.5;

      n.el.style.left = x + 'px';
      n.el.style.top = y + 'px';
      n.el.style.transform = `scale(${scale})`;
      n.el.style.opacity = opacity;
      n.el.style.zIndex = Math.round(depth * 10);
    });
  }

  // Scroll-driven rotation
  let scrollAccumulator = 0;
  window.addEventListener('scroll', () => {
    scrollAccumulator = 0.008;
  });

  // Orbit animation loop
  function animateOrbit() {
    requestAnimationFrame(animateOrbit);
    // Auto rotation
    orbitAngle += 0.001;
    // Scroll boost
    orbitAngle += scrollAccumulator;
    scrollAccumulator *= 0.92; // decay
    positionNodes();
  }

  // Start orbit after entering
  const orbitObserver = new MutationObserver(() => {
    if (!mainExp.classList.contains('hidden')) {
      positionNodes();
      animateOrbit();
      orbitObserver.disconnect();
    }
  });
  orbitObserver.observe(mainExp, { attributes: true, attributeFilter: ['class'] });

  // ─── PROJECT MODAL ───
  function openModal(proj) {
    modalTitle.textContent = proj.name;
    modalDesc.textContent = proj.description;

    if (proj.underDev) {
      modalTag.classList.remove('hidden');
    } else {
      modalTag.classList.add('hidden');
    }

    modalTech.innerHTML = proj.tech.map(t => `<span class="tech-badge">${t}</span>`).join('');
    modalFeatures.innerHTML = proj.features.map(f => `<li>${f}</li>`).join('');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (window.galaxyState) window.galaxyState.baseRotationSpeed = 0.0003;
  }

  modalClose.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ─── SKILLS TAGS ───
  function renderSkills(containerId, skillList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    skillList.forEach((skill, i) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      tag.style.animationDelay = `${i * 0.06}s`;
      container.appendChild(tag);
    });
  }

  renderSkills('skill-tags-lang', skills.lang);
  renderSkills('skill-tags-ai', skills.ai);
  renderSkills('skill-tags-tools', skills.tools);

  // ─── NAV ACTIVE STATE ───
  const sections = document.querySelectorAll('.section');

  function updateNav() {
    let current = '';
    sections.forEach(s => {
      const top = s.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.5) {
        current = s.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateNav);

  // ─── INTERSECTION OBSERVER FOR SECTION ANIMATIONS ───
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(40px)';
    s.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    sectionObserver.observe(s);
  });

  // ─── CHATBOT LOGIC ───
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatMessages = document.getElementById('chat-messages');

  const botResponses = [
    {
      keywords: ['hire', 'contact', 'email', 'message', 'reach', 'touch', 'custom', 'freelance', 'job', 'contract', 'collaboration', 'make', 'create'],
      response: "That sounds like a great opportunity! You can drop your message on the right — I’ll make sure it reaches her directly so you can discuss the details!"
    },
    {
      keywords: ['thinkmate', 'decision', 'ai assistant'],
      response: "ThinkMate is an AI decision assistant that uses structured reasoning. It integrates Whisper for voice input and can even generate diagrams to visualize complex thoughts. It's built on React 19 and Express."
    },
    {
      keywords: ['voice', 'pipeline', 'audio'],
      response: "That project is actually one of the most technically challenging ones! It handles real-time audio streaming via WebSockets with a complete STT → LLM → TTS pipeline and intelligent interruption control."
    },
    {
      keywords: ['skill', 'tech', 'stack', 'language'],
      response: "Akanshi's tech stack is broad and deep: React, Next.js, Node.js, Express, Python, and Java. On the AI side, she works with Gemini API, Whisper, and LLM pipelines. Have a specific tech requirement?"
    },
    {
      keywords: ['project', 'work', 'build', 'made', 'portfolio'],
      response: "I've built several core systems. Notably, ThinkMate (an AI decision assistant), a Real-Time Voice Conversation pipeline with sub-second latency, and a full-stack SmartBanker application. What specific area are you interested in?"
    },
    {
      keywords: ['hello', 'hi', 'hey'],
      response: "Hello! I'm here to answer any questions about Akanshi's engineering work. What would you like to know?"
    },
    {
      keywords: ['who are you', 'what are you', 'name'],
      response: "I'm a simulated AI assistant designed to showcase Akanshi's conversational design patterns while giving you quick info about her work."
    },
    {
      keywords: ['okay', 'ok', 'alright', 'thanks', 'cool', 'got it', 'sure', 'thank you'],
      response: "Have a great day! Let me know if you have any other questions or if you'd like to get in touch with Akanshi."
    }
  ];

  function getBotResponse(input) {
    const text = input.toLowerCase();
    for (let item of botResponses) {
      if (item.keywords.some(kw => text.includes(kw))) {
        return item.response;
      }
    }
    return "That's an interesting question. While I'm just a simulation, Akanshi would love to discuss that with you. Feel free to use the contact form on the right!";
  }

  function appendMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    msgDiv.innerHTML = `<span class="message-text">${text}</span>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function simulateBotTyping(callback) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing';
    typingDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      typingDiv.remove();
      callback();
    }, 1200 + Math.random() * 800); // 1.2 to 2 seconds typing
  }

  function handleChatSubmit() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    appendMessage(text, true);
    chatInput.value = '';
    
    simulateBotTyping(() => {
      const response = getBotResponse(text);
      appendMessage(response, false);
      
      // Subtle pulse on bot reply
      const lastMsg = chatMessages.lastElementChild;
      if (lastMsg) {
        lastMsg.animate([
          { boxShadow: '0 0 0px rgba(139, 92, 246, 0)' },
          { boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' },
          { boxShadow: '0 0 0px rgba(139, 92, 246, 0)' }
        ], { duration: 1500, easing: 'ease-out' });
      }
    });
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', handleChatSubmit);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleChatSubmit();
    });
  }

  // ─── FOCUS OBSERVERS ───
  const aboutSection = document.getElementById('about-section');
  const projectsSection = document.getElementById('projects-section');
  const contactSection = document.getElementById('contact-section');
  const learningSection = document.getElementById('learning-section');
  const galaxyCanvas = document.getElementById('galaxy-canvas');
  
  const focusObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === aboutSection) {
          if (window.galaxyState) window.galaxyState.baseRotationSpeed = 0.00002; // almost static
          if (galaxyCanvas) galaxyCanvas.classList.add('galaxy-faded');
        } else if (entry.target === projectsSection) {
          if (window.galaxyState) window.galaxyState.baseRotationSpeed = 0.0003; // normal
          if (galaxyCanvas) galaxyCanvas.classList.remove('galaxy-faded');
        } else {
          // contact or learning
          if (window.galaxyState) window.galaxyState.baseRotationSpeed = 0.00008; // slow focus mode
          if (galaxyCanvas) galaxyCanvas.classList.remove('galaxy-faded');
        }
      }
    });
  }, { threshold: 0.2 });
  
  if (aboutSection) focusObserver.observe(aboutSection);
  if (projectsSection) focusObserver.observe(projectsSection);
  if (contactSection) focusObserver.observe(contactSection);
  if (learningSection) focusObserver.observe(learningSection);

  // ─── RESIZE HANDLER ───
  window.addEventListener('resize', () => {
    positionNodes();
  });

})();

// ─── TOAST NOTIFICATION ───
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i>${type === 'success' ? '✓' : '✗'}</i> <span>${message}</span>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fadeOut');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400); // Wait for animation
  }, 4000);
}

// ─── EMAILJS SEND FUNCTION (GLOBAL) ───
function sendMail(e) {
  e.preventDefault();

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const btn = document.getElementById('contact-submit-btn');

  // Input validation
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  // Set loading state
  const originalText = btn.querySelector('.submit-text').textContent;
  btn.querySelector('.submit-text').textContent = 'Sending...';
  btn.disabled = true;

  emailjs.send("service_sy8ynt9", "template_646ezor", {
    from_name: name,
    reply_to: email,
    message: message,
  })
  .then(() => {
    showToast('Message sent successfully! 🚀', 'success');
    document.getElementById('contact-form').reset();
  })
  .catch((error) => {
    console.error('EmailJS Error:', error);
    showToast('Failed to send. Please try again. ❌', 'error');
  })
  .finally(() => {
    // Restore button state
    btn.querySelector('.submit-text').textContent = originalText;
    btn.disabled = false;
  });
}
