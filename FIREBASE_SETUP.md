# Firebase Database Setup Guide for Credify UI

## 1. Firebase Project Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `credify-ui` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" provider
3. Click "Save"

### Step 3: Create Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location (choose closest to your users)
4. Click "Done"

### Step 4: Get Configuration
1. Go to Project Settings (gear icon) → "General" tab
2. Scroll down to "Your apps" section
3. Click "Web" icon to add web app
4. Register app with name: `credify-ui-web`
5. Copy the Firebase configuration object

## 2. Environment Variables Setup

### Add to .env.local file:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Existing Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_R6PNLVOSkFJRwE
RAZORPAY_SECRET=FgA7QQ6lFcD3N5IQK5HPyqdI
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 3. Database Structure

### Collections Created:

#### `borrowers` Collection
```javascript
{
  uid: string,                    // Firebase Auth UID
  email: string,                   // User email
  displayName: string,             // User's name
  kycCompleted: boolean,           // KYC verification status
  loanDetails: {                  // Current loan information
    loanId: string,
    principal: number,            // Loan amount
    rate: number,                 // Interest rate
    duration: number,             // Loan duration in months
    purpose: string,              // Loan purpose
    startDate: string,            // Loan start date
    totalAmount: number,          // Total amount to be paid
    monthlyEMI: number,           // Monthly EMI amount
    paidMonths: number,           // Number of months paid
    remainingAmount: number,      // Remaining amount
    nextEMIDate: string           // Next EMI due date
  },
  paymentHistory: [               // Array of payment records
    {
      date: string,
      amount: number,
      status: 'Successful' | 'Failed' | 'Pending',
      paymentId?: string
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `lenders` Collection
```javascript
{
  uid: string,                    // Firebase Auth UID
  email: string,                  // User email
  displayName: string,            // User's name
  kycCompleted: boolean,          // KYC verification status
  portfolio: {                   // Portfolio statistics
    totalInvestment: number,
    activeLoans: number,
    avgInterestRate: number,
    totalReturns: number
  },
  marketplaceLoans: [             // Available loans to fund
    {
      loanId: string,
      borrowerId: string,
      amount: number,
      purpose: string,
      rate: number,
      duration: number,
      distance: string,
      status: 'Available' | 'Funded' | 'Completed',
      fundedBy?: string,
      fundedAt?: timestamp
    }
  ],
  payouts: [                     // Payout history
    {
      date: string,
      amount: number,
      status: 'Settled' | 'Pending' | 'Failed'
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 4. Security Rules (Firestore)

### Add these rules in Firestore → Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Borrowers can only access their own data
    match /borrowers/{borrowerId} {
      allow read, write: if request.auth != null && request.auth.uid == borrowerId;
    }
    
    // Lenders can only access their own data
    match /lenders/{lenderId} {
      allow read, write: if request.auth != null && request.auth.uid == lenderId;
    }
    
    // Allow reading marketplace loans for all authenticated users
    match /marketplace/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 5. Integration Points

### Login Pages Integration:
- **Borrower Login**: Store user data in `borrowers` collection
- **Lender Login**: Store user data in `lenders` collection
- **KYC Completion**: Update `kycCompleted` field
- **Authentication**: Use Firebase Auth for login/logout

### Borrower Dashboard Integration:
- **Loan Details**: Store and retrieve from `borrower.loanDetails`
- **Payment History**: Store payments in `borrower.paymentHistory`
- **EMI Payments**: Update payment history after successful Razorpay payment
- **Profile Updates**: Update borrower profile data

### Lender Dashboard Integration:
- **Portfolio Stats**: Store and retrieve from `lender.portfolio`
- **Marketplace Loans**: Store available loans in `lender.marketplaceLoans`
- **Funding Actions**: Update loan status when funded
- **Payouts**: Store payout history in `lender.payouts`

## 6. Next Steps

1. **Replace placeholder values** in `.env.local` with actual Firebase config
2. **Test authentication** on login pages
3. **Integrate database calls** in components
4. **Test data persistence** across page refreshes
5. **Implement real-time updates** for live data sync

## 7. Testing Checklist

- [ ] Firebase project created and configured
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Environment variables added to `.env.local`
- [ ] Security rules applied
- [ ] Login pages integrated with Firebase Auth
- [ ] Borrower data stored and retrieved
- [ ] Lender data stored and retrieved
- [ ] Payment history persisted
- [ ] Real-time updates working
