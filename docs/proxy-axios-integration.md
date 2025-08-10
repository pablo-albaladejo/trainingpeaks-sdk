# Integración de Proxies con Axios para Tests de Integración

Este sistema permite integrar automáticamente proxies gratuitos en los tests de integración existentes, sin necesidad de modificar la lógica de negocio.

## 🎯 Características

- ✅ **Integración transparente** con axios existente
- ✅ **Activación por variable de entorno** (`USE_PROXY=true`)
- ✅ **Fallback automático** a conexión directa si falla el proxy
- ✅ **Selección aleatoria** de proxies en cada petición
- ✅ **Validación automática** de proxies antes de usarlos
- ✅ **Reintentos automáticos** con diferentes proxies

## 🚀 Uso Rápido

### 1. Habilitar Proxies en Tests

```bash
# Ejecutar todos los tests de integración con proxy
USE_PROXY=true npm run test:integration

# Ejecutar test específico con proxy
USE_PROXY=true npm run test:integration:login-proxy
```

### 2. Scripts Disponibles

```bash
# Tests con proxy habilitado
npm run test:integration:with-proxy

# Test específico de login con proxy
npm run test:integration:login-proxy

# Ejemplo de uso
node scripts/example-proxy-axios.js
```

## 📖 API Principal

### `createIntegrationTestAxios(config)`

Crea una instancia de axios con soporte para proxies optimizada para tests de integración.

```typescript
import { createIntegrationTestAxios } from '@/shared/utils/proxy-axios';

const proxyAxios = createIntegrationTestAxios({
  enableProxy: process.env.USE_PROXY === 'true',
  maxProxies: 10,
  validateProxy: true,
  maxRetries: 2,
});
```

### `createProxyAxios(config)`

Crea una instancia de axios con soporte completo para proxies.

```typescript
import { createProxyAxios } from '@/shared/utils/proxy-axios';

const proxyAxios = createProxyAxios({
  enableProxy: true,
  maxProxies: 50,
  minSpeed: 10000,
  countries: ['us', 'uk'],
  protocols: ['http', 'https'],
});
```

## 🔧 Integración en Tests Existentes

### Ejemplo 1: Integración Básica

```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import { createTrainingPeaksClient } from '@/adapters/client/training-peaks-client';
import { createIntegrationTestAxios } from '@/shared/utils/proxy-axios';

describe('TrainingPeaks Integration Tests', () => {
  let client: ReturnType<typeof createTrainingPeaksClient>;

  beforeEach(() => {
    // ⚠️ SECURITY: Create separate axios instances for auth vs other requests
    const directAxios = createIntegrationTestAxios({
      enableProxy: false, // Direct connection for authentication
    });
    
    const proxyAxios = createIntegrationTestAxios({
      enableProxy: process.env.USE_PROXY === 'true',
    });

    // Use direct axios for authentication, proxy axios for other requests
    client = createTrainingPeaksClient({
      httpClient: directAxios,        // Authentication requests
      dataHttpClient: proxyAxios,     // Data requests (workouts, etc.)
      debug: { enabled: true },
    });
    
    // 🔒 SECURITY NOTE: When using debug logging, ensure logs do not contain
    // sensitive information such as tokens, passwords, or personally identifiable
    // information (PII) when using separate axios instances
  });

  it('should login successfully via direct connection', async () => {
    // This will use the direct connection (no proxy)
    const result = await client.login(username, password);
    expect(result.success).toBe(true);
  });
});
```

### Ejemplo 2: Testing de Proxy

```typescript
import {
  testProxyConnection,
  getProxiedIPFromAxios,
} from '@/shared/utils/proxy-axios';

it('should test proxy before running tests', async () => {
  const proxyAxios = createIntegrationTestAxios();

  // Testear conexión proxy
  const isWorking = await testProxyConnection(proxyAxios);

  if (process.env.USE_PROXY === 'true') {
    if (isWorking) {
      const ip = await getProxiedIPFromAxios(proxyAxios);
      console.log(`✅ Proxy working! IP: ${ip}`);
    } else {
      console.log('⚠️ Proxy not working, continuing without proxy');
    }
  }

  expect(typeof isWorking).toBe('boolean');
});
```

