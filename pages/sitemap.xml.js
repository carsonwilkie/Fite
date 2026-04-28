const BASE_URL = "https://fitefinance.com";

const routes = [
  { path: "/",           priority: "1.0", changefreq: "weekly"  },
  { path: "/features",   priority: "0.8", changefreq: "monthly" },
  { path: "/dashboard",  priority: "0.9", changefreq: "weekly"  },
  { path: "/feedback",   priority: "0.4", changefreq: "yearly"  },
  { path: "/privacy",    priority: "0.3", changefreq: "yearly"  },
  { path: "/terms",      priority: "0.3", changefreq: "yearly"  },
  { path: "/refunds",    priority: "0.3", changefreq: "yearly"  },
];

function buildSitemap(routes) {
  const today = new Date().toISOString().split("T")[0];
  const urls = routes
    .map(
      ({ path, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

export default function SitemapXml() {
  // Rendered server-side only; component never mounts in the browser.
  return null;
}

export function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
  res.write(buildSitemap(routes));
  res.end();
  return { props: {} };
}
