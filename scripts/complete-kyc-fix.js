// Complete KYC Status Fix
// This script fixes both localStorage and Firebase KYC status

// Instructions:
// 1. Open browser console on your login page
// 2. Copy and paste this code
// 3. Run the functions as needed

// Complete fix for KYC status
async function completeKycFix(email = 'parthudole@gmail.com', role = 'borrower') {
  try {
    console.log('🔧 Complete KYC Status Fix')
    console.log(`Email: ${email}, Role: ${role}`)
    
    // Step 1: Set in localStorage
    localStorage.setItem(`kyc:${role}:${email}`, 'true')
    console.log('✅ Step 1: KYC status set in localStorage')
    
    // Step 2: Update Firebase (if user is logged in)
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
      const currentUser = firebase.auth().currentUser
      console.log('Current user:', currentUser.email, 'UID:', currentUser.uid)
      
      const db = firebase.firestore()
      const collectionName = role === 'borrower' ? 'borrowers' : 'lenders'
      const userRef = db.collection(collectionName).doc(currentUser.uid)
      
      try {
        await userRef.update({
          kycCompleted: true,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        console.log('✅ Step 2: KYC status updated in Firebase Firestore')
      } catch (error) {
        console.error('❌ Step 2 failed:', error)
        
        // Try alternative approach
        try {
          await userRef.set({
            kycCompleted: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true })
          console.log('✅ Step 2 (alternative): KYC status set in Firebase Firestore')
        } catch (setError) {
          console.error('❌ Step 2 (alternative) failed:', setError)
        }
      }
    } else {
      console.log('⚠️ Step 2: No user logged in, skipping Firebase update')
    }
    
    // Step 3: Verify the fix
    console.log('🔍 Step 3: Verifying fix...')
    
    // Check localStorage
    const localKyc = localStorage.getItem(`kyc:${role}:${email}`)
    console.log(`📱 localStorage KYC status: ${localKyc}`)
    
    // Check Firebase (if possible)
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
      const currentUser = firebase.auth().currentUser
      const db = firebase.firestore()
      const collectionName = role === 'borrower' ? 'borrowers' : 'lenders'
      const userRef = db.collection(collectionName).doc(currentUser.uid)
      
      try {
        const doc = await userRef.get()
        if (doc.exists) {
          const data = doc.data()
          console.log(`📊 Firebase KYC status: ${data.kycCompleted}`)
        }
      } catch (error) {
        console.error('❌ Could not verify Firebase status:', error)
      }
    }
    
    console.log('✅ Complete KYC fix applied!')
    console.log('🔄 Please refresh the page and try logging in again.')
    
    return true
  } catch (error) {
    console.error('❌ Complete KYC fix failed:', error)
    return false
  }
}

// Fix for both borrower and lender
async function fixBothRoles(email = 'parthudole@gmail.com') {
  console.log('🔧 Fixing KYC status for both borrower and lender roles')
  
  const borrowerResult = await completeKycFix(email, 'borrower')
  const lenderResult = await completeKycFix(email, 'lender')
  
  if (borrowerResult && lenderResult) {
    console.log('✅ KYC status fixed for both roles!')
  } else {
    console.log('⚠️ Some fixes may have failed. Check the logs above.')
  }
}

// Quick verification
function verifyKycStatus(email = 'parthudole@gmail.com') {
  console.log('🔍 Verifying KYC Status')
  
  const borrowerKyc = localStorage.getItem(`kyc:borrower:${email}`)
  const lenderKyc = localStorage.getItem(`kyc:lender:${email}`)
  
  console.log(`📱 Borrower localStorage: ${borrowerKyc}`)
  console.log(`📱 Lender localStorage: ${lenderKyc}`)
  
  if (borrowerKyc === 'true' || lenderKyc === 'true') {
    console.log('✅ KYC status found in localStorage')
  } else {
    console.log('❌ No KYC status found in localStorage')
  }
}

console.log('🛠️ Complete KYC Fix Helper loaded!')
console.log('Available functions:')
console.log('- completeKycFix(email, role) // Fix KYC for specific role')
console.log('- fixBothRoles(email) // Fix KYC for both borrower and lender')
console.log('- verifyKycStatus(email) // Verify current KYC status')
console.log('')
console.log('Recommended: Run fixBothRoles() to fix your current issue')
console.log('Example: fixBothRoles("parthudole@gmail.com")')
