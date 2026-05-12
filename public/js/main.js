
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const navbar = $('.navbar');

  if (navbar) {
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
  }

  const toggle = $('.navbar__toggle');
  const nav    = $('.navbar__nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    $$('.navbar__link', nav).forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  (() => {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    $$('.navbar__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  })();

  const revealEls = $$('.reveal');

  if (revealEls.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); 
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(el => observer.observe(el));
  }

  const filterBtns = $$('.filter-btn');
  const treatCards = $$('.treatment-card');

  if (filterBtns.length > 0 && treatCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const categoria = btn.dataset.filter;

        treatCards.forEach(card => {
          const match = categoria === 'todos' || card.dataset.cat === categoria;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  const form     = $('#form-contato');
  const feedback = $('#form-feedback');

  if (form && feedback) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Enviando…';
      feedback.className = 'form-feedback';
      feedback.style.display = 'none';

      const dados = {
        nome:     form.nome.value.trim(),
        email:    form.email.value.trim(),
        telefone: form.telefone.value.trim(),
        servico:  form.servico.value,
        mensagem: form.mensagem.value.trim(),
      };

      try {
        const res = await fetch('/api/contato', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(dados),
        });

        const data = await res.json();

        if (res.ok && data.sucesso) {
          feedback.textContent = '✓ ' + data.mensagem;
          feedback.className = 'form-feedback success';
          form.reset();
          feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          const errosTexto = data.erros ? data.erros.join(' • ') : (data.mensagem || 'Erro desconhecido.');
          feedback.textContent = '⚠ ' + errosTexto;
          feedback.className = 'form-feedback error';
        }

      } catch (err) {
        console.error('[Contato] Erro de rede:', err);
        feedback.textContent = '⚠ Não foi possível conectar ao servidor. Verifique sua conexão.';
        feedback.className = 'form-feedback error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  const statNumbers = $$('.stat__number[data-target]');

  if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          const dur    = 1400; 
          const step   = 16;  
          const inc    = target / (dur / step);
          let cur = 0;

          const timer = setInterval(() => {
            cur += inc;
            if (cur >= target) {
              cur = target;
              clearInterval(timer);
            }
            el.textContent = Math.floor(cur).toLocaleString('pt-BR') + suffix;
          }, step);

          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  const spinnerStyle = document.createElement('style');
  spinnerStyle.textContent = `
    .spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(spinnerStyle);

})();
