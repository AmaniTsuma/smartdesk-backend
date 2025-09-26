"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPersistenceService = exports.UserPersistenceService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class UserPersistenceService {
    constructor() {
        this.users = [];
        this.clientProfiles = [];
        this.dataDir = path_1.default.join(__dirname, '../../data');
        this.usersFile = path_1.default.join(this.dataDir, 'users.json');
        this.clientProfilesFile = path_1.default.join(this.dataDir, 'clientProfiles.json');
        this.ensureDataDirectory();
        this.loadUsers();
        this.loadClientProfiles();
    }
    static getInstance() {
        if (!UserPersistenceService.instance) {
            UserPersistenceService.instance = new UserPersistenceService();
        }
        return UserPersistenceService.instance;
    }
    ensureDataDirectory() {
        if (!fs_1.default.existsSync(this.dataDir)) {
            fs_1.default.mkdirSync(this.dataDir, { recursive: true });
        }
    }
    loadUsers() {
        try {
            if (fs_1.default.existsSync(this.usersFile)) {
                const data = fs_1.default.readFileSync(this.usersFile, 'utf8');
                this.users = JSON.parse(data).map((user) => ({
                    ...user,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt),
                    lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
                }));
                console.log(`Loaded ${this.users.length} users from file`);
            }
            else {
                this.users = this.getDefaultUsers();
                this.saveUsers();
                console.log('Created default users file');
            }
        }
        catch (error) {
            console.error('Error loading users:', error);
            this.users = this.getDefaultUsers();
        }
    }
    loadClientProfiles() {
        try {
            if (fs_1.default.existsSync(this.clientProfilesFile)) {
                const data = fs_1.default.readFileSync(this.clientProfilesFile, 'utf8');
                this.clientProfiles = JSON.parse(data).map((profile) => ({
                    ...profile,
                    createdAt: new Date(profile.createdAt),
                    updatedAt: new Date(profile.updatedAt)
                }));
                console.log(`Loaded ${this.clientProfiles.length} client profiles from file`);
            }
            else {
                this.clientProfiles = [];
                this.saveClientProfiles();
                console.log('Created empty client profiles file');
            }
        }
        catch (error) {
            console.error('Error loading client profiles:', error);
            this.clientProfiles = [];
        }
    }
    saveUsers() {
        try {
            fs_1.default.writeFileSync(this.usersFile, JSON.stringify(this.users, null, 2));
        }
        catch (error) {
            console.error('Error saving users:', error);
        }
    }
    saveClientProfiles() {
        try {
            fs_1.default.writeFileSync(this.clientProfilesFile, JSON.stringify(this.clientProfiles, null, 2));
        }
        catch (error) {
            console.error('Error saving client profiles:', error);
        }
    }
    getDefaultUsers() {
        const hashedPassword = '$2b$12$9RyQoSuTwzRbg43UZAaJVuM/282i0WKVs5JsbMHdDnS2puKVArePG';
        return [
            {
                id: 'admin-1',
                email: 'admin@smartdesk.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isActive: true,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01')
            }
        ];
    }
    getAllUsers() {
        return [...this.users];
    }
    getUserById(id) {
        return this.users.find(user => user.id === id) || null;
    }
    getUserByEmail(email) {
        return this.users.find(user => user.email === email) || null;
    }
    addUser(user) {
        this.users.push(user);
        this.saveUsers();
    }
    updateUser(id, updates) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1)
            return null;
        this.users[userIndex] = {
            ...this.users[userIndex],
            ...updates,
            updatedAt: new Date()
        };
        this.saveUsers();
        return this.users[userIndex];
    }
    deleteUser(id) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1)
            return false;
        this.users.splice(userIndex, 1);
        this.saveUsers();
        return true;
    }
    getAllClientProfiles() {
        return [...this.clientProfiles];
    }
    getClientProfileByUserId(userId) {
        return this.clientProfiles.find(profile => profile.userId === userId) || null;
    }
    addClientProfile(profile) {
        this.clientProfiles.push(profile);
        this.saveClientProfiles();
    }
    updateClientProfile(userId, updates) {
        const profileIndex = this.clientProfiles.findIndex(profile => profile.userId === userId);
        if (profileIndex === -1)
            return null;
        this.clientProfiles[profileIndex] = {
            ...this.clientProfiles[profileIndex],
            ...updates,
            updatedAt: new Date()
        };
        this.saveClientProfiles();
        return this.clientProfiles[profileIndex];
    }
    deleteClientProfile(userId) {
        const profileIndex = this.clientProfiles.findIndex(profile => profile.userId === userId);
        if (profileIndex === -1)
            return false;
        this.clientProfiles.splice(profileIndex, 1);
        this.saveClientProfiles();
        return true;
    }
}
exports.UserPersistenceService = UserPersistenceService;
exports.userPersistenceService = UserPersistenceService.getInstance();
//# sourceMappingURL=UserPersistenceService.js.map