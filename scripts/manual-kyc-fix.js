// Manual KYC Status Fix
// This script helps you manually update KYC status in Firebase

// Instructions:
// 1. Open browser console on your login page
// 2. Copy and paste this code
// 3. Run the functions as needed

// Manual update KYC status for current user
async function updateKycStatusManually() {
  try {
    console.log('🔧 Manual KYC Status Update')
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase not loaded. Make sure you\'re on a page with Firebase.')
      return false
    }
    
    // Get current user
    const currentUser = firebase.auth().currentUser
    if (!currentUser) {
      console.error('❌ No user logged in. Please log in first.')
      return false
    }
    
    console.log('Current user:', currentUser.email, 'UID:', currentUser.uid)
    
    // Update in Firestore
    const db = firebase.firestore()
    const userRef = db.collection('borrowers').doc(currentUser.uid)
    
    try {
      await userRef.update({
        kycCompleted: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      
      console.log('✅ KYC status updated to TRUE in Firebase Firestore')
      return true
    } catch (error) {
      console.error('❌ Failed to update Firestore:', error)
      
      // Try alternative approach - set the document
      try {
        await userRef.set({
          kycCompleted: true,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        
        console.log('✅ KYC status set to TRUE in Firebase Firestore (alternative method)')
        return true
      } catch (setError) {
        console.error('❌ Failed to set document:', setError)
        return false
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating KYC status:', error)
    return false
  }
}

// Check current KYC status in Firebase
async function checkKycStatusInFirebase() {
  try {
    const currentUser = firebase.auth().currentUser
    if (!currentUser) {
      console.error('❌ No user logged in.')
      return
    }
    
    const db = firebase.firestore()
    const userRef = db.collection('borrowers').doc(currentUser.uid)
    const doc = await userRef.get()
    
    if (doc.exists) {
      const data = doc.data()
      console.log('📊 Current Firebase KYC status:', data.kycCompleted)
      console.log('📊 Full user data:', data)
    } else {
      console.log('❌ User document not found in Firestore')
    }
  } catch (error) {
    console.error('❌ Error checking KYC status:', error)
  }
}

// Quick fix for your specific case
async function quickKycFix() {
  console.log('🔧 Quick KYC Fix for parthudole@gmail.com')
  
  // Set in localStorage
  localStorage.setItem('kyc:borrower:parthudole@gmail.com', 'true')
  console.log('✅ KYC status set in localStorage')
  
  // Update in Firebase
  const success = await updateKycStatusManually()
  
  if (success) {
    console.log('✅ Quick fix completed! KYC status updated in both localStorage and Firebase.')
    console.log('🔄 Please refresh the page and try logging in again.')
  } else {
    console.log('❌ Quick fix failed. Please check the errors above.')
  }
}

// Verify the fix
async function verifyKycFix() {
  console.log('🔍 Verifying KYC Fix')
  
  // Check localStorage
  const localKyc = localStorage.getItem('kyc:borrower:parthudole@gmail.com')
  console.log('📱 localStorage KYC status:', localKyc)
  
  // Check Firebase
  await checkKycStatusInFirebase()
}

console.log('🛠️ Manual KYC Fix Helper loaded!')
console.log('Available functions:')
console.log('- updateKycStatusManually() // Update current user KYC status')
console.log('- checkKycStatusInFirebase() // Check current KYC status in Firebase')
console.log('- quickKycFix() // Quick fix for parthudole@gmail.com')
console.log('- verifyKycFix() // Verify the fix worked')
console.log('')
console.log('Recommended: Run quickKycFix() to fix your current issue')
