# AFIN Platform - User Manual (Phase 1)

Welcome to the African Fixed Income Network (AFIN) Digital Exchange Platform. This manual explains how the core features of the platform work, up to the Order Placement phase.

## 1. System Roles

The platform currently operates with two primary user roles, each with distinct permissions and responsibilities.

### 👤 The Investor
An individual or institutional user looking to purchase government bonds.
* **Capabilities:** Register, upload KYC documents, browse available bonds in the marketplace, and place investment orders.
* **Restrictions:** Cannot invest until KYC is explicitly approved by a Broker.

### 🏢 The Broker
The licensed financial intermediary managing the exchange.
* **Capabilities:** Review and approve/reject investor KYC applications, create and publish new bonds, and approve/reject incoming investment orders.

---

## 2. Feature Workflows

### 2.1 Onboarding & KYC (Know Your Customer)
Before an investor can participate in the marketplace, they must prove their identity.

```mermaid
sequenceDiagram
    autonumber
    actor Investor
    actor Broker
    participant System

    Investor->>System: 1. Registers Account
    Investor->>System: 2. Completes Profile (DOB, NUIT, Address)
    Investor->>System: 3. Uploads Documents (Identity, Tax, Address)
    System->>Broker: Notifies Broker of Pending KYC
    Broker->>System: 4. Reviews Documents
    
    alt Documents are Valid
        Broker->>System: Approves KYC
        System->>Investor: Status becomes "Verified"
    else Documents are Invalid
        Broker->>System: Rejects KYC (with reason)
        System->>Investor: Status becomes "Action Required"
    end
```

### 2.2 Bond Creation & Marketplace
Brokers are responsible for setting up the bonds that investors will see.

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Broker creates bond
    
    DRAFT --> OPEN: Broker publishes bond
    
    state OPEN {
        [*] --> VisibleToInvestors
        VisibleToInvestors --> InvestorsCanPlaceOrders
    }
    
    OPEN --> CLOSED: Subscription Deadline Reached
    CLOSED --> [*]
```

**How it works:**
1. The **Broker** creates a Bond in `DRAFT` status, specifying the Yield, Face Value, Minimum Investment, and Dates.
2. The **Broker** clicks "Publish", moving the bond to `OPEN` status.
3. The **Investor** visits the Marketplace. They will only see bonds that are `OPEN`.

---

### 2.3 The Order System
Once an investor is verified and a bond is open, the investment process begins.

```mermaid
sequenceDiagram
    autonumber
    actor Investor
    actor Broker
    participant System

    Investor->>System: Browses "Open" Bonds
    Investor->>System: Enters investment amount & Submits Order
    
    note over System: System validates: Is Investor KYC Approved?<br/>Is Bond Open?<br/>Is Amount >= Minimum?
    
    System->>Broker: Order appears in Broker Queue (PENDING)
    
    Broker->>System: Reviews Order
    
    alt Order Accepted
        Broker->>System: Approves Order
        System->>Investor: Order Status -> "Awaiting Payment"
    else Order Rejected
        Broker->>System: Rejects Order (with reason)
        System->>Investor: Order Status -> "Rejected"
    end
```

### Order Status Lifecycle
* **PENDING_REVIEW**: The investor has submitted the order, and it is waiting for the broker to look at it.
* **REJECTED**: The broker declined the order (e.g., suspected fraud or invalid details).
* **CANCELLED**: The investor cancelled their own order before the broker reviewed it.
* **AWAITING_PAYMENT**: The broker approved the order. The next step will require the investor to wire the money and upload a receipt.

---

### 2.4 Payments & Verification
After an order is approved by the broker, the investor must transfer the funds outside of the platform (e.g., via Bank Transfer) and upload the proof of payment.

```mermaid
sequenceDiagram
    autonumber
    actor Investor
    actor Broker
    participant System

    note over Investor,System: Order Status: AWAITING_PAYMENT
    Investor->>System: Uploads Bank Receipt PDF/Image
    System->>Broker: Order appears in Payments Queue
    Broker->>System: Reviews the uploaded receipt
    
    alt Payment is Valid
        Broker->>System: Verifies Payment
        System->>Investor: Status -> "PAYMENT_VERIFIED"
    else Payment is Invalid
        Broker->>System: Rejects Payment
        System->>Investor: Status -> "AWAITING_PAYMENT" (Requires re-upload)
    end
```

---

### 2.5 The Pro-Rata Allocation Engine
When the subscription period for a bond ends, the Broker must allocate the bonds to the investors. If the bond is "oversubscribed" (demand exceeds supply), the system automatically uses a **Pro-Rata** algorithm to fairly distribute the bonds.

```mermaid
stateDiagram-v2
    [*] --> CalculateDemand
    
    CalculateDemand --> Oversubscribed: Demand > Supply
    CalculateDemand --> FullySubscribed: Demand <= Supply
    
    Oversubscribed --> ApplyRatio: Ratio = Supply / Demand
    ApplyRatio --> FloorToFaceValue: Round down to nearest bond unit
    
    FullySubscribed --> FullAllocation: Ratio = 100%
    
    FloorToFaceValue --> CreateHoldings
    FullAllocation --> CreateHoldings
    
    CreateHoldings --> GenerateCoupons: System schedules future payouts
    GenerateCoupons --> [*]: Allocation Complete
```

**How it works:**
1. The **Broker** clicks "Run Allocation" on a closed bond.
2. The **System** calculates total verified demand vs the total issuance supply.
3. If demand exceeds supply, everyone gets a proportional slice (e.g., if demand is 2x supply, everyone gets 50% of what they asked for).
4. The system automatically creates **Portfolio Holdings** for the investors.
5. The system automatically schedules all future **Mock Coupon Payments** based on the bond's interest rate and frequency.

---

### 2.6 Real-Time Notifications
The platform includes a real-time notification bell to keep investors and brokers informed without needing to refresh the page.

* **Investors** receive notifications when:
  * Their KYC is Approved or Rejected.
  * Their Order is Approved or Rejected.
  * Their Payment is Verified.
  * Bonds are successfully allocated to their portfolio.
* **Brokers** receive notifications when:
  * New KYC applications are submitted.
  * New Orders are placed.
  * New Payments are uploaded.

---

## Summary of Completed Capabilities (Through Phase 5)
As of this phase, the system successfully guarantees that:
1. **Security**: Unverified users cannot place orders.
2. **Integrity**: Investors cannot order more or less than the bond's strict limits.
3. **Oversight**: Brokers have total manual control over who gets verified, whose orders get approved, and whose payments are legitimate.
4. **Fairness**: The Allocation Engine strictly enforces mathematical pro-rata distribution to prevent manual bias during oversubscription.
5. **Transparency**: Real-time notifications keep all parties instantly informed of state changes.
