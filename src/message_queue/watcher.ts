export interface Watcher {

    add(serviceId: string, address: string, orderId: string): Promise<void>;

    remove(serviceId: string, address: string, orderId: string): Promise<void>;
}