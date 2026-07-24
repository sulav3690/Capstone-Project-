function getApiBaseUrl() {
  const configuredUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    if (configuredUrl) {
      if (configuredUrl.startsWith('/')) return configuredUrl;

      try {
        const url = new URL(configuredUrl);
        const currentHost = window.location.hostname;
        const configuredForLocalhost = ['localhost', '127.0.0.1'].includes(url.hostname);
        const accessedFromAnotherDevice = !['localhost', '127.0.0.1'].includes(currentHost);

        // Keep local development usable from phones and tablets on the same
        // network instead of pointing those devices back at themselves.
        if (configuredForLocalhost && accessedFromAnotherDevice) {
          url.hostname = currentHost;
        }
        return url.toString().replace(/\/$/, '');
      } catch {
        return configuredUrl;
      }
    }

    // Production deployments can proxy /api on the same origin.
    if (window.location.port !== '3000') return '';

    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:8010`;
  }

  return configuredUrl || 'http://127.0.0.1:8010';
}

function formatErrorDetails(details) {
  if (typeof details === 'string') {
    return details.trim();
  }

  if (Array.isArray(details)) {
    return details
      .map(formatErrorDetails)
      .filter(Boolean)
      .join(', ');
  }

  if (details && typeof details === 'object') {
    return Object.entries(details)
      .map(([field, value]) => {
        const message = formatErrorDetails(value);
        return message ? `${field}: ${message}` : '';
      })
      .filter(Boolean)
      .join('; ');
  }

  return '';
}

let refreshPromise = null;

async function request(endpoint, options = {}) {
  const API_BASE_URL = getApiBaseUrl();
  const url = `${API_BASE_URL}${endpoint}`;

  const {
    timeoutMs = 15000,
    skipAuthRefresh = false,
    ...fetchOptions
  } = options;

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {})
  };

  if (options.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  let timedOut = false;
  const callerSignal = fetchOptions.signal;
  const handleCallerAbort = () => controller.abort();

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort();
    } else {
      callerSignal.addEventListener('abort', handleCallerAbort, { once: true });
    }
  }

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const config = {
    ...fetchOptions,
    headers,
    credentials: 'include', // Important to pass HTTPOnly JWT cookies
    signal: controller.signal,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    let data = {};

    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      const responseText = await response.text().catch(() => '');
      if (responseText) {
        data = { message: responseText };
      }
    }

    if (!response.ok) {
      const detailMessage = formatErrorDetails(data?.details);
      const responseMessage = typeof data?.message === 'string' ? data.message.trim() : '';
      const errorMessage =
        (response.status >= 500 ? responseMessage || detailMessage : detailMessage || responseMessage) ||
        `Request failed with status ${response.status}${response.statusText ? ` (${response.statusText})` : ''}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;

      const canRefresh =
        response.status === 401 &&
        !skipAuthRefresh &&
        !endpoint.startsWith('/api/auth/login/') &&
        !endpoint.startsWith('/api/auth/register/') &&
        !endpoint.startsWith('/api/auth/token/refresh/');

      if (canRefresh) {
        try {
          if (!refreshPromise) {
            refreshPromise = request('/api/auth/token/refresh/', {
              method: 'POST',
              skipAuthRefresh: true,
              timeoutMs,
            }).finally(() => {
              refreshPromise = null;
            });
          }
          await refreshPromise;
          return request(endpoint, {
            ...options,
            skipAuthRefresh: true,
          });
        } catch {
          // The original 401 is more useful to callers than the refresh error.
        }
      }

      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(
        timedOut
          ? `The request took longer than ${Math.round(timeoutMs / 1000)} seconds. Please try again.`
          : 'The request was cancelled.'
      );
    }
    if (!error?.status || error.status >= 500) {
      console.error(`API Error on ${endpoint}:`, error);
    }
    if (error instanceof TypeError) {
      throw new Error(`Cannot connect to the backend API at ${API_BASE_URL}. Please make sure the backend server is running.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', handleCallerAbort);
  }
}

const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
