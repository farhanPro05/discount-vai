import { formatDate, isPlaceholder, plural } from '../../lib/format'
import type { Order } from '../../payload-types'
import { Icon, type IconName } from '../ui/Icon'
import { STATUS_LABEL, paymentLabel, statusPill } from './OrderBits'

const FLOW: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered']

/** Header, status timeline and courier note for an order (account detail and tracking). */
export function OrderStatus({ order }: { order: Order }) {
  const when = (s: string) => order.timeline?.filter((t) => t.status === s).at(-1)?.at
  const stopped = order.status === 'cancelled' || order.status === 'returned'
  const idx = FLOW.indexOf(order.status)
  const steps = FLOW.map((s, i) => {
    const at = when(s)
    const done = !stopped && i < idx
    const now = !stopped && i === idx
    const icon: IconName = done || (now && s === 'delivered') ? 'check' : now ? 'arrowRight' : 'dot'
    const note =
      at
        ? formatDate(at, true)
        : s === 'delivered' && order.shipping?.expected
          ? `Expected ${formatDate(order.shipping.expected)}`
          : ''
    return { s, cls: done || (now && s === 'delivered') ? 'done' : now ? 'now' : '', icon, note }
  })
  const items = order.items.reduce((n, i) => n + i.qty, 0)
  return (
    <>
      <div className="od-h">
        <h1 className="pg-h1">Order #{order.orderNumber}</h1>
        <span className={statusPill(order.status)}>{STATUS_LABEL[order.status]}</span>
      </div>
      <p className="muted">
        Placed {formatDate(order.createdAt, true)} · {paymentLabel(order)} · {plural(items, 'item')}
      </p>
      {stopped ? (
        <p className="note" style={{ marginTop: 20 }}>
          <Icon name="alert" small />
          This order was {STATUS_LABEL[order.status].toLowerCase()}. Questions? Message us any time.
        </p>
      ) : (
        <ol className="tl" aria-label="Order status">
          {steps.map((st) => (
            <li key={st.s} className={st.cls}>
              <span className="tl-dot">
                <Icon name={st.icon} small />
              </span>
              <span className="tl-t">
                <b>{STATUS_LABEL[st.s]}</b>
                {st.note ? <small>{st.note}</small> : null}
              </span>
            </li>
          ))}
        </ol>
      )}
      {order.status === 'shipped' && (order.shipping?.courier || order.shipping?.trackingId) ? (
        <div className="note info">
          <Icon name="truck" small />
          <span>
            With the courier {order.shipping?.courier ?? ''}.{' '}
            {order.shipping?.trackingId ? (
              <>
                Tracking ID <b>{isPlaceholder(order.shipping.trackingId) ? order.shipping.trackingId : order.shipping.trackingId}</b>.
              </>
            ) : null}
            {order.shipping?.expected ? ` Expected ${formatDate(order.shipping.expected)}.` : ''}
          </span>
        </div>
      ) : null}
    </>
  )
}
