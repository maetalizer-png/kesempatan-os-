import { Utils } from '../../../js/core/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const { showToast } = Utils;

const NEWS_CSS = `:root{--nw-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--nw-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--nw-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));} #newsAggregatorPanel{box-sizing:border-box;padding:4px 12px !important;} .nw-wrap{position:relative;margin:0 0 16px;padding:2px 0 16px;} .nw-wrap::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:rgba(224,230,237,0.14);} .nw-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;} .nw-logo{flex:0 0 auto;width:44px;height:44px;clip-path:var(--nw-clip-sm);background:linear-gradient(135deg,var(--primary,#00FFA3),#00AA6E);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#03130b;} .nw-headtxt{flex:1 1 auto;min-width:0;} .nw-title{font-size:clamp(15px,4vw,19px);font-weight:800;letter-spacing:.2px;color:var(--primary,#00FFA3);text-shadow:0 0 10px rgba(0,255,163,.35);} .nw-sub{font-size:10px;color:#A0B3C9;margin-top:2px;} .nw-apistatus{font-size:10px;font-weight:700;} .nw-btn{position:relative;isolation:isolate;clip-path:var(--nw-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:9px 16px;color:var(--primary,#00FFA3);font-size:11px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} .nw-btn::before{content:'';position:absolute;inset:1px;clip-path:var(--nw-clip-asym);background:#06100b;z-index:-1;} .nw-btn:active{transform:scale(.97);} .nw-back{display:block;width:100%;margin-top:14px;} .nw-cats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;} .nw-cat{position:relative;isolation:isolate;clip-path:var(--nw-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:10px 18px;color:#9fb8ac;font-size:12px;font-weight:600;cursor:pointer;transition:background .25s ease,color .2s ease,transform .15s ease;} .nw-cat::before{content:'';position:absolute;inset:1px;clip-path:var(--nw-clip-asym);background:#06100b;z-index:-1;} .nw-cat.active{background:var(--primary,#00FFA3);color:#03130b;font-weight:800;} .nw-cat.active::before{background:var(--primary,#00FFA3);} .nw-cat:active{transform:scale(.97);} .nw-listhead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;} .nw-listtitle{font-size:13px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#FFD700;text-shadow:0 0 8px rgba(255,215,0,.3);} .nw-count{clip-path:var(--nw-clip-sm);background:rgba(0,255,163,.15);color:var(--primary,#00FFA3);padding:3px 10px;font-size:10px;font-weight:700;} .nw-srcline{clip-path:var(--nw-clip-sm);background:rgba(155,89,182,.2);color:#9B59B6;padding:3px 10px;font-size:10px;font-weight:700;} .nw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;} .nw-card{position:relative;isolation:isolate;clip-path:var(--nw-clip);background:rgba(26,255,156,.3);padding:1px;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} .nw-card::before{content:'';position:absolute;inset:1px;clip-path:var(--nw-clip);background:#05080c;z-index:-1;} .nw-card:hover{background:rgba(26,255,156,.6);filter:drop-shadow(0 0 8px rgba(0,255,163,.35));transform:translateY(-2px);} .nw-card-in{display:block;clip-path:var(--nw-clip);background:#05080c;} .nw-img{display:block;width:100%;height:160px;object-fit:cover;background:#0a0f1c;} .nw-body{display:block;padding:12px 14px;} .nw-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;font-size:10px;color:#7c8a82;} .nw-lokal{clip-path:var(--nw-clip-sm);background:var(--primary,#00FFA3);color:#03130b;padding:2px 8px;font-size:8px;font-weight:800;} .nw-time{margin-left:auto;clip-path:var(--nw-clip-sm);background:rgba(0,0,0,.5);color:var(--primary,#00FFA3);padding:2px 8px;font-size:9px;} .nw-title2{display:block;font-size:14px;font-weight:700;color:#E0E6ED;line-height:1.4;margin-bottom:6px;} .nw-desc{display:block;font-size:11px;color:#A0B3C9;line-height:1.5;margin-bottom:10px;} .nw-foot{display:flex;justify-content:space-between;align-items:center;font-size:10px;color:var(--primary,#00FFA3);} .nw-empty{text-align:center;padding:40px 16px;color:#A0B3C9;font-size:12px;} .nw-empty .nw-sub{margin-top:8px;color:#666;} .nw-spinner{width:36px;height:36px;border:3px solid rgba(0,255,163,.2);border-top-color:var(--primary,#00FFA3);border-radius:50%;animation:nwSpin .8s linear infinite;margin:0 auto 12px;} @keyframes nwSpin{to{transform:rotate(360deg);}} .nw-footline{font-size:9px;color:#666;margin-top:12px;text-align:center;} @media (hover:hover) and (pointer:fine){ .nw-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.35));} .nw-cat:hover{background:rgba(26,255,156,.6);color:#E0E8F0;} .nw-cat.active:hover{background:var(--primary,#00FFA3);color:#03130b;} }`;

