# Get first product
$products = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET -UseBasicParsing | ConvertFrom-Json
$firstProduct = $products.data.products[0]
Write-Host "Product: $($firstProduct.name)"

# Get first variant from first product
$firstVariant = $firstProduct.variants[0]
$variantId = $firstVariant.id
Write-Host "Variant ID: $variantId"

# Get initial cart (to get session ID)
$cartResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method GET -UseBasicParsing
$sessionId = $cartResponse.Headers['x-session-id']
Write-Host "Session ID from initial cart: $sessionId"

# Add item to cart
$headers = @{ 'X-Session-Id' = $sessionId }
$addResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart/items" -Method POST -Headers $headers -ContentType "application/json" -Body "{`"variantId`": `"$variantId`", `"quantity`": 1}" -UseBasicParsing
Write-Host "Add to cart response status: $($addResponse.StatusCode)"
Write-Host "Response:"
$addResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
