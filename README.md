# Enterprise Device Inventory Tracker

This is a self-contained responsive website for tracking Zebra TC78 inventory, checkouts, returns, repair tickets, and offline-device alerts.

## Run locally

Open `index.html` in a browser, or serve the folder with a simple static server.

Example with Node:

```powershell
npx serve .
```

## Included demo data

- 250 agents
- 300 devices
- 500 checkout history records
- seeded repair tickets and offline alert scenarios

## Notes

- Data is stored in browser `localStorage`
- Use `Reset Demo Data` to restore the original seed state
- This is a frontend demo site with client-side workflows and mock automation logic
