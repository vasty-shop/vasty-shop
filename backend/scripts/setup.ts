/**
 * Vasty Shop first-run setup wizard.
 *
 * Interactive CLI that walks a new user through picking providers for each
 * pluggable infrastructure concern, writes a working `.env` file, and prints
 * next steps. Every prompt has a free / zero-infra default marked in
 * (parentheses) so the fastest path is just pressing Enter through the
 * whole wizard.
 *
 * Run with:
 *    cd backend && npx ts-node scripts/setup.ts
 *    cd backend && npm run setup
 *
 * SAFETY:
 * - Never overwrites an existing `.env` without confirmation
 * - Prints a summary before writing
 * - Works fully offline — no network calls
 *
 * This wizard is the honest source of truth for what vasty-shop currently
 * supports. As provider-adapter PRs land, flip the matching concern's
 * `status` from 'planned' to 'implemented' and add the new provider
 * choices — the prompts reflect the real state of the repo.
 */

import * as fs from 'fs';
import * as path from 'path';

// `prompts` is CJS. With allowSyntheticDefaultImports but no
// esModuleInterop the ES default import is undefined at runtime for CJS
// modules, so we require() instead.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prompts: typeof import('prompts') = require('prompts');

// =====================================================================
// Provider catalog
// =====================================================================

type ProviderStatus = 'implemented' | 'planned';

interface ProviderChoice {
  value: string;
  title: string;
  description: string;
  isDefault?: boolean;
  envVars?: string[];
}

interface ProviderConcern {
  key: string;
  label: string;
  description: string;
  envVar: string;
  status: ProviderStatus;
  choices: ProviderChoice[];
}

