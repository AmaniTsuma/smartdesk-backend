import { User, ClientProfile } from '../models/User';
export declare class UserPersistenceService {
    private static instance;
    private users;
    private clientProfiles;
    private readonly dataDir;
    private readonly usersFile;
    private readonly clientProfilesFile;
    private constructor();
    static getInstance(): UserPersistenceService;
    private ensureDataDirectory;
    private loadUsers;
    private loadClientProfiles;
    private saveUsers;
    private saveClientProfiles;
    private getDefaultUsers;
    getAllUsers(): User[];
    getUserById(id: string): User | null;
    getUserByEmail(email: string): User | null;
    addUser(user: User): void;
    updateUser(id: string, updates: Partial<User>): User | null;
    deleteUser(id: string): boolean;
    getAllClientProfiles(): ClientProfile[];
    getClientProfileByUserId(userId: string): ClientProfile | null;
    addClientProfile(profile: ClientProfile): void;
    updateClientProfile(userId: string, updates: Partial<ClientProfile>): ClientProfile | null;
    deleteClientProfile(userId: string): boolean;
}
export declare const userPersistenceService: UserPersistenceService;
//# sourceMappingURL=UserPersistenceService.d.ts.map