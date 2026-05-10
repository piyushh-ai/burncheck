const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('../Credex WebDev 2026 Assignment.pdf');

pdf(dataBuffer).then(function(data) {
    const text = data.text;
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        if (line.toLowerCase().includes('email')) {
            console.log(`[Line ${i}]: ${line}`);
        }
    });
}).catch(err => {
    console.error("Error reading PDF:", err);
});
