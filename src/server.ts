// src/server.ts
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const server = app.listen(env.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 FrontendIQ API Server is running!                    ║
║                                                           ║
║   🌐 Environment: ${env.nodeEnv.padEnd(15)}                       ║
║   🔌 Port: ${String(env.port).padEnd(15)}                               ║
║   🗄️  Database: MongoDB Connected                         ║
║   🕐 Time: ${new Date().toLocaleString().padEnd(20)}                   ║
║                                                           ║
║   📚 API: http://localhost:${env.port}/api                    ║
║   ❤️  Health: http://localhost:${env.port}/api/health          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err: any) => {
      console.error("❌ UNHANDLED REJECTION! Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on("SIGTERM", () => {
      console.log("👋 SIGTERM received. Shutting down gracefully");
      server.close(() => {
        console.log("💔 Process terminated");
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();