const PROVIDERS: ProviderConcern[] = [
  {
    key: 'storage',
    label: 'File storage',
    description: 'Product images, vendor logos, invoices, exports.',
    envVar: 'STORAGE_PROVIDER',
    status: 'implemented', // PR #26
    choices: [
      {
        value: 'local-fs',
        title: 'Local filesystem  (zero infra)',
        description: 'Writes to ./data/uploads. Zero signup, zero cost.',
        isDefault: true,
        envVars: ['LOCAL_FS_PATH', 'LOCAL_FS_PUBLIC_URL'],
      },
      {
        value: 'r2',
        title: 'Cloudflare R2',
        description: '10GB free forever. Cheapest egress.',
        envVars: ['STORAGE_ACCESS_KEY_ID', 'STORAGE_SECRET_ACCESS_KEY', 'STORAGE_ENDPOINT'],
      },
      {
        value: 's3',
        title: 'AWS S3',
        description: '5GB free for 12 months.',
        envVars: ['STORAGE_ACCESS_KEY_ID', 'STORAGE_SECRET_ACCESS_KEY', 'STORAGE_BUCKET', 'STORAGE_REGION'],
      },
      {
        value: 'minio',
        title: 'MinIO  (self-hosted S3)',
        description: 'Run via `docker compose --profile minio`.',
        envVars: ['STORAGE_ACCESS_KEY_ID', 'STORAGE_SECRET_ACCESS_KEY', 'STORAGE_ENDPOINT'],
      },
      {
        value: 'b2',
        title: 'Backblaze B2',
        description: '10GB free. Cheapest egress of the big names.',
        envVars: ['STORAGE_ACCESS_KEY_ID', 'STORAGE_SECRET_ACCESS_KEY', 'STORAGE_ENDPOINT'],
      },
      {
        value: 'gcs',
        title: 'Google Cloud Storage',
        description: 'Requires @google-cloud/storage (auto-installed).',
        envVars: ['GCS_PROJECT_ID'],
      },
      {
        value: 'azure',
        title: 'Azure Blob Storage',
        description: 'Requires @azure/storage-blob (auto-installed).',
        envVars: ['AZURE_STORAGE_CONNECTION_STRING'],
      },
      {
        value: 'none',
        title: 'None',
        description: 'Storage features disabled.',
      },
    ],
  },
  {
    key: 'payments',
    label: 'Payment gateway',
    description: 'Checkout, vendor payouts, escrow. Marketplaces often offer multiple.',
    envVar: 'PAYMENT_PROVIDER',
    status: 'planned', // PR #18
    choices: [
      {
        value: 'stripe',
        title: 'Stripe  (current default)',
        description: 'Global cards + Stripe Connect for vendor splits.',
        isDefault: true,
        envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
      },
      {
        value: 'paypal',
        title: 'PayPal  [planned: #18]',
        description: 'Global. Partial support today.',
        envVars: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
      },
      {
        value: 'razorpay',
        title: 'Razorpay  [planned: #18]',
        description: 'India. Route API for marketplace splits.',
      },
      {
        value: 'paystack',
        title: 'Paystack  [planned: #18]',
        description: 'Nigeria, Ghana, South Africa, Kenya.',
      },
      {
        value: 'bkash',
        title: 'bKash  [planned: #18]',
        description: 'Bangladesh mobile wallet.',
      },
      {
        value: 'mpesa',
        title: 'M-Pesa  [planned: #18]',
        description: 'Kenya, Tanzania. Safaricom Daraja API.',
      },
      {
        value: 'none',
        title: 'None',
        description: 'Payment features disabled.',
      },
    ],
  },
  {
    key: 'ai',
    label: 'AI / LLM',
    description: 'Product autofill, recommendations, SEO generation.',
    envVar: 'AI_PROVIDER',
    status: 'planned', // PR #15
    choices: [
      {
        value: 'openai',
        title: 'OpenAI  (current default)',
        description: 'GPT-4o + vision. What vasty-shop uses today.',
        isDefault: true,
        envVars: ['OPENAI_API_KEY'],
      },
      {
        value: 'anthropic',
        title: 'Anthropic Claude  [planned: #15]',
        description: 'Best for long-context product copy.',
      },
      {
        value: 'ollama',
        title: 'Ollama  (local, fully offline)  [planned: #15]',
        description: 'Run LLMs on your own machine. Zero API cost.',
      },
      {
        value: 'gemini',
        title: 'Google Gemini  [planned: #15]',
        description: 'Cheap multimodal + embeddings.',
      },
      {
        value: 'groq',
        title: 'Groq  [planned: #15]',
        description: 'Ultra-low latency for real-time UX.',
      },
      {
        value: 'none',
        title: 'None  [planned: #15]',
        description: 'AI features disabled.',
      },
    ],
  },
  {
    key: 'sms',
    label: 'SMS',
    description: 'OTP, order confirmation, delivery updates.',
    envVar: 'SMS_PROVIDER',
    status: 'planned', // PR #19
    choices: [
      {
        value: 'none',
        title: 'None  (default)',
        description: 'SMS disabled. Set later when you have a provider.',
        isDefault: true,
      },
      {
        value: 'twilio',
        title: 'Twilio  [planned: #19]',
        description: 'Global.',
      },
      {
        value: 'messagebird',
        title: 'MessageBird  [planned: #19]',
        description: 'Cheaper than Twilio in EU.',
      },
      {
        value: 'textbee',
        title: 'TextBee  [planned: #19]',
        description: 'Self-hosted via Android phone as modem.',
      },
    ],
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Order confirmations, receipts, password reset.',
    envVar: 'EMAIL_PROVIDER',
    status: 'planned', // PR #20
    choices: [
      {
        value: 'smtp',
        title: 'SMTP  (any mail server)',
        description: 'Works with Gmail app passwords, Mailtrap, Postfix.',
        isDefault: true,
        envVars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'],
      },
      {
        value: 'resend',
        title: 'Resend  [planned: #20]',
        description: 'Modern API, generous free tier.',
      },
      {
        value: 'sendgrid',
        title: 'SendGrid  [planned: #20]',
        description: 'Enterprise standard.',
      },
      {
        value: 'none',
        title: 'None  [planned: #20]',
        description: 'Email features disabled.',
      },
    ],
  },
  {
    key: 'search',
    label: 'Product search',
    description: 'Catalog search, faceting, recommendations.',
    envVar: 'SEARCH_PROVIDER',
    status: 'planned', // PR #22
    choices: [
      {
        value: 'pg-trgm',
        title: 'Postgres pg_trgm  (zero infra)  [planned: #22]',
        description: 'Will be the new dev default. Uses existing Postgres.',
        isDefault: true,
      },
      {
        value: 'meilisearch',
        title: 'Meilisearch  [planned: #22]',
        description: 'Best typo tolerance for e-commerce.',
      },
      {
        value: 'typesense',
        title: 'Typesense  [planned: #22]',
        description: 'Fast, simple, self-hosted.',
      },
      {
        value: 'qdrant',
        title: 'Qdrant  (current)',
        description: 'Vector search. Currently hardcoded.',
      },
    ],
  },
  {
    key: 'maps',
    label: 'Maps (delivery zones)',
    description: 'Vendor locations, delivery zones, address autocomplete.',
    envVar: 'MAPS_PROVIDER',
    status: 'planned', // PR #17
    choices: [
      {
        value: 'osm-leaflet',
        title: 'OpenStreetMap + Leaflet  (free, no API key)  [planned: #17]',
        description: 'Will be the new default. Zero infra.',
        isDefault: true,
      },
      {
        value: 'google-maps',
        title: 'Google Maps  [planned: #17]',
        description: 'Polished UX, requires paid API key.',
      },
      {
        value: 'mapbox',
        title: 'Mapbox  [planned: #17]',
        description: 'Beautiful custom styling.',
      },
    ],
  },
];

