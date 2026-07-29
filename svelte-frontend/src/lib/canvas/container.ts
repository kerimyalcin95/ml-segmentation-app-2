class ContextContainer {
    private readonly services = new Map<symbol, unknown>();

    register<T>(key: symbol, value: T): void {
        this.services.set(key, value);
    }

    resolve<T>(key: symbol): T {
        const service = this.services.get(key);

        if (service === undefined) {
            throw new Error(`Service not registered: ${String(key.description ?? key)}`);
        }

        return service as T;
    }

    has(key: symbol): boolean {
        return this.services.has(key);
    }

    clear(): void {
        this.services.clear();
    }
}

export const contextContainer = new ContextContainer();

export const CONTEXT = {
    MainStage: Symbol("MainStage"),
    Camera: Symbol("Camera"),
    Document: Symbol("Document"),
} as const;