export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("product");

  if (!code) return context.next();

  const ua = request.headers.get("user-agent") || "";
  const isCrawler =
    /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|LinkedInBot/i.test(ua);

  if (!isCrawler) return context.next();

  const supabaseUrl = "https://zzhldihcsluaqrorepyk.supabase.co";
  const supabaseKey = "sb_publishable_AG8BoMnbpBkpyn-ZuxrcaA_CJx5HIOo";

  const response = await fetch(
    `${supabaseUrl}/rest/v1/products?code=eq.${encodeURIComponent(code)}&is_active=eq.true&select=name,description,image_url,price,code`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) return context.next();

  const products = await response.json();
  const product = products?.[0];

  if (!product) return context.next();

  const title = `${product.name} | ماه شاپینگ`;
  const description = `${product.price} افغانی | کد محصول: ${product.code} | ${product.description || "خرید آنلاین از ماه شاپینگ"}`;
  const image = product.image_url || "";
  const canonical = `${url.origin}/?product=${encodeURIComponent(product.code)}`;

  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta property="og:type" content="product">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<title>${escapeHtml(title)}</title>
</head>
<body>${escapeHtml(title)}</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};

function escapeHtml(value: string) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] || char));
}
