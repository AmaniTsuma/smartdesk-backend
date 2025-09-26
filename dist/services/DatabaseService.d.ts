import { PoolClient } from 'pg';
export declare class DatabaseService {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): DatabaseService;
    getClient(): Promise<PoolClient>;
    query(text: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
    testConnection(): Promise<boolean>;
}
export declare const databaseService: DatabaseService;
//# sourceMappingURL=DatabaseService.d.ts.map