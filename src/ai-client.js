/**
 * AI Client - OpenAI-compatible chat/completions interface
 * Supports tool-use: LLM decides when to call web search.
 */

const WEB_SEARCH_TOOL = {
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Search the web for current/real-time information. Use this when the user asks about recent events, news, weather, prices, live data, or anything you are unsure about and that might benefit from up-to-date information.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to look up',
        },
      },
      required: ['query'],
    },
  },
};

class AIClient {
  constructor(api) {
    this.api = api;
    this.settings = { apiBaseURL: '', apiKey: '', model: '', webSearchToken: '' };
    this.history = [];
    this.systemPrompt = '';
  }

  loadPetConfig(config) {
    this.systemPrompt = config.systemPrompt || '';
    this.history = [];
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  get isConfigured() {
    return !!(this.settings.apiBaseURL && this.settings.model);
  }

  get isWebSearchEnabled() {
    return !!this.settings.webSearchToken;
  }

  async chat(userMessage) {
    if (!this.isConfigured) {
      return { text: '(API not configured - open Settings from tray menu)', emotion: 'sad' };
    }

    this.history.push({ role: 'user', content: userMessage });

    if (this.history.length > 20) {
      this.history = this.history.slice(-16);
    }

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.history,
    ];

    try {
      const tools = this.isWebSearchEnabled ? [WEB_SEARCH_TOOL] : undefined;

      // First LLM call (may return tool_calls or direct answer)
      const msg = await this.api.aiChat({ messages, settings: this.settings, tools });

      // LLM wants to search the web
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        const reply = await this._handleToolCalls(messages, msg);
        this.history.push({ role: 'assistant', content: reply });
        const { text, emotion } = this._parseEmotion(reply);
        return { text, emotion };
      }

      // Direct answer (no tool call)
      const reply = msg.content || '';
      this.history.push({ role: 'assistant', content: reply });
      const { text, emotion } = this._parseEmotion(reply);
      return { text, emotion };
    } catch (err) {
      console.error('AI chat error:', err);
      return { text: `(Error: ${err.message})`, emotion: 'surprised' };
    }
  }

  /** Execute tool calls, feed results back to LLM, return final answer */
  async _handleToolCalls(messages, assistantMsg) {
    // Append assistant's tool_calls message
    messages.push(assistantMsg);

    // Execute each tool call
    for (const call of assistantMsg.tool_calls) {
      if (call.function.name === 'web_search') {
        let args;
        try { args = JSON.parse(call.function.arguments); } catch { args = { query: '' }; }
        const resultText = await this._webSearch(args.query);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: resultText || 'No results found.',
        });
      }
    }

    // Second LLM call with search results
    const finalMsg = await this.api.aiChat({ messages, settings: this.settings });
    return finalMsg.content || '';
  }

  /** Call PPIO web search API and format results as a text string */
  async _webSearch(query) {
    try {
      const data = await this.api.webSearch({
        query,
        token: this.settings.webSearchToken,
      });

      const parts = [];

      // PPIO response: { code, data: { webPages: { value: [...] } } }
      const inner = data.data || data;
      const results = inner.webPages?.value || inner.results || inner.web?.results || [];
      if (Array.isArray(results) && results.length > 0) {
        results.forEach((r, i) => {
          const title = r.name || r.title || '';
          const snippet = r.snippet || r.description || '';
          const url = r.displayUrl || r.url || r.link || '';
          if (title || snippet) {
            parts.push(`[${i + 1}] ${title}${url ? ' - ' + url : ''}\n    ${snippet}`);
          }
        });
      }

      // Summary field (if PPIO returns one at top level)
      if (inner.summary) {
        parts.unshift('Summary: ' + inner.summary);
      }

      return parts.length > 0 ? parts.join('\n') : '';
    } catch (err) {
      console.warn('Web search failed:', err.message);
      return 'Web search failed: ' + err.message;
    }
  }

  _parseEmotion(text) {
    const match = text.match(/\[emotion:(\w+)\]/);
    if (match) {
      return {
        text: text.replace(/\[emotion:\w+\]\s*/g, '').trim(),
        emotion: match[1].toLowerCase(),
      };
    }
    const lower = text.toLowerCase();
    if (/inhale|take this|breathe.*(fire|flame)|blue blaster/i.test(text)) return { text, emotion: 'attack' };
    if (/haha|yay|great|awesome|love|poyo.*!|❤|😊|🎉|太好了|开心|喜欢/.test(lower)) return { text, emotion: 'happy' };
    if (/wow|whoa|really\??|no way|😱|😮|天啊|什么/.test(lower)) return { text, emotion: 'surprised' };
    if (/grr|angry|mad|hate|😡|生气|讨厌/.test(lower)) return { text, emotion: 'angry' };
    if (/sad|sorry|miss|cry|😢|😭|难过|伤心/.test(lower)) return { text, emotion: 'sad' };
    if (/um+|shy|blush|embarrass|😳|害羞/.test(lower)) return { text, emotion: 'shy' };
    if (/hi|hello|hey|welcome|你好|嗨/.test(lower)) return { text, emotion: 'greeting' };
    if (/!{2,}|excited|amazing|incredible|太棒|兴奋/.test(lower)) return { text, emotion: 'excited' };
    return { text, emotion: 'neutral' };
  }

  clearHistory() {
    this.history = [];
  }
}
