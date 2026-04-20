const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Загружаем товары
let products = [];
const productsFile = path.join(__dirname, 'data', 'products.json');

if (fs.existsSync(productsFile)) {
    products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    console.log(`✅ Загружено ${products.length} товаров`);
} else {
    // Пробуем извлечь из app.js
    try {
        const appJs = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
        const start = appJs.indexOf('let products = [');
        let depth = 0;
        let end = start;
        let inString = false;
        for (let i = start; i < appJs.length; i++) {
            const c = appJs[i];
            if (c === '"' || c === "'") inString = !inString;
            if (!inString) {
                if (c === '[') depth++;
                if (c === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
            }
        }
        const productsStr = appJs.substring(start, end);
        const match = productsStr.match(/let products = ([\s\S]*)/);
        if (match) {
            products = eval(match[1]);
            if (!fs.existsSync(path.join(__dirname, 'data'))) {
                fs.mkdirSync(path.join(__dirname, 'data'));
            }
            fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
            console.log(`✅ Извлечено и сохранено ${products.length} товаров`);
        }
    } catch(e) {
        console.error('Ошибка:', e);
    }
}

// Загружаем заказы
let orders = [];
const ordersFile = path.join(__dirname, 'data', 'orders.json');
if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
}

function saveOrders() {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// API (БЕЗ проверки токена)
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'aydana2026') {
        res.json({ success: true, token: 'temp-token-for-test' });
    } else {
        res.status(401).json({ error: 'Неверный логин или пароль' });
    }
});

app.get('/api/admin/products', (req, res) => {
    res.json(products);
});

app.get('/api/admin/stats', (req, res) => {
    const newOrders = orders.filter(o => o.status === 'new').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    res.json({
        totalProducts: products.length,
        totalOrders: orders.length,
        newOrders: newOrders,
        totalRevenue: totalRevenue
    });
});

app.post('/api/orders', (req, res) => {
    const order = {
        id: Date.now(),
        status: 'new',
        date: new Date().toISOString(),
        ...req.body
    };
    orders.unshift(order);
    saveOrders();
    res.json({ ok: true, orderId: order.id });
});

app.get('/api/admin/orders', (req, res) => {
    const { status } = req.query;
    let result = status ? orders.filter(o => o.status === status) : orders;
    res.json(result);
});

app.get('/api/admin/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    res.json(order || {});
});

app.patch('/api/admin/orders/:id/status', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (order) {
        order.status = req.body.status;
        saveOrders();
    }
    res.json({ ok: true });
});

app.delete('/api/admin/orders/:id', (req, res) => {
    orders = orders.filter(o => o.id !== parseInt(req.params.id));
    saveOrders();
    res.json({ ok: true });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-2-2.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Сервер: http://localhost:${PORT}`);
    console.log(`👤 Логин: admin / Пароль: aydana2026`);
    console.log(`📦 Товаров: ${products.length}`);
});
