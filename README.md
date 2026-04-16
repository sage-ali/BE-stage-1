# HNG-14 Backend Stage 0: Name Gender Classification API

## Project Description and Purpose

This project serves as the backend for the HNG-14 Stage 0 task, implementing a simple API to classify the likely gender of a given name using the Genderize.io service. It's built with Node.js and TypeScript, leveraging Express for robust API handling and custom error management.

## API Endpoint Documentation

### `GET /api/classify?name=<name>`

This endpoint accepts a name as a query parameter and returns a prediction of the name's gender, along with associated confidence metrics.

**Request:**

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
    "processed_at": "2026-04-13T01:00:00.000Z"
  }
}
```

**Error Response Examples:**

*   **Missing or Empty Name (400 Bad Request):**
    ```json
    {
      "status": "error",
      "message": "Name query parameter is required and cannot be empty"
    }
    ```

*   **Invalid Name Type (422 Unprocessable Entity):**
    ```json
    {
      "status": "error",
      "message": "Name query parameter must be a string"
    }
    ```

*   **No Prediction Available (422 Unprocessable Entity):**
    ```json
    {
      "status": "error",
      "message": "No prediction available for the provided name"
    }
    ```

*   **Upstream API Failure (502 Bad Gateway):**
    ```json
    {
      "status": "error",
      "message": "Genderize API returned non-OK status"
    }
    ```

*   **Upstream API Timeout (504 Gateway Timeout):**
    ```json
    {
      "status": "error",
      "message": "Genderize API request timed out after 5000ms"
    }
    ```

### Response Fields Explanation:

*   `name` (string): The name that was queried.
*   `gender` (string | null): The predicted gender (`male`, `female`), or `null` if no prediction could be made.
*   `probability` (number | null): The probability of the predicted gender, between 0 and 1, or `null`.
*   `sample_size` (number): The number of data samples Genderize.io used for the prediction.
*   `is_confident` (boolean): `true` if `probability >= 0.7` AND `sample_size >= 100`, otherwise `false`. This indicates a high-confidence prediction.
*   `processed_at` (string): ISO 8601 formatted UTC timestamp indicating when the request was processed by this API.

## Local Development

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (Node Package Manager)

### Installation

1.  Clone the repository:
    ```bash
    git clone git@github.com:codessage/stage-0-BE.git
    cd stage-0-BE
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

*   **Development Mode (with hot-reloading):**
    ```bash
    npm run dev
    ```
    The server will typically run on `http://localhost:3000` (or the port specified in your `.env` file).

*   **Build for Production:**
    ```bash
    npm run build
    ```
    This compiles TypeScript files to JavaScript in the `dist/` directory.

*   **Start Production Server:**
    ```bash
    npm start
    ```
    This runs the compiled application from the `dist/` directory.

## Live API URL

[Placeholder: This URL will be provided after deployment to Render.com]

## Technology Stack

*   **Runtime:** Node.js
*   **Language:** TypeScript
*   **Web Framework:** Express.js
*   **Middleware:** CORS
*   **External API:** Genderize.io (for gender prediction)
*   **Utilities:** `dotenv` (for environment variables)
*   **Development Tools:** `tsx` (for hot-reloading in dev), `tsc` (TypeScript compiler)

