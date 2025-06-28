# NestJS + TypeORM + MySQL 實戰

本專案使用 pnpm 管理套件。

## 技術棧與核心套件

**主要套件**:
- `@nestjs/typeorm + typeorm`: ORM 框架，用 TypeScript 類別定義資料表，自動產生 SQL
- `mysql2`: MySQL 資料庫驅動程式
- `@nestjs/config + dotenv`: 環境變數管理
- `class-validator + class-transformer`: DTO 資料驗證
- `@nestjs/swagger`: API 文件自動生成

## 設定 NestJS 使用 .env 連接 MySQL

> 目標：讓 NestJS 可以讀取 .env 檔案，並使用 TypeORM 連接 MySQL。

先放上修改的內容，下面再說明。

```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全域可使用 .env
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT'), 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // 注意：在生產環境中不建議使用 synchronize
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 核心配置要點

- **異步配置**: 使用 `forRootAsync` 配合 `useFactory` 動態載入環境變數
- **全域設定**: `ConfigModule.forRoot({ isGlobal: true })` 讓所有模組都能使用 ConfigService
- **型別安全**: `config.get<string>('DB_HOST')` 提供 TypeScript 型別檢查
- **開發環境**: `synchronize: true` 自動同步 Entity 到資料庫（生產環境須關閉）

## 建立資料表(Entity) 與對應的 API

> 目標：建立簡單的 User 資料表 + CRUD API。

**快速開發工具**:
```bash
pnpm nest g resource user  # 自動生成完整 CRUD 結構
```

## Entity 設計要點

```ts
// src/user/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

## 使用 class-validator 進行 DTO 驗證

> 目標：透過 `class-validator` 套件為輸入資料加上驗證條件，避免寫入不合法資料

### 學習重點
- **全域驗證管道**: `app.useGlobalPipes(new ValidationPipe())` 自動驗證所有輸入
- **裝飾器驗證**: 使用 `@IsNotEmpty`、`@IsEmail` 等裝飾器定義驗證規則
- **自訂錯誤訊息**: 透過 `message` 屬性提供友善的錯誤訊息

### DTO 驗證範例

```ts
import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}
```

## 整理 Swagger 產生自動化 API 文件

> 目標：使用 Swagger 自動產生 /api 頁面，方便查看與測試 API

### 學習重點
- **自動文件生成**: 透過裝飾器自動產生 API 文件，訪問 `/api` 查看
- **API 分類**: `@ApiTags()` 將相關 API 分組
- **DTO 文件化**: `@ApiProperty()` 為 DTO 欄位添加說明和範例

### Swagger 配置範例

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Alice', description: '使用者名稱' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alice@example.com', description: '電子信箱' })
  @IsEmail()
  email: string;
}
```

訪問 `http://localhost:3000/api` 查看生成的 API 文件

## 全域錯誤處理 (Exception Filter)

> 目標：統一 API 的錯誤回傳格式，讓前端更容易處理錯誤。

### 學習重點
- **統一錯誤格式**: 使用 `ExceptionFilter` 介面統一所有 API 錯誤回應格式
- **全域註冊**: `app.useGlobalFilters()` 讓所有 Controller 都套用相同錯誤處理
- **錯誤分類**: 區分 `HttpException` 和一般錯誤，提供適當的狀態碼和訊息

### Exception Filter 範例

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
      
    response.status(status).json({
      status: false,
      error: { code: status, message, path: request.url }
    });
  }
}
```

統一錯誤回應格式：

```json
{
  "status": false,
  "error": {
    "code": 404,
    "message:" "User not found",
    "path": "/user/abc"
  }
}
```

## TypeORM 關聯設計 (User-Post 一對多)

### 學習重點

- **關聯定義**: 使用 `@OneToMany` 和 `@ManyToOne` 建立雙向關聯
- **級聯操作**: `onDelete: 'CASCADE'` 設定父資料刪除時子資料自動刪除
- **Repository 注入**: 在 Service 中同時注入多個 Repository 處理跨表操作
- **關聯查詢**: 使用 `relations: ['posts']` 進行 JOIN 查詢，一次取得關聯資料

### 開發細節與注意事項

#### 1. Module 設計
```ts
// PostModule 需要同時匯入 Post 和 User Entity
imports: [TypeOrmModule.forFeature([Post, User])]
```

#### 2. 關聯查詢的效能考量
```ts
// 好的做法：透過 User 查詢其 Posts
const user = await this.userRepository.findOne({
  where: { id: userId },
  relations: ['posts'], // JOIN 查詢，避免 N+1 問題
});

