

document.addEventListener('DOMContentLoaded', () => {
    const btnPlay = document.getElementById('btn-play');
    const block5 = document.getElementById('block-5-container');
    const originalContent = document.getElementById('original-content');

    let intervalId = null;
    let eventCounter = 0;
    let localStorageData = [];

    let objX, objY; 
    let stepSize = 1; 
    let direction = 0; 
    let quadrantsVisited = new Set();
    

    let animWidth, animHeight;
    const objRadius = 10;

    btnPlay.addEventListener('click', initWorkArea);

function initWorkArea() {
        const oldResults = document.getElementById('lab7-results');
        if (oldResults) {
            oldResults.remove();
        }

        fetch('clear-logs.php');
        localStorage.removeItem('animEvents');
        localStorageData = [];
        eventCounter = 0;

        originalContent.style.display = 'none';
        

        let existingLayer = document.getElementById('work-layer');
        if(existingLayer) existingLayer.remove();

        const workHTML = `
            <div class="work-layer" id="work-layer">
                <div class="controls-area">
                    <div class="controls-left" id="msg-box">Ready...</div>
                    <div class="controls-right">
                        <button id="btn-start" class="action-btn">Start</button>
                        <button id="btn-stop" class="action-btn" style="display:none;">Stop</button>
                        <button id="btn-reload" class="action-btn" style="display:none;">Reload</button>
                        <button id="btn-close" class="action-btn" style="margin-left:10px; background:#475569;">Close</button>
                    </div>
                </div>
                <div class="anim-area" id="anim-area">
                    <div class="anim-object" id="anim-obj"></div>
                    <div style="position:absolute; top:50%; left:0; width:100%; height:1px; background:rgba(255,255,255,0.3);"></div>
                    <div style="position:absolute; top:0; left:50%; width:1px; height:100%; background:rgba(255,255,255,0.3);"></div>
                </div>
            </div>
        `;
        
        block5.insertAdjacentHTML('beforeend', workHTML);

        document.getElementById('btn-start').onclick = startAnimation;
        document.getElementById('btn-close').onclick = closeWorkArea;
        document.getElementById('btn-stop').onclick = stopAnimation;
        document.getElementById('btn-reload').onclick = reloadAnimation;

        resetObject();
    }

    function resetObject() {
        const animArea = document.getElementById('anim-area');
        const obj = document.getElementById('anim-obj');
        
        animWidth = animArea.clientWidth;
        animHeight = animArea.clientHeight;
        
        objX = animWidth / 2;
        objY = animHeight / 2;
        
        stepSize = 1;
        direction = 0; // Починаємо вліво
        quadrantsVisited.clear();
        
        updateObjVisual(obj);
    }

    function updateObjVisual(obj) {
        obj.style.left = objX + 'px';
        obj.style.top = objY + 'px';
    }

    function startAnimation() {
        const btnStart = document.getElementById('btn-start');
        btnStart.disabled = true; // "втрачає можливість натискання" [cite: 162]
        
        logEvent("Start pressed");

        intervalId = setInterval(animationStep, 50); // 20 FPS (High load simulation)
    }

    function animationStep() {
        const obj = document.getElementById('anim-obj');
        
        switch(direction) {
            case 0: objX -= stepSize; break;
            case 1: objY -= stepSize; break;
            case 2: objX += stepSize; break;
            case 3: objY += stepSize; break;
        }


        stepSize += 1; // +1px на кожен крок 

        direction++;
        if (direction > 3) direction = 0;

        if (objX < objRadius) objX = objRadius;
        if (objX > animWidth - objRadius) objX = animWidth - objRadius;
        if (objY < objRadius) objY = objRadius;
        if (objY > animHeight - objRadius) objY = animHeight - objRadius;

        updateObjVisual(obj);

        checkQuadrants();

        logEvent(`Step: ${stepSize}px, Pos: ${Math.round(objX)}x${Math.round(objY)}`);
    }

    function checkQuadrants() {
        let q = -1;
        const centerX = animWidth / 2;
        const centerY = animHeight / 2;

        if (objX < centerX && objY < centerY) q = 0;
        else if (objX >= centerX && objY < centerY) q = 1;
        else if (objX < centerX && objY >= centerY) q = 2;
        else if (objX >= centerX && objY >= centerY) q = 3;

        if (q !== -1) {
            if (!quadrantsVisited.has(q)) {
                quadrantsVisited.add(q);
                logEvent(`Entered Quadrant ${q+1}`);
            }
        }

        if (quadrantsVisited.size === 4) {
            stopAnimation("All quadrants visited");
        }
    }

    function stopAnimation(reason = "Stopped") {
        clearInterval(intervalId);
        intervalId = null;
        logEvent(`Animation Stop: ${reason}`);

        document.getElementById('btn-start').style.display = 'none';
        document.getElementById('btn-reload').style.display = 'inline-block';
    }

    function reloadAnimation() {
        resetObject();
        document.getElementById('btn-reload').style.display = 'none';
        document.getElementById('btn-start').style.display = 'inline-block';
        document.getElementById('btn-start').disabled = false;
        logEvent("Reloaded");
    }


    function logEvent(msg) {
        eventCounter++;
        const now = Date.now();

        const eventData = {
            id: eventCounter,
            event: msg,
            client_time: now
        };


        document.getElementById('msg-box').innerText = `#${eventCounter} ${msg}`;

        fetch('server-immediate.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(eventData)
        }).catch(err => console.error(err));

        localStorageData.push(eventData);
        localStorage.setItem('animEvents', JSON.stringify(localStorageData));
    }

    function closeWorkArea() {
        if(intervalId) clearInterval(intervalId);
        
        const batchData = localStorage.getItem('animEvents');
        if (batchData) {
            fetch('server-batch.php', {
                method: 'POST',
                body: batchData
            }).then(() => {
                showResultsTable();
            });
        } else {
            showResultsTable();
        }

        document.getElementById('work-layer').remove();
        originalContent.style.display = 'block';
    }

function showResultsTable() {
        const container = document.getElementById('block-5-container');
        
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'lab7-results'; // <--- ВАЖЛИВО: Цей ID ми шукаємо при старті
        resultsDiv.innerHTML = `
            <h3 style="margin-top:20px; color:#e11d48;">Звіт подій (Порівняння)</h3>
            <div style="max-height:300px; overflow-y:scroll; border:1px solid #333;">
                <table class="result-table" id="comparison-table">
                    <tr><th>#</th><th>Подія</th><th>Client Time</th><th>Server Time (Method 1)</th><th>Diff (ms)</th></tr>
                    <tr><td colspan="5">Завантаження даних...</td></tr>
                </table>
            </div>`;
        
        container.appendChild(resultsDiv);

        fetch('log_immediate.json?nocache=' + Math.random())
            .then(r => r.json())
            .then(serverLogs => {
                const table = document.getElementById('comparison-table');
                if(!table) return; // Якщо користувач вже встиг натиснути Play знову

                let html = '<tr><th>#</th><th>Подія</th><th>Client Time</th><th>Server Time</th><th>Diff (ms)</th></tr>';
                
                serverLogs.forEach(row => {
                    const serverMs = row.server_time * 1000;
                    const diff = Math.round(Math.abs(serverMs - row.client_time));
                    const lagClass = diff > 500 ? 'diff-high' : '';

                    const clientDate = new Date(row.client_time);
                    const serverDate = new Date(serverMs);
                    const timeStrClient = clientDate.toLocaleTimeString() + `.${clientDate.getMilliseconds()}`;
                    const timeStrServer = serverDate.toLocaleTimeString() + `.${serverDate.getMilliseconds()}`;

                    html += `
                        <tr>
                            <td>${row.id}</td>
                            <td>${row.event}</td>
                            <td>${timeStrClient}</td>
                            <td>${timeStrServer}</td>
                            <td class="${lagClass}">${diff}</td>
                        </tr>
                    `;
                });
                table.innerHTML = html;
            })
            .catch(err => {
                const table = document.getElementById('comparison-table');
                if(table) table.innerHTML = '<tr><td colspan="5">Помилка завантаження логів.</td></tr>';
            });
    }
});