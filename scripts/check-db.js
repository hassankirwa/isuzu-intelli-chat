/**
 * Script to check if ChromaDB is running and responding properly
 */
const { exec } = require('child_process');
const http = require('http');
const https = require('https');

// ChromaDB connection details
const CHROMA_URL = process.env.CHROMA_DB_URL || 'http://localhost:8000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Execute a shell command
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`Command stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

/**
 * Check if ChromaDB is responsive
 */
function checkChromaDB() {
  return new Promise((resolve) => {
    console.log(`Checking ChromaDB at ${CHROMA_URL}...`);
    
    const httpModule = CHROMA_URL.startsWith('https') ? https : http;
    const requestUrl = `${CHROMA_URL}/api/v1/heartbeat`;
    
    const req = httpModule.get(requestUrl, (res) => {
      if (res.statusCode === 200) {
        console.log('ChromaDB is running and responsive.');
        resolve(true);
      } else {
        console.warn(`ChromaDB responded with status: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.error(`Error connecting to ChromaDB: ${err.message}`);
      resolve(false);
    });
    
    // Set a timeout
    req.setTimeout(5000, () => {
      req.destroy();
      console.error('Connection to ChromaDB timed out');
      resolve(false);
    });
  });
}

/**
 * Try to fix ChromaDB if it's not responsive
 */
async function fixChromaDB() {
  try {
    console.log('Attempting to restart ChromaDB...');
    await executeCommand('docker-compose restart chromadb');
    
    console.log('Waiting for ChromaDB to initialize (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Check if it's responsive after restart
    const isResponsive = await checkChromaDB();
    
    if (isResponsive) {
      console.log('Successfully restarted ChromaDB!');
      return true;
    } else {
      console.error('ChromaDB is still not responsive after restart');
      
      // Try to recreate the container
      console.log('Attempting to recreate ChromaDB container...');
      await executeCommand('docker-compose down');
      await executeCommand('docker-compose up -d');
      
      console.log('Waiting for ChromaDB to initialize (40 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 40000));
      
      const isResponsiveNow = await checkChromaDB();
      
      if (isResponsiveNow) {
        console.log('Successfully recreated ChromaDB container!');
        return true;
      } else {
        console.error('ChromaDB is still not responsive after recreation');
        return false;
      }
    }
  } catch (error) {
    console.error('Error fixing ChromaDB:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  let retries = 0;
  let isWorking = false;
  
  console.log('Starting ChromaDB health check...');
  
  while (retries < MAX_RETRIES && !isWorking) {
    isWorking = await checkChromaDB();
    
    if (!isWorking) {
      retries++;
      
      if (retries >= MAX_RETRIES) {
        console.error(`ChromaDB is not responsive after ${MAX_RETRIES} attempts`);
        console.log('Attempting to fix ChromaDB...');
        
        const fixed = await fixChromaDB();
        
        if (fixed) {
          console.log('ChromaDB has been fixed and is now responsive');
          process.exit(0);
        } else {
          console.error('Could not fix ChromaDB. Please check your Docker installation and ChromaDB configuration.');
          process.exit(1);
        }
      } else {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${retries}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  
  if (isWorking) {
    console.log('ChromaDB health check passed!');
    process.exit(0);
  } else {
    console.error('ChromaDB health check failed!');
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 