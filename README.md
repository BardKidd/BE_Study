# NestJS + TypeORM + MySQL 實戰

本專案使用 pnpm 管理套件。

## 安裝必要套件

- @nestjs/typeorm + typeorm

> typeorm 是 TypeORM 的核心函式庫  
> @nestjs/typeorm 是讓 NestJS 的整合包。可以整合並使用 TypeORM。

可以用來定義資料表(Entity)，使用上就類似撰寫 TypeScript 類別。  
也可以自動產生 SQL 指令來指令來建立/查詢/更新/刪除資料表。

```ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

- mysql2

> MySQL 的驅動程式。

TypeORM 沒有支援所有的資料庫，所以需要安裝對應的 driver 才能正常工作。

- @nestjs/config

> NestJS 官方的設定模組，可以用來讀取與管理環境變數(process.env)。  
> 需要使用環境變數還需要額外安裝 dotenv 套件。

- dotenv

> 來讀取 .env 檔案內容到 process.env 當中。

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

### imports 是什麼？

這是 NestJS 中 Module 的一個屬性，用來引入其他模組的功能，可以想像成「裝備零件」。

AppModule 可以想像成總控制的大模組，imports 就是要進來組裝的小零件。

#### ConfigModule

> 用來幫你把 .env 的內容「讀進來」，再用 ConfigService 讓你在任何地方都可以「讀取設定值」。

- `.forRoot({})`
  - `isGlobal`: 設定為 `true` 的話表示整個應用程式內都可以使用 `ConfigService`，不需要每個模組都手動 `imports: [ConfigModule]`。

#### ConfigService

> 在任何地方都能讀取 .env 的設定值。搭配 TypeScript 使用時，可以提供型別檢查。

```ts
config.get<string>('DB_HOST'); // 可以搭配 TypeScript 來寫型別，使用上比 process.env 更安全。
```

#### TypeOrmModule.forRootAsync()

> 用來設定資料庫參數。

- inject: [ConfigService] -> 告訴 NestJS 要把 ConfigService 注入進來。
- useFactory: -> 回傳資料庫的設定。

## 建立資料表(Entity) 與對應的 API

> 目標：建立簡單的 User 資料表 + CRUD API。

快速產生完整 CRUD 結構

```bash
pnpm nest g resource user
```

幫你產生以下的檔案結構

```
src/user/
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/
│   └── user.entity.ts
├── user.controller.ts
├── user.module.ts
├── user.service.ts

```

## 定義 User 資料表(Entity)

> 目標：定義 User 資料表的欄位與型別。

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
