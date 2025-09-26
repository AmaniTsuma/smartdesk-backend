"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgreSQLUserService = exports.PostgreSQLUserService = void 0;
const DatabaseService_1 = require("./DatabaseService");
class PostgreSQLUserService {
    constructor() { }
    static getInstance() {
        if (!PostgreSQLUserService.instance) {
            PostgreSQLUserService.instance = new PostgreSQLUserService();
        }
        return PostgreSQLUserService.instance;
    }
    async getAllUsers() {
        try {
            const result = await DatabaseService_1.databaseService.query(`
        SELECT 
          id, email, password, first_name as "firstName", last_name as "lastName", 
          role, is_active as "isActive", company, phone, address, industry, 
          website, bio, created_at as "createdAt", updated_at as "updatedAt", 
          last_login as "lastLogin"
        FROM users 
        ORDER BY created_at DESC
      `);
            return result.rows.map((row) => ({
                ...row,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                lastLogin: row.lastLogin ? new Date(row.lastLogin) : undefined
            }));
        }
        catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }
    async getUserById(id) {
        try {
            const result = await DatabaseService_1.databaseService.query(`
        SELECT 
          id, email, password, first_name as "firstName", last_name as "lastName", 
          role, is_active as "isActive", company, phone, address, industry, 
          website, bio, created_at as "createdAt", updated_at as "updatedAt", 
          last_login as "lastLogin"
        FROM users 
        WHERE id = $1
      `, [id]);
            if (result.rows.length === 0)
                return null;
            const user = result.rows[0];
            return {
                ...user,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
                lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
            };
        }
        catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }
    async getUserByEmail(email) {
        try {
            const result = await DatabaseService_1.databaseService.query(`
        SELECT 
          id, email, password, first_name as "firstName", last_name as "lastName", 
          role, is_active as "isActive", company, phone, address, industry, 
          website, bio, created_at as "createdAt", updated_at as "updatedAt", 
          last_login as "lastLogin"
        FROM users 
        WHERE email = $1
      `, [email]);
            if (result.rows.length === 0)
                return null;
            const user = result.rows[0];
            return {
                ...user,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
                lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
            };
        }
        catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }
    async addUser(user) {
        try {
            await DatabaseService_1.databaseService.query(`
        INSERT INTO users (
          id, email, password, first_name, last_name, role, is_active, 
          company, phone, address, industry, website, bio, 
          created_at, updated_at, last_login
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
      `, [
                user.id,
                user.email,
                user.password,
                user.firstName,
                user.lastName,
                user.role,
                user.isActive,
                user.company || null,
                user.phone || null,
                user.address || null,
                user.industry || null,
                user.website || null,
                user.bio || null,
                user.createdAt,
                user.updatedAt,
                user.lastLogin || null
            ]);
        }
        catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }
    async updateUser(id, updates) {
        try {
            const setClause = [];
            const values = [];
            let paramCount = 1;
            Object.entries(updates).forEach(([key, value]) => {
                if (key === 'firstName') {
                    setClause.push(`first_name = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
                else if (key === 'lastName') {
                    setClause.push(`last_name = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
                else if (key === 'isActive') {
                    setClause.push(`is_active = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
                else if (key === 'lastLogin') {
                    setClause.push(`last_login = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
                else if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
                    setClause.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (setClause.length === 0) {
                return await this.getUserById(id);
            }
            setClause.push(`updated_at = NOW()`);
            values.push(id);
            const query = `
        UPDATE users 
        SET ${setClause.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING 
          id, email, password, first_name as "firstName", last_name as "lastName", 
          role, is_active as "isActive", company, phone, address, industry, 
          website, bio, created_at as "createdAt", updated_at as "updatedAt", 
          last_login as "lastLogin"
      `;
            const result = await DatabaseService_1.databaseService.query(query, values);
            if (result.rows.length === 0)
                return null;
            const user = result.rows[0];
            return {
                ...user,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
                lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
            };
        }
        catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    async deleteUser(id) {
        try {
            const result = await DatabaseService_1.databaseService.query('DELETE FROM users WHERE id = $1', [id]);
            return result.rowCount > 0;
        }
        catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
    async getAllClientProfiles() {
        try {
            const result = await DatabaseService_1.databaseService.query(`
        SELECT 
          id, user_id as "userId", company, phone, address, industry, 
          website, bio, created_at as "createdAt", updated_at as "updatedAt"
        FROM client_profiles 
        ORDER BY created_at DESC
      `);
            return result.rows.map((row) => ({
                ...row,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt)
            }));
        }
        catch (error) {
            console.error('Error getting all client profiles:', error);
            throw error;
        }
    }
    async getClientProfileByUserId(userId) {
        try {
            const result = await DatabaseService_1.databaseService.query(`
        SELECT 
          id, user_id as "userId", company, phone, address, industry, 
          website, bio, created_at as "createdAt", updated_at as "updatedAt"
        FROM client_profiles 
        WHERE user_id = $1
      `, [userId]);
            if (result.rows.length === 0)
                return null;
            const profile = result.rows[0];
            return {
                ...profile,
                createdAt: new Date(profile.createdAt),
                updatedAt: new Date(profile.updatedAt)
            };
        }
        catch (error) {
            console.error('Error getting client profile by user ID:', error);
            throw error;
        }
    }
    async addClientProfile(profile) {
        try {
            await DatabaseService_1.databaseService.query(`
        INSERT INTO client_profiles (
          id, user_id, company, phone, address, industry, website, bio,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
      `, [
                profile.id,
                profile.userId,
                profile.company || null,
                profile.phone || null,
                profile.address || null,
                profile.industry || null,
                profile.website || null,
                profile.bio || null,
                profile.createdAt,
                profile.updatedAt
            ]);
        }
        catch (error) {
            console.error('Error adding client profile:', error);
            throw error;
        }
    }
    async updateClientProfile(userId, updates) {
        try {
            const setClause = [];
            const values = [];
            let paramCount = 1;
            Object.entries(updates).forEach(([key, value]) => {
                if (key !== 'id' && key !== 'userId' && key !== 'createdAt' && key !== 'updatedAt') {
                    setClause.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (setClause.length === 0) {
                return await this.getClientProfileByUserId(userId);
            }
            setClause.push(`updated_at = NOW()`);
            values.push(userId);
            const query = `
        UPDATE client_profiles 
        SET ${setClause.join(', ')} 
        WHERE user_id = $${paramCount}
        RETURNING 
          id, user_id as "userId", company, phone, address, industry, 
          website, bio, created_at as "createdAt", updated_at as "updatedAt"
      `;
            const result = await DatabaseService_1.databaseService.query(query, values);
            if (result.rows.length === 0)
                return null;
            const profile = result.rows[0];
            return {
                ...profile,
                createdAt: new Date(profile.createdAt),
                updatedAt: new Date(profile.updatedAt)
            };
        }
        catch (error) {
            console.error('Error updating client profile:', error);
            throw error;
        }
    }
    async deleteClientProfile(userId) {
        try {
            const result = await DatabaseService_1.databaseService.query('DELETE FROM client_profiles WHERE user_id = $1', [userId]);
            return result.rowCount > 0;
        }
        catch (error) {
            console.error('Error deleting client profile:', error);
            throw error;
        }
    }
}
exports.PostgreSQLUserService = PostgreSQLUserService;
exports.postgreSQLUserService = PostgreSQLUserService.getInstance();
//# sourceMappingURL=PostgreSQLUserService.js.map