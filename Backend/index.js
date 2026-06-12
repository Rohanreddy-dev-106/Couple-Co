import express from "express";
import wishlistRouter from "./src/Orders/wishlist.routs.js"
import userrouts from "./src/Users/users.routs.js"
import ProducrRoute from "./src/products/product.routs.js";
import managementRouter from "./src/User_Admin_Management/management.routs.js";
import orderRouter from "./src/Orders/order.routs.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();
const server = express();
server.use(express.json())//Postman
server.use(express.urlencoded({ extended: true }));//Data comming from HTML forms
server.use(cookieParser())
server.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "You have reached the request limit. Please try again after 15 minutes.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
server.use("/api", rateLimitMiddleware);

//All apis endpoints

server.use("/api/user", userrouts);
server.use("/api/products",ProducrRoute);
server.use("/api/management",managementRouter);
server.use("/api/order",orderRouter);
server.use("/api/wishlist",wishlistRouter);





server.use((req, res, next) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Backend Service</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        
        .container-wrapper {
          max-width: 700px;
          width: 100%;
        }
        
        .error-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          padding: 3rem 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        
        .server-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .error-code {
          font-size: 5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          line-height: 1;
        }
        
        .error-title {
          font-size: 1.8rem;
          color: #2d3748;
          margin: 1.5rem 0 1rem;
          font-weight: 700;
        }
        
        .error-message {
          color: #4a5568;
          margin-bottom: 1.5rem;
          line-height: 1.8;
          font-size: 1.1rem;
        }
        
        .joke-box {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
          border-left: 4px solid #f6416c;
        }
        
        .joke-text {
          color: #2d3748;
          font-style: italic;
          font-size: 1rem;
          margin: 0;
          line-height: 1.6;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }
        
        .info-card {
          background: #f7fafc;
          border-radius: 10px;
          padding: 1rem;
          border: 2px solid #e2e8f0;
        }
        
        .info-card h3 {
          font-size: 0.9rem;
          color: #718096;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-card p {
          font-size: 1.1rem;
          color: #2d3748;
          font-weight: 600;
          margin: 0;
        }
        
        .status-badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          margin: 1rem 0;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          padding: 14px 36px;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.3s ease;
          color: white;
          text-decoration: none;
          display: inline-block;
          margin-top: 1rem;
        }
        
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          color: white;
        }
        
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #667eea, transparent);
          margin: 2rem 0;
        }
        
        @media (max-width: 576px) {
          .error-code {
            font-size: 3.5rem;
          }
          .error-title {
            font-size: 1.4rem;
          }
          .error-container {
            padding: 2rem 1.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container-wrapper">
        <div class="error-container">
          <div class="server-icon">⚙️</div>
          <h1 class="error-code">404</h1>
          <h2 class="error-title">Oops! You've Hit a Backend Endpoint</h2>
          
          <span class="status-badge">🟢 Backend Online</span>
          
          <p class="error-message">
            This is a backend API service. There's no frontend UI here – just pure server-side goodness! 
            You'll need to connect using a proper API client or check our documentation.
          </p>
          
          <div class="joke-box">
            <p class="joke-text">
              "Why did the frontend developer break up with the backend developer? 
              Because they had too many <strong>commitment issues</strong>... 
              the backend kept returning 404 when the frontend needed emotional support!" 💔
            </p>
          </div>
          
          <div class="info-grid">
            <div class="info-card">
              <h3>Service Type</h3>
              <p>REST API</p>
            </div>
            <div class="info-card">
              <h3>Status</h3>
              <p>Active</p>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <a href="/api-doc-rohan" class="btn btn-primary">
            📚 View API Documentation
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
});




export default server;