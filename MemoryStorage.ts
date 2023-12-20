import { IStorage } from './IStorage';

export class MemoryStorage extends IStorage {
  async getItem<T = any>(key: string, _default?: any): Promise<T> { return key in this.data ? this.data[key] : _default; }
  async setItem(key: string, value: any) { this.data[key] = value; }
  async hasKey(key: string) { return key in this.data }
  async removeItem(key: string) { delete this.data[key] }
  async *keys(prefix?: string) { for (const key in this.data) if (!prefix || key.startsWith(prefix)) yield key; }
}
