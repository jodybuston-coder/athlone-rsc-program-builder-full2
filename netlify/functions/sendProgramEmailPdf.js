const sgMail = require("@sendgrid/mail");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

const RED = "#C8102E", BORDER = "#e6e6e6";

function esc(s){ return String(s ?? "").replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function renderHTML({ programName, resItems, carItems, mobItems, logoUrl }){
  const list = (arr) => arr && arr.length
    ? "<ul style='margin:6px 0 0 20px'>" + arr.join("") + "</ul>"
    : "<ul style='margin:6px 0 0 20px'><li style='color:#999'>None</li></ul>";

  const r = list((resItems||[]).map(x => {
    const line = `${esc(x.category)}${x.group? " / " + esc(x.group) : ""}: ${esc(x.exercise)} — ${esc(x.sets)} x ${esc(x.reps)}${x.notes? " <span style='color:"+RED+"'>Notes: "+esc(x.notes)+"</span>":""}`;
    return "<li>"+line+"</li>";
  }));

  const c = list((carItems||[]).map(x => {
    const line = `${esc(x.equipment)} — ${esc(x.duration)} minutes @ ${esc(x.intensity)}${x.notes? " <span style='color:"+RED+"'>Notes: "+esc(x.notes)+"</span>":""}`;
    return "<li>"+line+"</li>";
  }));

  const m = list((mobItems||[]).map(x => {
    const line = `${esc(x.type)}${x.joint? " / " + esc(x.joint) : ""}: ${esc(x.name)} — ${esc(x.duration)} ${esc(x.unit)}${x.notes? " <span style='color:"+RED+"'>Notes: "+esc(x.notes)+"</span>":""}`;
    return "<li>"+line+"</li>";
  }));

  const wm = `<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;opacity:.06;font-size:72px;font-weight:800;color:${RED};transform:rotate(-30deg);pointer-events:none">Athlone RSC</div>`;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>@page{size:A4;margin:24px}body{font-family:Arial,sans-serif;color:#222}
  .header{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid ${BORDER}}
  .title{font-weight:700;font-size:18px;color:${RED}}</style></head>
  <body>${wm}
    <div class="header">
      ${logoUrl ? `<img src="${esc(logoUrl)}" style="height:40px" alt="logo">` : ""}
      <div><div class="title">Athlone RSC Program Builder</div><div style="color:#666;font-size:13px">Program</div></div>
    </div>
    <h3 style="margin:10px 0">${esc(programName)}</h3>
    <div><strong>Resistance</strong>${r}</div>
    <div><strong>Cardio</strong>${c}</div>
    <div><strong>Mobility</strong>${m}</div>
    <div style="font-size:12px;color:#666;margin-top:12px">Developed by Jody Buston</div>
  </body></html>`;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    const { SENDGRID_API_KEY, SENDER_EMAIL, SENDER_LOGO_URL } = process.env;
    if (!SENDGRID_API_KEY || !SENDER_EMAIL) return { statusCode: 500, body: JSON.stringify({ error: "Email server not configured" }) };

    const { to, programName, resItems, carItems, mobItems } = JSON.parse(event.body || "{}");
    if (!to || !programName) return { statusCode: 400, body: JSON.stringify({ error: "Missing fields (to, programName)" }) };

    const html = renderHTML({ programName, resItems, carItems, mobItems, logoUrl: SENDER_LOGO_URL });

    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({ args: chromium.args, defaultViewport: chromium.defaultViewport, executablePath, headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" } });
    await browser.close();

    sgMail.setApiKey(SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from: SENDER_EMAIL,
      subject: "Athlone RSC Program — " + programName,
      html: "<p>Please find your program attached as a PDF.</p>",
      attachments: [{ content: pdf.toString("base64"), filename: (programName||"program").replace(/\s+/g,"_")+".pdf", type: "application/pdf", disposition: "attachment" }]
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Email failed" }) };
  }
};
