import { Redis } from '@upstash/redis';

// Reads the exact variable names Vercel created for this integration.
var kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN
});

const KEY = 'contacts:list';

function digitsOf(v) {
  return String(v || '').replace(/\D/g, '');
}

function cleanName(v) {
  return String(v || '').trim().replace(/\s+/g, ' ');
}

// Same two formats the front end accepts:
//   11 digits, e.g. 0300 1234567
//   "+" followed by 12 digits, any country code, e.g. +923001234567
function normalizePhone(v) {
  var s = String(v || '').replace(/[\s-]/g, '');
  if (/^\d{11}$/.test(s)) {
    return { display: s.slice(0, 4) + ' ' + s.slice(4), key: s };
  }
  if (/^\+\d{12}$/.test(s)) {
    return { display: s, key: /^\+92/.test(s) ? '0' + s.slice(3) : s };
  }
  return null;
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function getList() {
  var list = await kv.get(KEY);
  return Array.isArray(list) ? list : [];
}

function publicView(c) {
  return { id: c.id, name: c.name, phone: c.phone, createdAt: c.createdAt };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      var list = await getList();
      return res.status(200).json(list.map(publicView));
    }

    if (req.method === 'POST') {
      var body = req.body || {};
      var name = cleanName(body.name);
      if (!name || Array.from(name).length < 2) {
        return res.status(400).json({ error: "Enter the contact's full name." });
      }
      var norm = normalizePhone(body.phone);
      if (!norm) {
        return res.status(400).json({ error: 'Use 11 digits like 0300 1234567, or + followed by 12 digits like +923001234567.' });
      }

      var current = await getList();
      var dup = current.find(function (c) { return c.key === norm.key; });
      if (dup) {
        return res.status(409).json({ error: dup.name + ' is already saved with this number.' });
      }

      var contact = { id: newId(), name: name, phone: norm.display, key: norm.key, createdAt: Date.now() };
      current.unshift(contact);
      await kv.set(KEY, current);
      return res.status(201).json(publicView(contact));
    }

    if (req.method === 'PUT') {
      var id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing contact id.' });

      var pBody = req.body || {};
      var pName = cleanName(pBody.name);
      if (!pName || Array.from(pName).length < 2) {
        return res.status(400).json({ error: "Enter the contact's full name." });
      }
      var pNorm = normalizePhone(pBody.phone);
      if (!pNorm) {
        return res.status(400).json({ error: 'Use 11 digits like 0300 1234567, or + followed by 12 digits like +923001234567.' });
      }

      var pList = await getList();
      var idx = pList.findIndex(function (c) { return c.id === id; });
      if (idx === -1) return res.status(404).json({ error: 'Contact not found. It may have been deleted.' });

      var otherDup = pList.find(function (c) { return c.id !== id && c.key === pNorm.key; });
      if (otherDup) {
        return res.status(409).json({ error: otherDup.name + ' is already saved with this number.' });
      }

      pList[idx] = { id: id, name: pName, phone: pNorm.display, key: pNorm.key, createdAt: pList[idx].createdAt };
      await kv.set(KEY, pList);
      return res.status(200).json(publicView(pList[idx]));
    }

    if (req.method === 'DELETE') {
      var dId = req.query.id;
      if (!dId) return res.status(400).json({ error: 'Missing contact id.' });

      var dList = await getList();
      var dIdx = dList.findIndex(function (c) { return c.id === dId; });
      if (dIdx === -1) return res.status(404).json({ error: 'Contact not found. It may already be deleted.' });

      var removed = dList.splice(dIdx, 1)[0];
      await kv.set(KEY, dList);
      return res.status(200).json(publicView(removed));
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
