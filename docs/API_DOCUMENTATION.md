# SafeRoute-AI API Documentation

Welcome to the backend API specification for **SafeRoute-AI**. This document describes both the currently implemented foundational endpoints and the planned route evaluation and incident reporting endpoints for the hackathon MVP.

---

## 1. General Overview

- **Base URL (Local Development):** `http://localhost:8000` or `http://127.0.0.1:8000`
- **Interactive OpenAPI Documentation (Swagger UI):** `http://localhost:8000/docs`
- **Alternative ReDoc UI:** `http://localhost:8000/redoc`
- **Data Exchange Format:** `application/json`

---

## 2. Currently Implemented Endpoints

### 2.1 API Root Information

Returns basic project metadata, current API version, and navigation links.

- **Method:** `GET`
- **Path:** `/`
- **Status Code:** `200 OK`

#### Response Example:
```json
{
  "project": "SafeRoute-AI",
  "description": "Intelligent safety-aware routing engine API",
  "version": "0.1.0",
  "documentation": "/docs",
  "health_check": "/health",
  "status": "online"
}
```

---

### 2.2 System Health Check

Validates the operational readiness of the FastAPI application.

- **Method:** `GET`
- **Path:** `/health`
- **Status Code:** `200 OK`

#### Response Example:
```json
{
  "status": "healthy",
  "service": "saferoute-backend",
  "timestamp": "2026-11-19T14:54:30.123456Z",
  "environment": "development"
}
```

---

## 3. Planned Endpoints (Hackathon Roadmap)

### 3.1 Evaluate Route Safety
Calculates and scores candidate navigation paths between an origin and destination coordinate pair.

- **Method:** `POST`
- **Path:** `/api/v1/routes/evaluate`
- **Status Code:** `200 OK`

#### Request Body Schema:
```json
{
  "origin": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "destination": {
    "latitude": 37.7891,
    "longitude": -122.4014
  },
  "travel_mode": "walking",
  "preferences": {
    "prioritize_lighting": true,
    "avoid_high_incident_zones": true,
    "max_detour_percent": 20
  }
}
```

#### Response Body Schema:
```json
{
  "routes": [
    {
      "route_id": "route_safest_01",
      "type": "SAFEST",
      "safety_score": 88.5,
      "risk_level": "LOW_RISK",
      "distance_meters": 1850,
      "estimated_duration_seconds": 1320,
      "polyline": "encoded_polyline_string_here",
      "safety_factors": {
        "average_lighting": 0.85,
        "incident_count_within_100m": 0,
        "well_lit_segments_ratio": 0.92
      }
    },
    {
      "route_id": "route_fastest_02",
      "type": "FASTEST",
      "safety_score": 62.0,
      "risk_level": "MODERATE_RISK",
      "distance_meters": 1500,
      "estimated_duration_seconds": 1080,
      "polyline": "encoded_polyline_string_here",
      "safety_factors": {
        "average_lighting": 0.45,
        "incident_count_within_100m": 3,
        "well_lit_segments_ratio": 0.50
      }
    }
  ]
}
```

---

### 3.2 Single Coordinate / Zone Safety Score
Queries immediate safety score and localized indicators for a given geographic point.

- **Method:** `GET`
- **Path:** `/api/v1/safety-score`
- **Query Parameters:**
  - `lat` (float, required): Latitude of target location.
  - `lng` (float, required): Longitude of target location.
  - `radius` (int, optional, default: 250): Radius in meters to evaluate.

#### Response Body Schema:
```json
{
  "coordinate": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "safety_score": 79.0,
  "risk_level": "LOW_RISK",
  "indicators": {
    "lighting_rating": 0.8,
    "crowd_density": 0.7,
    "recent_incidents": 1
  },
  "last_updated": "2026-11-19T14:00:00Z"
}
```

---

### 3.3 Submit Community Safety Report
Allows users to report localized hazards (broken street lights, harassment, suspicious activity, unlit areas).

- **Method:** `POST`
- **Path:** `/api/v1/reports`
- **Status Code:** `201 Created`

#### Request Body Schema:
```json
{
  "latitude": 37.7762,
  "longitude": -122.4150,
  "category": "poor_lighting",
  "description": "Street lights completely out on 4th street corner.",
  "severity": "medium",
  "anonymous": true
}
```

#### Response Body Schema:
```json
{
  "report_id": "rep_94f83a2e",
  "status": "received",
  "created_at": "2026-11-19T14:55:10Z"
}
```

---

### 3.4 Retrieve Active Community Reports
Fetches safety hazards and incident reports within a bounding box for rendering map overlays.

- **Method:** `GET`
- **Path:** `/api/v1/reports`
- **Query Parameters:**
  - `min_lat` (float, required)
  - `min_lng` (float, required)
  - `max_lat` (float, required)
  - `max_lng` (float, required)

---

## 4. Standard HTTP Status Codes & Error Response

All error responses return a standardized JSON structure:

```json
{
  "detail": "Descriptive error message explaining the issue."
}
```

| HTTP Status | Meaning | Typical Scenario |
| :--- | :--- | :--- |
| `200 OK` | Success | Request succeeded and data returned. |
| `201 Created` | Created | Resource successfully created (e.g. incident report). |
| `400 Bad Request` | Client Error | Malformed coordinates, invalid date formats. |
| `422 Unprocessable Entity` | Validation Error | Pydantic schema validation failure. |
| `500 Internal Server Error` | Server Error | Unhandled backend exception or database downtime. |
