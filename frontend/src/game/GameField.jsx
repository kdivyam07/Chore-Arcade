import { lazy, Suspense } from 'react';
import './shared/field.css';
const fields = {
  cricket: lazy(() => import('./cricket/CricketField')),
  blaster: lazy(() => import('./blaster/BlasterField')),
  hoops: lazy(() => import('./hoops/HoopsField')),
};
export default function GameField({ gameId, ...props }) {
  const Field = fields[gameId] || fields.cricket;
  return (
    <Suspense fallback={<div className="email-card">Loading your arcade machine…</div>}>
      <Field {...props} />
    </Suspense>
  );
}
