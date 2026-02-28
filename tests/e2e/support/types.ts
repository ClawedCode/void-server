/**
 * API Response Types for E2E Tests
 * Provides type safety for API responses used in test assertions
 */

// Test Configuration Types
export interface Neo4jServiceConfig {
  uri: string;
  user: string;
  password: string;
  mock: boolean;
}

export interface IPFSServiceConfig {
  url: string;
  gateway: string;
  mock: boolean;
}

export interface BaseServiceConfig {
  url: string;
  mock: boolean;
}

export interface TimeoutConfig {
  page: number;
  api: number;
  element: number;
}

export interface TestConfig {
  appUrl: string;
  services: {
    neo4j: Neo4jServiceConfig;
    ipfs: IPFSServiceConfig;
    lmstudio: BaseServiceConfig;
    ollama?: BaseServiceConfig;
  };
  timeouts: TimeoutConfig;
}

// Health & Version APIs
export interface HealthResponse {
  status: string;
  version?: string;
}

export interface VersionResponse {
  version: string;
  name?: string;
  hasUpdate?: boolean;
  currentVersion?: string;
  latestVersion?: string;
}

// AI Provider APIs
export interface AIProviderResponse {
  providers?: AIProvider[];
  activeProvider?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  connected?: boolean;
}

// Chat APIs
export interface ChatSession {
  id: string;
  templateId?: string;
  messages?: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface CreateChatResponse {
  id: string;
  chat?: ChatSession;
}

// Memory APIs
export interface MemoryResponse {
  memories?: Memory[];
  count?: number;
}

export interface Memory {
  id: string;
  content: MemoryContent | string;
  category: string;
  importance: number;
  createdAt?: string;
}

export interface MemoryContent {
  text: string;
}

export interface MemoryStatusResponse {
  neo4j?: {
    connected: boolean;
    version?: string;
  };
  stats?: MemoryStats;
  byCategory?: Record<string, number>;
}

export interface MemoryStats {
  total: number;
  byCategory?: Record<string, number>;
}

// Plugin APIs
export interface PluginsResponse {
  installed: InstalledPlugin[];
  available: AvailablePlugin[];
  loadedPlugins: LoadedPlugin[];
  bootstrapMode?: boolean;
}

export interface InstalledPlugin {
  name: string;
  enabled: boolean;
  loaded?: boolean;
  builtIn?: boolean;
  userInstalled?: boolean;
  status?: 'active' | 'stopped' | 'error';
  version?: string;
}

export interface AvailablePlugin {
  name: string;
  description?: string;
  gitUrl?: string;
}

export interface LoadedPlugin {
  name: string;
  mountPath: string;
  status: string;
  navSection?: string;
  navTitle?: string;
  navIcon?: string;
}

export interface PluginManifest {
  plugins: Record<string, PluginManifestEntry>;
}

export interface PluginManifestEntry {
  name: string;
  description: string;
  gitUrl: string;
  branch?: string;
}

// Template APIs
export interface Template {
  id: string;
  name: string;
  content?: string;
  variables?: string[];
}

export interface TemplatesResponse {
  templates?: Template[];
}

// Variable APIs
export interface Variable {
  id: string;
  name: string;
  value: string;
}

export interface VariablesResponse {
  variables?: Variable[];
}

// IPFS APIs
export interface IPFSStatusResponse {
  online: boolean;
  peerId?: string;
  addresses?: string[];
}

export interface IPFSDaemonResponse {
  online?: boolean;
  status?: string;
}

// Wallet APIs
export interface WalletAddress {
  address: string;
  derivationPath: string;
  publicKey?: string;
}

export interface WalletDeriveResponse {
  addresses: WalletAddress[];
}

// Version/Update APIs
export interface UpdateCheckResponse {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
}

// Error response for API error assertions
export interface ErrorResponse {
  error: string;
}

// Environment info from version endpoint
export interface EnvironmentResponse {
  isDocker?: boolean;
  updateMethod?: string;
}

// Plugin list item for untyped plugin arrays
export interface PluginListItem {
  name: string;
  enabled?: boolean;
  builtIn?: boolean;
  userInstalled?: boolean;
  status?: string;
}

// Update check from the check endpoint (distinct from UpdateCheckResponse)
export interface UpdateAvailableResponse {
  updateAvailable?: boolean;
}

// Test Data Interface
export interface TestData {
  lastResponse?: unknown;
  lastStatus?: number;
  chatId?: string;
  chatIds?: string[];
  memoryId?: string;
  walletAddress?: string;
  expectWatchtower?: boolean;
}

// Type guard helpers
export function isMemoryStatusResponse(obj: unknown): obj is MemoryStatusResponse {
  return typeof obj === 'object' && obj !== null && 'neo4j' in obj;
}

export function isPluginsResponse(obj: unknown): obj is PluginsResponse {
  return typeof obj === 'object' && obj !== null && 'installed' in obj;
}

export function isHealthResponse(obj: unknown): obj is HealthResponse {
  return typeof obj === 'object' && obj !== null && 'status' in obj;
}

export function isErrorResponse(obj: unknown): obj is ErrorResponse {
  return typeof obj === 'object' && obj !== null && 'error' in obj;
}

export function isVersionResponse(obj: unknown): obj is VersionResponse {
  return typeof obj === 'object' && obj !== null && 'version' in obj;
}

/**
 * Assert that a test response is of expected type.
 * Throws with a descriptive message if the response is null/undefined.
 */
export function assertResponse<T>(response: unknown, typeName: string): T {
  if (response === null || response === undefined) {
    throw new Error(`Expected ${typeName} response but got ${response}`);
  }
  return response as T;
}