function injectCSS() {
    if (document.getElementById('newsAggStyle')) return;
    const s = document.createElement('style');
    s.id = 'newsAggStyle';
    s.textContent = NEWS_CSS;
    document.head.appendChild(s);
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m] || m;
    });
}

function stripTags(html) {
    return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

class NewsAggregator {
    constructor() {
        this.news = [];
        this.isLoading = false;
        this.apiKey = localStorage.getItem('kes_gnews_api_key') || '';
        this.currentCategory = 'technology';
    }

    saveApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('kes_gnews_api_key', key);
    }

    async fetchLokalNews(category) {
        const lokalSources = {
            technology: [
                { name: 'Detik Inet', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://inet.detik.com/index.rss' },
                { name: 'Kompas Tekno', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://tekno.kompas.com/rss' },
                { name: 'CNBC Tekno', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.cnbcindonesia.com/technology/rss' }
            ],
            business: [
                { name: 'Detik Finance', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://finance.detik.com/rss' },
                { name: 'Kompas Bisnis', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://bisnis.kompas.com/rss' },
                { name: 'CNBC Market', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.cnbcindonesia.com/market/rss' },
                { name: 'Liputan6 Bisnis', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.liputan6.com/feeds/6' }
            ],
            crypto: [
                { name: 'CoinDesk', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/feed' },
                { name: 'CoinTelegraph', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss' }
            ],
            indonesia: [
                { name: 'Detik News', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://news.detik.com/rss' },
                { name: 'Kompas', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://news.kompas.com/rss' },
                { name: 'Tempo', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://nasional.tempo.co/rss' },
                { name: 'Liputan6', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.liputan6.com/feeds/1' },
                { name: 'CNBC News', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.cnbcindonesia.com/news/rss' }
            ],
            startup: [
                { name: 'DailySocial', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://dailysocial.id/feed' },
                { name: 'TechCrunch', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/feed' },
                { name: 'Startup Bisnis', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://startupbisnis.com/feed' }
            ]
        };
        const sources = lokalSources[category] || lokalSources.indonesia;
        const allNews = [];
        for (const source of sources) {
            try {
                const response = await fetch(source.url);
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    data.items.slice(0, 3).forEach(function(item) {
                        allNews.push({
                            title: stripTags(item.title),
                            source: source.name,
                            time: this.formatTime(item.pubDate),
                            url: item.link,
                            image: (item.enclosure && item.enclosure.link) || (item.thumbnail) || this.getRandomImage(),
                            description: stripTags(item.description).substring(0, 150)
                        });
                    }.bind(this));
                }
            } catch (e) { console.warn('[NewsAggregator] fetchLokalNews source failed:', source.name, e.message); }
        }
        return allNews.slice(0, 15);
    }

    getRandomImage() {
        const images = [
            'https://placehold.co/400x200/0a0f1c/00FFA3?text=NEWS',
            'https://placehold.co/400x200/1a1a2e/FFD700?text=BREAKING',
            'https://placehold.co/400x200/0a0f1c/FF4444?text=UPDATE'
        ];
        return images[Math.floor(Math.random() * images.length)];
    }

    async fetchNews(category) {
        category = category || 'technology';
        if (this.isLoading) {
            if (showToast) showToast('Sedang mengambil berita...', 'warn');
            return;
        }
        this.currentCategory = category;
        this.updateActiveButton(category);
        this.isLoading = true;
        const container = document.getElementById('newsResultsContainer');
        if (container) {
            container.innerHTML = '<div class="nw-empty"><div class="nw-spinner"></div><div>Mengambil berita terbaru...</div><div class="nw-sub">Sumber: Internasional + Lokal (Detik, Kompas, CNBC, dll)</div></div>';
        }
        try {
            let allNews = [];
            const lokalNews = await this.fetchLokalNews(category);
            allNews = allNews.concat(lokalNews);
            if (this.apiKey && this.apiKey.length > 10) {
                const categoryMap = {
                    technology: 'technology OR AI OR startup OR digital',
                    business: 'business OR economy OR market OR finance',
                    crypto: 'cryptocurrency OR bitcoin OR ethereum OR blockchain',
                    indonesia: 'Indonesia OR Jakarta',
                    startup: 'startup OR "venture capital" OR funding'
                };
                const query = categoryMap[category] || category;
                const url = 'https://gnews.io/api/v4/search?q=' + encodeURIComponent(query) + '&lang=en&max=8&apikey=' + this.apiKey;
                const response = await fetch(url);
                const data = await response.json();
                if (data.articles) {
                    const gnews = data.articles.map(function(article) {
                        return {
                            title: stripTags(article.title),
                            source: (article.source && article.source.name) || 'GNews',
                            time: this.formatTime(article.publishedAt),
                            url: article.url,
                            image: article.image || this.getRandomImage(),
                            description: stripTags(article.description).substring(0, 150)
                        };
                    }.bind(this));
                    allNews = allNews.concat(gnews);
                }
            }
            allNews.sort(function(a, b) {
                const timeA = a.time === 'Baru saja' ? Date.now() : new Date(a.time).getTime() || 0;
                const timeB = b.time === 'Baru saja' ? Date.now() : new Date(b.time).getTime() || 0;
                return timeB - timeA;
            });
            this.news = allNews.slice(0, 25);
            this.displayNews(category);
            if (showToast) showToast(this.news.length + ' berita terbaru (' + lokalNews.length + ' dari sumber lokal)', 'success');
        } catch (error) {
            if (container) {
                container.innerHTML = '<div class="nw-empty"><div style="color:#FF8888;margin-bottom:12px;">Gagal mengambil berita</div><button id="retryNewsBtn" class="nw-cat">Coba Lagi</button></div>';
                const retry = document.getElementById('retryNewsBtn');
                if (retry) retry.addEventListener('click', function() { this.fetchNews(category); }.bind(this));
            }
        } finally {
            this.isLoading = false;
        }
    }

    formatTime(publishedAt) {
        if (!publishedAt) return 'Baru saja';
        const date = new Date(publishedAt);
        if (isNaN(date.getTime())) return 'Baru saja';
        const now = new Date();
        const diff = Math.floor((now - date) / 1000 / 60);
        if (diff < 1) return 'Baru saja';
        if (diff < 60) return diff + ' menit lalu';
        if (diff < 1440) return Math.floor(diff / 60) + ' jam lalu';
        return Math.floor(diff / 1440) + ' hari lalu';
    }

    updateActiveButton(category) {
        const self = this;
        ['newsTechBtn', 'newsBizBtn', 'newsCryptoBtn', 'newsIndoBtn', 'newsStartupBtn'].forEach(function(id) {
            const btn = document.getElementById(id);
            if (btn) btn.classList.toggle('active', id === self.getButtonId(category));
        });
    }

    getButtonId(category) {
        const map = {
            technology: 'newsTechBtn',
            business: 'newsBizBtn',
            crypto: 'newsCryptoBtn',
            indonesia: 'newsIndoBtn',
            startup: 'newsStartupBtn'
        };
        return map[category] || 'newsTechBtn';
    }

    displayNews(category) {
        const container = document.getElementById('newsResultsContainer');
        if (!container) return;
        const categoryNames = {
            technology: 'Teknologi & AI',
            business: 'Bisnis & Ekonomi',
            crypto: 'Crypto & Blockchain',
            indonesia: 'Indonesia (Lokal)',
            startup: 'Startup & Venture'
        };
        const name = categoryNames[category] || category;
        if (this.news.length === 0) {
            container.innerHTML = '<div class="nw-empty">Belum ada berita untuk kategori ini</div>';
            return;
        }
        const self = this;
        container.innerHTML = '<div class="nw-listhead"><span class="nw-listtitle">' + name + '</span><span class="nw-count">' + this.news.length + ' berita</span><span class="nw-srcline">Lokal + Internasional</span></div>' +
            '<div class="nw-grid">' + this.news.map(function(n, i) { return self.renderNewsCard(n, i); }).join('') + '</div>';
    }

    renderNewsCard(news, index) {
        const isLokal = ['Detik', 'Kompas', 'CNBC', 'Liputan6', 'Tempo', 'DailySocial'].some(function(s) { return news.source.indexOf(s) !== -1; });
        const badge = isLokal ? '<span class="nw-lokal">🇮🇩 LOKAL</span>' : '';
        const desc = escapeHtml(news.description || '');
        return '<article class="nw-card" data-url="' + news.url + '"><span class="nw-card-in">' +
            '<img class="nw-img" src="' + news.image + '" alt="" loading="lazy" onerror="this.src=\'https://placehold.co/400x200/0a0f1c/00FFA3?text=NEWS\'">' +
            '<span class="nw-body">' +
            '<span class="nw-meta"><span>' + escapeHtml(news.source) + '</span>' + badge + '<span class="nw-time">' + news.time + '</span></span>' +
            '<span class="nw-title2">' + escapeHtml(news.title) + '</span>' +
            '<span class="nw-desc">' + desc + (desc.length > 100 ? '...' : '') + '</span>' +
            '<span class="nw-foot"><span>Klik untuk baca</span><span>→</span></span>' +
            '</span></span></article>';
    }

    render() {
        injectCSS();
        let container = document.getElementById('newsAggregatorPanel');
        if (!container) {
            const page = document.getElementById('newsPage');
            container = document.createElement('div');
            container.id = 'newsAggregatorPanel';
            if (page) {
                page.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        }
        container.innerHTML = '<div class="nw-wrap">' +
            '<div class="nw-head">' +
            '<div class="nw-logo">N</div>' +
            '<div class="nw-headtxt"><div class="nw-title">News Aggregator</div><div class="nw-sub">Berita terkini • Internasional + Lokal (Detik, Kompas, CNBC, dll)</div></div>' +
            '<span class="nw-apistatus" style="color:' + (this.apiKey ? '#00FFA3' : '#FF8888') + '">' + (this.apiKey ? '● API Ready' : '● API Opsional') + '</span>' +
            '<button id="editGnewsKeyBtn" class="nw-btn">GNews API</button>' +
            '</div>' +
            '<div class="nw-cats">' +
            '<button id="newsTechBtn" class="nw-cat">Teknologi</button>' +
            '<button id="newsBizBtn" class="nw-cat">Bisnis</button>' +
            '<button id="newsCryptoBtn" class="nw-cat">₿ Crypto</button>' +
            '<button id="newsIndoBtn" class="nw-cat">🇮 Indonesia (LOKAL)</button>' +
            '<button id="newsStartupBtn" class="nw-cat">Startup</button>' +
            '</div>' +
            '<div id="newsResultsContainer" style="min-height:200px;">' +
            '<div class="nw-empty">Pilih kategori untuk melihat berita terbaru<div class="nw-sub">Sumber: Detik, Kompas, CNBC, Liputan6, Tempo, DailySocial + Internasional</div></div>' +
            '</div>' +
            '<div class="nw-footline">Data dari GNews API + RSS Lokal</div>' +
            '<button onclick="window.showPage(\'dashboard\')" class="nw-btn nw-back">← Kembali ke Dasbor</button>' +
            '</div>';
        this.attachEvents();
        this.updateActiveButton(this.currentCategory);
    }

    attachEvents() {
        const wire = function(id, cat) {
            const b = document.getElementById(id);
            if (b) b.addEventListener('click', function() { this.fetchNews(cat); }.bind(this));
        }.bind(this);
        wire('newsTechBtn', 'technology');
        wire('newsBizBtn', 'business');
        wire('newsCryptoBtn', 'crypto');
        wire('newsIndoBtn', 'indonesia');
        wire('newsStartupBtn', 'startup');

        const keyBtn = document.getElementById('editGnewsKeyBtn');
        if (keyBtn) {
            keyBtn.addEventListener('click', function() {
                const newKey = prompt('Masukkan GNews API Key (gratis di gnews.io):', this.apiKey);
                if (newKey && newKey.length > 10) {
                    this.saveApiKey(newKey);
                    this.fetchNews(this.currentCategory);
                }
            }.bind(this));
        }

        const container = document.getElementById('newsAggregatorPanel');
        if (container) {
            container.addEventListener('click', function(e) {
                const card = e.target.closest('.nw-card');
                if (card && card.dataset.url) {
                    window.open(card.dataset.url, '_blank');
                }
            });
        }
    }
}

const newsAggregatorInstance = new NewsAggregator();
export { newsAggregatorInstance as NewsAggregator };

KESEMPATAN.NewsAggregator = newsAggregatorInstance;
window.NewsAggregator = newsAggregatorInstance;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { window.NewsAggregator.render(); });
} else {
    setTimeout(function() { window.NewsAggregator.render(); }, 100);
}