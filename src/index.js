// Packages required
const obfuscator = require('sha256');
const fs = require('fs');

/* Name: partialHashing
  Type: Helper function
 Usage: Only obfuscates partial fields inside the data and not the whole field 
*/
const partialHashing = (user, field, stringToDetect) => {
  let spaceIndex = user[field].indexOf(stringToDetect);
  let obfuscatedField;
  if (spaceIndex !== -1) {
    obfuscatedField = user[field].slice(0, spaceIndex) + stringToDetect + obfuscator(user[field]).slice(spaceIndex + 1, user[field].length);
  } else {
    obfuscatedField = obfuscator(user[field]).slice(0, user[field].length);
  }
  return obfuscatedField;
}

/* Name: hideSensitiveData
   Type: Main function of this module
   Usage: outputs the new data with the hidden sensitive fields by hashing the req. fields using sha256
*/
const hideSensitiveData = (userData, PIILevel1, PIILevel2) => {
  for (let user of userData) {
    for (let field of PIILevel1) {
      let fieldLength = 10;
      let obfuscatedField;
      if (user[field] !== null && typeof user[field] !== 'undefined')
        obfuscatedField = obfuscator(user[field]).slice(0, fieldLength);
      user[field] = obfuscatedField;
    }

    for (let field of PIILevel2) {
      // Make sure that if fields are null, they stay null and not get hashed.  
      if (user[field] === null && typeof user[field] === 'undefined') {
        continue;
      }

      let obfuscatedField;

      if (field === 'Name') {
        user[field] = partialHashing(user, field, ' ');
      } else if (field === 'Phone') {
        user[field] = partialHashing(user, field, '-');
      }
    }

    if (consoleLogDataFlag == '--show') {
      console.log(user);
    }
  }

  return userData;
}

/* Name: saveObfuscatedData
   Type: Helper function
   Usage: Saves the new object and writes it to the firectory as a json file
*/
const saveObfuscatedData = (fileName, newData, dirName) => {
  let writeFileName = fileName;
  let dotIndex = fileName.indexOf('.');
  if (dotIndex !== -1) {
    writeFileName = fileName.slice(0, dotIndex);
  }

  let dataStoreLoc = dirName + writeFileName + '-obfuscated.json';
  fs.writeFile(dataStoreLoc, JSON.stringify(newData), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log('Sensitive content has been obfuscated from the file and new file has been stored here: ' + dataStoreLoc);
  });
}

/* Code demo to run the code */

// Initially, process the input cli options
const fileName = process.argv[2];
let consoleLogDataFlag;
if (process.argv.length >= 4) {
  consoleLogDataFlag = process.argv[3];     // to see the nature of the saved data
}

const dirName = '../data/json/';

// read in user-data
let userData;
try {
  userData = require(dirName + fileName);
} catch (err) { // incorrect filename by the user
  console.log('The name of the file given cannot be located. Please try again');
  process.exit();
}

// Declare the tiers of fields you want to hide data in 
const PIILevel1 = ['Id', 'SSN', 'Location', 'DOB', 'Email'];
const PIILevel2 = ['Name', 'Phone'];    // Level2 would be partial hashing


/* process the function and write the file to system */
let newData = hideSensitiveData(userData, PIILevel1, PIILevel2);
saveObfuscatedData(fileName, newData, dirName);





