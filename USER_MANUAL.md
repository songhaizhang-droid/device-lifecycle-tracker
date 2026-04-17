# Enterprise Device Inventory Tracker User Manual

## 1. Overview

This website helps track Zebra TC78 devices across stations, agents, and repair workflows.

Main sections:

- Dashboard
- Agent Kiosk
- Device Directory
- Repair Center

## 2. Getting Started

Open the website in a browser. The app loads demo data automatically.

If you want to restore the original sample data, click `Reset Demo Data`.

## 3. Dashboard

The Dashboard shows:

- device counts by status
- active check-outs
- devices by station
- warranty expirations
- repair queue
- offline alerts

### Filter by Station

1. Open the `Station Filter` dropdown
2. Select an IATA code such as `YYZ`
3. The dashboard cards and lists update for that station

## 4. Agent Kiosk

Use this area for device handoff.

### Check Out a Device

1. Enter or scan the `Agent ID`
2. Enter the `Device Serial Number` or use `Scan Barcode`
3. Select `Checkout Duration`
4. Click `Check Out Device`

If the duration is more than 5 days, the app shows a charging reminder.

### Return a Device

1. Enter or scan the `Device Serial Number`
2. Click `Return Device`

### Report Damage

1. Enter the agent ID and device serial
2. Click `Report Damage`
3. The app takes you to the repair form with fields prefilled

## 5. Barcode Scanning

### Device Barcode

Each device has a barcode generated from its serial number.

### Scan in the Kiosk

1. Click `Scan Barcode`
2. Allow camera access if prompted
3. Point the camera at the barcode
4. The serial number field fills automatically

If scanning is not supported in your browser, enter the serial manually.

## 6. Device Directory

Use this section to search and review devices.

### Search and Filter

- search by device name or serial number
- filter by status
- station is shown directly in the list

### View Device Details

1. Click a device row
2. Review:
   current status
   station
   warranty
   assigned agent
   barcode
   checkout history
   repair history

## 7. Add New Device

1. Go to `Device Directory`
2. In `Add New Device`, enter:
   serial number
   device name
   station IATA code
   initial status
   warranty expiration date
3. Review the barcode preview
4. Click `Add Device`

Rules:

- serial number must be unique
- station must be a 3-letter IATA code

## 8. Repair Center

Use this section to create and manage repair tickets.

### Create a Repair Ticket

1. Select the device
2. Select the reporting agent
3. Enter the issue description
4. Click `Create Repair Ticket`

The device is moved to `In Repair`.

### Resolve a Repair Ticket

1. Find the ticket in the repair list
2. Click `Mark Resolved`

If no other open repair tickets exist for that device, it becomes `Available`.

## 9. Data Storage

This version stores data in the browser only.

- data is saved in `localStorage`
- different users do not share the same records
- clearing browser storage removes saved changes

## 10. Troubleshooting

### Barcode scanner does not open

- check camera permission
- check whether the browser supports barcode scanning
- use manual serial entry if needed

### Device row does not appear after adding

- clear search/filter values
- check that the device was added with a unique serial

### Dashboard looks wrong for a station

- confirm the selected station in the dashboard filter
- reset demo data if local browser state is corrupted
