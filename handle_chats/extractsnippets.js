"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var chatFilePath = './chat.json'; // Replace with the path to your chat file
var outputDir = 'snippets'; // Directory to save the snippets
// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
// Read the chat file
var chatContent = fs.readFileSync(chatFilePath, 'utf-8');
var chatData = JSON.parse(chatContent);
// Print the content of the chat file for debugging
console.log('Chat file content:');
console.log(chatContent);
// Enhanced regex to identify code snippets
var snippetRegex = /```[\s\S]*?```/g;
var snippetCount = 0;
// Function to extract snippets from text
var extractSnippets = function (text) {
    var snippets = [];
    var match;
    while ((match = snippetRegex.exec(text)) !== null) {
        snippets.push(match[0]);
    }
    return snippets;
};
// Iterate over the chat messages and extract code snippets
chatData.requests.forEach(function (request) {
    var _a;
    var messageText = ((_a = request.message) === null || _a === void 0 ? void 0 : _a.text) || '';
    console.log("Processing message: ".concat(messageText)); // Debugging statement
    var snippets = extractSnippets(messageText);
    snippets.forEach(function (snippet) {
        snippetCount++;
        var fileName = "snippet".concat(snippetCount, ".ts"); // Adjust extension based on language if needed
        var filePath = path.join(outputDir, fileName);
        // Output the snippet to the console
        console.log('====');
        console.log(snippet);
        console.log('====');
        // Write the snippet to a file
        fs.writeFileSync(filePath, snippet);
        console.log("Snippet ".concat(snippetCount, " written to ").concat(filePath));
    });
});
console.log("Total snippets extracted: ".concat(snippetCount));
