import { useEffect, useState } from 'react';
import { QrCode as QrCodeIcon } from 'lucide-react';
import QRCode from 'qrcode';

export default function QrCodeTile({ code, size = 120 }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let active = true;
    if (!code) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(code, { margin: 1, width: size * 4 })
      .then((url) => active && setDataUrl(url))
      .catch(() => active && setDataUrl(null));
    return () => {
      active = false;
    };
  }, [code, size]);

  return (
    <div className="flex-col items-center gap-2" style={{ display: 'flex' }}>
      <div
        className="flex items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-strong)',
          background: 'var(--bg-sunken)',
          color: 'var(--text-tertiary)',
          overflow: 'hidden',
        }}
      >
        {dataUrl ? (
          <img src={dataUrl} alt={`QR code ${code}`} width={size} height={size} style={{ display: 'block' }} />
        ) : (
          <QrCodeIcon size={size * 0.5} />
        )}
      </div>
      <span className="font-mono text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>{code}</span>
    </div>
  );
}
