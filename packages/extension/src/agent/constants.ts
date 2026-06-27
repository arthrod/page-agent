import type { LLMConfig } from '@page-agent/llms'

// Demo LLM for testing
export const DEMO_MODEL = 'qwen3.5-plus'
export const DEMO_BASE_URL = 'https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run'
// export const DEMO_API_KEY = 'NA'

export const DEMO_CONFIG: LLMConfig = {
	baseURL: DEMO_BASE_URL,
	model: DEMO_MODEL,
	// apiKey: DEMO_API_KEY,
}

// ⭐ Cicero default: Gemini 3.5 Flash via Google's OpenAI-compatible endpoint.
// Kept SEPARATE from DEMO_* on purpose: repurposing DEMO_BASE_URL would make
// isTestingEndpoint() flag the real Gemini endpoint as a testing endpoint.
// No apiKey is embedded — the user pastes her Gemini key once (saved to storage).
export const DEFAULT_MODEL = 'gemini-3.5-flash'
export const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai'

export const DEFAULT_CONFIG: LLMConfig = {
	baseURL: DEFAULT_GEMINI_BASE_URL,
	model: DEFAULT_MODEL,
}

/** Legacy testing endpoints that should be auto-migrated to DEMO_BASE_URL */
export const LEGACY_TESTING_ENDPOINTS = [
	'https://hwcxiuzfylggtcktqgij.supabase.co/functions/v1/llm-testing-proxy',
]

export function isTestingEndpoint(url: string): boolean {
	const normalized = url.replace(/\/+$/, '')
	return normalized === DEMO_BASE_URL || LEGACY_TESTING_ENDPOINTS.some((ep) => normalized === ep)
}

export function migrateLegacyEndpoint(config: LLMConfig): LLMConfig {
	const normalized = config.baseURL.replace(/\/+$/, '')
	if (LEGACY_TESTING_ENDPOINTS.some((ep) => normalized === ep)) {
		return { ...DEMO_CONFIG }
	}
	return config
}
