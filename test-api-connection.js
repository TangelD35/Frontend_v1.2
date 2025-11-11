/**
 * Script de prueba para verificar conexión con el backend
 * Ejecutar con: node test-api-connection.js
 */

const API_URL = 'http://localhost:8000';

// Colores para consola
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testEndpoint(name, url, options = {}) {
    try {
        const response = await fetch(`${API_URL}${url}`, options);
        const data = await response.json();
        
        if (response.ok) {
            log.success(`${name}: ${response.status}`);
            return { success: true, data };
        } else {
            log.error(`${name}: ${response.status} - ${data.detail || 'Error'}`);
            return { success: false, error: data };
        }
    } catch (error) {
        log.error(`${name}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('\n🧪 Iniciando pruebas de conexión con el backend...\n');
    
    let token = null;
    
    // 1. Test de Health Check
    log.info('1. Probando Health Check...');
    await testEndpoint('Health Check', '/health');
    
    // 2. Test de Login
    log.info('\n2. Probando Login...');
    const loginData = new URLSearchParams({
        username: 'admin',
        password: 'admin123'
    });
    
    const loginResult = await testEndpoint('Login', '/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginData
    });
    
    if (loginResult.success) {
        token = loginResult.data.access_token;
        log.success(`Token obtenido: ${token.substring(0, 20)}...`);
    } else {
        log.error('No se pudo obtener token. Abortando pruebas autenticadas.');
        return;
    }
    
    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // 3. Test de Analytics Summary
    log.info('\n3. Probando Analytics Summary...');
    await testEndpoint('Analytics Summary', '/api/v1/analytics/summary', {
        headers: authHeaders
    });
    
    // 4. Test de Player Rankings
    log.info('\n4. Probando Player Rankings...');
    await testEndpoint('Player Rankings', '/api/v1/analytics/player/ranking?metric=points&limit=5', {
        headers: authHeaders
    });
    
    // 5. Test de Trends
    log.info('\n5. Probando Trends...');
    await testEndpoint('Trends', '/api/v1/analytics/trends?type=team&metric=points', {
        headers: authHeaders
    });
    
    // 6. Test de Advanced Analytics - League Averages
    log.info('\n6. Probando Advanced Analytics - League Averages...');
    await testEndpoint('League Averages', '/api/v1/advanced-analytics/league/averages/2023', {
        headers: authHeaders
    });
    
    // 7. Test de Advanced Analytics - TS% Calculator
    log.info('\n7. Probando TS% Calculator...');
    await testEndpoint('TS% Calculator', '/api/v1/advanced-analytics/metrics/calculate/ts-percentage?points=100&fga=80&fta=20', {
        headers: authHeaders
    });
    
    // 8. Test de Advanced Analytics - eFG% Calculator
    log.info('\n8. Probando eFG% Calculator...');
    await testEndpoint('eFG% Calculator', '/api/v1/advanced-analytics/metrics/calculate/efg-percentage?fgm=40&three_pm=10&fga=80', {
        headers: authHeaders
    });
    
    // 9. Test de ML Metrics
    log.info('\n9. Probando ML Classifier Metrics...');
    await testEndpoint('ML Classifier Metrics', '/api/v1/analytics/ml/metrics/classifier', {
        headers: authHeaders
    });
    
    // 10. Test de Teams
    log.info('\n10. Probando Teams List...');
    const teamsResult = await testEndpoint('Teams List', '/api/v1/teams?limit=5', {
        headers: authHeaders
    });
    
    // 11. Test de Players
    log.info('\n11. Probando Players List...');
    await testEndpoint('Players List', '/api/v1/players?limit=5', {
        headers: authHeaders
    });
    
    // 12. Test de Tournaments
    log.info('\n12. Probando Tournaments List...');
    await testEndpoint('Tournaments List', '/api/v1/tournaments?limit=5', {
        headers: authHeaders
    });
    
    console.log('\n✅ Pruebas completadas!\n');
}

// Ejecutar pruebas
runTests().catch(console.error);
