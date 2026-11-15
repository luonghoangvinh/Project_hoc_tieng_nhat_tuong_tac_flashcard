# React + Vite
các thư viện cần cài

## thư viện dùng lúc mapping, giúp dữ liệu được tạo hoặc update theo đúng định dạng, không lỗi hệ thống.
npm install class-validator class-transformer @nestjs/mapped-types
## nestJS config để đọc file .env
npm install @nestjs/config

## hai thư viện giúp tính năng authentification
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt

 ## để TypeScript hiểu được kiểu dữ liệu của: passport-jwt và bcrypt
npm install -D @types/passport-jwt @types/bcrypt




# để sử dụng nestjs,react cần
Cài Node.js
Cài Nest CLI

khởi tạo project nestJS cho backend:
trong terminal gõ và ấn enter: nest new my-nest-app
sau đó chọn: npm

# khi tải nestjs thì nếu gặp lỗi dòng baseURL ở file tsconfig thì thay dòng đó bằng hai dòng này:

    "types": ["jest", "node"],
    "rootDir": "./",
    

### install mongoose
this <mongoose>library is used to connect with mongodb
npm install @nestjs/mongoose mongoose

tạo file "vite-env.d.ts" thêm declare module "*.css" vào file và luôn mở nó, nếu mà bị lỗi import file .css





## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## cách chạy project này
nhập: npm run start:dev
khi dừng chương trình, ấn tổ hợp phím Ctrl + C

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```