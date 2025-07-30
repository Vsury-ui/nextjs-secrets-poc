import { Octokit } from '@octokit/rest';

export interface AppSecrets {
  databaseUrl: string;
  apiKey: string;
  jwtSecret: string;
  redisUrl: string;
  stripeSecretKey: string;
}

class SecretsManager {
  private static instance: SecretsManager;
  private secrets: AppSecrets | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (process.env.NODE_ENV === 'production') {
      await this.loadFromGitHub();
    } else {
      this.loadFromEnv();
    }

    this.isInitialized = true;
  }

  private async loadFromGitHub(): Promise<void> {
    try {
      const githubToken = process.env.GITHUB_TOKEN;
      const repoOwner = process.env.GITHUB_REPO_OWNER;
      const repoName = process.env.GITHUB_REPO_NAME;
      const secretsPath = process.env.GITHUB_SECRETS_PATH || 'secrets.json';

      if (!githubToken || !repoOwner || !repoName) {
        throw new Error('GitHub configuration missing. Please set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME');
      }

      const octokit = new Octokit({
        auth: githubToken,
      });

      const response = await octokit.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: secretsPath,
      });

      if ('content' in response.data && response.data.content) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        this.secrets = JSON.parse(content);
      } else {
        throw new Error('Failed to fetch secrets from GitHub');
      }
    } catch (error) {
      console.error('Error loading secrets from GitHub:', error);
      throw new Error('Failed to initialize secrets from GitHub');
    }
  }

  private loadFromEnv(): void {
    this.secrets = {
      databaseUrl: process.env.DATABASE_URL || '',
      apiKey: process.env.API_KEY || '',
      jwtSecret: process.env.JWT_SECRET || '',
      redisUrl: process.env.REDIS_URL || '',
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    };

    // Validate that all required secrets are present
    const missingSecrets = Object.entries(this.secrets)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingSecrets.length > 0) {
      throw new Error(`Missing required secrets: ${missingSecrets.join(', ')}`);
    }
  }

  public getSecrets(): AppSecrets {
    if (!this.secrets) {
      throw new Error('Secrets not initialized. Call initialize() first.');
    }
    return this.secrets;
  }

  public getSecret(key: keyof AppSecrets): string {
    if (!this.secrets) {
      throw new Error('Secrets not initialized. Call initialize() first.');
    }
    return this.secrets[key];
  }

  public isReady(): boolean {
    return this.isInitialized && this.secrets !== null;
  }
}

export const secretsManager = SecretsManager.getInstance();

// Helper function to get secrets safely
export async function getSecrets(): Promise<AppSecrets> {
  const manager = SecretsManager.getInstance();
  if (!manager.isReady()) {
    await manager.initialize();
  }
  return manager.getSecrets();
}

// Helper function to get a specific secret safely
export async function getSecret(key: keyof AppSecrets): Promise<string> {
  const manager = SecretsManager.getInstance();
  if (!manager.isReady()) {
    await manager.initialize();
  }
  return manager.getSecret(key);
} 