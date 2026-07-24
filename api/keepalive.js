const TABLES_TO_CHECK = [
  'chef_profile',
  'qa_items',
  'dishes',
  'dish_reviews',
];

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (
    !cronSecret ||
    request.headers.authorization !== `Bearer ${cronSecret}`
  ) {
    return response.status(401).json({ ok: false });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are missing.');
    return response.status(500).json({ ok: false });
  }

  const restUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1`;
  const headers = {
    Accept: 'application/json',
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  try {
    const statuses = await Promise.all(
      TABLES_TO_CHECK.map(async (table) => {
        const supabaseResponse = await fetch(
          `${restUrl}/${table}?select=id&limit=1`,
          {
            method: 'GET',
            headers,
            cache: 'no-store',
          },
        );

        if (!supabaseResponse.ok) {
          throw new Error(`${table} returned ${supabaseResponse.status}`);
        }

        return supabaseResponse.status;
      }),
    );

    return response.status(200).json({
      ok: true,
      queries: statuses.length,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supabase keepalive failed:', error);
    return response.status(502).json({ ok: false });
  }
}
