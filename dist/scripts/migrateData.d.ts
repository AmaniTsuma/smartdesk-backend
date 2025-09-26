declare class DataMigrator {
    private dataDir;
    migrateAllData(): Promise<void>;
    private migrateUsers;
    private migrateClientProfiles;
    private migrateServiceRequests;
    private migrateConversations;
    private migrateMessages;
    private migrateServiceUpdates;
    backupJsonFiles(): Promise<void>;
}
export { DataMigrator };
//# sourceMappingURL=migrateData.d.ts.map