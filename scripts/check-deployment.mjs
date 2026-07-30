const deploymentUrl = process.env.DEPLOYMENT_URL;

if (!deploymentUrl) {
  throw new Error('DEPLOYMENT_URL is required, for example https://example.pages.dev');
}

const baseUrl = new URL(deploymentUrl);
const checks = [
  { path: '/', status: 200, includes: '<title>Will Xue' },
  { path: '/blog', status: 200, includes: '>Blog<' },
  { path: '/album', status: 200, includes: '>Album<' },
  { path: '/rss.xml', status: 200, includes: '<rss' },
  { path: '/sitemap.xml', status: 200, includes: '<urlset' },
  { path: '/__deployment-health-missing__', status: 404, includes: 'Page not found' }
];

async function runCheck(check) {
  const url = new URL(check.path, baseUrl);
  let lastFailure = '';

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        headers: { 'user-agent': 'xue-deployment-check/1.0' },
        signal: AbortSignal.timeout(10_000)
      });
      const body = await response.text();

      if (response.status === check.status && body.includes(check.includes)) return;
      lastFailure = `expected ${check.status} and ${JSON.stringify(check.includes)}, received ${response.status}`;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }

    if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
  }

  throw new Error(`${url}: ${lastFailure}`);
}

for (const check of checks) await runCheck(check);

console.log(`Deployment smoke check passed for ${baseUrl.origin}.`);
