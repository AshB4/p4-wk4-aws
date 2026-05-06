# Week 5 Day 1

React management interface for the primary Week 4 ERD entities:

- Drivers
- Vehicles

The app is built with Vite + React and performs CRUD operations against a live Flask API hosted on EC2.

## API Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://YOUR-EC2-PUBLIC-IP:5000
```

Expected REST endpoints:

- `GET /drivers`
- `POST /drivers`
- `PUT /drivers/:id`
- `DELETE /drivers/:id`
- `GET /vehicles`
- `POST /vehicles`
- `PUT /vehicles/:id`
- `DELETE /vehicles/:id`

Expected request payloads:

```json
{
  "name": "Jordan Ramirez",
  "license_type": "Class A"
}
```

```json
{
  "license_plate": "TX-4821",
  "model": "Ford Transit 250"
}
```

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
