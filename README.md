<div align="center">
    <h3 align="center">:notebook: Log book</h3>
</div>

## Опис

Бекенд-додаток для ведення базового фінансовго обліку.

- Регестрація/аунтефікація користувача
- Створення рахунку
- Деактивація рахунку
- Створення трансферів/транзакцій
- Аналітика фінансової активності користувача

## Розробники

- [Уколов Роман ІМ-41](https://github.com/fakeowl1)
- [Глеба Катерина ІМ-41](https://github.com/KaterynaHl)

## Технологічний стек

- Node.js v25.2 (серверна частина)
- Fastify (обробка запитів)
- Docker (сервіси)

## Інструкції з налаштування

1. Клонуйте репозиторій
2. Запустіть сервіси: `docker compose up -d`

## Запуск додатку

1. Завантажте бібліотеки: `npm install`
2. Запустіть міграції: `npx prisma migrate dev`
3. Запустіть додаток: `npm start` 

## Запуск тестів
Для тестів створюється тимчасовий контейнер з базою данних postgres. Після цього контейнер видаляється.

Запустити тести: `npm run start-test`

## Структура проєкту
```
src/
├── error-handler.js
├── routes
│   ├── accounts.js
│   ├── transaction.js
│   └── users.js
├── services
│   ├── account_service.js
│   ├── token_service.js
│   ├── transaction_service.js
│   └── user_service.js
├── test
│   ├── integration
│   └── unit
│       ├── account_service.test.js
│       ├── jest.unit.config.js
│       ├── transaction_service.test.js
│       ├── user_service.test.js
│       └── utils.test.js
└── utils.js
```

## Приклади API 

## TODO
- [ ] Додати опис версій
- [ ] Налаштувати docker
- [ ] Додати тести
