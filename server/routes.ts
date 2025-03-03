import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res, next) => {
    // Return a JSON response for API requests
    if (req.accepts('json')) {
      return res.json({ status: 'ok' });
    }
    next();
  });

  // Get conversation by ID
  app.get('/api/conversation/:id', async (req, res, next) => {
    // Process only if JSON is accepted
    if (req.accepts('json')) {
      try {
        const conversation = await storage.getConversation(req.params.id);
        if (conversation) {
          return res.json(conversation);
        } else {
          return res.status(404).json({ message: 'Conversation not found' });
        }
      } catch (err) {
        console.error('Error getting conversation:', err);
        return res.status(500).json({ message: 'Failed to get conversation' });
      }
    }
    next();
  });

  // Get message by ID
  app.get('/api/conversation/:conversationId/:messageId', async (req, res, next) => {
    // Process only if JSON is accepted
    if (req.accepts('json')) {
      try {
        const { conversationId, messageId } = req.params;
        const message = await storage.getMessage(conversationId, messageId);
        if (message) {
          return res.json(message);
        } else {
          return res.status(404).json({ message: 'Message not found' });
        }
      } catch (err) {
        console.error('Error getting message:', err);
        return res.status(500).json({ message: 'Failed to get message' });
      }
    }
    next();
  });

  // Create conversation with new message
  app.post('/api/conversation', async (req, res, next) => {
    // Only process if this is a JSON request
    if (req.is('application/json')) {
      console.log('Processing /api/conversation with body:', JSON.stringify(req.body));
      try {
        const { conversationId, message } = req.body;
        
        if (!message) {
          return res.status(400).json({ message: 'Message is required' });
        }
        
        if (conversationId) {
          // Add to existing conversation
          const result = await storage.addMessageToConversation(conversationId, message);
          return res.json(result);
        } else {
          // Create new conversation
          const result = await storage.createConversation(message);
          return res.json(result);
        }
      } catch (err) {
        console.error('Error in /api/conversation:', err);
        return res.status(500).json({ message: 'Failed to create conversation or send message' });
      }
    } else {
      // Not a JSON request, pass to next middleware
      next();
    }
  });

  // Chat endpoint - compatible with front-end 
  // Direct proxy to Claude API - skip local storage
  app.post('/api/chat', async (req, res, next) => {
    // Only process if this is a JSON request
    if (req.is('application/json')) {
      console.log('Processing /api/chat with body:', JSON.stringify(req.body));
      try {
        // Claude API configuration
        const apiEndpoint = "https://7pg9r2dlcc.execute-api.us-east-1.amazonaws.com/api/conversation";
        const apiKey = "H7UI4czPRX7mxrlg67v7tCPL1XnBx5y90p4ieSZ8";
        
        // Extract conversation ID and message
        const { conversationId, message } = req.body;
        
        if (!message) {
          return res.status(400).json({ message: 'Message is required' });
        }
        
        // Send the request directly to Claude API
        const claudeResponse = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            conversationId: conversationId || null,
            message
          })
        });
        
        if (!claudeResponse.ok) {
          const errorText = await claudeResponse.text();
          console.error(`Claude API Error: ${claudeResponse.status} - ${errorText}`);
          return res.status(claudeResponse.status).json({ 
            error: 'Failed to get response from Claude API',
            details: errorText
          });
        }
        
        // Get initial response with conversation and message IDs
        const initialClaudeData = await claudeResponse.json();
        console.log('Claude API Initial Response:', JSON.stringify(initialClaudeData));
        
        // Return Claude API response directly to the client
        return res.json({
          conversationId: initialClaudeData.conversationId,
          message: {
            id: initialClaudeData.messageId
          }
        });
      } catch (err) {
        console.error('Error in /api/chat:', err);
        return res.status(500).json({ message: 'Failed to create conversation or send message' });
      }
    } else {
      // Not a JSON request, pass to next middleware
      next();
    }
  });

  // Message retrieval endpoint
  app.get('/api/message/:conversationId/:messageId', async (req, res) => {
    try {
      const { conversationId, messageId } = req.params;
      const apiKey = "H7UI4czPRX7mxrlg67v7tCPL1XnBx5y90p4ieSZ8";
      
      console.log(`Fetching message from conversation ${conversationId}, message ${messageId}`);
      
      // Function to retrieve message with retries
      const fetchMessageWithRetry = async (maxRetries = 5, initialDelay = 1000) => {
        let attempt = 0;
        let delay = initialDelay;
        
        while (attempt < maxRetries) {
          try {
            const messageUrl = `https://7pg9r2dlcc.execute-api.us-east-1.amazonaws.com/api/conversation/${conversationId}/${messageId}`;
            console.log(`Fetching message from: ${messageUrl}`);
            
            const messageResponse = await fetch(messageUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
              }
            });
            
            // If message is not ready yet (404), retry with backoff
            if (messageResponse.status === 404) {
              attempt++;
              console.log(`Message not ready yet, retrying in ${delay/1000} seconds... (Attempt ${attempt}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay = Math.min(delay * 1.5, 10000); // Exponential backoff with 10s cap
              continue;
            }
            
            // Handle other errors
            if (!messageResponse.ok) {
              const errorText = await messageResponse.text();
              console.error(`Error fetching message: ${messageResponse.status} - ${errorText}`);
              return { error: true, status: messageResponse.status, message: errorText };
            }
            
            // Parse and return successful response
            const messageData = await messageResponse.json();
            return { error: false, data: messageData };
          } catch (error) {
            console.error('Error during message fetch:', error);
            attempt++;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * 1.5, 10000);
          }
        }
        
        return { error: true, status: 500, message: `Failed to retrieve message after ${maxRetries} attempts` };
      };
      
      // Execute the retry logic
      const result = await fetchMessageWithRetry();
      
      if (result.error) {
        return res.status(result.status || 500).json({ error: result.message });
      }
      
      return res.json(result.data);
    } catch (error) {
      console.error('Error in message retrieval:', error);
      return res.status(500).json({ error: 'Failed to retrieve message' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
