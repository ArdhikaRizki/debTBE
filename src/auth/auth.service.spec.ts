import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt module
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    createUser: jest.fn(),
    findUnique: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        email: 'test@example.com',
      };

      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: 'uuid-1',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      };

      const expectedResult = {
        id: 'uuid-1',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserService.createUser.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        username: 'testuser',
        password: hashedPassword,
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(result).toEqual(expectedResult);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const username = 'testuser';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';

      const user = {
        id: 'uuid-1',
        username: 'testuser',
        password: hashedPassword,
        name: 'Test User',
        email: 'test@example.com',
      };

      mockUserService.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(username, password);

      expect(mockUserService.findUnique).toHaveBeenCalledWith({ username });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        id: 'uuid-1',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user is not found', async () => {
      mockUserService.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      const user = {
        id: 'uuid-1',
        username: 'testuser',
        password: 'hashedPassword123',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockUserService.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const user = {
        id: 'uuid-1',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
      };

      const token = 'jwt-token-123';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 'uuid-1',
      });
      expect(result).toEqual({
        access_token: token,
        user: {
          id: 'uuid-1',
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
        },
      });
    });
  });
});
