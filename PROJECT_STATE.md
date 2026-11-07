# Project State: AURA (Account & Unified Resource Analytics)

## Project Objective
An interactive, 3D web-based portal to track enterprise usage of RHEL and OCP, featuring ultra-smooth animations and a strict Red/Black/White aesthetic.

## Architecture
- **Backend:** Go (Standard Library `net/http`)
- **Frontend:** HTML5, CSS3, JavaScript (ES6)

## Implemented Features
- [x] Initial project setup and state creation.
- [x] Dynamic backend generation of 258+ clusters and nodes.
- [x] Cluster Full List View & Cluster Details View.
- [x] Restored global search, profile, and RHEL/OCP toggles.
- [x] Dashboard metrics mapped to 4 sparkline graphs.
- [x] Added Cluster-specific Case Table and Case Inflow Graph.
- [x] Restored Three.js interactive mouse parallax.
- [x] Added 3 new enterprise accounts (Snape Research, Rajini Motors, Random AI).
- [x] OCP Version variability added to dynamic cluster generator.
- [x] Rebranded portal to AURA (Account & Unified Resource Analytics).
- [x] Added animated Splash/Landing screen with Red typography and floating entry button.
- [x] ROLLBACK: Removed SSH connection status tracking as requested.

## Current Working State
Application boots to an animated Splash Screen. User interaction triggers the data load and transition to the full AURA dashboard. SSH tracking has been cleanly removed.

## Next Steps
- Wire up frontend search inputs to filter account/cluster arrays locally.
