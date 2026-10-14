import type { Field, GlobalConfig } from 'payload'

import { anyone, hiddenFromStaff, ownerOnly } from '../access'

const zone = (name: string, label: string, fee: number, eta: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'fee', type: 'number', required: true, min: 0, defaultValue: fee, label: 'Charge (৳)', admin: { width: '50%' } },
        { name: 'eta', type: 'text', required: true, defaultValue: eta, label: 'Delivery time', admin: { width: '50%' } },
      ],
    },
  ],
})

export const Commerce: GlobalConfig = {
  slug: 'commerce',
  label: 'Delivery & payment',
  admin: { group: 'Settings', hidden: hiddenFromStaff },
  access: { read: anyone, update: ownerOnly },
  hooks: {
    // The order-number mark only ever goes up, even if a settings form opened earlier is saved now.
    beforeChange: [
      ({ data, originalDoc }) => ({ ...data, lastOrderNumber: Math.max(Number(data.lastOrderNumber) || 0, Number(originalDoc?.lastOrderNumber) || 0) || null }),
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Delivery',
          fields: [
            zone('inside', 'Inside Dhaka', 70, '1 to 2 days'),
            zone('outside', 'Outside Dhaka', 130, '2 to 4 days'),
            {
              name: 'freeDeliveryOver',
              type: 'number',
              min: 0,
              defaultValue: 2000,
              label: 'Free delivery on orders over (৳)',
              admin: { description: 'Leave empty to switch free delivery off.' },
            },
            { name: 'exchangeDays', type: 'number', defaultValue: 7, min: 0, label: 'Exchange window (days)' },
            // The highest order number issued so far, so numbers are never reused (set by the checkout).
            { name: 'lastOrderNumber', type: 'number', admin: { hidden: true } },
            {
              name: 'nextSteps',
              type: 'group',
              label: 'What happens next (shown on the order confirmation page)',
              fields: [
                { name: 'call', type: 'text', label: 'We call to confirm', defaultValue: 'Within 2 hours, between 9 am and 10 pm.' },
                { name: 'ship', type: 'text', label: 'Packed and shipped', defaultValue: 'Same or next day. The courier contacts you before delivering.' },
              ],
            },
          ],
        },
        {
          label: 'Cash on Delivery',
          fields: [
            { name: 'codEnabled', type: 'checkbox', defaultValue: true, label: 'Offer Cash on Delivery' },
            {
              name: 'codZones',
              type: 'select',
              hasMany: true,
              defaultValue: ['inside', 'outside'],
              label: 'Allowed for',
              options: [
                { label: 'Inside Dhaka', value: 'inside' },
                { label: 'Outside Dhaka', value: 'outside' },
              ],
            },
            {
              name: 'codAdvanceDelivery',
              type: 'checkbox',
              defaultValue: false,
              label: 'Ask for the delivery charge in advance on COD orders',
              admin: { description: 'Customers pay the delivery charge online first; the rest is paid in cash. Needs online payment switched on.' },
            },
          ],
        },
        {
          label: 'Online payment',
          fields: [
            {
              name: 'onlineEnabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'Offer online payment (SSLCommerz)',
              admin: { description: 'Needs the SSLCommerz store ID and password in the server settings (.env).' },
            },
            {
              name: 'onlineLabels',
              type: 'text',
              defaultValue: 'bKash, Nagad, Visa, Mastercard',
              label: 'Methods to show on the payment card',
            },
          ],
        },
        {
          label: 'Order emails',
          fields: [
            {
              name: 'orderAlertEmail',
              type: 'email',
              label: 'Send new-order alerts to',
              admin: { description: 'Leave empty to use the shop email in Header, footer & contact → Contact & social.' },
            },
            {
              name: 'customerEmails',
              type: 'checkbox',
              defaultValue: true,
              label: 'Email customers an order confirmation (when they give an email at checkout)',
              admin: { description: 'Emails are sent through the mail server set in the server settings (.env: SMTP_HOST and friends).' },
            },
          ],
        },
      ],
    },
  ],
}
