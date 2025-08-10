# Sistema de Proxies para Tests de Integración

Este sistema permite hacer peticiones HTTP desde IPs aleatorias usando proxies gratuitos, ideal para testing de integración que requiera simular peticiones desde diferentes ubicaciones geográficas.

## 🎯 Características

- ✅ **Descarga automática** de listas de proxies gratuitos
- ✅ **Selección aleatoria** de proxies en cada petición
- ✅ **Integración con axios** y agentes de proxy
- ✅ **Manejo de errores** y reintentos automáticos
- ✅ **Validación de proxies** antes de usarlos
- ✅ **Estadísticas** y monitoreo de rendimiento
- ✅ **Configuración flexible** por país, protocolo, velocidad

## 🚀 Uso Rápido

### Instalación de Dependencias

```bash
npm install
```

### Ejecutar Tests con Proxies

```bash
# Tests de integración con proxies
npm run test:integration:proxy

# Ejemplo de uso
node scripts/example-proxy-usage.js
```

## 📖 API Principal

### `makeProxiedRequest(config)`

Función principal para hacer peticiones a través de proxies.

```typescript
import { makeProxiedRequest } from '@/shared/utils/proxy-request';

const result = await makeProxiedRequest({
  url: 'https://api.ipify.org?format=json',
  method: 'GET',
  timeout: 15000,
  maxRetries: 3,
});

if (result.success) {
  console.log(`IP: ${result.data.ip}`);
  console.log(`Proxy: ${result.proxy.ip}:${result.proxy.port}`);
  console.log(`Response time: ${result.responseTime}ms`);
}
```

### `getProxiedIP(config)`

Función especializada para obtener la IP actual a través de un proxy.

```typescript
import { getProxiedIP } from '@/shared/utils/proxy-request';

const result = await getProxiedIP({
  timeout: 15000,
  maxRetries: 2,
});

if (result.success) {
  console.log(`Current IP: ${result.data.ip}`);
}
```

## ⚙️ Configuración

### Configuración del ProxyManager

```typescript
import { ProxyManager } from '@/shared/utils/proxy-request';

const proxyManager = new ProxyManager({
  sources: [
    'https://www.proxy-list.download/api/v1/get?type=https',
    'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
  ],
  maxProxies: 100,
  minSpeed: 1000, // ms
  countries: ['us', 'uk', 'de'],
  protocols: ['http', 'https'],
  updateInterval: 5 * 60 * 1000, // 5 minutos
});
```

### Opciones de Configuración

| Opción           | Tipo                    | Default             | Descripción                       |
| ---------------- | ----------------------- | ------------------- | --------------------------------- |
| `sources`        | `string[]`              | Lista predefinida   | URLs de fuentes de proxies        |
| `maxProxies`     | `number`                | 100                 | Máximo número de proxies a cargar |
| `minSpeed`       | `number`                | 1000                | Velocidad mínima en ms            |
| `countries`      | `string[]`              | `[]`                | Filtro por países                 |
| `protocols`      | `('http' \| 'https')[]` | `['http', 'https']` | Protocolos permitidos             |
| `updateInterval` | `number`                | 300000              | Intervalo de actualización en ms  |

### Configuración de Peticiones

```typescript
interface ProxyRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  validateProxy?: boolean;
}
```

## 🔧 Ejemplos de Uso

### Ejemplo 1: Petición Básica

```typescript
import { makeProxiedRequest } from '@/shared/utils/proxy-request';

const result = await makeProxiedRequest({
  url: 'https://httpbin.org/json',
  timeout: 15000,
  maxRetries: 3,
});

if (result.success) {
  console.log('Response:', result.data);
  console.log('Proxy used:', result.proxy);
}
```

### Ejemplo 2: POST Request

```typescript
const result = await makeProxiedRequest({
  url: 'https://httpbin.org/post',
  method: 'POST',
  data: { message: 'Hello from proxy!' },
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
```

### Ejemplo 3: Múltiples Peticiones

```typescript
const requests = Array.from({ length: 5 }, () =>
  makeProxiedRequest({
    url: 'https://api.ipify.org?format=json',
    timeout: 15000,
  })
);

const results = await Promise.all(requests);
const ips = results.filter((r) => r.success).map((r) => r.data.ip);

console.log('Unique IPs:', new Set(ips).size);
```

### Ejemplo 4: Filtrado por País

```typescript
import { ProxyManager } from '@/shared/utils/proxy-request';

const usProxyManager = new ProxyManager({
  countries: ['us'],
  maxProxies: 20,
});

const proxy = await usProxyManager.getRandomProxy();
// Usar solo proxies de Estados Unidos
```

## 🧪 Testing

### Ejecutar Tests de Proxies

```bash
# Todos los tests de integración
npm run test:integration

# Solo tests de proxies
npm run test:integration:proxy

# Test específico
npm run test:integration:proxy -- -t "should make request through proxy"
```

### Tests Incluidos

- ✅ Carga de proxies desde fuentes
- ✅ Selección aleatoria de proxies
- ✅ Peticiones HTTP básicas
- ✅ Peticiones POST
- ✅ Manejo de errores
- ✅ Reintentos automáticos
- ✅ Validación de proxies
- ✅ Estadísticas de rendimiento
- ✅ Múltiples peticiones simultáneas

## 📊 Monitoreo y Estadísticas

