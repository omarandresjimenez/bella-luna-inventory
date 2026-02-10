import {
  Typography,
  Grid,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useProduct } from '../../hooks/useProducts';
import { useAddToCart } from '../../hooks/useCustomer';
import type { ProductVariant, VariantAttributeValueItem } from '../../types';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Alert severity="error">
        Producto no encontrado
      </Alert>
    );
  }

  const currentVariant = selectedVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
  const currentPrice = currentVariant?.price || product.finalPrice;

  const handleAddToCart = () => {
    if (currentVariant) {
      addToCart({ variantId: currentVariant.id, quantity });
    }
  };

  // Group attributes by name
  const attributesMap = new Map<string, Set<VariantAttributeValueItem>>();
  if (product.variants) {
    product.variants.forEach((variant) => {
      variant.attributeValues.forEach(({ attributeValue }) => {
        const attrName = attributeValue.attribute.displayName;
        if (!attributesMap.has(attrName)) {
          attributesMap.set(attrName, new Set());
        }
        attributesMap.get(attrName)!.add(attributeValue);
      });
    });
  }

  return (
    <Grid container spacing={4}>
      {/* Product Images */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CardMedia
          component="img"
          image={(product.images && product.images.length > 0) ? product.images[0].largeUrl : 'https://via.placeholder.com/600x800?text=No+Image'}
          alt={product.name}
          sx={{ width: '100%', borderRadius: 2 }}
        />
      </Grid>

      {/* Product Info */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h4" gutterBottom>
          {product.name}
        </Typography>

        {product.brand && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Marca: {product.brand}
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h4" color="primary">
            ${currentPrice}
          </Typography>
          {product.discountPercent > 0 && (
            <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              ${product.basePrice}
            </Typography>
          )}
          {product.discountPercent > 0 && (
            <Chip label={`-${product.discountPercent}%`} color="error" />
          )}
        </Box>

        <Typography variant="body1" paragraph>
          {product.description}
        </Typography>

        {/* Variant Selectors */}
        {Array.from(attributesMap.entries()).map(([attrName, values]) => (
          <FormControl fullWidth sx={{ mb: 2 }} key={attrName}>
            <InputLabel>{attrName}</InputLabel>
            <Select
              value={currentVariant?.attributeValues.find(
                (av) => av.attributeValue.attribute.displayName === attrName
              )?.attributeValue.id || ''}
              label={attrName}
              onChange={(e) => {
                const selectedValueId = e.target.value;
                const variant = product.variants.find((v) =>
                  v.attributeValues.some((av) => av.attributeValue.id === selectedValueId)
                );
                if (variant) setSelectedVariant(variant);
              }}
            >
              {Array.from(values).map((value) => (
                <MenuItem key={value.id} value={value.id}>
                  {value.colorHex ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: value.colorHex,
                          border: '1px solid #ccc',
                        }}
                      />
                      {value.displayValue || value.value}
                    </Box>
                  ) : (
                    value.displayValue || value.value
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        {/* Quantity */}
        <FormControl sx={{ mb: 2, minWidth: 120 }}>
          <InputLabel>Cantidad</InputLabel>
          <Select
            value={quantity}
            label="Cantidad"
            onChange={(e) => setQuantity(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Stock Info */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Stock disponible: {currentVariant?.stock || 0} unidades
        </Typography>

        {/* Add to Cart Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleAddToCart}
          disabled={isAddingToCart || !currentVariant || currentVariant.stock === 0}
        >
          {isAddingToCart ? 'Agregando...' : 'Agregar al Carrito'}
        </Button>
      </Grid>
    </Grid>
  );
}
