import fetch from 'node-fetch';

/**
 * This script tests the Claude API integration through our proxy server
 * It performs a two-step process:
 * 1. Sends a message to create a conversation and get message ID
 * 2. Retrieves the message content using the conversation and message IDs
 */
async function testClaudeApi() {
  try {
    console.log('Starting Claude API integration test...');
    
    // Step 1: Send a message to the API
    console.log('\nStep 1: Sending message to API...');
    const chatResponse = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          content: [
            {
              contentType: 'text',
              body: 'Explain the concept of recursion in 2-3 sentences.'
            }
          ],
          model: 'claude-v3-haiku'
        }
      })
    });
    
    if (!chatResponse.ok) {
      throw new Error(`Chat API error: ${chatResponse.status} - ${await chatResponse.text()}`);
    }
    
    const chatData = await chatResponse.json();
    console.log('Chat API response:', JSON.stringify(chatData, null, 2));
    
    // Extract the conversation and message IDs
    const { conversationId, message } = chatData;
    
    if (!conversationId || !message?.id) {
      throw new Error('Missing conversation or message ID in response');
    }
    
    console.log(`Got conversation ID: ${conversationId}`);
    console.log(`Got message ID: ${message.id}`);
    
    // Step 2: Retrieve the message
    console.log('\nStep 2: Retrieving message...');
    const messageResponse = await fetch(`http://localhost:5000/api/message/${conversationId}/${message.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!messageResponse.ok) {
      throw new Error(`Message API error: ${messageResponse.status} - ${await messageResponse.text()}`);
    }
    
    const messageData = await messageResponse.json();
    console.log('Message API response:', JSON.stringify(messageData, null, 2));
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testClaudeApi();