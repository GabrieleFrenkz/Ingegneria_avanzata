#!/bin/bash

echo "=========================================="
echo "  TEST GESTIONE ERRORI - E-COMMERCE API"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contatori
PASS=0
FAIL=0

function test_endpoint() {
    local name=$1
    local expected_status=$2
    local method=$3
    local endpoint=$4
    local data=$5
    local token=$6

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Test: $name${NC}"
    echo -e "${BLUE}Endpoint: $method $endpoint${NC}"

    # Costruisci il comando curl
    if [ -z "$data" ]; then
        if [ -z "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token")
        fi
    else
        if [ -z "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data")
        fi
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    # Verifica status code
    if [ "$http_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status: $http_code (Expected: $expected_status)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} - Expected: $expected_status, Got: $http_code"
        ((FAIL++))
    fi

    # Mostra risposta formattata
    echo -e "${BLUE}Response:${NC}"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    echo ""
}

# Verifica che il server sia in esecuzione
echo "Verifico che il server Rails sia in esecuzione..."
if ! curl -s "$BASE_URL/up" > /dev/null 2>&1; then
    echo -e "${RED}✗ ERRORE: Il server Rails non risponde su $BASE_URL${NC}"
    echo "Assicurati che il server sia avviato con: rails server"
    exit 1
fi
echo -e "${GREEN}✓ Server Rails attivo${NC}"
echo ""

# ============================================
# TEST 400 - Bad Request
# ============================================
test_endpoint \
    "400 - Bad Request (Parametro Mancante)" \
    "400" \
    "POST" \
    "/api/login" \
    '{}'

# ============================================
# TEST 401 - Unauthorized
# ============================================
test_endpoint \
    "401 - Unauthorized (Nessun Token)" \
    "401" \
    "GET" \
    "/api/cart"

test_endpoint \
    "401 - Unauthorized (Credenziali Errate)" \
    "401" \
    "POST" \
    "/api/login" \
    '{"user":{"email":"wrong@test.com","password":"wrongpassword"}}'

# ============================================
# TEST 403 - Forbidden (richiede registrazione)
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Preparazione Test 403: Registrazione utente normale...${NC}"

# Registra utente di test
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/register" \
    -H "Content-Type: application/json" \
    -d '{
        "user": {
            "email": "test_'$RANDOM'@example.com",
            "password": "password123",
            "password_confirmation": "password123",
            "first_name": "Test",
            "last_name": "User"
        }
    }')

# Estrai token
USER_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$USER_TOKEN" ]; then
    echo -e "${RED}✗ Impossibile ottenere token utente. Salto test 403.${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Token utente ottenuto${NC}"
    echo ""

    test_endpoint \
        "403 - Forbidden (Utente normale tenta accesso admin)" \
        "403" \
        "GET" \
        "/api/admin/stats" \
        "" \
        "$USER_TOKEN"
fi

# ============================================
# TEST 404 - Not Found
# ============================================
test_endpoint \
    "404 - Not Found (Prodotto Inesistente)" \
    "404" \
    "GET" \
    "/api/products/nonexistent_product_id_12345"

# ============================================
# TEST 422 - Unprocessable Entity
# ============================================
test_endpoint \
    "422 - Validation Failed (Email Invalida)" \
    "422" \
    "POST" \
    "/api/register" \
    '{
        "user": {
            "email": "invalid-email",
            "password": "123",
            "password_confirmation": "123",
            "first_name": "",
            "last_name": ""
        }
    }'

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "=========================================="
echo "           TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "Total:  $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ Tutti i test sono passati!${NC}"
    echo ""
    echo "Status HTTP verificati:"
    echo "  ✓ 400 Bad Request"
    echo "  ✓ 401 Unauthorized"
    echo "  ✓ 403 Forbidden"
    echo "  ✓ 404 Not Found"
    echo "  ✓ 422 Unprocessable Entity"
    exit 0
else
    echo -e "${RED}✗ Alcuni test sono falliti${NC}"
    echo "Controlla i log di Rails per maggiori dettagli."
    exit 1
fi
