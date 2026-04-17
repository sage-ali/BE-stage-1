# HNG-14 Backend Stage 0: Name Gender Classification API

A NestJS-based REST API that predicts the gender of a given name using the Genderize.io service.

## Features

- **Gender Prediction**: Query any name to get predicted gender, probability, and confidence metrics
- **Global Validation**: Automatic request validation using NestJS ValidationPipe
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **CORS Support**: Enabled for cross-origin requests
- **Type-Safe**: Built with TypeScript for robust type checking

## API Documentation

### Base URL

```
http://localhost:3000
```

### Endpoints

#### `GET /`

Health check endpoint.

**Response:**

```json
{
  "message": "Name Gender Classification API is running"
}
```

#### `GET /health`

Service health status endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-04-17T05:25:00.000Z"
}
```

#### `GET /api/classify?name=<name>`

Predict the gender of a given name.

**Request Parameters:**

- `name` (required): The name to classify

**Example Request:**

```http
GET /api/classify?name=john
```

**Successful Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 10000,
    "is_confident": true,
    "processed_at": "2026-04-17T05:25:00.000Z"
  }
}
```

**Error Responses:**

*Missing Name (400 Bad Request):*

```json
{
  "status": "error",
  "message": "Name query parameter is required and cannot be empty"
}
```

*Invalid Name Type (422 Unprocessable Entity):*

```json
{
  "status": "error",
  "message": "Name query parameter must be a string"
}
```

*No Prediction Available (422 Unprocessable Entity):*

```json
{
  "status": "error",
  "message": "No prediction available for the provided name"
}
```

*API Failure (502 Bad Gateway):*

```json
{
  "status": "error",
  "message": "Genderize API returned non-OK status"
}
```

*API Timeout (504 Gateway Timeout):*

```json
{
  "status": "error",
  "message": "Genderize API request timed out after 5000ms"
}
```

### Response Fields

 | Field | Type | Description |
 |-------|------|-------------|
 | `name` | string | The queried name |
 | `gender` | string \| null | Predicted gender (`male`, `female`, or `null`) |
 | `probability` | number \| null | Probability between 0 and 1 |
 | `sample_size` | number | Number of data samples used |
 | `is_confident` | boolean | `true` if probability ≥ 0.7 and sample size ≥ 100 |
 | `processed_at` | string | ISO 8601 UTC timestamp |

## Local Development

### Prerequisites

- Node.js v18 or higher
- pnpm (recommended) or npm
- Docker and Docker Compose

### Environment Variables

- `LOG_LEVEL`: Set logging level (e.g., `info`, `debug`, `warn`, `error`). Default: `info`.
- `NODE_ENV`: Set to `production` for JSON logs; otherwise, pretty-logs are used.
- `DATABASE_URL`: PostgreSQL connection string.

### Setup Database (Docker)

Start the PostgreSQL database using Docker Compose:

```bash
pnpm run docker:up
```

### Database Migration

Push the Prisma schema to the database:

```bash
pnpm run db:push
```

### Installation

```bash
# Clone the repository
git clone git@github.com:codessage/BE-stage-1.git
cd BE-stage-1

# Install dependencies
pnpm install

# Generate Prisma Client
pnpm run prisma:generate
```

### Running the Application

**Development Mode:**

```bash
pnpm run start:dev
```

**Prisma Studio:**

To view the database contents:

```bash
pnpm run prisma:studio
```

**Build for Production:**

```bash
pnpm run build
```

**Start Production Server:**

```bash
pnpm run start
```

The server runs on `http://localhost:3000` by default (configurable via `PORT` environment variable).

### Testing

**Unit Tests:**

```bash
pnpm run test
```

**E2E Tests:**

```bash
pnpm run test:e2e
```

**Test Coverage:**

```bash
pnpm run test:cov
```

### Logging

Logs are output to stdout in JSON format (pretty-printed in development). You can customize the log level via the `LOG_LEVEL` environment variable.

### API Documentation

Interactive API documentation is available at `http://localhost:3000/api-docs`. The OpenAPI specification is generated automatically from the code using `@nestjs/swagger`.

**Endpoints documented:**

- `GET /` - Health check endpoint
- `GET /health` - Service health status endpoint
- `GET /api/classify?name=<name>` - Gender prediction endpoint with query parameter validation and response examples

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **HTTP Client**: Axios
- **Validation**: class-validator, class-transformer
- **Testing**: Vitest, Supertest
- **Logging**: Pino
- **Development**: pnpm, ts-node, ts-jest

## Project Structure

```
src/
├── classification/       # Gender classification module
│   ├── classification.controller.ts
│   ├── classification.service.ts
│   ├── classification.module.ts
│   ├── dto/
│   │   └── classification-query.dto.ts
│   └── types/
│       └── genderize.types.ts
├── prisma/              # Prisma configuration
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── filters/             # Exception filters
│   └── http-exception.filter.ts
├── middleware/          # Custom middleware
│   ├── errorHandler.ts
│   └── validateNameParam.ts
├── services/            # External services
│   └── genderizeService.ts
├── errors/              # Custom error classes
│   ├── ExternalApiError.ts
│   ├── NoPredictionError.ts
│   └── ValidationError.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## Deployment

### Render Deployment

This project includes a `render.yaml` blueprint for automated deployment to [Render](https://render.com).

**What's configured:**

- **PostgreSQL Database**: Free tier, automatically provisioned
- **Web Service**: Node.js application with automatic deploys
- **Environment Variables**: `DATABASE_URL` is automatically linked from the PostgreSQL service

**Deployment Steps:**

1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` file
3. The service will:
   - Run `pnpm install`
   - Run `pnpm prisma:generate` to generate the Prisma Client
   - Run `pnpm build` to compile the NestJS application
   - Start the production server with `pnpm start:prod`
4. Access your application at the provided Render URL

**Environment Variables (handled automatically):**

- `DATABASE_URL`: Connection string from Render's PostgreSQL service
- `PORT`: Provided by Render (default 3000)
- `NODE_ENV`: Set to `production`

### Docker Commands Reference

```bash
# Start PostgreSQL database
pnpm run docker:up

# Stop PostgreSQL database
pnpm run docker:down

# View running containers
docker compose ps
```

## License

UNLICENSED
