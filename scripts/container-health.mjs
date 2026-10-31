try { const r = await fetch('http://127.0.0.1:'+(process.env.PORT ?? 4000)+'/health/live',{signal:AbortSignal.timeout(3000)}); process.exit(r.ok?0:1); } catch { process.exit(1); }
