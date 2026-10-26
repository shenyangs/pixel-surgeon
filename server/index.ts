import express from 'express';
const app = express(); app.use(express.json({limit:'512kb'}));
app.get('/api/health', (_req,res) => res.json({ ok: true, project: 'pixel-surgeon' }));
app.listen(5203, '127.0.0.1', () => console.log('[pixel-surgeon] api ready on 5203'));
