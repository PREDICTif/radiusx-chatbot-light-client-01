import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get conversation by ID
  app.get('/api/conversation/:id', async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (conversation) {
        res.json(conversation);
      } else {
        res.status(404).json({ message: 'Conversation not found' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Failed to get conversation' });
    }
  });

  // Get message by ID
  app.get('/api/conversation/:conversationId/:messageId', async (req, res) => {
    try {
      const { conversationId, messageId } = req.params;
      const message = await storage.getMessage(conversationId, messageId);
      if (message) {
        res.json(message);
      } else {
        res.status(404).json({ message: 'Message not found' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Failed to get message' });
    }
  });

  // Create conversation with new message
  app.post('/api/conversation', async (req, res) => {
    try {
      const { conversationId, message } = req.body;
      
      if (conversationId) {
        // Add to existing conversation
        const result = await storage.addMessageToConversation(conversationId, message);
        res.json(result);
      } else {
        // Create new conversation
        const result = await storage.createConversation(message);
        res.json(result);
      }
    } catch (err) {
      res.status(500).json({ message: 'Failed to create conversation or send message' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