// 避免：多次查詢造成效能問題
```

#### 3. 外鍵驗證
```ts
// 建立 Post 前先驗證 User 是否存在
const user = await this.userRepository.findOne({
  where: { id: createPostDto.userId },
});
if (!user) {
  throw new Error(`User with id ${createPostDto.userId} not found`);
}
```

#### 4. TypeORM 關聯的重要概念
- **雙向關聯**: Entity 之間互相引用，但只有一方擁有外鍵（`@ManyToOne` 這邊）
- **Lazy Loading**: TypeORM 預設不會自動載入關聯資料，需明確指定 `relations`
- **Cascade Options**: 除了 `onDelete` 還有 `onUpdate`、`cascade` 等選項控制關聯行為

## TypeORM Migration 資料庫版本控制

### 為什麼需要 Migration？

在開發過程中，我們經常需要修改資料庫結構（新增表格、修改欄位、建立關聯等）。如果使用 `synchronize: true`，TypeORM 會自動同步 Entity 到資料庫，但這在生產環境非常危險，可能導致資料遺失。Migration 提供了：

- **版本控制**: 追蹤資料庫結構變更歷史
- **安全性**: 在生產環境中可控地更新資料庫結構
- **協作**: 團隊成員可以同步資料庫變更
- **回滾**: 可以撤銷錯誤的資料庫變更

### 設定 Migration 環境

#### 1. 建立 DataSource 配置檔案

```ts
// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './user/entities/user.entity';
import { Post } from './post/entities/post.entity';

// 載入 .env 檔案中的環境變數
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false, // 生產環境必須為 false，由 migration 管理
  logging: ['query', 'error'], // 開啟查詢日誌，方便調試
  entities: [User, Post], // 列出所有 Entity
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'], // Migration 檔案路徑
  subscribers: [],
});
```

### data-source.ts 與 app.module.ts 的關係說明

你可能會發現 `data-source.ts` 和 `app.module.ts` 中的資料庫配置非常相似，這是因為它們服務於不同的目的：

#### **data-source.ts - TypeORM CLI 專用**
- **用途**: 專門給 TypeORM CLI 工具使用（migration、entity 生成等）
- **執行環境**: 在 Node.js 環境中直接執行，不依賴 NestJS 框架
- **配置方式**: 直接使用 `process.env` 讀取環境變數
- **何時執行**: 執行 migration 相關指令時

```ts
// TypeORM CLI 使用這個配置檔案
// 當你執行 pnpm migration:generate 時會讀取這個檔案
export const AppDataSource = new DataSource({
  // 直接讀取 process.env，因為沒有 NestJS 的 ConfigService
  host: process.env.DB_HOST,
  // ... 其他配置
});
```

#### **app.module.ts - NestJS 應用程式專用**
- **用途**: NestJS 應用程式運行時的資料庫連線
- **執行環境**: 在 NestJS 框架內執行，可使用依賴注入
- **配置方式**: 使用 `ConfigService` 讀取環境變數（更安全、有型別檢查）
- **何時執行**: 應用程式啟動時

```ts
// NestJS 應用程式使用這個配置
// 當你執行 pnpm dev 啟動應用程式時會使用這個配置
TypeOrmModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    // 使用 ConfigService，提供型別安全和更好的錯誤處理
    host: config.get<string>('DB_HOST'),
    // ... 其他配置
  }),
});
```

#### **為什麼需要兩個相似的配置？**

1. **不同的執行上下文**:
   - CLI 工具在 NestJS 框架外運行，無法使用 `ConfigService`
   - 應用程式在 NestJS 框架內運行，可以利用依賴注入系統

2. **不同的使用時機**:
   - `data-source.ts`: 開發時使用（生成 migration、檢查資料庫狀態）
   - `app.module.ts`: 運行時使用（應用程式連接資料庫）

3. **配置同步**:
   - 兩個檔案的配置必須保持一致
   - 任何資料庫結構變更都需要在兩個地方反映

#### **最佳實踐建議**

為了避免配置不一致，可以考慮以下方法：

```ts
// 建立共用的配置物件
// src/config/database.config.ts
export const getDatabaseConfig = () => ({
  type: 'mysql' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Post],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  synchronize: false,
});

