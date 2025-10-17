// Firebase Debug Helper
// Copy and paste this into your browser console on the login page

// Check current Firebase Auth state
function checkFirebaseAuth() {
  console.log('🔍 Checking Firebase Authentication...');
  
  // Import Firebase (if not already available)
  if (typeof firebase === 'undefined') {
    console.log('❌ Firebase not loaded. Make sure you\'re on a page with Firebase.');
    return;
  }
  
  // Check current user
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    console.log('✅ Current user:', currentUser.email);
  } else {
    console.log('❌ No current user');
  }
  
  // Check auth state
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('✅ Auth state - User logged in:', user.email);
    } else {
      console.log('❌ Auth state - No user logged in');
    }
  });
}

// Clear all auth data (use with caution)
function clearFirebaseAuth() {
  console.log('🧹 Clearing Firebase Auth data...');
  
  // Sign out current user
  firebase.auth().signOut().then(() => {
    console.log('✅ Signed out successfully');
    
    // Clear localStorage
    localStorage.clear();
    console.log('✅ Cleared localStorage');
    
    // Reload page
    window.location.reload();
  }).catch((error) => {
    console.error('❌ Error signing out:', error);
  });
}

// Check Firestore data
async function checkFirestoreData() {
  console.log('🔍 Checking Firestore data...');
  
  try {
    const db = firebase.firestore();
    
    // Check borrowers
    const borrowersSnapshot = await db.collection('borrowers').get();
    console.log(`📊 Borrowers: ${borrowersSnapshot.size}`);
    
    borrowersSnapshot.forEach(doc => {
      console.log(`  - ${doc.id}: ${doc.data().email}`);
    });
    
    // Check lenders
    const lendersSnapshot = await db.collection('lenders').get();
    console.log(`📊 Lenders: ${lendersSnapshot.size}`);
    
    lendersSnapshot.forEach(doc => {
      console.log(`  - ${doc.id}: ${doc.data().email}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
  }
}

// Run all checks
function runAllChecks() {
  checkFirebaseAuth();
  checkFirestoreData();
}

console.log('🛠️ Firebase Debug Tools loaded!');
console.log('Available functions:');
console.log('- checkFirebaseAuth()');
console.log('- checkFirestoreData()');
console.log('- clearFirebaseAuth()');
console.log('- runAllChecks()');
