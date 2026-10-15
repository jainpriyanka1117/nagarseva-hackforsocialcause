# NagarSeva — Technical Design Document

This document provides a comprehensive technical overview of the **NagarSeva** municipal grievance tracking and civic engagement platform, detailing its architecture, data models, state machines, sequence flows, security mechanisms, and algorithmic engines.

---

## 1. Executive Summary & Core Objectives

NagarSeva is designed to bridge the trust deficit between municipal administrations and citizens by enforcing accountability and transparency across the grievance resolution lifecycle. 

Key architectural goals include:
1. **End-to-End Visibility**: Every complaint is publicly traceable with an immutable audit log.
2. **Enforceable Citizen Verification**: Issues cannot be unilaterally closed by municipal contractors or officers without citizen confirmation or transparent timeout recording.
3. **Dynamic SLA Accountability**: Escalation thresholds tailored to issue severity and safety hazard levels.
4. **Geospatial Context**: Corroboration of neighbourhood risks using coordinate mapping and time-decay safety algorithms.
5. **Zero-Setup Fullstack Simplicity**: Unified TypeScript development environment powered by TanStack Start, Drizzle ORM, and pure JS/WASM LibSQL/SQLite.

---

## 2. System Architecture

The application is structured as a fullstack monolith leveraging TanStack Start's hybrid client-server model.

```mermaid
graph TD
    subgraph Client ["Client Tier (Browser)"]
        UI["React 19 + Tailwind CSS + shadcn/ui"]
        Router["TanStack Router (File-Based)"]
        Forms["Client Form Validation & State"]
        Query["TanStack Query (Cache & Synchronizer)"]
    end

    subgraph ServerTier ["Server & Runtime Tier (TanStack Start / Nitro)"]
        SSR["Server-Side Rendering (SSR)"]
        ServerFns["Server Functions (createServerFn RPC)"]
        API["REST API Controllers (/api/*)"]
        AuthMiddleware["Web Crypto Auth & JWT Middleware"]
    end

    subgraph ServiceTier ["Core Domain Services"]
        ComplaintService["Complaint Lifecycle & Audit Engine"]
        SLAService["Dynamic SLA Calculation Engine"]
        AnalyticsService["Ward Metrics & Performance Engine"]
        SafetyService["Geospatial Hazard & Decay Engine"]
        UploadService["Evidence File Persistence"]
    end

    subgraph DataTier ["Data & Storage Layer"]
        Drizzle["Drizzle ORM"]
        DB[("LibSQL / SQLite (file:local.db / Turso)")]
        UploadStorage[("Local File Storage (public/uploads/)")]
    end

    UI --> Router
    Router --> Forms
    Forms --> Query
    Query --> ServerFns
    Query --> API
    SSR --> ServerFns

    ServerFns --> AuthMiddleware
    API --> AuthMiddleware
    AuthMiddleware --> ComplaintService
    AuthMiddleware --> SLAService
    AuthMiddleware --> AnalyticsService
    AuthMiddleware --> SafetyService
    AuthMiddleware --> UploadService

    ComplaintService --> Drizzle
    SLAService --> Drizzle
    AnalyticsService --> Drizzle
    SafetyService --> Drizzle
    UploadService --> UploadStorage
    UploadService --> Drizzle

    Drizzle --> DB
```

---

## 3. Database Entity Relationship (ER) Model

The schema is defined using Drizzle ORM in [src/db/schema.ts](./src/db/schema.ts) with strict foreign key constraints and indexed lookup fields.

