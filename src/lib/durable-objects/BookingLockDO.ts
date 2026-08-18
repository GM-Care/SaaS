/**
 * ============================================================================
 * CLOUDFLARE DURABLE OBJECTS: DISTRIBUTED TRANSACTIONAL BOOKING LOCK ENGINE
 * ============================================================================
 * Prevents double-booking race conditions across global edge locations.
 * Implements an atomic mutex with a 10-minute checkout TTL.
 * ============================================================================
 */

export interface SlotLock {
  venueId: string;
  date: string;
  slot: string;
  lockedBy: string; // Customer session / Booking ID
  lockedAt: number;
  expiresAt: number; // 10-Minute TTL
}

export class BookingLockDO {
  state: DurableObjectState;
  storage: DurableObjectStorage;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.storage = state.storage;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (request.method === 'POST' && path === '/lock') {
        const body: { venueId: string; date: string; slot: string; sessionOrBookingId: string } = await request.json();
        const key = `lock:${body.venueId}:${body.date}:${body.slot}`;
        
        const existingLock = await this.storage.get<SlotLock>(key);
        const now = Date.now();

        // Check if existing lock is active
        if (existingLock && existingLock.expiresAt > now && existingLock.lockedBy !== body.sessionOrBookingId) {
          return new Response(JSON.stringify({
            success: false,
            message: 'This showtime slot is currently reserved by another guest. Please choose another slot or try again in 5 minutes.',
            isLocked: true,
            expiresInSeconds: Math.ceil((existingLock.expiresAt - now) / 1000)
          }), { status: 409, headers: { 'Content-Type': 'application/json' } });
        }

        // Grant 10-Minute Lock
        const newLock: SlotLock = {
          venueId: body.venueId,
          date: body.date,
          slot: body.slot,
          lockedBy: body.sessionOrBookingId,
          lockedAt: now,
          expiresAt: now + (10 * 60 * 1000) // 10 minutes
        };

        await this.storage.put(key, newLock);

        return new Response(JSON.stringify({
          success: true,
          message: 'Slot locked successfully for checkout',
          lock: newLock
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (request.method === 'POST' && path === '/release') {
        const body: { venueId: string; date: string; slot: string; sessionOrBookingId: string } = await request.json();
        const key = `lock:${body.venueId}:${body.date}:${body.slot}`;
        
        const existingLock = await this.storage.get<SlotLock>(key);
        if (existingLock && existingLock.lockedBy === body.sessionOrBookingId) {
          await this.storage.delete(key);
        }

        return new Response(JSON.stringify({ success: true, message: 'Slot released' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'GET' && path === '/status') {
        const venueId = url.searchParams.get('venueId');
        const date = url.searchParams.get('date');
        const slot = url.searchParams.get('slot');
        const key = `lock:${venueId}:${date}:${slot}`;

        const existingLock = await this.storage.get<SlotLock>(key);
        const now = Date.now();

        const isLocked = Boolean(existingLock && existingLock.expiresAt > now);
        return new Response(JSON.stringify({
          success: true,
          isLocked,
          lock: isLocked ? existingLock : null
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: 'Endpoint Not Found' }), { status: 404 });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
