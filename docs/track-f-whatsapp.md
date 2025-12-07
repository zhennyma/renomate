# Track F: WhatsApp / Messaging

> **Notion Source:** WhatsApp Integration Flows - `00897dd8f69c4decab114120aa649b43`  
> **Status:** Not Started

---

## Overview

Implements the "WhatsApp-first" strategy for supplier communication:
- Phone → project mapping
- "YES" reply triggers sourcing transition
- Magic links for supplier access
- Message logging for audit trail

---

## Data Model Extensions

### whatsapp_threads

Conversation context per phone, linked to project and optionally supplier.

```sql
CREATE TABLE public.whatsapp_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('consumer', 'supplier', 'unknown')),
  user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects (id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.supplier_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX whatsapp_threads_phone_idx ON public.whatsapp_threads (phone);
CREATE INDEX whatsapp_threads_project_idx ON public.whatsapp_threads (project_id);
```

### whatsapp_messages

All inbound/outbound WhatsApp messages.

```sql
CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.whatsapp_threads (id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'template', 'button')),
  body TEXT,
  payload JSONB,
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX whatsapp_messages_thread_idx ON public.whatsapp_messages (thread_id);
```

---

## Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| F1 | Migration: whatsapp_threads, whatsapp_messages | 45m | Not Started |
| F2 | RLS for WhatsApp tables | 30m | Not Started |
| F3 | Webhook endpoint skeleton | 60m | Not Started |
| F4 | Phone normalization and thread resolution | 60m | Not Started |
| F5 | "YES" reply → sourcing transition | 60m | Not Started |
| F6 | Magic link generation for suppliers | 45m | Not Started |

---

## Webhook Logic

### Endpoint: `POST /webhooks/whatsapp`

```typescript
async function handleWhatsAppWebhook(payload: WebhookPayload) {
  // 1. Extract from provider payload
  const fromPhone = payload.from;
  const messageText = payload.text || payload.button_payload;
  
  // 2. Normalize phone
  const phone = normalizePhone(fromPhone); // "+971 50 123 4567" → "+971501234567"
  
  // 3. Resolve or create thread
  const thread = await resolveThread(phone);
  
  // 4. Insert message row
  await insertMessage(thread.id, 'inbound', messageText);
  
  // 5. Business logic: Check for "YES" reply
  if (isAcceptance(messageText)) {
    await handleAcceptance(thread);
  }
}
```

### Thread Resolution Logic

1. Check `whatsapp_threads` for existing thread with this phone
2. If found and has `project_id` → reuse
3. Else, try to resolve as **supplier**:
   - `users.phone` → `supplier_profiles.user_id` → recent `project_supplier_invites`
4. Else, try to resolve as **consumer**:
   - `users.phone` → `projects.consumer_id`
5. If still unknown → create thread with `actor_type = 'unknown'`

### "YES" Reply Handling

```typescript
async function handleAcceptance(thread: Thread) {
  if (!thread.project_id || !thread.supplier_id) {
    // Can't process without context
    return;
  }
  
  // Update invite status
  await supabase
    .from('project_supplier_invites')
    .update({ decision_status: 'accepted' })
    .eq('project_id', thread.project_id)
    .eq('supplier_id', thread.supplier_id);
  
  // Optionally transition project to sourcing
  await supabase
    .from('projects')
    .update({ status: 'sourcing' })
    .eq('id', thread.project_id)
    .in('status', ['open_for_bids', 'ready_for_review']);
}
```

---

## Magic Links

### Purpose

Allow suppliers to access project details without logging in, via a secure token.

### Implementation

```sql
-- Already in project_supplier_invites table:
-- magic_link_token TEXT UNIQUE
```

### Token Generation

```typescript
function generateMagicLink(inviteId: string): string {
  const token = crypto.randomUUID();
  
  // Store token on invite
  await supabase
    .from('project_supplier_invites')
    .update({ magic_link_token: token })
    .eq('id', inviteId);
  
  return `https://app.renomate.ae/supplier/magic/${token}`;
}
```

### Token Resolution

```typescript
async function resolveMagicLink(token: string) {
  const { data: invite } = await supabase
    .from('project_supplier_invites')
    .select('*, project:projects(*), supplier:supplier_profiles(*)')
    .eq('magic_link_token', token)
    .single();
  
  if (!invite) throw new Error('Invalid or expired link');
  
  // Return project view for this supplier
  return invite;
}
```

---

## Phone Normalization

```typescript
function normalizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Ensure starts with +
  if (!normalized.startsWith('+')) {
    // Assume UAE if no country code
    if (normalized.startsWith('0')) {
      normalized = '+971' + normalized.slice(1);
    } else {
      normalized = '+' + normalized;
    }
  }
  
  return normalized;
}

// Examples:
// "+971 50 123 4567" → "+971501234567"
// "050-123-4567" → "+971501234567"
// "971501234567" → "+971501234567"
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| Multiple active projects per supplier | Use most recent active invite |
| Unknown phone number | Create thread with `actor_type = 'unknown'`, route to ops |
| Duplicate webhook delivery | Use `provider_message_id` for idempotency |
| Expired magic link | Return error, prompt to request new link |

---

## Security Considerations

- Do not expose raw WhatsApp logs to end users
- Phone → project mapping respects RLS
- Magic links are single-supplier, single-project, revocable
- Consider expiry window for magic links (e.g., 7 days)

---

## Provider Choice

**Decision needed:** Meta Cloud API vs Twilio WhatsApp Business API

| Factor | Meta Cloud API | Twilio |
|--------|---------------|--------|
| Cost | Lower per-message | Higher but simpler |
| Setup | More complex | Easier |
| Features | Full WhatsApp features | Good coverage |
| UAE support | Yes | Yes |

---

## Dependencies

| Requires | Enables |
|----------|---------|
| Track B (base tables exist) | Supplier lead notification flow |
| Track C (RLS in place) | |
| Track E (State Machine) | Sourcing transition |