### Ejemplo 3: Múltiples Requests con Diferentes Proxies

```typescript
it('should make multiple requests using different proxies', async () => {
  const proxyAxios = createIntegrationTestAxios();
  const requests = [];

  // Hacer múltiples peticiones para usar diferentes proxies
  for (let i = 0; i < 3; i++) {
    requests.push(proxyAxios.get('https://api.ipify.org?format=json'));
  }

  const results = await Promise.all(requests);

  // Verificar que obtuvimos diferentes IPs
  const ips = results.filter((r) => r.status === 200).map((r) => r.data.ip);

  const uniqueIPs = new Set(ips);
  console.log(`Unique IPs: ${uniqueIPs.size}/${ips.length}`);

  expect(uniqueIPs.size).toBeGreaterThan(1);
});
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Habilitar proxies
USE_PROXY=true

# Configuración adicional (opcional)
PROXY_MAX_RETRIES=3
PROXY_TIMEOUT=15000
PROXY_VALIDATE=true
```

### Configuración del ProxyAxios

```typescript
interface ProxyAxiosConfig {
  enableProxy?: boolean; // Habilitar/deshabilitar proxy
  proxySources?: string[]; // Fuentes de proxies
  maxProxies?: number; // Máximo número de proxies
  minSpeed?: number; // Velocidad mínima en ms
  countries?: string[]; // Filtro por países
  protocols?: ('http' | 'https')[]; // Protocolos permitidos
  updateInterval?: number; // Intervalo de actualización
  validateProxy?: boolean; // Validar proxy antes de usar
  maxRetries?: number; // Máximo de reintentos
  retryDelay?: number; // Delay entre reintentos
}
```

## 🔍 Funciones de Utilidad

### `testProxyConnection(axiosInstance)`

Testea si el proxy está funcionando correctamente.

```typescript
import { testProxyConnection } from '@/shared/utils/proxy-axios';

const isWorking = await testProxyConnection(proxyAxios);
if (isWorking) {
  console.log('✅ Proxy working correctly');
} else {
  console.log('❌ Proxy not working');
}
```

### `getProxiedIPFromAxios(axiosInstance)`

Obtiene la IP actual a través del proxy.

```typescript
import { getProxiedIPFromAxios } from '@/shared/utils/proxy-axios';

const ip = await getProxiedIPFromAxios(proxyAxios);
if (ip) {
  console.log(`Current IP: ${ip}`);
}
```

### `axiosInstance.getProxyStats()`

Obtiene estadísticas de los proxies disponibles.

```typescript
const stats = await proxyAxios.getProxyStats();
console.log('Proxy stats:', {
  total: stats.total,
  working: stats.working,
  averageSpeed: stats.averageSpeed,
});
```

## 🧪 Testing

### Ejecutar Tests con Proxy

```bash
# Todos los tests de integración con proxy
USE_PROXY=true npm run test:integration

# Test específico con proxy
USE_PROXY=true npm run test:integration:login-proxy

# Test sin proxy (por defecto)
npm run test:integration
```

### Verificar Funcionamiento

```bash
# Test rápido del sistema de proxy
node scripts/example-proxy-axios.js test

# Obtener IP actual
node scripts/example-proxy-axios.js ip

# Ver estadísticas
node scripts/example-proxy-axios.js stats
```

## 🔄 Comportamiento de Fallback

El sistema incluye un comportamiento de fallback robusto:

1. **Intenta con proxy** si está habilitado
2. **Valida el proxy** antes de usarlo
3. **Reintenta con otro proxy** si falla
4. **Fallback a conexión directa** si todos los proxies fallan
5. **Logs informativos** del proceso

### Ejemplo de Fallback

```typescript
const proxyAxios = createIntegrationTestAxios({
  enableProxy: true,
  maxRetries: 3,
  validateProxy: true,
});

// Si todos los proxies fallan, hará la petición directamente
const response = await proxyAxios.get('https://api.example.com');
```

## 📊 Monitoreo y Debugging

### Logs Automáticos

El sistema genera logs automáticos:

```
Making request through proxy 192.168.1.100:8080
Attempt 1 failed: Connection timeout
Making request through proxy 10.0.0.50:3128
✅ Request successful through 10.0.0.50:3128
```

### Información del Proxy

```typescript
const proxy = proxyAxios.getCurrentProxy();
if (proxy) {
  console.log(`Using proxy: ${proxy.ip}:${proxy.port} (${proxy.protocol})`);
}
```

## ⚠️ Consideraciones

### Limitaciones

- Los proxies gratuitos pueden ser inestables
- Velocidad variable dependiendo del proxy
- Algunos proxies pueden estar bloqueados
- No garantiza anonimidad completa

### Mejores Prácticas

1. **Usar timeouts apropiados** (15-30 segundos)
2. **Configurar reintentos** (2-3 intentos)
3. **Validar proxies** antes de usarlos
4. **Manejar errores** graciosamente
5. **No depender** de proxies para funcionalidad crítica

### Configuración Recomendada para Tests

```typescript
const testProxyAxios = createIntegrationTestAxios({
  enableProxy: process.env.USE_PROXY === 'true',
  maxProxies: 10,
  minSpeed: 15000, // 15 segundos
  validateProxy: true,
  maxRetries: 2,
  retryDelay: 1000,
});
```

## 🔗 Integración con TrainingPeaks Client

### Uso en Cliente Existente

```typescript
import { createTrainingPeaksClient } from '@/adapters/client/training-peaks-client';
import { createIntegrationTestAxios } from '@/shared/utils/proxy-axios';

// Crear cliente con proxy
const proxyAxios = createIntegrationTestAxios();
const client = createTrainingPeaksClient({
  httpClient: proxyAxios,
  debug: { enabled: true },
});

// Usar normalmente
const result = await client.login(username, password);
```

### Testing de Rate Limiting

```typescript
it('should test rate limiting from different IPs', async () => {
  const proxyAxios = createIntegrationTestAxios();
  const client = createTrainingPeaksClient({ httpClient: proxyAxios });

  const requests = Array.from({ length: 10 }, () => client.getUser());

  const results = await Promise.all(requests);
  const successful = results.filter((r) => r.success);

  expect(successful.length).toBeGreaterThan(5);
});
```

## 📝 Scripts Disponibles

| Comando                                     | Descripción               |
| ------------------------------------------- | ------------------------- |
| `npm run test:integration:with-proxy`       | Todos los tests con proxy |
| `npm run test:integration:login-proxy`      | Test de login con proxy   |
| `node scripts/example-proxy-axios.js`       | Ejemplo completo          |
| `node scripts/example-proxy-axios.js test`  | Test rápido               |
| `node scripts/example-proxy-axios.js ip`    | Obtener IP                |
| `node scripts/example-proxy-axios.js stats` | Estadísticas              |

## 🎯 Casos de Uso

### 1. Testing de Geolocalización

```typescript
it('should test API behavior from different locations', async () => {
  const proxyAxios = createIntegrationTestAxios({
    countries: ['us', 'uk', 'de'],
  });

  const client = createTrainingPeaksClient({ httpClient: proxyAxios });
  const result = await client.getUser();

  expect(result.success).toBe(true);
});
```

### 2. Testing de Rate Limiting

```typescript
it('should test rate limiting with multiple IPs', async () => {
  const proxyAxios = createIntegrationTestAxios();
  const client = createTrainingPeaksClient({ httpClient: proxyAxios });

  // Hacer múltiples requests rápidos
  const promises = Array.from({ length: 20 }, () => client.getUser());

  const results = await Promise.all(promises);
  const successful = results.filter((r) => r.success);

  // Debería tener éxito con diferentes IPs
  expect(successful.length).toBeGreaterThan(10);
});
```

### 3. Testing de Disponibilidad

```typescript
it('should test API availability from different networks', async () => {
  const proxyAxios = createIntegrationTestAxios();
  const client = createTrainingPeaksClient({ httpClient: proxyAxios });

  const result = await client.login(username, password);

  // Debería funcionar independientemente del proxy
  expect(result.success).toBe(true);
});
```
