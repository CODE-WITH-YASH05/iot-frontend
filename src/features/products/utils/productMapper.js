const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function getFullImageUrl(path) {
  if (!path) {
    return null;
  }

  // If it's already a full URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If it's a media path
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Handle media URLs
  if (cleanPath.startsWith("/media/")) {
    return `${API_BASE_URL}${cleanPath}`;
  }

  return `${API_BASE_URL}${cleanPath}`;
}

export function getPrimaryImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const primaryImage =
    images.find((image) => image?.is_primary === true) ||
    images.find((image) => image?.is_primary) ||
    images[0];

  const imagePath = primaryImage?.image || primaryImage;

  return getFullImageUrl(imagePath);
}

export function getProductImages(images = []) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      const imagePath = image?.image || image;
      return getFullImageUrl(imagePath);
    })
    .filter(Boolean);
}

export function mapProduct(product) {
  if (!product) {
    return null;
  }

  // Handle images - could be array or object
  let images = [];
  if (Array.isArray(product.images)) {
    images = product.images;
  } else if (product.images && typeof product.images === "object") {
    // If images is an object, try to extract values
    images = Object.values(product.images).filter(Boolean);
  }

  // Handle inventory
  const inventory = product.inventory || {};

  // Handle category
  const category =
    product.category && typeof product.category === "object"
      ? product.category
      : { name: product.category || "", slug: product.category_slug || "" };

  // Handle brand
  const brand =
    product.brand && typeof product.brand === "object"
      ? product.brand
      : { name: product.brand || "", slug: product.brand_slug || "" };

  // Price calculations
  const originalPrice = Number(product.price || 0);
  const discountPrice =
    product.discount_price !== null && product.discount_price !== undefined
      ? Number(product.discount_price)
      : null;

  const sellingPrice =
    discountPrice !== null && discountPrice > 0 && discountPrice < originalPrice
      ? discountPrice
      : originalPrice;

  const availableStock = Number(
    inventory.available_stock ?? inventory.stock ?? 0,
  );

  // Get primary image
  const primaryImage = getPrimaryImage(images);
  const allImages = getProductImages(images);

  // Extract specifications
  const specs = {};
  if (Array.isArray(product.specifications)) {
    product.specifications.forEach((spec) => {
      if (spec?.name && spec?.value !== undefined) {
        specs[spec.name] = spec.value;
      }
    });
  }

  return {
    id: product.id,
    slug: product.slug || product.id,
    name: product.name || "Unnamed Product",
    price: sellingPrice,
    originalPrice: originalPrice,
    discountPrice: discountPrice,
    description:
      product.short_description ||
      product.description ||
      "No description available",
    fullDescription:
      product.description ||
      product.short_description ||
      "No description available",
    image: primaryImage,
    images: allImages,
    imageUrls: allImages,
    videos: product.videos || [],
    specifications: product.specifications || [],
    specs: specs,
    category: category.name || "",
    categorySlug: category.slug || "",
    brand: brand.name || "",
    brandSlug: brand.slug || "",
    stock: Number(inventory.stock || 0),
    reservedStock: Number(inventory.reserved_stock || 0),
    soldStock: Number(inventory.sold_stock || 0),
    availableStock: availableStock,
    inStock: availableStock > 0,
    featured: Boolean(product.featured),
    latest: Boolean(product.latest),
    trending: Boolean(product.trending),
    status: product.status || "draft",
    sku: product.sku || "",
    barcode: product.barcode || "",
    warranty: product.warranty || null,
    weight: product.weight || null,
    rating: product.rating || 4.5,
    reviews: product.reviews || 0,
    createdAt: product.created_at || null,
    updatedAt: product.updated_at || null,
  };
}
