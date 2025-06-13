const { supabase } = require('../services/supabaseClient');
const { getAIResponse } = require('../services/aiService');

exports.getChatMessages = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(502).json({ error: 'Database error' });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.postChatMessage = async (req, res) => {
  try {
    const { content, sender = 'user' } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid message content' });
    }

    // Save user message
    const { data: userMessage, error: userError } = await supabase
      .from('messages')
      .insert([{ sender, content }])
      .select()
      .single();

    if (userError) throw userError;

    // Get AI response
    const aiReply = await getAIResponse(content);

    // Save bot response
    const { data: botMessage, error: botError } = await supabase
      .from('messages')
      .insert([{ sender: 'bot', content: aiReply }])
      .select()
      .single();

    if (botError) throw botError;

    res.status(201).json({
      user: userMessage,
      bot: botMessage
    });

  } catch (error) {
    console.error('Post message error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};