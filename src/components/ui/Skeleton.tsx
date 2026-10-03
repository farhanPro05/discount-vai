/* Placeholders shown while a page loads on a slow connection. They reuse the real page grids, so columns match at every screen size. */

const Bar = ({ w, h = 14, className = '' }: { w: string; h?: number; className?: string }) => (
  <span className={`sk ${className}`} style={{ width: w, height: h }} />
)

function Busy({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="wrap sk-page" aria-busy="true">
      <span className="sk-sr" role="status">
        {label}
      </span>
      {children}
    </div>
  )
}

export function ListingSkeleton() {
  return (
    <Busy label="Loading products">
      <div className="cat-pg" aria-hidden="true">
        <Bar w="160px" h={12} className="sk-bc" />
        <div className="ct-l">
          <div className="sk-col">
            <Bar w="220px" h={36} />
            <Bar w="min(520px, 80%)" />
          </div>
        </div>
        <div className="sk-row">
          {[72, 88, 64, 96, 80].map((w, i) => (
            <Bar key={i} w={`${w}px`} h={36} className="sk-pill" />
          ))}
        </div>
        <div className="ga">
          {Array.from({ length: 8 }, (_, i) => (
            <div className="cd" key={i}>
              <span className="sk sk-ph" />
              <Bar w="80%" className="sk-t" />
              <Bar w="40%" />
            </div>
          ))}
        </div>
      </div>
    </Busy>
  )
}

export function ProductSkeleton() {
  return (
    <Busy label="Loading product">
      <div aria-hidden="true">
        <Bar w="200px" h={12} className="sk-bc" />
        <div className="pdp">
          <span className="sk sk-ph" />
          <div className="sk-col">
            <Bar w="40%" h={12} />
            <Bar w="85%" h={34} />
            <Bar w="30%" h={24} />
            <div className="sk-row">
              {[40, 40, 40].map((w, i) => (
                <Bar key={i} w={`${w}px`} h={40} className="sk-pill" />
              ))}
            </div>
            <div className="sk-row">
              {[48, 48, 48, 48, 48].map((w, i) => (
                <Bar key={i} w={`${w}px`} h={44} />
              ))}
            </div>
            <Bar w="100%" h={52} />
            <Bar w="100%" />
            <Bar w="90%" />
            <Bar w="70%" />
          </div>
        </div>
      </div>
    </Busy>
  )
}
