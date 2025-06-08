# Project Management App

A full-stack project management application built with Next.js, tRPC, Prisma, and deployed with SST on AWS.

## Features

- User Authentication with NextAuth.js
- Project Management
- Task Management
- Team Collaboration
- Real-time Updates
- Beautiful UI with Tailwind CSS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/abhi567449/ProjectApp.git
cd ProjectApp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your values.

4. Run database migrations:
```bash
npx prisma migrate deploy
```

5. Start the development server:
```bash
npm run dev
```

## Deployment

The app is configured to deploy on AWS using SST (Serverless Stack).

1. Configure AWS credentials
2. Deploy:
```bash
npm run deploy
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
