// jsdom serves test pages from an opaque origin (no `url` configured), where the
// real Web Storage API throws `SecurityError` on access. Several services
// (e.g. AuthService) read `localStorage` at construction time, so we replace it
// with a simple in-memory implementation before any test runs.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

function installMemoryStorage(target: object, propertyName: string): void {
  Object.defineProperty(target, propertyName, {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}

installMemoryStorage(globalThis, 'localStorage');
if (typeof window !== 'undefined') {
  installMemoryStorage(window, 'localStorage');
}
