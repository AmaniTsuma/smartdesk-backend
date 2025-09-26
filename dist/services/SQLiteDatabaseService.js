"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqliteDatabaseService = exports.SQLiteDatabaseService = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
class SQLiteDatabaseService {
    constructor() {
        this.dbPath = path_1.default.join(__dirname, '../../data/smartdesk.db');
        this.db = new sqlite3_1.default.Database(this.dbPath);
    }
    static getInstance() {
        if (!SQLiteDatabaseService.instance) {
            SQLiteDatabaseService.instance = new SQLiteDatabaseService();
        }
        return SQLiteDatabaseService.instance;
    }
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ rows });
                }
            });
        });
    }
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        lastID: this.lastID,
                        changes: this.changes,
                        rowCount: this.changes
                    });
                }
            });
        });
    }
    async transaction(callback) {
        try {
            await this.run('BEGIN TRANSACTION');
            const result = await callback();
            await this.run('COMMIT');
            return result;
        }
        catch (error) {
            await this.run('ROLLBACK');
            throw error;
        }
    }
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async testConnection() {
        try {
            const result = await this.query('SELECT datetime("now") as now');
            console.log('✅ SQLite database connection successful:', result.rows[0]);
            return true;
        }
        catch (error) {
            console.error('❌ SQLite database connection failed:', error);
            return false;
        }
    }
}
exports.SQLiteDatabaseService = SQLiteDatabaseService;
exports.sqliteDatabaseService = SQLiteDatabaseService.getInstance();
//# sourceMappingURL=SQLiteDatabaseService.js.map