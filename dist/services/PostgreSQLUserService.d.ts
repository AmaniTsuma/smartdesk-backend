import { User, ClientProfile } from '../models/User';
export declare class PostgreSQLUserService {
    private static instance;
    private constructor();
    static getInstance(): PostgreSQLUserService;
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    addUser(user: User): Promise<void>;
    updateUser(id: string, updates: Partial<User>): Promise<User | null>;
    deleteUser(id: string): Promise<boolean>;
    getAllClientProfiles(): Promise<ClientProfile[]>;
    getClientProfileByUserId(userId: string): Promise<ClientProfile | null>;
    addClientProfile(profile: ClientProfile): Promise<void>;
    updateClientProfile(userId: string, updates: Partial<ClientProfile>): Promise<ClientProfile | null>;
    deleteClientProfile(userId: string): Promise<boolean>;
}
export declare const postgreSQLUserService: PostgreSQLUserService;
//# sourceMappingURL=PostgreSQLUserService.d.ts.map