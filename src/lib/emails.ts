import type { Order } from '../payload-types'
import { SITE_URL, taka } from './format'

/*
 * Order emails. Email clients ignore CSS variables and <style> blocks, so these use inline styles
 * with neutral colours that suit any of the palette presets.
 */

type Mail = { subject: string; html: string; text: string }

const esc = (v: unknown): string =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

const INK = '#1f1d1a'
const MUTED = '#6b665e'
const LINE = '#e6e1d8'
const BG = '#f6f4ef'

const zoneLabel = (z?: string | null) => (z === 'outside' ? 'Outside Dhaka' : 'Inside Dhaka')

const paymentLine = (o: Order): string => {
  if (o.paymentMethod === 'online') return o.paymentStatus === 'paid' ? `Paid online (${taka(o.total)})` : 'Online payment'
  const advance = o.advancePaid ?? 0
  return advance > 0 ? `Cash on Delivery: ${taka(o.total - advance)} to pay when it arrives (${taka(advance)} paid online)` : `Cash on Delivery: ${taka(o.total)} to pay when it arrives`
}

const itemRows = (o: Order): string =>
  o.items
    .map(
      (i) => `<tr>
  <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK}">${esc(i.name)}<br><span style="color:${MUTED};font-size:13px">${esc([i.colour, i.size].filter(Boolean).join(' · '))} · Qty ${esc(i.qty)}</span></td>
  <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};text-align:right;white-space:nowrap">${esc(taka(i.lineTotal))}</td>
</tr>`,
    )
    .join('')

const totalRows = (o: Order): string => {
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;font-size:14px;color:${strong ? INK : MUTED};${strong ? 'font-weight:700' : ''}">${esc(label)}</td><td style="padding:4px 0;font-size:14px;color:${INK};text-align:right;${strong ? 'font-weight:700' : ''}">${esc(value)}</td></tr>`
  return [
    row('Subtotal', taka(o.subtotal)),
    row(`Delivery (${zoneLabel(o.zone)})`, o.delivery ? taka(o.delivery) : 'Free'),
    o.discount ? row(`Discount${o.discountCode ? ` (${o.discountCode})` : ''}`, `-${taka(o.discount)}`) : '',
    row('Total', taka(o.total), true),
  ].join('')
}

const shell = (preheader: string, body: string): string => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${LINE}">
<tr><td style="padding:20px 24px;border-bottom:1px solid ${LINE};font-size:20px;color:${INK}">Discount <b>Vai</b></td></tr>
<tr><td style="padding:24px">${body}</td></tr>
</table>
</td></tr></table>
</body></html>`

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;padding:12px 20px;font-size:14px;font-weight:700">${esc(label)}</a>`

const textItems = (o: Order) => o.items.map((i) => `- ${i.name} (${[i.colour, i.size].filter(Boolean).join(', ')}) x${i.qty}: ${taka(i.lineTotal)}`).join('\n')

const textTotals = (o: Order) =>
  [`Subtotal: ${taka(o.subtotal)}`, `Delivery: ${o.delivery ? taka(o.delivery) : 'Free'}`, o.discount ? `Discount: -${taka(o.discount)}` : '', `Total: ${taka(o.total)}`]
    .filter(Boolean)
    .join('\n')