// data-source.ts 中使用
export const AppDataSource = new DataSource(getDatabaseConfig());

// app.module.ts 中使用
TypeOrmModule.forRoot(getDatabaseConfig()),
```

#### 2. 修改 AppModule 配置

```ts
// src/app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Post], // 明確列出所有 Entity
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: false, // 應用程式啟動時不自動執行 migration
        migrationsTableName: 'typeorm_migrations', // 儲存 migration 記錄的資料表
        synchronize: false, // 重要：生產環境必須為 false
      }),
    }),
  ],
})
```

#### 3. 新增 Migration Scripts

需要安裝額外套件：
```bash
pnpm add -D tsconfig-paths
```

在 `package.json` 中新增 scripts：
```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs -d src/data-source.ts",
    "migration:create": "npm run typeorm migration:create",
    "migration:generate": "npm run typeorm migration:generate",
    "migration:run": "npm run typeorm migration:run",
    "migration:revert": "npm run typeorm migration:revert",
    "migration:show": "npm run typeorm migration:show"
  }
}
```

### Migration 指令使用指南

根據你的 `package.json` 配置，以下是正確的使用方式：

#### **1. migration:generate - 自動生成 migration**
```bash
# 語法：pnpm migration:generate src/migrations/描述性名稱
pnpm migration:generate src/migrations/InitialMigration
pnpm migration:generate src/migrations/AddUserAge
pnpm migration:generate src/migrations/CreatePostTable
```
**使用時機**：當你修改了 Entity（新增欄位、修改關聯、新增表格等）後使用
**作用**：比較當前 Entity 定義與資料庫現狀，自動生成需要的 SQL 變更

#### **2. migration:create - 手動建立空 migration**
```bash
# 語法：pnpm migration:create src/migrations/描述性名稱
pnpm migration:create src/migrations/SeedInitialData
pnpm migration:create src/migrations/UpdateUserPasswords
```
**使用時機**：需要手動寫 SQL（如資料種子、複雜的資料轉換）
**作用**：建立空的 migration 檔案，需要手動填寫 up() 和 down() 方法

#### **3. migration:run - 執行 migration**
```bash
pnpm migration:run
```
**使用時機**：
- 剛建立新的 migration 後
- 從 git 拉取了別人的 migration
- 部署到生產環境前
**作用**：執行所有尚未執行的 migration

#### **4. migration:show - 查看 migration 狀態**
```bash
pnpm migration:show
```
**使用時機**：想確認哪些 migration 已執行、哪些尚未執行
**輸出範例**：
```
[ ] 1750500254254-InitialMigration  // 尚未執行
[X] 1750500356789-AddUserAge        // 已執行
```

#### **5. migration:revert - 撤銷上一個 migration**
```bash
pnpm migration:revert
```
**使用時機**：上一個 migration 有問題，需要回滾
**作用**：執行最後一個 migration 的 down() 方法，撤銷變更

### 實際工作流程範例

#### **場景 1：你想為 User 新增一個 age 欄位**
```bash
# 1. 先修改 User entity
# src/user/entities/user.entity.ts
@Column({ nullable: true })
age: number;

# 2. 生成對應的 migration
pnpm migration:generate src/migrations/AddUserAgeColumn

# 3. 檢查生成的 migration 檔案是否正確
# 4. 執行 migration
pnpm migration:run

# 5. 確認執行狀態
pnpm migration:show
```

#### **場景 2：你想撤銷剛才的變更**
```bash
# 撤銷上一個 migration
pnpm migration:revert

# 確認狀態
pnpm migration:show
```

#### **場景 3：團隊協作，同事新增了 migration**
```bash
# 1. 從 git 拉取最新程式碼
git pull

# 2. 查看有哪些新的 migration
pnpm migration:show

# 3. 執行新的 migration
pnpm migration:run
```

### 開發流程建議

#### 1. 開發階段
```bash
# 1. 修改 Entity 定義
# 2. 生成對應的 migration
pnpm migration:generate src/migrations/DescriptiveName

