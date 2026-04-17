# Enterprise Device Inventory Tracker Design Document

## 1. Purpose

This web application manages shared Zebra TC78 barcode scanners used by airline ramp agents. It supports:

- device inventory tracking
- station-based grouping by IATA code
- check-out and return workflows
- repair ticket reporting
- offline-device alert visibility
- barcode generation and barcode-assisted kiosk workflows

The current implementation is a browser-based frontend demo with seeded mock data and local persistence.

## 2. Goals

- Provide a fast kiosk workflow for device check-out and check-in
- Give supervisors a dashboard view of inventory and status
- Group inventory by station
- Track repair and historical transaction activity
- Support barcode-based device lookup and scanning
- Allow demo usage without a backend

## 3. Non-Goals

- Multi-user shared persistence
- Real authentication or authorization
- Real email or notification delivery
- Real MDM integration or live device telemetry
- Enterprise barcode printer integration

## 4. Architecture

The app is implemented as a static website:

- [index.html](C:/Users/3892/Documents/New%20project/index.html): layout and UI structure
- [styles.css](C:/Users/3892/Documents/New%20project/styles.css): responsive styling and visual design
- [app.js](C:/Users/3892/Documents/New%20project/app.js): data generation, rendering, state management, workflows, and scanner logic

The site runs fully in the browser. Data is stored in `localStorage` under the key `device-lifecycle-demo-state-v1`.

## 5. Data Model

### Agents

- `agentId`
- `fullName`
- `role`

### Devices

- `serialNumber`
- `deviceName`
- `stationCode`
- `barcodeValue`
- `status`
- `warrantyExpirationDate`
- `lastSeenOnline`
- `currentAssignedAgentId`

### Checkout History

- `transactionId`
- `deviceSerial`
- `agentId`
- `checkoutAt`
- `checkoutDurationDays`
- `checkinAt`
- `transactionStatus`

### Repair Tickets

- `ticketId`
- `deviceSerial`
- `reportedByAgentId`
- `dateReported`
- `issueDescription`
- `repairStatus`

## 6. Main Features

### Dashboard

- KPI metrics for available, checked out, in repair, and history count
- station filter
- active assignment table
- devices by station summary
- warranty watch list
- repair queue
- offline alert list

### Agent Kiosk

- agent ID entry
- device serial entry
- barcode scan button
- checkout duration selection
- over-5-day charge reminder
- check-out and return actions
- damage reporting handoff to repair form

### Device Directory

- searchable and filterable device table
- station-aware sorting
- device detail panel
- barcode display for each device
- new device creation form
- live barcode preview for new devices

### Repair Center

- repair ticket form
- open ticket list
- resolve repair action

## 7. Barcode Design

Each device is assigned a generated barcode string:

- format: `DEV-{serialNumber}`
- example: `DEV-TC78-0001`

The app renders a visual barcode representation in SVG for display purposes. Camera scanning uses browser barcode detection when supported. If unsupported, users can still manually enter the serial number.

## 8. State and Persistence

### Seeded Data

The mock environment creates:

- 250 agents
- 300 devices
- 500 checkout history records
- repair tickets

### Persistence Model

- first load creates seeded demo state
- subsequent changes are persisted to browser `localStorage`
- reset restores original seed data

## 9. Workflow Logic

### Check Out

1. Validate agent ID
2. Validate device serial
3. Confirm device is available
4. Create active checkout transaction
5. Save checkout duration
6. Update device status and assigned agent
7. If duration > 5 days, show charging reminder

### Return

1. Validate device
2. Find active checkout transaction
3. Stamp check-in time
4. Mark transaction closed
5. Return device to available

### Damage Report

1. Create repair ticket
2. Mark device in repair
3. Close active checkout if one exists

### Station Filtering

Dashboard metrics and dashboard lists are filtered by selected station. Device directory remains global but displays station per row.

## 10. Browser Dependencies

### Required

- modern browser with JavaScript enabled

### Optional

- camera access
- `BarcodeDetector` support for live barcode scanning

If barcode scanning is unavailable, manual serial entry remains supported.

## 11. Limitations

- Data is not shared across users or devices
- Scanner support depends on browser implementation
- Offline alerts are simulated from mock timestamps
- Barcodes are generated client-side and are not printer-calibrated labels

## 12. Recommended Future Enhancements

- backend database for shared multi-user data
- authentication and role-based access
- station master-data management
- barcode/QR label export and print sheets
- agent ID barcode scanning
- expected return date and overdue views
- audit logs and reporting exports
