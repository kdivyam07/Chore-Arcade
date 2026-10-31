import { ACTIONS } from '../../../../shared/actions';
export default function ActionTargets({ selected, disabled, onSelect }) {
  return (
    <div className="action-zones">
      {ACTIONS.map((action, index) => (
        <button
          key={action.kind}
          disabled={disabled}
          aria-pressed={selected === action.kind}
          onClick={() => onSelect(action.kind)}
        >
          <kbd>{index + 1}</kbd>
          <span>{action.label.replace(/[←↓→]/g, '').trim()}</span>
          <small>{action.description.toUpperCase()}</small>
        </button>
      ))}
    </div>
  );
}