// =====================================================================
// Wizard implementation
// =====================================================================

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const ENV_EXAMPLE_PATH = path.join(ROOT, '.env.example');

interface WizardResult {
  updates: Record<string, string>;
  needsFilling: string[];
  selections: Array<{ concern: ProviderConcern; choice: ProviderChoice }>;
}

function divider(ch = '=', width = 70): void {
  console.log(ch.repeat(width));
}

function header(title: string): void {
  console.log('');
  divider();
  console.log(`  ${title}`);
  divider();
  console.log('');
}

function readExistingEnv(envPath: string): Record<string, string> | null {
  if (!fs.existsSync(envPath)) return null;
  const raw = fs.readFileSync(envPath, 'utf-8');
  const out: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

/**
 * Splice `updates` into the baseline .env contents. Existing keys get
 * rewritten in place; new keys are appended in a trailing "Setup Wizard
 * Overrides" section. Preserves comments and blank lines.
 */
function renderEnv(baseline: string, updates: Record<string, string>): string {
  const lines = baseline.split('\n');
  const touched = new Set<string>();
  const out = lines.map((line) => {
    const m = line.match(/^(\s*)([A-Z0-9_]+)(\s*=\s*)(.*)$/);
    if (!m) return line;
    const key = m[2];
    if (key in updates) {
      touched.add(key);
      return `${m[1]}${key}${m[3]}${updates[key]}`;
    }
    return line;
  });

  const untouched = Object.entries(updates).filter(([k]) => !touched.has(k));
  if (untouched.length > 0) {
    out.push('');
    out.push('# =====================================================');
    out.push('# SETUP WIZARD OVERRIDES');
    out.push('# =====================================================');
    for (const [k, v] of untouched) out.push(`${k}=${v}`);
  }
  return out.join('\n');
}

async function runWizard(
  existingEnv: Record<string, string> | null,
): Promise<WizardResult> {
  header('Vasty Shop first-run setup');

  console.log('This wizard picks providers for each piece of infrastructure.');
  console.log('Every question has a zero-infra default marked (in parentheses).');
  console.log('Press Enter to accept the default and keep going.');
  console.log('');
  console.log('Provider adapters that are not yet implemented are marked');
  console.log('[planned: #NN] — picking one writes the env var for the current');
  console.log('hardcoded implementation so your .env is usable today, and the');
  console.log('wizard will reflect the real options once the PR lands.');
  console.log('');

  const result: WizardResult = {
    updates: {},
    needsFilling: [],
    selections: [],
  };

  for (const concern of PROVIDERS) {
    divider('-');
    console.log(`  ${concern.label}`);
    console.log(`  ${concern.description}`);
    if (concern.status === 'planned') {
      console.log('  (adapter pattern not implemented yet — see GitHub issues)');
    }
    divider('-');

    const defaultIdx = Math.max(
      0,
      concern.choices.findIndex((c) => c.isDefault),
    );

    const { pick } = await prompts({
      type: 'select',
      name: 'pick',
      message: concern.label,
      initial: defaultIdx,
      choices: concern.choices.map((c) => ({
        title: c.title,
        description: c.description,
        value: c.value,
      })),
    });
    console.log('');

    if (pick === undefined) process.exit(0); // ctrl-c

    const choice = concern.choices.find((c) => c.value === pick)!;
    result.selections.push({ concern, choice });
    result.updates[concern.envVar] = pick;

    for (const key of choice.envVars ?? []) {
      if (!existingEnv?.[key] && !result.updates[key]) {
        result.needsFilling.push(key);
      }
    }
  }

  return result;
}

function printSummary(result: WizardResult): void {
  header('Summary');
  for (const { concern, choice } of result.selections) {
    const flag = concern.status === 'implemented' ? 'ready' : 'planned';
    console.log(
      `  ${concern.envVar.padEnd(22)} ${choice.value.padEnd(14)} [${flag}]`,
    );
  }
  console.log('');
  if (result.needsFilling.length > 0) {
    console.log('The following env vars still need values — open .env and fill them in:');
    for (const k of result.needsFilling) console.log(`  - ${k}`);
    console.log('');
  } else {
    console.log('All selected providers are ready to boot (no extra secrets needed).');
    console.log('');
  }
}

export async function main(opts: { envPath?: string; envExamplePath?: string } = {}): Promise<void> {
  const envPath = opts.envPath ?? ENV_PATH;
  const envExamplePath = opts.envExamplePath ?? ENV_EXAMPLE_PATH;

  const existingEnv = readExistingEnv(envPath);

  if (existingEnv) {
    console.log(`Found existing .env at ${envPath}`);
    const { keep } = await prompts({
      type: 'confirm',
      name: 'keep',
      message: 'Update it in place? (No will regenerate from .env.example)',
      initial: true,
    });
    console.log('');
    if (keep === undefined) return;
  } else {
    console.log(`No .env yet — will create from .env.example`);
  }

  const result = await runWizard(existingEnv);
  printSummary(result);

  const { write } = await prompts({
    type: 'confirm',
    name: 'write',
    message: `Write these selections to ${path.relative(process.cwd(), envPath)}?`,
    initial: true,
  });

  if (!write) {
    console.log('Aborted. Nothing was written.');
    return;
  }

  const baseline = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf-8')
    : fs.readFileSync(envExamplePath, 'utf-8');

  const rendered = renderEnv(baseline, result.updates);
  fs.writeFileSync(envPath, rendered, 'utf-8');

  console.log('');
  console.log(`.env written: ${envPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. (optional) Fill in any remaining secrets in .env');
  console.log('  2. docker compose up -d              # Postgres + Redis');
  console.log('  3. npm run migrate                   # apply schema');
  console.log('  4. npm run start:dev                 # start the backend');
  console.log('');
  console.log('Docs: see backend/docs/providers/ for per-provider setup guides.');
  console.log('Health: once running, GET http://localhost:4005/api/v1/health/providers');
  console.log('');
}

export { renderEnv, runWizard, readExistingEnv, PROVIDERS };

if (require.main === module) {
  main().catch((err) => {
    console.error('\nSetup wizard crashed:', err);
    process.exit(1);
  });
}
