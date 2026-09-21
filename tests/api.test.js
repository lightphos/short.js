import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, elem, listen } from '../short.js';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('api', () => {
    it('gets an element by id', () => {
        const element = { id: 'rest-form' };
        const getElementById = vi.fn().mockReturnValue(element);
        vi.stubGlobal('document', { getElementById });

        expect(elem('rest-form')).toBe(element);
        expect(getElementById).toHaveBeenCalledWith('rest-form');
    });

    it('listens to an element by id', () => {
        const element = { addEventListener: vi.fn() };
        vi.stubGlobal('document', { getElementById: vi.fn().mockReturnValue(element) });
        const handler = vi.fn();

        expect(listen('rest-form', 'submit', handler)).toBe(element);
        expect(element.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function), undefined);

        const registeredHandler = element.addEventListener.mock.calls[0][1];
        const event = { type: 'submit' };
        registeredHandler(event);
        expect(handler).toHaveBeenCalledWith(event, element);
    });

    it('serializes JSON payloads and parses JSON responses', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ id: 1 }), {
                status: 201,
                headers: { 'content-type': 'application/json' },
            })
        );

        await expect(api.post('/users', { name: 'Ada' })).resolves.toEqual({ id: 1 });
        expect(fetchMock).toHaveBeenCalledWith('/users', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'Ada' }),
        }));
        expect(fetchMock.mock.calls[0][1].headers.get('content-type')).toBe('application/json');
    });

    it('throws an error with status and parsed response data', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ message: 'Invalid request' }), {
                status: 422,
                headers: { 'content-type': 'application/json' },
            })
        );

        await expect(api.delete('/users/1')).rejects.toMatchObject({
            status: 422,
            data: { message: 'Invalid request' },
        });
    });
});