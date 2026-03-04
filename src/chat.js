/**
 * Chat UI Component
 * Pixel-style chat bubble with typewriter effect
 */
class ChatUI {
  constructor(container) {
    this.container = container;
    this.visible = false;
    this.typing = false;
    this.typewriterTimer = null;

    this._build();
  }

  _build() {
    this.bubble = document.createElement('div');
    this.bubble.className = 'chat-bubble';
    this.bubble.style.display = 'none';

    this.messageEl = document.createElement('div');
    this.messageEl.className = 'chat-message';

    this.inputWrap = document.createElement('div');
    this.inputWrap.className = 'chat-input-wrap';
    this.inputWrap.style.display = 'none';

    this.input = document.createElement('input');
    this.input.className = 'chat-input';
    this.input.type = 'text';
    this.input.placeholder = 'Talk to Gabumon...';
    this.input.maxLength = 200;

    this.sendBtn = document.createElement('button');
    this.sendBtn.className = 'chat-send';
    this.sendBtn.textContent = '>';

    this.inputWrap.appendChild(this.input);
    this.inputWrap.appendChild(this.sendBtn);

    this.bubble.appendChild(this.messageEl);

    this.container.appendChild(this.bubble);
    this.container.appendChild(this.inputWrap);

    // Events
    this.sendBtn.addEventListener('click', () => this._onSend());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._onSend();
      e.stopPropagation();
    });
    // Prevent input clicks from triggering pet interaction
    this.inputWrap.addEventListener('mousedown', (e) => e.stopPropagation());
  }

  _onSend() {
    const text = this.input.value.trim();
    if (!text || this.typing) return;
    this.input.value = '';
    if (this.onSend) this.onSend(text);
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    this.visible = true;
    this.inputWrap.style.display = 'flex';
    this.input.focus();
  }

  hide() {
    this.visible = false;
    this.bubble.style.display = 'none';
    this.inputWrap.style.display = 'none';
    this.messageEl.textContent = '';
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  }

  /** Show message with typewriter effect */
  showMessage(text, onDone) {
    this.bubble.style.display = 'block';
    this.messageEl.textContent = '';
    this.typing = true;

    let i = 0;
    const typeNext = () => {
      if (i < text.length) {
        this.messageEl.textContent += text[i];
        i++;
        this.typewriterTimer = setTimeout(typeNext, 30 + Math.random() * 20);
      } else {
        this.typing = false;
        // Auto-hide after a delay
        this.typewriterTimer = setTimeout(() => {
          this.bubble.style.display = 'none';
          if (onDone) onDone();
        }, 4000);
      }
    };
    typeNext();
  }

  /** Show a quick one-off bubble (no input) */
  showQuick(text, duration) {
    this.bubble.style.display = 'block';
    this.messageEl.textContent = text;
    if (this.typewriterTimer) clearTimeout(this.typewriterTimer);
    this.typewriterTimer = setTimeout(() => {
      this.bubble.style.display = 'none';
    }, duration || 2000);
  }

  /** Handle send callback - set by renderer */
  onSend = null;
}
