// Script to clear browser IndexedDB cache
// This script should be run in the browser console or as part of the app initialization

(function() {
  // Function to delete all IndexedDB databases
  function deleteAllDatabases() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        console.log('IndexedDB not available in this environment');
        resolve();
        return;
      }
      
      console.log('Attempting to clear all IndexedDB databases...');
      
      // Get list of all databases
      const databases = indexedDB.databases();
      
      databases.then((dbList) => {
        console.log(`Found ${dbList.length} databases`);
        
        // Delete each database
        const deletePromises = dbList.map((dbInfo) => {
          return new Promise((deleteResolve, deleteReject) => {
            if (dbInfo.name) {
              console.log(`Deleting database: ${dbInfo.name}`);
              const deleteReq = indexedDB.deleteDatabase(dbInfo.name);
              
              deleteReq.onsuccess = () => {
                console.log(`Successfully deleted database: ${dbInfo.name}`);
                deleteResolve();
              };
              
              deleteReq.onerror = (event) => {
                console.error(`Error deleting database ${dbInfo.name}:`, event.target.error);
                deleteResolve(); // Resolve anyway to continue with other databases
              };
              
              deleteReq.onblocked = (event) => {
                console.warn(`Deletion of database ${dbInfo.name} is blocked:`, event.target.error);
                deleteResolve(); // Resolve anyway to continue with other databases
              };
            } else {
              deleteResolve();
            }
          });
        });
        
        Promise.all(deletePromises)
          .then(() => {
            console.log('All databases deleted successfully');
            resolve();
          })
          .catch((error) => {
            console.error('Error deleting databases:', error);
            resolve(); // Resolve anyway
          });
      }).catch((error) => {
        console.error('Error getting database list:', error);
        resolve(); // Resolve anyway
      });
    });
  }
  
  // Function to clear all localStorage
  function clearLocalStorage() {
    try {
      localStorage.clear();
      console.log('localStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
  
  // Function to clear all sessionStorage
  function clearSessionStorage() {
    try {
      sessionStorage.clear();
      console.log('sessionStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }
  
  // Function to clear all caches
  function clearAllCaches() {
    if ('caches' in window) {
      caches.keys().then((names) => {
        console.log(`Found ${names.length} cache entries`);
        names.forEach((name) => {
          caches.delete(name).then(() => {
            console.log(`Deleted cache: ${name}`);
          }).catch((error) => {
            console.error(`Error deleting cache ${name}:`, error);
          });
        });
      }).catch((error) => {
        console.error('Error getting cache keys:', error);
      });
    } else {
      console.log('Caches API not available');
    }
  }
  
  // Main function to clear all client-side storage
  async function clearAllClientStorage() {
    console.log('Starting to clear all client-side storage...');
    
    // Clear IndexedDB
    await deleteAllDatabases();
    
    // Clear localStorage
    clearLocalStorage();
    
    // Clear sessionStorage
    clearSessionStorage();
    
    // Clear caches
    clearAllCaches();
    
    console.log('\\n✅ All client-side storage cleared successfully!');
    console.log('\\n🔄 Please refresh the page to start with a clean slate');
  }
  
  // Expose the function globally
  window.clearAllClientStorage = clearAllClientStorage;
  
  console.log('%c[Uangku] Client storage clearing utility loaded!', 'color: green; font-weight: bold;');
  console.log('%cTo clear all client storage, run: clearAllClientStorage()', 'color: blue;');
  console.log('%cThis will clear IndexedDB, localStorage, sessionStorage, and caches', 'color: gray;');
})();