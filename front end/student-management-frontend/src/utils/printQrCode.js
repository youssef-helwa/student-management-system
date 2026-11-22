import QRCode from 'qrcode';

// Opens a small print-ready page with the student's QR code and core ID
// info, then triggers the browser print dialog. Used by the "Print QR
// Code" action on the Students list and the Student Details page.
export async function printStudentQrCode(student, { gradeName, className } = {}) {
  if (!student?.qrCode) return;

  const dataUrl = await QRCode.toDataURL(student.qrCode, { margin: 1, width: 480 });

  const printWindow = window.open('', '_blank', 'width=420,height=560');
  if (!printWindow) return; // popup blocked — fail silently rather than throw

  const gradeClassLine = [gradeName, className].filter(Boolean).join(' / ');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>QR Code — ${escapeHtml(student.fullName || '')}</title>
        <style>
          @page { size: auto; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          .card {
            width: 320px;
            text-align: center;
            border: 1px solid #d8dce1;
            border-radius: 12px;
            padding: 24px 20px;
          }
          .card img {
            width: 220px;
            height: 220px;
            margin: 0 auto 16px;
            display: block;
          }
          .name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
          .meta { font-size: 13px; color: #555; margin-bottom: 2px; }
          .code { font-family: monospace; font-size: 13px; color: #333; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="${dataUrl}" alt="Student QR code" />
          <div class="name">${escapeHtml(student.fullName || '')}</div>
          ${gradeClassLine ? `<div class="meta">${escapeHtml(gradeClassLine)}</div>` : ''}
          <div class="code">${escapeHtml(student.studentCode || '')}</div>
        </div>
        <script>
          window.onload = function () {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
