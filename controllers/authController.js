const {supabase} = require('../services/supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword }])
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ ...data, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// ✅ Login (email-based + secure compare)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials (email not found)' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials (wrong password)' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ ...user, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
