export declare class SQLiteDatabaseService {
    private static instance;
    private db;
    private dbPath;
    private constructor();
    static getInstance(): SQLiteDatabaseService;
    query(sql: string, params?: any[]): Promise<any>;
    run(sql: string, params?: any[]): Promise<any>;
    transaction<T>(callback: () => Promise<T>): Promise<T>;
    close(): Promise<void>;
    testConnection(): Promise<boolean>;
}
export declare const sqliteDatabaseService: SQLiteDatabaseService;
//# sourceMappingURL=SQLiteDatabaseService.d.ts.map