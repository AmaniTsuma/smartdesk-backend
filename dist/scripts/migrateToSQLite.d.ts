declare class SQLiteDataMigrator {
    private dataDir;
    migrateAllData(): Promise<void>;
    private migrateUsers;
    private migrateClientProfiles;
    private migrateServiceRequests;
    private migrateConversations;
    private migrateMessages;
    backupJsonFiles(): Promise<void>;
}
export { SQLiteDataMigrator };
//# sourceMappingURL=migrateToSQLite.d.ts.map