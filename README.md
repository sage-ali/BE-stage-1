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

```
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

### Installation

```bash
# Clone the repository
git clone git@github.com:codessage/BE-stage-1.git
cd BE-stage-1

# Install dependencies
pnpm install
```

### Running the Application

**Development Mode (with watch):**

```bash
pnpm run start:dev
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

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: NestJS
- **HTTP Client**: Axios
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest
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

For production deployment, refer to the [NestJS deployment documentation](https://docs.nestjs.com/deployment).

## License

UNLICENSED
