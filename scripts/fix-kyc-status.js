// Fix KYC Status Helper
// This script helps you manually set KYC status for existing users

// Instructions:
// 1. Open browser console on your login page
// 2. Copy and paste this code
// 3. Run the functions as needed

// Set KYC status for current user
async function setKycCompleted(email, role = 'borrower') {
  try {
    // Set in localStorage
    localStorage.setItem(`kyc:${role}:${email}`, 'true')
    console.log(`✅ KYC status set to completed for ${email} (${role})`)
    
    // If you're logged in, also update Firebase
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
      const currentUser = firebase.auth().currentUser
      console.log(`Current user UID: ${currentUser.uid}`)
      
      // You can manually update Firebase here if needed
      console.log('To update Firebase, use the Firebase Console or the update functions in the app')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error setting KYC status:', error)
    return false
  }
}

// Check current KYC status
function checkKycStatus(email, role = 'borrower') {
  const kycStatus = localStorage.getItem(`kyc:${role}:${email}`)
  console.log(`KYC status for ${email} (${role}): ${kycStatus}`)
  return kycStatus === 'true'
}

// Clear all KYC data
function clearAllKycData() {
  const keys = Object.keys(localStorage)
  const kycKeys = keys.filter(key => key.startsWith('kyc:'))
  
  kycKeys.forEach(key => {
    localStorage.removeItem(key)
    console.log(`Removed: ${key}`)
  })
  
  console.log('✅ All KYC data cleared')
}

// List all KYC entries
function listKycEntries() {
  const keys = Object.keys(localStorage)
  const kycKeys = keys.filter(key => key.startsWith('kyc:'))
  
  console.log('📋 Current KYC entries:')
  kycKeys.forEach(key => {
    const value = localStorage.getItem(key)
    console.log(`  ${key}: ${value}`)
  })
  
  return kycKeys
}

// Quick fix for your specific case
function quickFix() {
  console.log('🔧 Quick Fix for parthudole@gmail.com')
  
  // Set KYC completed for borrower
  setKycCompleted('parthudole@gmail.com', 'borrower')
  
  // Set KYC completed for lender (if needed)
  setKycCompleted('parthudole@gmail.com', 'lender')
  
  console.log('✅ Quick fix applied! Try logging in again.')
}

console.log('🛠️ KYC Status Helper loaded!')
console.log('Available functions:')
console.log('- setKycCompleted(email, role)')
console.log('- checkKycStatus(email, role)')
console.log('- clearAllKycData()')
console.log('- listKycEntries()')
console.log('- quickFix() // For parthudole@gmail.com')
console.log('')
console.log('Example usage:')
console.log('setKycCompleted("parthudole@gmail.com", "borrower")')