/** Sent to the customer once the order is confirmed (COD placed, or online payment validated). */
export function orderConfirmationEmail(o: Order, shopPhone?: string | null): Mail {
  const link = `${SITE_URL}/order/${o.orderNumber}?t=${o.accessToken}`
  const first = o.contact.name.split(' ')[0]
  const address = [o.address.line, o.address.area, o.address.district].filter(Boolean).join(', ')
  const help = shopPhone ? ` Questions? Call us on ${shopPhone} or reply to this email.` : ' Questions? Just reply to this email.'
  const html = shell(
    `Order ${o.orderNumber}: ${taka(o.total)}`,
    `<h1 style="margin:0 0 8px;font-size:22px;color:${INK}">Thanks, ${esc(first)}! We've got your order.</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:${MUTED}">Order <b style="color:${INK}">${esc(o.orderNumber)}</b>. We'll call you on ${esc(o.contact.phone)} to confirm it before it's sent.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(o)}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${totalRows(o)}</table>
<p style="margin:20px 0 4px;font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:.06em">Payment</p>
<p style="margin:0 0 16px;font-size:14px;color:${INK}">${esc(paymentLine(o))}</p>
<p style="margin:0 0 4px;font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:.06em">Delivering to</p>
<p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:${INK}">${esc(o.contact.name)}<br>${esc(address)}</p>
${button(link, 'View your order')}
<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${MUTED}">${esc(help.trim())}</p>`,
  )
  const text = `Thanks, ${first}! We've got your order ${o.orderNumber}.
We'll call you on ${o.contact.phone} to confirm it before it's sent.

${textItems(o)}

${textTotals(o)}

Payment: ${paymentLine(o)}
Delivering to: ${o.contact.name}, ${address}

View your order: ${link}
${help.trim()}`
  return { subject: `Order ${o.orderNumber} received · Discount Vai`, html, text }
}

/** Sent to the shop so a new order gets a call quickly. */
export function newOrderAlertEmail(o: Order): Mail {
  const link = `${SITE_URL}/admin/collections/orders/${o.id}`
  const address = [o.address.line, o.address.area, o.address.district].filter(Boolean).join(', ')
  const method = o.paymentMethod === 'online' ? 'Paid online' : 'COD'
  const html = shell(
    `${o.contact.name}, ${taka(o.total)}, ${method}`,
    `<h1 style="margin:0 0 8px;font-size:22px;color:${INK}">New order ${esc(o.orderNumber)}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:${MUTED}">${esc(taka(o.total))} · ${esc(paymentLine(o))}</p>
${o.stockProblem ? `<p style="margin:0 0 20px;padding:12px;border:2px solid ${INK};font-size:14px;line-height:1.5;color:${INK}"><b>Stock problem:</b> ${esc(o.stockProblem)}</p>` : ''}
<p style="margin:0 0 4px;font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:.06em">Customer</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:${INK}">${esc(o.contact.name)}<br>${esc(o.contact.phone)}${o.contact.email ? `<br>${esc(o.contact.email)}` : ''}<br>${esc(address)} (${esc(zoneLabel(o.zone))})</p>
${o.notes ? `<p style="margin:0 0 4px;font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:.06em">Notes</p><p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:${INK}">${esc(o.notes)}</p>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(o)}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 24px">${totalRows(o)}</table>
${button(link, 'Open in admin')}`,
  )
  const text = `New order ${o.orderNumber}: ${taka(o.total)}, ${paymentLine(o)}${o.stockProblem ? `\nSTOCK PROBLEM: ${o.stockProblem}` : ''}

Customer: ${o.contact.name}, ${o.contact.phone}${o.contact.email ? `, ${o.contact.email}` : ''}
Address: ${address} (${zoneLabel(o.zone)})${o.notes ? `\nNotes: ${o.notes}` : ''}

${textItems(o)}

${textTotals(o)}

Open in admin: ${link}`
  return { subject: `New order ${o.orderNumber} · ${taka(o.total)} · ${method}`, html, text }
}

/** Password reset for a shopper's account (used by the Customers collection's forgot-password flow). */
export function passwordResetEmail(token: string, name?: string | null): { subject: string; html: string } {
  const link = `${SITE_URL}/account/reset?token=${encodeURIComponent(token)}`
  const first = (name ?? '').split(' ')[0]
  const html = shell(
    'Reset your Discount Vai password',
    `<h1 style="margin:0 0 8px;font-size:22px;color:${INK}">${first ? `Hi ${esc(first)}, reset` : 'Reset'} your password</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:${MUTED}">Someone (hopefully you) asked to reset the password for your Discount Vai account. The link works for 1 hour.</p>
${button(link, 'Choose a new password')}
<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${MUTED}">Didn't ask for this? You can ignore this email; your password stays the same.</p>`,
  )
  return { subject: 'Reset your Discount Vai password', html }
}
