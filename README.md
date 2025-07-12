# PhantomFog: Comprehensive Project Documentation

**Version:** 1.1.0 • **Team:** MAJKL • **Event:** BrunelHack 2025

---

## Table of Contents

- [Introduction](#introduction)  
- [Project Vision & Objectives](#project-vision--objectives)  
- [User Personas & Use Cases](#user-personas--use-cases)  
- [System Overview & Architecture](#system-overview--architecture)  
- [Frontend Design & Implementation](#frontend-design--implementation)  
- [Backend & API Layer](#backend--api-layer)  
- [Blockchain Components](#blockchain-components)  
  - [Solana Anchor Program](#solana-anchor-program)  
  - [Internet Computer (ICP) Canister](#internet-computer-icp-canister)  
- [AI-Based Verification Flow](#ai-based-verification-flow)  
- [Data Models & Schemas](#data-models--schemas)  
- [Security & Privacy Considerations](#security--privacy-considerations)  
- [Performance & Scalability](#performance--scalability)  
- [Deployment & DevOps](#deployment--devops)  
- [Testing Strategy](#testing-strategy)  
- [Monitoring & Analytics](#monitoring--analytics)  
- [User Interface & Experience](#user-interface--experience)  
- [Internationalization & Localization](#internationalization--localization)  
- [Accessibility](#accessibility)  
- [Error Handling & Logging](#error-handling--logging)  
- [Developer Experience & Documentation](#developer-experience--documentation)  
- [Future Roadmap](#future-roadmap)  
- [Glossary](#glossary)  
- [References & Resources](#references--resources)  

---

## Introduction

PhantomFog is a next-generation, gamified location verification platform that overlays a dynamic fog-of-war on an SVG London Tube map. Developed by Team MAJKL for BrunelHack 2025, PhantomFog leverages blockchain (Solana), decentralized compute/storage (Internet Computer Protocol), and AI-driven photo verification to deliver a secure, privacy-preserving, and highly engaging user experience.

Users physically visit Tube stations, capture an in-app selfie with a paper sign displaying their `@username`, and submit their photos for AI validation. Upon successful verification, metadata is stored immutably on ICP canisters, and a low-cost Solana transaction logs the station visit—minting an on-chain NFT badge as proof-of-presence. The global map fog clears in real-time for all participants, fostering collaborative exploration and friendly competition.

**Key differentiators:**

- **Hybrid Blockchain Architecture:** Combines Solana’s speed and ICP’s scalable storage  
- **AI Assurance:** Uses Gemini model to detect real faces, handwritten usernames, and context  
- **User-Owned Data:** Raw images remain under user control in encrypted canisters  
- **Enterprise-Grade UX:** Accessibility, performance, and modular design to support large-scale events  

---

## Project Vision & Objectives

**Vision:** Revolutionize how people prove physical presence by seamlessly integrating decentralized verification with real-world exploration gamified for mass engagement.

### Core Objectives

- **Trustless Proof-of-Presence:** Multi-layered pipeline ensures >99% authenticity accuracy  
- **Data Sovereignty & Privacy:** Only essential metadata (station ID, timestamp, photo checksum) persists; sensitive data remains encrypted  
- **Scalable Global Infrastructure:** Architect for millions of daily users via Solana’s parallel TPS and ICP’s auto-scaling canisters  
- **Developer-First SDK:** Provide a TypeScript SDK, CLI scaffolding, and OpenAPI docs for easy third-party integrations  
- **Immersive Gamification:** Offer fog-of-war map, NFT badges, timed events, leaderboards, and team challenges  
- **Cross-Chain Interoperability:** Support SPL tokens and ICP-certified NFTs for badge display across wallets  
- **Sustainable Ecosystem:** Monetize through branded events, premium badge drops, analytics subscriptions, and DAO governance  

### Success Metrics

- **User Engagement:** 50K monthly active users within 6 months  
- **Verification Throughput:** 1M+ check-ins per day  
- **Partner Integrations:** 10+ third-party events integrated in the first year  
- **Retention & Referral:** 40% 30-day retention; 20% organic referral growth  

---

## User Personas & Use Cases

| Persona               | Goals                                              | Pain Points                              |
|-----------------------|----------------------------------------------------|------------------------------------------|
| **Urban Explorer**    | Discover hidden locales; earn digital badges       | Standard check-in apps lack authenticity |
| **Event Organizer**   | Host city-wide scavenger hunts                     | Complex logistics; trust issues          |
| **Transit Authority** | Incentivize off-peak travel; collect usage metrics | Data privacy; user adoption              |
| **Developer Partner** | Integrate location gamification into existing apps | Lack of ready-to-use SDKs and APIs        |

**Use Case Example:**

1. Explorer Alice opens PhantomFog and sees a fully fogged map.  
2. She travels to Baker Street, captures a selfie with `@Alice123`.  
3. AI verifies authenticity; ICP canister stores metadata.  
4. Phantom Wallet signs a Solana transaction; NFT badge minted.  
5. Fog at Baker Street clears globally; Alice’s profile shows her new badge.  

---

## System Overview & Architecture

```mermaid
flowchart LR
  subgraph UI
    U[User] --> F[React Frontend]
  end
  F -->|Wallet Connect| W[Phantom Wallet]
  F -->|Photo Upload| A[AI Service]
  A -->|Verified| F
  F -->|Store Metadata| I[ICP Canister]
  F -->|Create TX| S[Solana Anchor]
  S -->|Confirm| F
  I -->|Fetch Logs| F
  F -->|Update| M[Fog-of-War Map]
