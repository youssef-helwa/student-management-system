import { initials } from '../../utils/formatters';

export default function Avatar({ name, src, size = 36 }) {
  const dim = { width: size, height: size, fontSize: size * 0.38 };
  return (
    <span className="avatar" style={dim}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}
