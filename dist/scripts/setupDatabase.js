"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDatabase = setupDatabase;
const DatabaseService_1 = require("../services/DatabaseService");
const DatabaseSchema_1 = require("../services/DatabaseSchema");
async function setupDatabase() {
    const db = DatabaseService_1.DatabaseService.getInstance();
    try {
        console.log('🚀 Starting database setup...');
        const connected = await db.testConnection();
        if (!connected) {
            console.error('❌ Cannot connect to database. Please check your configuration.');
            process.exit(1);
        }
        await DatabaseSchema_1.DatabaseSchema.createTables();
        await DatabaseSchema_1.DatabaseSchema.seedDefaultData();
        console.log('✅ Database setup completed successfully!');
    }
    catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
    finally {
        await db.close();
    }
}
if (require.main === module) {
    setupDatabase();
}
//# sourceMappingURL=setupDatabase.js.map