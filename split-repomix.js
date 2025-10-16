#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Splits a repomix-output.xml file into multiple parts by file boundaries
 * Usage: node split-repomix.js [input-file] [max-lines-per-part]
 */

const inputFile = process.argv[2] || 'repomix-output.xml';
const maxLinesPerPart = parseInt(process.argv[3]) || 2500;

console.log(`Splitting ${inputFile} into parts with max ${maxLinesPerPart} lines each...`);

// Read the entire file
const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

// Find where the actual file contents start
let headerEndIndex = 0;
let filesStartIndex = 0;
let filesEndIndex = lines.length;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<files>')) {
    filesStartIndex = i;
    headerEndIndex = i;
    break;
  }
}

for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('</files>')) {
    filesEndIndex = i;
    break;
  }
}

// Extract header and footer
const header = lines.slice(0, headerEndIndex + 2).join('\n'); // Include <files> and next line
const footer = '\n</files>\n';

// Find all file boundaries
const fileBoundaries = [];
for (let i = filesStartIndex + 2; i < filesEndIndex; i++) {
  if (lines[i].match(/^<file path=/)) {
    fileBoundaries.push({
      lineNum: i,
      path: lines[i].match(/path="([^"]+)"/)?.[1] || 'unknown'
    });
  }
}

console.log(`Found ${fileBoundaries.length} files in the output`);

// Split into parts
const parts = [];
let currentPart = [];
let currentLineCount = header.split('\n').length;
let partNum = 1;

for (let i = 0; i < fileBoundaries.length; i++) {
  const startLine = fileBoundaries[i].lineNum;
  const endLine = i < fileBoundaries.length - 1 
    ? fileBoundaries[i + 1].lineNum 
    : filesEndIndex;
  
  const fileLines = lines.slice(startLine, endLine);
  const fileLinesCount = fileLines.length;
  
  // Check if adding this file would exceed the limit
  if (currentLineCount + fileLinesCount > maxLinesPerPart && currentPart.length > 0) {
    // Save current part
    parts.push({
      number: partNum++,
      files: [...currentPart],
      lineCount: currentLineCount
    });
    
    // Start new part
    currentPart = [];
    currentLineCount = header.split('\n').length;
  }
  
  // Add file to current part
  currentPart.push({
    path: fileBoundaries[i].path,
    startLine,
    endLine,
    lines: fileLines
  });
  currentLineCount += fileLinesCount;
}

// Add the last part
if (currentPart.length > 0) {
  parts.push({
    number: partNum,
    files: currentPart,
    lineCount: currentLineCount
  });
}

console.log(`\nSplitting into ${parts.length} parts:`);
parts.forEach(part => {
  console.log(`  Part ${part.number}: ${part.files.length} files, ~${part.lineCount} lines`);
});

// Write the parts to files
const outputDir = 'repomix-parts';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

parts.forEach((part, index) => {
  const isLastPart = index === parts.length - 1;
  
  let partContent = header + '\n';
  
  // Add files
  part.files.forEach(file => {
    partContent += file.lines.join('\n') + '\n';
  });
  
  // Add continuation message or footer
  if (!isLastPart) {
    partContent += '\n<!-- ⏳ PLEASE WAIT FOR NEXT DROP IN NEXT MESSAGE - DON\'T REVIEW YET -->\n';
  }
  
  partContent += footer;
  
  const outputFile = path.join(outputDir, `part-${part.number}-of-${parts.length}.xml`);
  fs.writeFileSync(outputFile, partContent);
  console.log(`✓ Written ${outputFile} (${part.lineCount} lines, ${part.files.length} files)`);
});

// Create a README with instructions
const readmeContent = `# Repomix Output Split into ${parts.length} Parts

This directory contains the repomix output split into ${parts.length} parts for easier consumption by AI assistants.

## Parts:
${parts.map((part, index) => {
  const fileList = part.files.map(f => `  - ${f.path}`).join('\n');
  return `### Part ${part.number} of ${parts.length}
- File: part-${part.number}-of-${parts.length}.xml
- Lines: ~${part.lineCount}
- Files: ${part.files.length}
${fileList}
`;
}).join('\n')}

## Usage:
1. Copy and paste part-1-of-${parts.length}.xml to your AI assistant
2. Wait for it to acknowledge (it will see the "PLEASE WAIT" message)
3. Continue with part-2-of-${parts.length}.xml, and so on
4. The last part will not have the "PLEASE WAIT" message

## Files Included:
${fileBoundaries.map(f => `- ${f.path}`).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
console.log(`\n✓ Created README.md with instructions`);
console.log(`\n✅ Done! Check the '${outputDir}' directory for the split files.`);

