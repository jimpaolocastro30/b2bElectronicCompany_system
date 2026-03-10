# Protocol integration (Modbus TCP, IEC 60870, DNP3)

## Overview

The Energy B2B portal **does not implement full protocol stacks** (Modbus TCP, IEC 60870, DNP3, Ethernet/RS485 I/O) inside the Node.js backend. Instead, the platform expects **edge gateways or IoT services** to:

1. Talk to field devices using the appropriate protocol.
2. Normalize data (e.g. meter readings, grid metrics) and push them into this backend via **HTTP** or **WebSockets**.

This keeps the central API protocol-agnostic and allows different gateways (vendor-specific or open-source) to be swapped without changing the core application.

## Backend integration points

### 1. Usage readings (meter data)

- **Endpoint**: `POST /api/v1/admin/usage-readings` (admin or personnel, JWT).
- **Body**: `{ "readings": [ { "servicePointId", "timestamp", "value", "unit", "qualityFlag?" } ] }`
- **Payload shape**: `timestamp` ISO 8601; `unit` one of `kWh`, `therms`, `m3`; `qualityFlag` optional `actual` | `estimated` | `missing`.

A gateway that reads meters via Modbus or DNP3 should map registers/points to these fields and send batches to this endpoint (or to an internal queue that a worker posts from).

### 2. Grid status (ISO / DSO style)

- **Endpoint**: Not exposed as a public ingest in the current MVP. Options:
  - Add `POST /api/v1/admin/grid-status` (or a dedicated key-based ingest) accepting `{ "timestamp", "region", "frequency", "load", "renewablesShare", "alerts" }`.
  - Or have an edge service write directly to the `GridStatusSnapshot` collection if running in the same ecosystem.

The portal reads grid status via `GET /api/v1/grid/status` for dashboards.

### 3. Device endpoint metadata

- The **DeviceEndpoint** model stores protocol and connection metadata (e.g. Modbus TCP host/port/unitId, DNP3 RTU address) per service point or grid zone. The portal (or ops tools) can **read** this configuration; actual protocol connections are handled by external gateways that use this metadata to know where to connect.

## Environment and hardware

- **Application server**: Standard Node.js deployment (e.g. Linux in a data center or cloud). No special temperature or humidity requirements.
- **Field gateways / RTUs**: Environmental specs (**-10°C to 75°C**, **5–95% humidity**) and **NEMA/UL** apply to **these devices**, not to the Node/React application. Procurement and deployment of gateways should follow the RFP template and vendor specs.

## Summary

| Protocol / layer   | Implemented in this repo | Recommended approach                          |
|--------------------|---------------------------|-----------------------------------------------|
| Modbus TCP         | No                        | Edge gateway → HTTP/WS to this API            |
| IEC 60870          | No                        | Edge gateway → HTTP/WS to this API             |
| DNP3               | No                        | Edge gateway → HTTP/WS to this API             |
| Ethernet/RS485 I/O | No                        | Handled by gateways; data normalized and sent |

The backend provides **REST APIs and WebSockets** for real-time updates (e.g. usage, bills, grid). Gateway vendors integrate by posting to these endpoints and optionally subscribing to Socket.io for live dashboards.
