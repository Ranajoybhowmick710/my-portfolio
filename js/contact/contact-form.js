const web3FormsEndpoint = 'https://api.web3forms.com/submit';
const configuredAccessKey = window.__PORTFOLIO_CONFIG__?.VITE_WEB3FORMS_ACCESS_KEY?.trim() || '';

export function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');
  const submitButton = form.querySelector('button[type="submit"]');
  const fields = ['name', 'email', 'subject', 'message'];
  let isSubmitting = false;

  const setError = (name, message) => {
    const error = form.querySelector(`[data-error-for="${name}"]`);
    const input = form.elements[name];
    if (error) error.textContent = message;
    input?.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const setStatus = (message, state = '') => {
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (isSubmitting) return;
    fields.forEach(name => setError(name, ''));
    let valid = true;
    fields.forEach(name => {
      const input = form.elements[name];
      if (!input.value.trim()) {
        setError(name, 'This field is required.');
        valid = false;
      } else if (name === 'email' && !input.validity.valid) {
        setError(name, 'Enter a valid email address.');
        valid = false;
      }
    });
    if (!valid) {
      setStatus('Please check the highlighted fields.', 'error');
      return;
    }
    if (!configuredAccessKey) {
      setStatus('Contact is not configured yet. Add VITE_WEB3FORMS_ACCESS_KEY to config.local.js during development.', 'error');
      return;
    }

    isSubmitting = true;
    if (submitButton) submitButton.disabled = true;
    setStatus('Sending…', 'loading');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const formData = new FormData(form);
      formData.set('access_key', configuredAccessKey);
      const response = await fetch(web3FormsEndpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();
      const trimmedResponse = responseText.trim();
      const looksLikeJson = contentType.includes('application/json') || trimmedResponse.startsWith('{') || trimmedResponse.startsWith('[');
      let payload = null;

      if (looksLikeJson && trimmedResponse) {
        try {
          payload = JSON.parse(responseText);
        } catch {
          throw new Error('The contact service returned invalid JSON.');
        }
      }

      if (!response.ok) throw new Error(`Contact request failed with status ${response.status}.`);
      if (looksLikeJson && (!payload || typeof payload !== 'object' || payload.success !== true || payload.error)) {
        throw new Error('The contact service did not confirm delivery.');
      }

      setStatus('Thanks — your message was sent.', 'success');
      form.reset();
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'The request timed out. Please try again.'
        : 'The message could not be sent. Please try again or email me directly.';
      setStatus(message, 'error');
    } finally {
      window.clearTimeout(timeout);
      isSubmitting = false;
      if (submitButton) submitButton.disabled = false;
    }
  });
}
