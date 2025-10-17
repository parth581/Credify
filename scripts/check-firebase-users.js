// Firebase Users Checker Script
// Run this with: node scripts/check-firebase-users.js

const { initializeApp } = require('firebase/app');
const { getAuth, listUsers } = require('firebase/auth');
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set up service account)
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkFirebaseUsers() {
  try {
    console.log('🔍 Checking Firebase Authentication users...');
    
    // List all users in Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    
    console.log(`📊 Total users in Firebase Auth: ${listUsersResult.users.length}`);
    
    if (listUsersResult.users.length === 0) {
      console.log('✅ No users found in Firebase Auth');
    } else {
      console.log('\n📋 User Details:');
      listUsersResult.users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   UID: ${user.uid}`);
        console.log(`   Created: ${new Date(user.metadata.creationTime).toLocaleString()}`);
        console.log(`   Last Sign In: ${user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Never'}`);
        console.log('   ---');
      });
    }
    
    // Check Firestore collections
    console.log('\n🗄️ Checking Firestore collections...');
    
    const db = admin.firestore();
    
    // Check borrowers collection
    const borrowersSnapshot = await db.collection('borrowers').get();
    console.log(`📊 Borrowers in Firestore: ${borrowersSnapshot.size}`);
    
    // Check lenders collection  
    const lendersSnapshot = await db.collection('lenders').get();
    console.log(`📊 Lenders in Firestore: ${lendersSnapshot.size}`);
    
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Error checking Firebase users:', error);
  }
}

// Run the check
checkFirebaseUsers();
