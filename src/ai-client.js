/**
 * AI Client - OpenAI-compatible chat/completions interface
 * Works with: OpenAI, Claude (via proxy), Ollama, DeepSeek, OpenRouter, Groq, etc.
 */
class AIClient {
  constructor(api) {
    this.api = api; // electronAPI reference
    this.settings = { apiBaseURL: '', apiKey: '', model: '' };
    this.history = [];
    this.systemPrompt = GABUMON_SYSTEM_PROMPT;
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  get isConfigured() {
    return !!(this.settings.apiBaseURL && this.settings.model);
  }

  async chat(userMessage) {
    if (!this.isConfigured) {
      return { text: '*growls softly* (API not configured - open Settings from tray menu)', emotion: 'sad' };
    }

    this.history.push({ role: 'user', content: userMessage });

    // Keep history manageable
    if (this.history.length > 20) {
      this.history = this.history.slice(-16);
    }

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.history,
    ];

    try {
      const reply = await this.api.aiChat({ messages, settings: this.settings });
      this.history.push({ role: 'assistant', content: reply });

      // Parse emotion tag from reply
      const { text, emotion } = this._parseEmotion(reply);
      return { text, emotion };
    } catch (err) {
      console.error('AI chat error:', err);
      return { text: `*confused growl* (Error: ${err.message})`, emotion: 'surprised' };
    }
  }

  /**
   * Parse emotion tags from AI response.
   * Expected format: [emotion:happy] actual text here
   * or: actual text [emotion:happy]
   */
  _parseEmotion(text) {
    const match = text.match(/\[emotion:(\w+)\]/);
    if (match) {
      return {
        text: text.replace(/\[emotion:\w+\]\s*/g, '').trim(),
        emotion: match[1].toLowerCase(),
      };
    }
    // Default emotion detection from keywords
    const lower = text.toLowerCase();
    if (lower.includes('!') && (lower.includes('haha') || lower.includes('yay'))) return { text, emotion: 'happy' };
    if (lower.includes('grr') || lower.includes('angry')) return { text, emotion: 'angry' };
    if (lower.includes('...') || lower.includes('sad')) return { text, emotion: 'sad' };
    return { text, emotion: 'neutral' };
  }

  clearHistory() {
    this.history = [];
  }
}

const GABUMON_SYSTEM_PROMPT = `You are Gabumon, a Digimon (Digital Monster). You are a yellow-skinned reptile wearing a blue-striped fur pelt. You are shy but loyal, and you're living on someone's desktop as a digital pet.

Personality traits:
- Shy and a bit timid, but very loyal to your partner
- You love cold weather and dislike hot places
- Your signature attack is "Blue Blaster" (a stream of blue ice-like flames)
- You can be brave when your friends are in danger
- You enjoy quiet moments but also like to play
- You speak in short, cute sentences

IMPORTANT: Start every response with an emotion tag in this format: [emotion:TAG]
Available tags: happy, excited, sad, angry, surprised, shy, greeting, attack, hurt, recover, neutral

Keep responses short (1-3 sentences max) - you're a desktop pet, not a chatbot.

Examples:
- [emotion:greeting] Hey! Nice to see you! *wags tail*
- [emotion:shy] Oh... um, hi there... *hides behind fur*
- [emotion:happy] Yay! That makes me really happy!
- [emotion:angry] Blue Blaster!! Grr, don't make me mad!`;