```mermaid
erDiagram
    USERS ||--o{ COMPLAINTS : reports
    USERS ||--o{ COMPLAINT_TIMELINE : acts_in
    USERS ||--o{ COMPLAINT_EVIDENCE : uploads
    COMPLAINTS ||--|{ COMPLAINT_TIMELINE : has_audit_log
    COMPLAINTS ||--o{ COMPLAINT_EVIDENCE : contains_proof

    USERS {
        text id PK "usr_..."
        text email UK "Unique email address"
        text passwordHash "PBKDF2 salted hash"
        text name "Display name"
        text role "citizen | officer | admin"
        text ward "Assigned or resident ward"
        text department "Municipal department (for officers)"
        text phone "Optional contact number"
        text createdAt "ISO 8601 timestamp"
    }

    COMPLAINTS {
        text id PK "NS-24-XXXXX"
        text category "Pothole, Blocked drain, etc."
        text location "Street address / landmark"
        text ward "Ward identifier (e.g. Ward 82)"
        text status "Submitted, In Progress, etc."
        text priority "High | Medium | Low"
        text description "Detailed description"
        real x "Map percentage X coordinate (0-100)"
        real y "Map percentage Y coordinate (0-100)"
        real latitude "Optional GPS latitude"
        real longitude "Optional GPS longitude"
        integer safety "Flag: 1 if safety hazard, 0 otherwise"
        text citizenId FK "Optional reference to USERS"
        text citizenName "Citizen reporting name"
        text assignedOfficerId FK "Optional reference to USERS"
        text assignedOfficerName "Assigned officer name"
        integer slaTargetHours "Calculated SLA window (12, 48, 72)"
        text slaDeadline "ISO 8601 deadline timestamp"
        text resolvedAt "Timestamp when officer marked resolved"
        text resolutionProof "Resolution summary notes"
        text verifiedAt "Timestamp when citizen confirmed closure"
        text verificationFeedback "Citizen verification review"
        text reopenReason "Citizen reason for reopening"
        text createdAt "ISO 8601 timestamp"
        text updatedAt "ISO 8601 timestamp"
    }

    COMPLAINT_TIMELINE {
        text id PK "tml_..."
        text complaintId FK "References COMPLAINTS.id"
        text action "Submitted, Accepted, Resolved, etc."
        text message "Contextual note or update description"
        text actorName "User or system actor name"
        text actorRole "Citizen | Officer | Municipal Admin | System"
        text evidenceUrl "Optional photo attachment"
        text createdAt "ISO 8601 timestamp"
    }

    COMPLAINT_EVIDENCE {
        text id PK "evd_..."
        text complaintId FK "References COMPLAINTS.id"
        text fileUrl "Relative path (/uploads/...)"
        text fileName "Original file name"
        text fileType "MIME type (image/png, etc.)"
        text caption "Description of image"
        text uploadedBy "Uploader display name"
        text uploadedRole "Citizen | Officer"
        text createdAt "ISO 8601 timestamp"
    }
```

---

## 4. Complaint Lifecycle & State Machine

A complaint progresses through discrete, audited stages. Closures cannot occur without verification or explicit timeout recording.

```mermaid
stateDiagram-v2
    [*] --> Submitted : Citizen reports issue

    Submitted --> Accepted : Officer accepts grievance
    Submitted --> InProgress : Crew dispatched

    Accepted --> InProgress : Work commences on site

    InProgress --> ResolvedPending : Officer uploads completion proof
    
    state "Resolved — pending verification" as ResolvedPending

    ResolvedPending --> ClosedVerified : Citizen inspects & confirms resolution
    ResolvedPending --> Reopened : Citizen rejects fix with new evidence
    ResolvedPending --> ClosedUnverified : Verification SLA expires (7 days)

    Reopened --> InProgress : Officer resumes corrective work

    state "Closed: verified" as ClosedVerified
    state "Closed: unverified" as ClosedUnverified

    ClosedVerified --> [*]
    ClosedUnverified --> [*]
```

---

## 5. End-to-End Grievance Submission & Verification Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Citizen
    participant Client as Frontend (TanStack Router)
    participant Server as ServerFn / REST API
    participant Engine as SLA & Audit Engine
    participant DB as SQLite / Drizzle
    actor Officer

    Citizen->>Client: Fill issue form (Category, Location, Priority, Photo)
    Client->>Server: createComplaintServerFn(payload)
    Server->>Engine: Calculate SLA (Priority: High -> 12h, Medium -> 48h)
    Engine-->>Server: SLA Deadline computed
    Server->>DB: INSERT INTO complaints & complaint_timeline
    DB-->>Server: Complaint Created (ID: NS-24-01847)
    Server-->>Client: Success receipt & redirection URL
    Client-->>Citizen: Display Tracking Number & Live Timeline

    Note over Officer,DB: Officer Queue Inspection
    Officer->>Client: Open /officer workspace
    Client->>Server: fetchComplaints({ ward: "Ward 82" })
    Server->>DB: Query assigned grievances
    DB-->>Client: Return complaint list
    Officer->>Client: Click "Begin Work" (Status -> In Progress)
    Client->>Server: updateComplaintStatusServerFn({ status: "In Progress" })
    Server->>DB: UPDATE complaint & INSERT timeline entry

    Note over Officer,DB: Resolution Submission
    Officer->>Client: Upload resolution proof photo & notes
    Client->>Server: updateComplaintStatusServerFn({ status: "Resolved — pending verification" })
    Server->>DB: Record resolvedAt & resolutionProof

    Note over Citizen,Client: Citizen Verification Loop
    Citizen->>Client: Inspect resolution proof on /complaint/NS-24-01847
    alt Citizen is satisfied
        Citizen->>Client: Click "Verify & Close"
        Client->>Server: updateComplaintStatusServerFn({ status: "Closed: verified" })
        Server->>DB: Mark verifiedAt & audit confirmation
        Client-->>Citizen: Issue marked "Closed: verified"
    else Citizen is unsatisfied
        Citizen->>Client: Click "Reopen Issue" with feedback
        Client->>Server: updateComplaintStatusServerFn({ status: "Reopened", reason: "Water still overflowing" })
        Server->>DB: Reset status to Reopened & alert officer queue
        Client-->>Citizen: Issue reopened for review
    end
