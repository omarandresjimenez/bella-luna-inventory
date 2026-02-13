#!/bin/bash
# Script to create test customer account

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "name": "Test Customer"
  }' \
  -v

echo ""
echo "Test account creation request sent!"
echo "Credentials:"
echo "  Email: customer@example.com"
echo "  Password: password123"