### Obtener Estadísticas

```typescript
import { getProxyStats } from '@/shared/utils/proxy-request';

const stats = await getProxyStats();
console.log('Total proxies:', stats.total);
console.log('Working proxies:', stats.working);
console.log('Average speed:', stats.averageSpeed);
console.log('Countries:', stats.countries);
console.log('Protocols:', stats.protocols);
```

### Testing de Proxies

```typescript
import { testProxies } from '@/shared/utils/proxy-request';

const proxies = await proxyManager.getAllProxies();
const workingProxies = await testProxies(proxies.slice(0, 10));

console.log(`Working: ${workingProxies.length}/${proxies.length}`);
```

## 🔍 Fuentes de Proxies

El sistema incluye múltiples fuentes de proxies gratuitos:

1. **proxy-list.download** - Lista de proxies HTTPS
2. **proxyscrape.com** - API de proxies con metadatos
3. **GitHub repositories** - Listas mantenidas por la comunidad

### Agregar Nuevas Fuentes

```typescript
const customManager = new ProxyManager({
  sources: [
    'https://www.proxy-list.download/api/v1/get?type=https',
    'https://tu-fuente-personalizada.com/proxies.txt',
  ],
});
```

## ⚠️ Consideraciones

### Limitaciones

- Los proxies gratuitos pueden ser inestables
- Velocidad variable dependiendo del proxy
- Algunos proxies pueden estar bloqueados
- No garantiza anonimidad completa

### Consideraciones Legales y de Cumplimiento

- **Términos de Servicio**: Respetar los términos y condiciones de los sitios web y APIs objetivo
- **Restricciones Jurisdiccionales**: Entender las leyes locales sobre el uso de proxies en tu jurisdicción
- **Patrones de Scraping**: Evitar patrones abusivos que puedan sobrecargar los servidores objetivo
- **Rate Limiting**: Implementar límites de velocidad apropiados y backoff exponencial

### Mejores Prácticas

1. **Usar timeouts apropiados** (15-30 segundos)
2. **Configurar reintentos** (2-3 intentos)
3. **Validar proxies** antes de usarlos
4. **Manejar errores** graciosamente
5. **No depender** de proxies para funcionalidad crítica
6. **NO proxificar autenticación o PII**: Usar conexión directa para login y datos sensibles
7. **Cumplir con términos de servicio**: Respetar los términos de la API/sitio web objetivo
8. **Implementar rate limiting**: Usar backoff exponencial en fallos para evitar sobrecargar servicios

### Configuración Recomendada

```typescript
const recommendedConfig = {
  timeout: 15000,
  maxRetries: 3,
  retryDelay: 1000,
  validateProxy: true,
};
```

## 🛠️ Troubleshooting

### Problemas Comunes

#### No se cargan proxies

```bash
# Verificar conectividad
curl https://www.proxy-list.download/api/v1/get?type=https

# Revisar logs
npm run test:integration:proxy -- --verbose
```

#### Peticiones fallan

```typescript
// Aumentar timeout y reintentos
const result = await makeProxiedRequest({
  url: 'https://api.example.com',
  timeout: 30000,
  maxRetries: 5,
  retryDelay: 2000,
});
```

#### Proxies lentos

```typescript
// Filtrar por velocidad
const fastManager = new ProxyManager({
  minSpeed: 5000, // Solo proxies < 5 segundos
});
```

## 📝 Scripts Disponibles

| Comando                                     | Descripción               |
| ------------------------------------------- | ------------------------- |
| `npm run test:integration:proxy`            | Ejecutar tests de proxies |
| `node scripts/example-proxy-usage.js`       | Ejemplo completo          |
| `node scripts/example-proxy-usage.js ip`    | Obtener IP actual         |
| `node scripts/example-proxy-usage.js stats` | Ver estadísticas          |
| `node scripts/example-proxy-usage.js test`  | Test rápido               |

## 🔗 Integración con Tests Existentes

### Usar en Tests de TrainingPeaks

> ⚠️ **ADVERTENCIA DE SEGURIDAD**: Las peticiones autenticadas o con información personal identificable (PII) NO deben ser enviadas a través de proxies no confiables. Use conexiones directas para login y cualquier llamada que contenga tokens bearer para proteger datos sensibles.

```typescript
import { makeProxiedRequest } from '@/shared/utils/proxy-request';

it('should test API from different IPs', async () => {
  const result = await makeProxiedRequest({
    url: 'https://api.trainingpeaks.com/v1/user',
    headers: { Authorization: `Bearer ${token}` },
    timeout: 20000,
  });

  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
});
```

### Testing de Rate Limiting

```typescript
it('should test rate limiting from different IPs', async () => {
  const requests = Array.from({ length: 10 }, () =>
    makeProxiedRequest({
      url: 'https://api.example.com/endpoint',
      timeout: 10000,
    })
  );

  const results = await Promise.all(requests);
  const successful = results.filter((r) => r.success);

  expect(successful.length).toBeGreaterThan(5);
});
```

## 📈 Métricas y Rendimiento

El sistema incluye métricas automáticas:

- **Tiempo de respuesta** por proxy
- **Tasa de éxito** de peticiones
- **Distribución** por países
- **Velocidad promedio** de proxies
- **Número de reintentos** necesarios

Estas métricas ayudan a optimizar la configuración y selección de proxies.
