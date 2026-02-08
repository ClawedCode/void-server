/**
 * API Response Types for E2E Tests
 * Provides type safety for API responses used in test assertions
 */

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