```

---

## 6. Dynamic SLA Engine

The SLA calculation engine computes deadlines dynamically based on issue category, urgency, and hazard flags:

$$\Delta t_{\text{SLA}} = 
\begin{cases} 
12\text{ hours} & \text{if Priority is High or Safety is flagged} \\
48\text{ hours} & \text{if Priority is Medium} \\
72\text{ hours} & \text{if Priority is Low}
\end{cases}$$

$$\text{Deadline} = T_{\text{submission}} + \Delta t_{\text{SLA}}$$

The server computes remaining SLA dynamically on every fetch:
- $\text{Remaining} > 0$: Formatted as `Xh Ym remaining`
- $\text{Remaining} \le 0$: Flagged as `Overdue`

---

## 7. Geospatial Safety & Time-Decay Model

Safety signals on the community map decay over time to prevent temporary hazards from perpetually distorting neighbourhood safety scores:

$$S(t) = S_0 \cdot e^{-\lambda (t - t_0)}$$

Where:
- $S_0$ = Initial hazard intensity (1.0 for safety alerts, 0.5 for standard issues)
- $\lambda$ = Half-life decay factor ($0.05/\text{hour}$)
- $(t - t_0)$ = Elapsed hours since incident creation or confirmation

Signals older than 7 days automatically transition out of active safety alerts unless corroborated by recurrent citizen reports in the same coordinate bounding box ($\Delta x \le 5\%$, $\Delta y \le 5\%$).

---

## 8. Authentication & Cryptography Architecture

```mermaid
graph LR
    subgraph AuthInput ["Credential Input"]
        PW["Plaintext Password"]
        Salt["16-byte Cryptographic Salt"]
    end

    subgraph PBKDF2Engine ["Web Crypto Engine"]
        PBKDF2["PBKDF2 Derivation<br/>(100,000 iterations, SHA-256, 32-byte key)"]
        HashHex["Stored Hash: salt.hashHex"]
    end

    subgraph JWTEngine ["Stateless Session Engine (jose)"]
        KeyGen["HMAC-SHA256 CryptoKey (subtle.importKey)"]
        Sign["Sign JWT Token with Claims:<br/>{ userId, email, role, ward }"]
        Verify["Verify Signature & Expiration"]
    end

    PW --> PBKDF2
    Salt --> PBKDF2
    PBKDF2 --> HashHex

    KeyGen --> Sign
    Sign --> Verify
```

### Password Hashing
- Algorithm: **PBKDF2** with **HMAC-SHA-256**
- Iteration count: **100,000**
- Salt length: **16 bytes** from `crypto.getRandomValues()`
- Output: Hex-encoded `salt.hash` representation stored in `users.passwordHash`

### Token Management
- Algorithm: **HMAC-SHA-256** (`HS256`) via native `CryptoKey`
- Payload: `userId`, `email`, `role` (`citizen` | `officer` | `admin`), `ward`
- Expiration: `7 days`

---

## 9. Technology Stack Matrix

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) | Modern React 19 SSR framework with type-safe server functions and unified bundle. |
| **Routing** | [TanStack Router](https://tanstack.com/router) | 100% type-safe file-based routing with integrated loaders and search parameter validation. |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | Accessible, responsive design system powered by Radix UI primitives. |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Zero-overhead, type-safe SQL query builder and schema management. |
| **Database** | [LibSQL / SQLite](https://github.com/tursodatabase/libsql-client-ts) | Embedded, zero-configuration file database with zero C++ native build tool dependencies; easily promotes to Turso cloud. |
| **Security** | Web Crypto API + [jose](https://github.com/panva/jose) | Modern standard cryptography without native Node.js OpenSSL dependencies. |
| **Testing** | [Vitest](https://vitest.dev/) | High-speed unit and integration test runner with in-memory SQLite isolation. |
