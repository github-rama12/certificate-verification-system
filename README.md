# Certificate Verification System

Node.js + Express + MongoDB + QR code generation.

## Run locally
1. Install Node.js.
2. Open this folder in VS Code.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your MongoDB Atlas connection string in `MONGODB_URI`.
6. Set `BASE_URL=http://localhost:3000`.
7. Run `npm start`.

## Create a certificate
POST `/api/certificates` with JSON such as:
{
  "studentName":"PAGOTI RAMACHANDRA RAO",
  "courseName":"Artificial Intelligence",
  "category":"Internship",
  "duration":"12 Weeks",
  "companyName":"CODTECH IT SOLUTIONS PRIVATE LIMITED",
  "startDate":"20 May 2026",
  "endDate":"20 August 2026"
}

The response includes a verification URL and QR URL.

## Verify
`/verify/<certificateId>`

## Note
This is a template for certificates you are authorized to issue. It should not be used to alter or misrepresent an issuer's certificate.
