## Par l'ia de supabase
// create_users_and_conversation.ts
import { v4 as uuidv4 } from "npm:uuid@9.0.0";

interface UserInput { email: string; password: string; full_name?: string; role?: string; }
interface Payload {
  userA: UserInput;
  userB: UserInput;
  conversation?: { title?: string };
  message: { content: string };
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("Missing Supabase environment variables");

async function createAuthUser(user: UserInput) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE,
      "Authorization": `Bearer ${SERVICE_ROLE}`
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Auth create failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data;
}

async function insertRow(table: string, row: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE,
      "Authorization": `Bearer ${SERVICE_ROLE}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify(row)
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Insert ${table} failed: ${res.status} ${body}`);
  }
  return res.json();
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const payload: Payload = await req.json();

    // create users
    const createdA = await createAuthUser(payload.userA);
    const createdB = await createAuthUser(payload.userB);

    const userAId: string = createdA.id ?? createdA.user?.id ?? createdA;
    const userBId: string = createdB.id ?? createdB.user?.id ?? createdB;

    // insert profiles
    const profileA = {
      id: userAId,
      full_name: payload.userA.full_name ?? null,
      role: payload.userA.role ?? null,
      created_at: new Date().toISOString()
    };
    const profileB = {
      id: userBId,
      full_name: payload.userB.full_name ?? null,
      role: payload.userB.role ?? null,
      created_at: new Date().toISOString()
    };

    await insertRow("profiles", profileA);
    await insertRow("profiles", profileB);

    // create conversation
    const convId = uuidv4();
    const conversation = {
      id: convId,
      title: payload.conversation?.title ?? null,
      created_by: userAId,
      created_at: new Date().toISOString()
    };
    await insertRow("conversations", conversation);

    // create message
    const msgId = uuidv4();
    const message = {
      id: msgId,
      conversation_id: convId,
      sender_id: userAId,
      content: payload.message.content,
      created_at: new Date().toISOString()
    };
    await insertRow("messages", message);

    const result = {
      users: { userA: userAId, userB: userBId },
      conversation_id: convId,
      message_id: msgId
    };
    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});

-The new function is now live at:
https://zwoldthzirsrlmtkayxw.supabase.co/functions/v1/create-convo-and-users

-To download and work on this function locally, use the CLI command:
supabase functions download create-convo-and-users

## Message de l'ia de supabase

Déploiement réussi — Edge Function "create-convo-and-users" déployée.

Comment procéder pour l'utiliser :

Endpoint : https://zwoldthzirsrlmtkayxw.functions.supabase.co/create-convo-and-users
Méthode : POST
En-têtes : Content-Type: application/json
Payload exemple : { "userA": { "email": "alice@example.com [blocked]", "password": "StrongPassw0rd!", "full_name": "Alice", "role": "user" }, "userB": { "email": "bob@example.com [blocked]", "password": "StrongPassw0rd!", "full_name": "Bob", "role": "user" }, "conversation": { "title": "Test chat" }, "message": { "content": "Hello Bob — test message" } }
Notes et validations rapides :

La fonction utilise SUPABASE_SERVICE_ROLE_KEY — elle doit être protégée; ne l'exposez pas publiquement.
Elle suppose que les tables profiles, conversations, messages existent in the REST-exposed schema (public). If schema differs, tell me and I will update.
If creation fails (duplicate email, missing columns), you'll receive a clear 500 error body.

Oui — le déploiement a réussi et la fonction est disponible. Résumé court et actions recommandées :

Statut : ✅ Edge Function "create-convo-and-users" déployée avec succès.
Endpoint : https://zwoldthzirsrlmtkayxw.functions.supabase.co/create-convo-and-users
Méthode : POST, Content-Type: application/json
Fonction : crée deux comptes Auth (via service role), insère profils dans public.profiles, crée conversation et message.
Sécurité : ne pas exposer cet endpoint publiquement — il utilise la clé service_role côté serveur. Restreignez l'accès (IP allowlist, un secret, ou autorisation via votre backend).
Hypothèses confirmées : tables profiles, conversations, messages doivent exister avec les colonnes utilisées (id, created_at, etc.). Si votre schéma diffère, dites-moi et j'adapte la fonction.
Erreurs courantes : email déjà existant, colonnes manquantes, ou RLS bloquant (service role ignore RLS). Les erreurs renvoient un JSON avec clé "error".

## Fin
