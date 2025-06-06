#!/bin/bash

# API Testing Script for Supabase Auth
# Make sure to set these variables
API_BASE_URL="http://localhost:3000"
API_KEY="dev-api-key-12345"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="Password123"

echo "🚀 Starting API Tests..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local description=$5
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "x-api-key: $API_KEY" \
                -H "$headers" \
                -d "$data")
        else
            response=$(curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "x-api-key: $API_KEY" \
                -d "$data")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "x-api-key: $API_KEY" \
                -H "$headers")
        else
            response=$(curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "x-api-key: $API_KEY")
        fi
    fi
    
    echo "Response: $response"
    
    # Check if response contains "success"
    if echo "$response" | grep -q '"status":"success"'; then
        echo -e "${GREEN}✅ PASSED${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    
    echo "--------------------------------"
}

# 1. Health Check
test_endpoint "GET" "/api/health" "" "" "Health Check"

# 2. Register User
register_data="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"repassword\":\"$TEST_PASSWORD\"}"
test_endpoint "POST" "/api/auth/register" "$register_data" "" "Register User"

# Wait a bit for email verification (in real scenario, user would click email link)
echo -e "\n${YELLOW}⏳ Waiting 2 seconds for registration to process...${NC}"
sleep 2

# 3. Login User (might fail if email not verified)
login_data="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
login_response=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$login_data")

echo -e "\n${YELLOW}Testing: Login User${NC}"
echo "Endpoint: POST /api/auth/login"
echo "Response: $login_response"

# Extract token if login successful
if echo "$login_response" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ACCESS_TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "Access Token: $ACCESS_TOKEN"
else
    echo -e "${RED}❌ FAILED (might be due to email verification required)${NC}"
    ACCESS_TOKEN=""
fi
echo "--------------------------------"

# 4. Get User Info (if we have token)
if [ -n "$ACCESS_TOKEN" ]; then
    test_endpoint "GET" "/api/auth/me" "" "Authorization: Bearer $ACCESS_TOKEN" "Get User Info"
    
    # 5. Change Password
    change_password_data="{\"current_password\":\"$TEST_PASSWORD\",\"new_password\":\"NewPassword123\",\"confirm_password\":\"NewPassword123\"}"
    test_endpoint "POST" "/api/auth/change-password" "$change_password_data" "Authorization: Bearer $ACCESS_TOKEN" "Change Password"
    
    # 6. Logout
    test_endpoint "POST" "/api/auth/logout" "" "Authorization: Bearer $ACCESS_TOKEN" "Logout User"
else
    echo -e "\n${YELLOW}⚠️  Skipping authenticated endpoints (no access token)${NC}"
fi

# 7. Forgot Password
forgot_password_data="{\"email\":\"$TEST_EMAIL\"}"
test_endpoint "POST" "/api/auth/forgot-password" "$forgot_password_data" "" "Forgot Password"

# 8. Admin Endpoints
echo -e "\n${YELLOW}Testing Admin Endpoints...${NC}"

# List API Keys
test_endpoint "GET" "/api/admin/api-keys" "" "" "List API Keys"

# Create API Key
create_api_key_data="{\"key_name\":\"test-key\",\"permissions\":[\"auth\"]}"
test_endpoint "POST" "/api/admin/api-keys" "$create_api_key_data" "" "Create API Key"

# List Users
test_endpoint "GET" "/api/admin/users" "" "" "List Users"

# Create User
create_user_data="{\"email\":\"admin-created@example.com\",\"password\":\"AdminPassword123\",\"role_id\":1}"
test_endpoint "POST" "/api/admin/users" "$create_user_data" "" "Create User (Admin)"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "================================"
echo -e "${YELLOW}Notes:${NC}"
echo "- Some tests might fail if email verification is required"
echo "- In production, make sure to verify emails before login"
echo "- Check your Supabase logs for more details"
echo "- Default API key: $API_KEY"
