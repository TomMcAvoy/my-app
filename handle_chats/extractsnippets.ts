import * as fs from 'fs';
import * as path from 'path';

const chatFilePath = './chat.json'; // Replace with the path to your chat file
const outputDir = 'snippets'; // Directory to save the snippets

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Read the chat file
const chatContent = fs.readFileSync(chatFilePath, 'utf-8');
const chatData = JSON.parse(chatContent);

// Print the content of the chat file for debugging
console.log('Chat file content:');
console.log(chatContent);

// Enhanced regex to identify code snippets
const snippetRegex = /```[\s\S]*?```/g;

let snippetCount = 0;

// Function to extract snippets from text
const extractSnippets = (text: string): string[] => {
    const snippets: string[] = [];
    let match;

    while ((match = snippetRegex.exec(text)) !== null) {
        snippets.push(match[0]);
    }

    return snippets;
};

// Iterate over the chat messages and extract code snippets
chatData.requests.forEach((request: any) => {
    const messageText = request.message?.text || '';
    console.log(`Processing message: ${messageText}`); // Debugging statement

    const snippets = extractSnippets(messageText);

    snippets.forEach((snippet) => {
        snippetCount++;
        const fileName = `snippet${snippetCount}.txt`; // Adjust extension based on language if needed
        const filePath = path.join(outputDir, fileName);

        // Output the snippet to the console
        console.log('====');
        console.log(snippet);
        console.log('====');

        // Write the snippet to a file
        fs.writeFileSync(filePath, snippet);
        console.log(`Snippet ${snippetCount} written to ${filePath}`);
    });
});

console.log(`Total snippets extracted: ${snippetCount}`);
