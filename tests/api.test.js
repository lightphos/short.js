import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, elem, frmsub, listen } from '../short.js';

const originalDocument = globalThis.document;

afterEach(() => {
    vi.restoreAllMocks();
    if (originalDocument === undefined) {
        delete globalThis.document;
    } else {
        globalThis.document = originalDocument;
    }
});

describe('api', () => {
    it('gets an element by id', () => {
        const element = { id: 'rest-form' };
        const getElementById = vi.fn().mockReturnValue(element);
        globalThis.document = { getElementById };

        expect(elem('rest-form')).toBe(element);
        expect(getElementById).toHaveBeenCalledWith('rest-form');
    });

    it('listens to an element by id', () => {
        const element = { addEventListener: vi.fn() };
        globalThis.document = { getElementById: vi.fn().mockReturnValue(element) };
        const handler = vi.fn();

        expect(listen('rest-form', 'submit', handler)).toBe(element);
        expect(element.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function), undefined);

        const registeredHandler = element.addEventListener.mock.calls[0][1];
        const event = { type: 'submit' };
        registeredHandler(event);
        expect(handler).toHaveBeenCalledWith(event, element);
    });

    it('handles form submission lifecycle', async () => {
        const submit = { disabled: false };
        const form = {
            querySelector: vi.fn().mockReturnValue(submit),
            addEventListener: vi.fn(),
        };
        const status = { textContent: '', classList: { add: vi.fn(), remove: vi.fn() } };
        const result = { textContent: '', classList: { add: vi.fn(), remove: vi.fn() } };
        globalThis.document = {
            getElementById: vi.fn((id) => ({
                'rest-form': form,
                'rest-status': status,
                'rest-result': result,
            }[id])),
        };
        const response = { id: 1 };
        const handler = vi.fn().mockResolvedValue(response);

        frmsub('rest-form', handler, {
            statusId: 'rest-status',
            resultId: 'rest-result',
            sending: 'Sending post...',
            success: 'Post created successfully.',
        });
        const registeredHandler = form.addEventListener.mock.calls[0][1];
        await registeredHandler({ preventDefault: vi.fn() });

        expect(handler).toHaveBeenCalledWith(expect.anything(), form);
        expect(status.textContent).toBe('Post created successfully.');
        expect(result.textContent).toBe(JSON.stringify(response, null, 2));
        expect(submit.disabled).toBe(false);
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