const app = {
    accountsData: [],
    currentAccount: null,
    clustersData: [],
    sparklines: {},
    inflowChart: null,
    
    init() {
        Chart.defaults.font.family = "'Segoe UI', Tahoma, sans-serif";
        Chart.defaults.color = "#888";
    },

    async bootPortal() {
        const splash = document.getElementById('splash-screen');
        const ui = document.getElementById('ui-layer');

        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 800);

        this.initThreeJS();
        
        try {
            const res = await fetch('/api/accounts');
            this.accountsData = await res.json();
            
            if(this.accountsData.length > 0) {
                this.renderSidebar();
                await this.loadAccount(this.accountsData[0].id);
                
                ui.classList.remove('hidden');
                setTimeout(() => { ui.style.opacity = '1'; }, 100);
            }
        } catch (error) {
            console.error('Initialization failed:', error);
            alert("Backend Connection Failed. Check if Go server is running.");
        }
    },

    renderSidebar() {
        const nav = document.getElementById('accounts-nav');
        nav.innerHTML = '';
        this.accountsData.forEach(acc => {
            const item = document.createElement('div');
            item.className = 'nav-item';
            item.id = `nav-${acc.id}`;
            item.innerText = acc.name;
            item.onclick = () => this.loadAccount(acc.id);
            nav.appendChild(item);
        });
    },

    async loadAccount(accountId) {
        try {
            this.currentAccount = this.accountsData.find(a => a.id === accountId);
            if (!this.currentAccount) return;
            const acc = this.currentAccount;
            
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            const activeEl = document.getElementById(`nav-${acc.id}`);
            if(activeEl) activeEl.classList.add('active');

            document.getElementById('dash-title').innerText = acc.name;
            document.getElementById('dash-eligible').innerText = acc.eligibleClusters;
            document.getElementById('dash-sub').innerText = acc.subStatus;
            document.getElementById('team-tam').innerText = acc.team.tam;

            document.getElementById('team-apac').innerText = acc.team.apac;
            document.getElementById('team-ist').innerText = acc.team.ist;
            document.getElementById('team-emea').innerText = acc.team.emea;
            document.getElementById('team-est').innerText = acc.team.est;

            document.getElementById('metric-high').innerText = acc.support.highSevCount.toString().padStart(2, '0');
            document.getElementById('metric-esc').innerText = acc.support.escalations.toString().padStart(2, '0');
            document.getElementById('metric-await').innerText = acc.support.awaitingCustomer.toString().padStart(2, '0');
            document.getElementById('metric-eng').innerText = acc.support.waitingOnEng.toString().padStart(2, '0');

            this.drawSparkline('spark-high', [2, 1, 3, 2, acc.support.highSevCount], '#E50914');
            this.drawSparkline('spark-esc', [0, 1, 0, 1, acc.support.escalations], '#ffaa00');
            this.drawSparkline('spark-await', [3, 4, 2, 5, acc.support.awaitingCustomer], '#4a90e2');
            this.drawSparkline('spark-eng', [1, 2, 1, 4, acc.support.waitingOnEng], '#aaaaaa');

            const caseList = document.getElementById('case-list');
            if (acc.support.activeCases.length === 0) {
                caseList.innerHTML = `<tr><td colspan="4">No active cases.</td></tr>`;
            } else {
                caseList.innerHTML = acc.support.activeCases.map(c => `
                    <tr>
                        <td>${c.caseId}</td>
                        <td>${c.subject}</td>
                        <td class="sev-${c.severity.toLowerCase()}">${c.severity}</td>
                        <td>${c.status}</td>
                    </tr>
                `).join('');
            }

            const res = await fetch(`/api/clusters?accountID=${acc.id}`);
            this.clustersData = await res.json();

            this.renderClusterTable('cluster-preview-list', this.clustersData.slice(0, 5));
            this.showDashboard();
            
        } catch (error) {
            console.error('Failed to load account details:', error);
        }
    },

    drawSparkline(canvasId, dataPoints, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (this.sparklines[canvasId]) {
            this.sparklines[canvasId].destroy();
        }

        this.sparklines[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5'],
                datasets: [{
                    data: dataPoints,
                    borderColor: color,
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false, min: 0 }
                },
                layout: { padding: 2 }
            }
        });
    },

    renderClusterTable(targetId, clusters) {
        const tbody = document.getElementById(targetId);
        if(!tbody) return;
        
        tbody.innerHTML = clusters.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.version}</td>
                <td>${c.infra}</td>
                ${targetId === 'cluster-full-list' ? `<td class="text-green">${c.subStatus}</td>` : ''}
                <td><button class="btn-outline btn-small" onclick="app.loadClusterDetails('${c.id}')">View</button></td>
            </tr>
        `).join('');
    },

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
            v.classList.add('hidden');
        });
        
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden');
            setTimeout(() => target.classList.add('active'), 20);
        }
    },

    showDashboard() {
        this.switchView('view-dashboard');
    },

    showClusterList() {
        this.renderClusterTable('cluster-full-list', this.clustersData);
        this.switchView('view-cluster-list');
    },

    loadClusterDetails(clusterId) {
        const cluster = this.clustersData.find(c => c.id === clusterId);
        if (!cluster) return;

        document.getElementById('det-cluster-name').innerText = cluster.name;
        document.getElementById('det-cluster-sub').innerText = cluster.subStatus;
        document.getElementById('det-cluster-ver').innerText = cluster.version;
        document.getElementById('det-cluster-infra').innerText = cluster.infra;

        const setCheck = (id, isValid) => {
            const el = document.getElementById(id);
            if(el) el.className = `check-icon ${isValid ? 'pass' : 'fail'}`;
        };
        setCheck('chk-etcd', cluster.health.etcdBackup);
        setCheck('chk-sys', cluster.health.systemdReserve);
        setCheck('chk-ntp', cluster.health.ntpSync);
        setCheck('chk-kdump', cluster.health.kdumpCheck);

        const nodeList = document.getElementById('det-node-list');
        if(nodeList) {
            nodeList.innerHTML = cluster.nodes.map(n => `
                <tr>
                    <td>${n.name}</td>
                    <td><span class="role-badge role-${n.role.toLowerCase()}">${n.role}</span></td>
                    <td class="text-green">Ready</td>
                </tr>
            `).join('');
        }

        const caseList = document.getElementById('det-cluster-cases');
        if(caseList) {
            if (cluster.cases && cluster.cases.length > 0) {
                caseList.innerHTML = cluster.cases.map(c => `
                    <tr>
                        <td>${c.caseId}</td>
                        <td>${c.subject}</td>
                        <td class="sev-${c.severity.toLowerCase()}">${c.severity}</td>
                        <td>${c.status}</td>
                    </tr>
                `).join('');
            } else {
                caseList.innerHTML = `<tr><td colspan="4" style="text-align:center;">No specific cases actively logged for this cluster.</td></tr>`;
            }
        }

        this.drawClusterInflowChart(cluster.inflowData);
        this.switchView('view-cluster-details');
    },

    drawClusterInflowChart(dataPoints) {
        const ctx = document.getElementById('cluster-inflow-chart').getContext('2d');
        if (this.inflowChart) {
            this.inflowChart.destroy();
        }

        this.inflowChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [{
                    label: 'Cases Raised',
                    data: dataPoints,
                    borderColor: '#E50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#E50914',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(255,255,255,0.05)' } 
                    },
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    },

    initThreeJS() {
        const container = document.getElementById('canvas-container');
        if(!container) return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const objects = [];
        const geometry = new THREE.IcosahedronGeometry(2, 0);
        const matRed = new THREE.MeshBasicMaterial({ color: 0xE50914, wireframe: true, transparent: true, opacity: 0.3 });
        const matWhite = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, transparent: true, opacity: 0.1 });

        for (let i = 0; i < 40; i++) {
            const mesh = new THREE.Mesh(geometry, i % 3 === 0 ? matRed : matWhite);
            mesh.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 40 - 10);
            mesh.userData = { rx: (Math.random() - 0.5) * 0.02, ry: (Math.random() - 0.5) * 0.02, yDir: (Math.random() - 0.5) * 0.05 };
            scene.add(mesh);
            objects.push(mesh);
        }

        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
            mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const animate = function () {
            requestAnimationFrame(animate);
            objects.forEach(obj => {
                obj.rotation.x += obj.userData.rx; 
                obj.rotation.y += obj.userData.ry; 
                obj.position.y += obj.userData.yDir;
                
                if (obj.position.y > 40) obj.position.y = -40; 
                if (obj.position.y < -40) obj.position.y = 40;
            });

            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };
        animate();
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
