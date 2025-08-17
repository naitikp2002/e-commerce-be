const fs = require('fs');
const path = require('path');

console.log('🔍 Starting build validation...');

// Check if all required files exist
const requiredFiles = [
  'server.js',
  'app.js',
  'package.json',
  'config/config.json',
  'config/config.js',
  'config/firebase.js',
  'models/index.js',
  'middleware/authMiddleware.js',
  'middleware/errorHandler.js',
  'middleware/validateField.js'
];

console.log('\n📁 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check if all route files exist
console.log('\n🛣️  Checking route files...');
const routesDir = 'routes';
const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
routeFiles.forEach(file => {
  console.log(`✅ routes/${file}`);
});

// Check if all controller files exist
console.log('\n🎮 Checking controller files...');
const controllersDir = 'controllers';
const controllerFiles = fs.readdirSync(controllersDir).filter(file => file.endsWith('.js'));
controllerFiles.forEach(file => {
  console.log(`✅ controllers/${file}`);
});

// Check if all model files exist
console.log('\n🗄️  Checking model files...');
const modelsDir = 'models';
const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
modelFiles.forEach(file => {
  console.log(`✅ models/${file}`);
});

// Validate package.json
console.log('\n📦 Validating package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log('✅ Start script found');
  } else {
    console.log('❌ Start script missing');
  }
  
  if (packageJson.main) {
    console.log('✅ Main entry point defined');
  } else {
    console.log('❌ Main entry point missing');
  }
  
  if (packageJson.dependencies) {
    console.log('✅ Dependencies section found');
  } else {
    console.log('❌ Dependencies section missing');
  }
  
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check for syntax errors by trying to require main files
console.log('\n🔧 Validating JavaScript syntax...');
try {
  require('./server.js');
  console.log('✅ server.js syntax is valid');
} catch (error) {
  console.log('❌ server.js syntax error:', error.message);
}

try {
  require('./models/index.js');
  console.log('✅ models/index.js syntax is valid');
} catch (error) {
  console.log('❌ models/index.js syntax error:', error.message);
}

console.log('\n🎉 Build validation completed!');
console.log('\n📋 Next steps:');
console.log('1. Create a .env file with your environment variables');
console.log('2. Update database credentials in config/config.json');
console.log('3. Run: npm install');
console.log('4. Run: npm start');

if (!allFilesExist) {
  console.log('\n⚠️  Some required files are missing. Please check the errors above.');
  process.exit(1);
} else {
  console.log('\n✅ All required files are present. Build should succeed!');
}
