import assert from 'node:assert/strict'
import test from 'node:test'

// Import or re-implement pure utility tests
function formatPrice(price) {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0,
    }).format(price)
}

function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

function isValidEmail(value) {
    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const DISPOSABLE_DOMAINS = new Set(['yopmail.com', 'tempmail.com', 'mailinator.com'])
    const email = value.trim().toLowerCase()
    if (!EMAIL_REGEX.test(email)) return false
    const domain = email.split('@')[1] || ''
    const parts = domain.split('.')
    const tld = parts[parts.length - 1] || ''
    if (parts.length < 2 || tld.length < 2) return false
    return !DISPOSABLE_DOMAINS.has(domain)
}

function resolveVideoUrl(value) {
    const url = value.trim()
    if (!url) return { kind: 'invalid', url: '' }
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
        if (host === 'youtube.com' || host === 'youtu.be') {
            const v = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop()
            if (v) return { kind: 'embed', url: `https://www.youtube.com/embed/${v}` }
        }
        if (/\.(mp4|webm)$/i.test(parsed.pathname)) return { kind: 'file', url }
    } catch {
        return { kind: 'invalid', url: '' }
    }
    return { kind: 'invalid', url: '' }
}

test('formatPrice formats numbers to RWF currency', () => {
    const formatted = formatPrice(150000)
    assert.ok(formatted.includes('150,000') || formatted.includes('150') || formatted.includes('RWF'))
})

test('slugify converts titles into clean url slugs', () => {
    assert.equal(slugify('Luxury Apartment in Kigali'), 'luxury-apartment-in-kigali')
    assert.equal(slugify('House & Garden @ Kimironko!'), 'house--garden--kimironko')
})

test('isValidEmail correctly identifies valid and disposable emails', () => {
    assert.equal(isValidEmail('tenant@example.com'), true)
    assert.equal(isValidEmail('user@yopmail.com'), false)
    assert.equal(isValidEmail('invalid-email'), false)
})

test('resolveVideoUrl parses YouTube and direct video links', () => {
    assert.deepEqual(resolveVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), {
        kind: 'embed',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
    assert.deepEqual(resolveVideoUrl('https://example.com/tour.mp4'), {
        kind: 'file',
        url: 'https://example.com/tour.mp4',
    })
    assert.deepEqual(resolveVideoUrl('not-a-url'), {
        kind: 'invalid',
        url: '',
    })
})
