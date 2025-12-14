import { storage } from "./storage";
import { decrypt } from "./crypto";

export async function getApiKey(provider: "gigachat" | "openai"): Promise<string | null> {
  const keyName = provider === "gigachat" ? "gigachat_api_key" : "openai_api_key";
  const envVarName = provider === "gigachat" ? "GIGACHAT_API_KEY" : "OPENAI_API_KEY";
  
  // Try database first
  try {
    const setting = await storage.getSecureSetting(keyName);
    if (setting) {
      const decrypted = decrypt(setting.encryptedValue);
      if (decrypted && decrypted.length > 0) {
        return decrypted;
      }
    }
  } catch (e) {
    console.error(`Failed to get ${provider} key from database:`, e);
  }
  
  // Fallback to environment variable
  const envValue = process.env[envVarName];
  return envValue && envValue.length > 0 ? envValue : null;
}

export async function hasApiKey(provider: "gigachat" | "openai"): Promise<boolean> {
  const key = await getApiKey(provider);
  return key !== null && key.length > 0;
}
