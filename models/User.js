// backend/models/User.js

const getUserById = async (supabase, id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('User not found');
  return data;
};

module.exports = { getUserById };
