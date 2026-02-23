const express = require('express');
const cors = require('cors');
const path = require('path');
const { getRecords, setRecord, getAuthStatus, setAuthStatus, importRecords } = require('./db');

const app = express();
const PORT = 3006;
const LOGIN_CODE = '233888';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/records', async (req, res) => {
  try {
    const records = await getRecords();
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const { date, status } = req.body;
    if (!date || (status && !['success', 'neutral', 'danger'].includes(status))) {
      return res.status(400).json({ success: false, error: '无效参数' });
    }
    await setRecord(date, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth', async (req, res) => {
  try {
    const isLoggedIn = await getAuthStatus();
    res.json({ success: true, isLoggedIn });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (code === LOGIN_CODE) {
      await setAuthStatus(true);
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: '登录码错误' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    await setAuthStatus(false);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const { records, merge } = req.body;
    if (!records) {
      return res.status(400).json({ success: false, error: '无效数据' });
    }
    await importRecords(records, merge);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
