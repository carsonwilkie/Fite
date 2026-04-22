// Execution Command (run in terminal):

// curl http://localhost:3000/api/admin-users \
//   -H "x-admin-secret: YOUR_ADMIN_SECRET"

//  * make sure npm run dev is running *

export default async function handler(req, res) {
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;

  const response = await fetch(
    `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
    { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } }
  );

  if (!response.ok) {
    return res.status(response.status).json({ error: "Clerk API error" });
  }

  const users = await response.json();

  const summary = users.map((u) => ({
    id: u.id,
    email: u.email_addresses?.[0]?.email_address ?? null,
    firstName: u.first_name,
    lastName: u.last_name,
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at,
  }));

  res.json({ count: summary.length, offset, users: summary });
}