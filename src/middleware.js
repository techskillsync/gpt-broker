const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const checkSupabaseSession = async (ctx, next) => {
    const authHeader = ctx.headers['authorization'];
    if (!authHeader) {
        ctx.status = 401;
        ctx.body = { error: 'Authorization header is required' };
        return;
    }

    const token = authHeader.split(' ')[1];
    const { data: user, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid or expired token' };
        return;
    }

    ctx.state.user = user;
    await next();
};

module.exports = { checkSupabaseSession };
