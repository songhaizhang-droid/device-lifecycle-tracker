# Enterprise Device Inventory Tracker Test Cases

## 1. Dashboard

### TC-DASH-001 Load dashboard successfully

- Precondition: app is opened
- Steps:
  1. Open the home page
- Expected:
  - dashboard loads without error
  - KPI cards are visible
  - active assignments list is populated

### TC-DASH-002 Filter dashboard by station

- Precondition: app loaded with demo data
- Steps:
  1. Select a station from `Station Filter`
- Expected:
  - metrics update
  - checked-out table updates
  - devices by station card reflects filtered set
  - warranty, repair, and offline lists update

## 2. Device Directory

### TC-DIR-001 Open device detail

- Steps:
  1. Navigate to `Device Directory`
  2. Click a device row
- Expected:
  - detail panel updates
  - station is shown
  - barcode is shown
  - history and repair sections appear

### TC-DIR-002 Search by serial

- Steps:
  1. Enter a known serial number in search
- Expected:
  - matching device row is shown
  - unrelated rows are hidden

### TC-DIR-003 Filter by status

- Steps:
  1. Select `In Repair` from status filter
- Expected:
  - only devices in repair appear

## 3. Add Device

### TC-ADD-001 Add valid new device

- Steps:
  1. Open `Device Directory`
  2. Enter unique serial number
  3. Enter device name
  4. Enter valid 3-letter station code
  5. Select status
  6. Select warranty date
  7. Click `Add Device`
- Expected:
  - success message is shown
  - new device appears in directory
  - device detail shows station and barcode

### TC-ADD-002 Reject duplicate serial

- Steps:
  1. Add a new device using an existing serial number
- Expected:
  - error message is shown
  - no duplicate device is created

### TC-ADD-003 Reject invalid station code

- Steps:
  1. Enter station code shorter or longer than 3 letters
  2. Submit form
- Expected:
  - validation error is shown
  - device is not created

### TC-ADD-004 Barcode preview updates with serial

- Steps:
  1. Type a new serial number in the add-device form
- Expected:
  - barcode preview updates immediately

## 4. Kiosk Checkout and Return

### TC-KIOSK-001 Successful checkout

- Steps:
  1. Enter valid agent ID
  2. Enter available device serial
  3. Click `Check Out Device`
- Expected:
  - success toast is shown
  - device status becomes `Checked Out`
  - active transaction is created

### TC-KIOSK-002 Reject checkout for unavailable device

- Steps:
  1. Enter valid agent ID
  2. Enter serial for device in repair or already checked out
  3. Click `Check Out Device`
- Expected:
  - error toast is shown
  - no new checkout transaction is created

### TC-KIOSK-003 Successful return

- Steps:
  1. Enter serial for a checked-out device
  2. Click `Return Device`
- Expected:
  - active transaction is closed
  - device becomes `Available`

### TC-KIOSK-004 Reject return without active transaction

- Steps:
  1. Enter serial for device without an active checkout
  2. Click `Return Device`
- Expected:
  - error toast is shown

### TC-KIOSK-005 Show long-duration charging reminder

- Steps:
  1. Select `7 days` or `10 days`
- Expected:
  - warning message appears in kiosk

### TC-KIOSK-006 Long-duration checkout reminder toast

- Steps:
  1. Select duration greater than 5 days
  2. Complete checkout
- Expected:
  - charging reminder toast appears

## 5. Barcode

### TC-BAR-001 Device detail barcode renders

- Steps:
  1. Open any device in directory
- Expected:
  - barcode graphic is visible
  - barcode value text is visible

### TC-BAR-002 Kiosk barcode scan fills serial

- Precondition: browser supports camera and barcode detection
- Steps:
  1. Open `Agent Kiosk`
  2. Click `Scan Barcode`
  3. Scan valid device barcode
- Expected:
  - serial field is populated
  - scanner closes

### TC-BAR-003 Unsupported browser fallback

- Precondition: browser without `BarcodeDetector`
- Steps:
  1. Click `Scan Barcode`
- Expected:
  - user sees fallback error/info toast
  - user can still type serial manually

## 6. Repair Flow

### TC-REP-001 Create repair ticket

- Steps:
  1. Open `Repair Center`
  2. Select device and reporting agent
  3. Enter issue
  4. Submit form
- Expected:
  - repair ticket is created
  - device moves to `In Repair`

### TC-REP-002 Resolve repair ticket

- Steps:
  1. Click `Mark Resolved` on open repair ticket
- Expected:
  - ticket becomes resolved
  - if no other open ticket exists, device becomes `Available`

## 7. Persistence

### TC-DATA-001 Local changes persist after refresh

- Steps:
  1. Add a device or check out a device
  2. Refresh the page
- Expected:
  - change is retained

### TC-DATA-002 Reset demo data restores seed state

- Steps:
  1. Make several changes
  2. Click `Reset Demo Data`
- Expected:
  - seed dataset is restored
  - custom changes are removed
