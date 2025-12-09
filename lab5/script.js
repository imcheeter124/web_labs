
document.addEventListener("DOMContentLoaded", () => {
    
    // ЗАВДАННЯ 1: Поміняйте місцями контент блоків «3» та «6». 
    const block3 = document.querySelector('.block3');
    const block6 = document.querySelector('.block6');

    if (block3 && block6) {
        const tempContent = block3.innerHTML;
        block3.innerHTML = block6.innerHTML;
        block6.innerHTML = tempContent;
    }

    // ЗАВДАННЯ 2: Функція площі паралелограма (base * height). 
    // Вивід в кінці контенту блоку «5».
    const block5 = document.querySelector('.block5');
    
    function calculateParallelogramArea(base, height) {
        return base * height;
    }

    const pBase = 15;
    const pHeight = 10;
    const area = calculateParallelogramArea(pBase, pHeight);
    
    const areaResult = document.createElement('div');
    areaResult.style.marginTop = "15px";
    areaResult.style.color = "#4ade80";
    areaResult.innerHTML = `<strong>Завдання 2:</strong> Площа паралелограма (b=${pBase}, h=${pHeight}) = ${area}`;
    block5.appendChild(areaResult);

    // ЗАВДАННЯ 3: Максимальна цифра числа (Cookies). [cite: 128-131]
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i=0;i < ca.length;i++) {
            let c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function eraseCookie(name) {   
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    const cookieName = "maxDigitResult";
    const savedResult = getCookie(cookieName);

    if (savedResult) {
        // а) При оновленні, якщо є кукі -> вивести інфо + питання про видалення
        const userDelete = confirm(`Інформація з Cookies: ${savedResult}\nНатисніть ОК, щоб видалити дані з Cookies.`);
        
        if (userDelete) {
            // б) Видалення кукі і перезавантаження
            eraseCookie(cookieName);
            alert("Cookies видалено. Сторінка буде перезавантажена.");
            location.reload();
        } else {
            // в) Відмова -> повідомлення про необхідність перезавантаження (форма не показується)
            alert("Cookies залишились. Для появи форми необхідно видалити Cookies (перезавантажте сторінку ще раз).");
        }
    } else {
        // Якщо кукі немає -> показати форму
        const formDiv = document.createElement('div');
        formDiv.className = 'js-form';
        formDiv.innerHTML = `
            <p><strong>Завдання 3:</strong> Введіть натуральне число:</p>
            <input type="number" id="numInput" placeholder="Наприклад: 385">
            <button id="btnMaxDigit">Знайти макс. цифру</button>
        `;
        block5.appendChild(formDiv);

        document.getElementById('btnMaxDigit').addEventListener('click', () => {
            const val = document.getElementById('numInput').value;
            if(!val || val < 0) {
                alert("Будь ласка, введіть коректне натуральне число.");
                return;
            }
            
            // Знаходимо максимальну цифру
            const digits = val.toString().split('').map(Number);
            const maxDigit = Math.max(...digits);
            
            const msg = `Максимальна цифра числа ${val} це ${maxDigit}`;
            alert(msg);
            setCookie(cookieName, msg, 1); // Зберігаємо на 1 день
            location.reload();
        });
    }

    // ЗАВДАННЯ 4: mouseout + вирівнювання по правому краю + LocalStorage. [cite: 132-133]
    // Блоки 2, 4, 5.
    const alignBlocks = ['.block2', '.block4', '.block5'];
    
    // Відновлення стану при завантаженні
    alignBlocks.forEach(selector => {
        const el = document.querySelector(selector);
        const storedAlign = localStorage.getItem('align_' + selector);
        if (el && storedAlign) {
            el.style.textAlign = storedAlign;
        }
    });

    alignBlocks.forEach(selector => {
        const el = document.querySelector(selector);
        if(!el) return;

        el.addEventListener('mouseout', () => {
            const radio = document.querySelector('input[name="alignOption"]:checked');
            if (radio && radio.value === 'right') {
                el.style.textAlign = 'right';
                localStorage.setItem('align_' + selector, 'right');
            } else {
                el.style.textAlign = 'left'; 
                localStorage.setItem('align_' + selector, 'left');
            }
        });
    });

    // ЗАВДАННЯ 5: Створення нумерованого списку при події select. [cite: 134-139]
    
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('list_data_')) {
            localStorage.removeItem(key);
        }
    });

    // Обробка виділення тексту
    document.addEventListener('mouseup', () => {
        const selection = window.getSelection();
        if (selection.toString().length === 0) return;

        let targetBlock = selection.anchorNode.parentElement.closest('[class*="block"]');
        if (!targetBlock) return;

        const isValidBlock = ['block1','block2','block3','block4','block5','block6','block7']
                             .some(c => targetBlock.classList.contains(c));
        
        if (!isValidBlock) return;
        
        // Перевіряємо чи вже є форма, щоб не дублювати
        if (targetBlock.querySelector('.list-creator-form')) return;

        const formHTML = `
            <div class="list-creator-form js-form">
                <h4>Створити список</h4>
                <input type="text" class="list-input" placeholder="Пункт списку">
                <button type="button" class="add-item-btn">Додати пункт</button>
                <ol class="preview-list" style="margin:10px 0; padding-left:20px;"></ol>
                <button type="button" class="save-list-btn">Зберегти список</button>
                <button type="button" class="cancel-btn">Скасувати</button>
            </div>
        `;
        targetBlock.insertAdjacentHTML('beforeend', formHTML);
        
        const form = targetBlock.querySelector('.list-creator-form');
        const input = form.querySelector('.list-input');
        const addBtn = form.querySelector('.add-item-btn');
        const saveBtn = form.querySelector('.save-list-btn');
        const cancelBtn = form.querySelector('.cancel-btn');
        const previewOl = form.querySelector('.preview-list');

        let currentItems = [];

        addBtn.addEventListener('click', () => {
            if(input.value) {
                currentItems.push(input.value);
                const li = document.createElement('li');
                li.textContent = input.value;
                previewOl.appendChild(li);
                input.value = '';
                input.focus();
            }
        });

        saveBtn.addEventListener('click', () => {
            if (currentItems.length > 0) {
                // Збереження
                const blockClass = Array.from(targetBlock.classList).find(c => c.startsWith('block'));
                localStorage.setItem('list_data_' + blockClass, JSON.stringify(currentItems));
                
                const finalOl = document.createElement('ol');
                currentItems.forEach(text => {
                    const li = document.createElement('li');
                    li.textContent = text;
                    finalOl.appendChild(li);
                });
                targetBlock.appendChild(finalOl);
            }
            form.remove(); 
        });

        cancelBtn.addEventListener('click', () => {
            form.remove();
        });
    });
});