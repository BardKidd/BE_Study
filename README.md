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
