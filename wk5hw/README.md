# Week 5 Day 2

React management interface for the primary Week 4 ERD entities:

- Drivers
- Vehicles
- Routes
- Packages

The app is built with Vite + React and performs CRUD operations against a Flask API hosted one folder above the frontend.

Day 2 additions:

- Delivery Routes interface for `service_zone`, `date`, and `driver_id`
- Package Management form with a required Route ID dropdown
- Route Details view that shows all packages assigned to the selected route
- Frontend validation to block blank required values and missing foreign keys

The Flask backend for this project lives one folder above this frontend:

- Backend: `/Users/ash/p4-wk4-aws`
- Frontend: `/Users/ash/p4-wk4-aws/wk5hw`

## API Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://YOUR-EC2-PUBLIC-IP:5000
```

For local development, use:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
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
- `GET /routes`
- `POST /routes`
- `PUT /routes/:id`
- `DELETE /routes/:id`
- `GET /packages`
- `POST /packages`
- `PUT /packages/:id`
- `DELETE /packages/:id`

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

```json
{
  "service_zone": "Citadel Sector 7",
  "date": "2026-05-06",
  "driver_id": 1
}
```

```json
{
  "description": "Plumbus parts crate",
  "weight": 4.5,
  "route_id": 1
}
```

## Run Locally

Start the Flask API from the parent folder:

```bash
cd /Users/ash/p4-wk4-aws
python3 app.py
```

Then start the React app:

```bash
cd /Users/ash/p4-wk4-aws/wk5hw
npm install
npm run dev
```

## Build

```bash
npm run build
```
