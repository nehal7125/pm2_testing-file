const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hello World</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .container {
                    text-align: center;
                    padding: 2rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                h1 { font-size: 3rem; margin: 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Hello World!</h1>
                <p>Server is running on port ${PORT}</p>
            </div>
        </body>
        </html>
    `);
});

server.listen(PORT, () => {
    console.log(`Hello World! Server running on port ${PORT}`);
});