# 3. 檢查生成的 migration 檔案是否正確
# 4. 執行 migration
pnpm migration:run
```

#### 2. 生產部署
```bash
# 部署前先執行 migration
pnpm migration:run

# 確認 migration 狀態
pnpm migration:show
```

### 重要注意事項

#### 1. 關閉 synchronize
- **開發環境**: 可以暫時使用 `synchronize: true` 快速原型開發
- **生產環境**: 必須設定 `synchronize: false`，完全依賴 migration 管理資料庫結構

#### 2. Migration 檔案管理
- **不要手動修改已執行的 migration 檔案**
- **確保 migration 檔案被加入版本控制**
- **migration 名稱要具有描述性**

#### 3. 團隊協作
- 所有成員都應該執行相同的 migration
- 合併程式碼前確保 migration 衝突已解決
- 定期清理不必要的 migration 檔案

#### 4. 資料安全
- 在生產環境執行 migration 前先備份資料庫
- 測試 migration 的 up 和 down 方法
- 避免在 migration 中刪除重要資料

## 使用者認證 (JWT) 與密碼安全

> 目標：建立一個安全的使用者註冊與登入流程，並使用 JWT (JSON Web Token) 作為使用者狀態管理的通行證。

### 學習重點
- **密碼雜湊**: 使用 `bcrypt` 套件對使用者密碼進行加鹽雜湊，避免在資料庫中儲存明文密碼。
- **DTO 驗證**: 為註冊和登入的 DTO 加上 `class-validator` 規則，從入口處阻擋無效請求。
- **JWT 簽發**: 在使用者成功登入後，使用 `@nestjs/jwt` 簽發一個包含使用者資訊的 JWT。
- **非同步模組設定**: 使用 `JwtModule.registerAsync` 配合 `ConfigService`，安全地從環境變數載入 JWT Secret。

### 核心流程程式碼範例

#### 1. 在 DTO 中加入密碼欄位與驗證

```ts
// src/user/dto/create-user.dto.ts
import { IsNotEmpty, IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  // ... name 和 email 欄位
  
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
```

#### 2. 在 Service 中進行密碼雜湊

```ts
// src/user/user.service.ts
import * as bcrypt from 'bcrypt';

// ...
async create(createUserDto: CreateUserDto) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(
    createUserDto.password,
    saltRounds,
  );

  const newUser = this.userRepository.create({
    ...createUserDto,
    password: hashedPassword,
  });

  return this.userRepository.save(newUser);
}
```

#### 3. 在 AuthService 中驗證使用者並簽發 JWT

```ts
// src/auth/auth.service.ts
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
// ...

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userService.findUserForAuth(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

#### 4. 安全地設定 AuthModule

```ts
// src/auth/auth.module.ts
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  // ...
})
export class AuthModule {}
```

### 開發細節與注意事項

#### 1. `select: false` 與 `QueryBuilder`
為了安全，`User` Entity 中的 `password` 欄位應設定為 `select: false`，使其在一般查詢中不會被回傳。但在驗證密碼時，我們又需要取得它。這時就必須使用 `QueryBuilder`。

```ts
// src/user/user.service.ts

// 專門給 AuthService 使用的查詢方法
async findUserForAuth(email: string): Promise<User | undefined> {
  return this.userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .addSelect('user.password') // 關鍵：強制選取 password 欄位
    .getOne();
}
```

#### 2. 安全的錯誤回傳
在 `AuthService` 的 `signIn` 方法中，無論是「使用者不存在」還是「密碼錯誤」，都應該回傳**完全相同**的錯誤訊息（例如 `Invalid credentials`）。這可以防止攻擊者透過錯誤訊息的差異來猜測哪個帳號是存在的。

#### 3. JWT Secret 的管理
JWT Secret 是系統安全的核心，**絕對不能**硬編碼在程式碼中。
- **開發環境**: 將其存放在 `.env` 檔案中。
- **生產環境**: 使用雲端服務商提供的秘密管理工具（如 AWS Secrets Manager, GCP Secret Manager）或作業系統的環境變數來管理。
- **`.gitignore`**: 確保 `.env` 檔案被加入到 `.gitignore` 中，避免將密鑰洩漏到版本控制系統。