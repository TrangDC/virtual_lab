// lamp.js - Separated DOM Version

class AlcoholLamp {
    constructor(container) {
        this.container = container;
        
        // Tạo 2 phần tử riêng biệt (Thân và Nắp)
        this.elements = this.createSeparatedElements();
        this.bodyEl = this.elements.body;
        this.capEl = this.elements.cap;

        // Thêm vào DOM
        this.container.appendChild(this.bodyEl);
        this.container.appendChild(this.capEl);

        // Random vị trí
        const x = Math.random() * (window.innerWidth - 500) + 200;
        const y = Math.random() * (window.innerHeight - 700) + 200;
        
        // Đặt vị trí ban đầu cho cả 2 trùng nhau
        this.setPosition(this.bodyEl, x, y);
        this.setPosition(this.capEl, x, y);

        // Cache elements từ trong các div tương ứng
        this.lampGroup = this.bodyEl.querySelector('#group-lamp');
        this.capGroup = this.capEl.querySelector('#group-cap');
        this.wick = this.bodyEl.querySelector('#wick-trigger');
        this.flamePhysics = this.bodyEl.querySelector('#flame-physics');

        this.bodyEl.lampRef = this; // Gắn chính instance này vào DOM element để tương tác
        this.capEl.lampRef = this; // <--- THÊM DÒNG NÀY ĐỂ KHI HOVER VÀO NẮP CŨNG BIẾT LÀ CỦA ĐÈN NÀO

        // Init trạng thái
        this.isCapped = true;
        this.isLit = false;
        this.SNAP_DISTANCE = 60;

        // Biến vật lý
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastLampX = parseFloat(this.bodyEl.style.left) || 0;
        
        this.flameState = { angle: 0, scaleX: 1, scaleY: 1 };

        this.initEvents();
        this.startPhysicsLoop();
    }

    setPosition(el, x, y) {
        el.style.left = x + 'px';
        el.style.top = y + 'px';
    }

    getPos(el) {
        return {
            x: parseFloat(el.style.left) || 0,
            y: parseFloat(el.style.top) || 0
        };
    }

    createSeparatedElements() {
        // SVG Defs dùng chung (ID đã fix namespace lamp-)
        const defs = `
        <defs>
            <radialGradient id="lamp-grad-body-base" cx="204.88" cy="286.48" r="26.53" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".95" stop-color="#fff" stop-opacity=".1"/></radialGradient>
            <radialGradient xlink:href="#lamp-grad-body-base" id="lamp-grad-body-glass" cx="204.49" cy="243.65" r="72.65" gradientTransform="matrix(1 0 0 .49 0 124.43)"/>
            <radialGradient id="lamp-grad-liq-container" cx="204.53" cy="226.3" r="55.77" gradientTransform="matrix(1 0 0 .49 0 115.58)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <linearGradient id="lamp-grad-liq-blue" x1="146.95" x2="262.81" y1="261.79" y2="261.79" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#27aae1" stop-opacity=".3"/><stop offset=".51" stop-color="#a8e7ff"/><stop offset="1" stop-color="#a8e7ff" stop-opacity=".3"/></linearGradient>
            <linearGradient xlink:href="#lamp-grad-liq-blue" id="lamp-grad-liq-blue-2" x1="146.95" x2="262.81" y1="250.87" y2="250.87"/>
            <radialGradient id="lamp-grad-glass-shine" cx="205.09" cy="1696.19" r="44.26" gradientTransform="matrix(1 0 0 .54 0 -662.55)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".56" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <radialGradient id="lamp-grad-glass-rim" cx="204.88" cy="903.49" r="17.18" gradientTransform="matrix(1 0 0 .72 0 -416.37)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".95" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <radialGradient id="lamp-fire-blue" cx="205.09" cy="-254.72" r="11.86" gradientTransform="matrix(1 0 0 1.23 0 484.69)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0029e9" stop-opacity=".79"/><stop offset="0" stop-color="#0029e9" stop-opacity=".8"/><stop offset=".12" stop-color="#0029e9" stop-opacity=".79"/><stop offset=".38" stop-color="#0029e9" stop-opacity=".6"/><stop offset=".75" stop-color="#0050ff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <radialGradient id="lamp-fire-orange" cx="205.09" cy="-261.82" r="8.9" gradientTransform="matrix(1 0 0 1.23 0 483.18)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0029e9" stop-opacity=".79"/><stop offset="0" stop-color="#f15a29" stop-opacity=".8"/><stop offset=".05" stop-color="#f15a29" stop-opacity=".8"/><stop offset=".28" stop-color="#f15a29" stop-opacity=".79"/><stop offset=".55" stop-color="#f15a29" stop-opacity=".6"/><stop offset=".85" stop-color="#ff815b" stop-opacity=".3"/><stop offset="1" stop-color="#ffbca8" stop-opacity=".02"/></radialGradient>
            <radialGradient id="lamp-fire-yellow" cx="203.88" cy="-271.43" r="6.41" gradientTransform="matrix(1 0 0 1.23 0 481.14)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0029e9" stop-opacity=".79"/><stop offset="0" stop-color="#dc9d46"/><stop offset=".2" stop-color="#d99b47" stop-opacity=".8"/><stop offset=".41" stop-color="#e3ab52" stop-opacity=".7"/><stop offset=".67" stop-color="#d6963e" stop-opacity=".3"/><stop offset="1" stop-color="#d8983f" stop-opacity="0"/></radialGradient>
            <radialGradient id="lamp-fire-glow" cx="205.09" cy="168.53" r="16.02" fx="189.876" gradientTransform="rotate(-88.99 251.45 122.967)scale(1 .46)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".19" stop-color="#fff" stop-opacity=".6"/><stop offset=".37" stop-color="#fff" stop-opacity=".2"/><stop offset=".67" stop-color="#fff" stop-opacity=".4"/><stop offset=".78" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <linearGradient id="lamp-wick-grad" x1="189.24" x2="220.52" y1="206.59" y2="206.59" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>
            <linearGradient id="lamp-wick-dark" x1="189.74" x2="195.15" y1="206.59" y2="206.59" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".39" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>
            <linearGradient xlink:href="#lamp-wick-grad" id="lamp-wick-grad-2" x1="186.82" x2="226.47" y1="236.62" y2="236.62"/>
            <linearGradient xlink:href="#lamp-wick-grad" id="lamp-wick-grad-3" x1="204.17" x2="207.81" y1="185.94" y2="185.94"/>
            <linearGradient id="lamp-ceramic-grad" x1="196.01" x2="213.75" y1="190.69" y2="190.69" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".23" stop-color="#fff" stop-opacity=".4"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset=".78" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>
            <linearGradient xlink:href="#lamp-ceramic-grad" id="lamp-ceramic-grad-2" x1="196.32" x2="213.44" y1="196.52" y2="196.52"/>
            <radialGradient id="lamp-cap-top" cx="215.3" cy="209.57" r="7.82" gradientTransform="rotate(88.88 128.494 124.442)scale(1 .19)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <style>.lamp-cls-5{fill:none;stroke:#fff;opacity:.33;stroke-miterlimit:10}</style>
        </defs>`;

        // Group Thân đèn
        const bodyGroup = `
        <g id="group-lamp">
            <path d="M204.88 287.56c-16.56 0-30.52-4.24-35-10a6.44 6.44 0 0 0-1.47 3.93c0 7.72 16.31 14 36.43 14s36.43-6.25 36.43-14a6.4 6.4 0 0 0-1.48-3.93c-4.39 5.76-18.36 10-34.91 10" style="fill:url(#lamp-grad-body-base)"/>
            <path d="M270 241.61c0-17-29.17-30.81-65.15-30.81s-65.15 13.79-65.15 30.81c0 8.06 6.56 15.4 17.29 20.9 6.46 3.83 11.15 10.87 13.12 14.21 2.24 6.85 16.94 12.15 34.74 12.15 16.16 0 29.75-4.36 33.81-10.29a8 8 0 0 0 .76-1.38c1.8-3.16 6.8-11 13.83-15 10.44-5.44 16.75-12.67 16.75-20.59" style="fill:url(#lamp-grad-body-glass)"/>
            <path d="M205.63 217.45c28.82 0 52.71 10 57.17 23v-.11c0-15.13-25.94-27.4-57.93-27.4S147 225.19 147 240.32a13.5 13.5 0 0 0 .76 4.4c.08-15.07 25.96-27.27 57.87-27.27" style="fill:url(#lamp-grad-liq-container)"/>
            <path d="M270 241.61c0-17-29.17-30.81-65.15-30.81s-65.15 13.79-65.15 30.81c0 8.06 6.56 15.4 17.29 20.9 6.46 3.83 11.15 10.87 13.12 14.21 2.24 6.85 16.94 12.15 34.74 12.15 16.16 0 29.75-4.36 33.81-10.29a8 8 0 0 0 .76-1.38c1.8-3.16 6.8-11 13.83-15 10.44-5.44 16.75-12.67 16.75-20.59Z" class="lamp-cls-5"/>
            <path d="M204.88 287.56c-16.56 0-30.52-4.24-35-10a6.44 6.44 0 0 0-1.47 3.93c0 7.72 16.31 14 36.43 14s36.43-6.25 36.43-14a6.4 6.4 0 0 0-1.48-3.93c-4.39 5.76-18.36 10-34.91 10Z" class="lamp-cls-5"/>
            <path d="M262.81 250.87c0-6.93-25.94-12.55-57.93-12.55S147 243.94 147 250.87a3.4 3.4 0 0 0 .84 2.13c1.83 2.75 8.87 7.94 12.67 9.75 5.93 3.27 10.24 9.28 12 12.14 2.07 5.84 15.55 10.36 31.9 10.36 14.83 0 27.31-3.72 31-8.78a6.4 6.4 0 0 0 .69-1.17c1.66-2.7 6.24-9.41 12.7-12.78a49.2 49.2 0 0 0 12.49-8.79 4 4 0 0 0 1.52-2.86" style="opacity:.1;fill:url(#lamp-grad-liq-blue)"/>
            <ellipse cx="204.88" cy="250.87" rx="57.93" ry="12.55" style="opacity:.1;fill:url(#lamp-grad-liq-blue-2)"/>
            <path d="M205.09 261.44c-32.34 0-58.84-5.12-61.17-11.61a2.8 2.8 0 0 0-.17.93c0 6.93 27.46 12.54 61.34 12.54s61.34-5.61 61.34-12.54a2.8 2.8 0 0 0-.17-.93c-2.34 6.49-28.83 11.61-61.17 11.61" style="fill:url(#lamp-grad-glass-shine)"/>
            <path d="M224.85 227.08c-.15 3.54-9 6.39-20 6.39s-19.83-2.85-20-6.39c-2.12 1-3.33 2.12-3.33 3.34 0 3.58 10.43 6.48 23.31 6.48s23.31-2.9 23.31-6.48c.05-1.22-1.14-2.36-3.29-3.34" style="fill:url(#lamp-grad-glass-rim)"/>
            <path d="m220.52 221-.16-.22a8.26 8.26 0 0 1-1.59-4.89v-22.51a4.34 4.34 0 0 0-4.34-4.34H195.1a4.33 4.33 0 0 0-4.33 4.34v22.82a8.25 8.25 0 0 1-1.53 4.8h.2-.2c0 1.72 7 3.11 15.64 3.11s15.64-1.39 15.64-3.11h-.2Z" style="fill:url(#lamp-wick-grad)"/>
            <path d="M192.28 221h.2za8.25 8.25 0 0 0 1.53-4.8v-22.82a4.34 4.34 0 0 1 4.34-4.34h-2.55a4.33 4.33 0 0 0-4.33 4.34v22.82a8.33 8.33 0 0 1-1.53 4.8h.2-.2c0 1.72 7 3.11 15.64 3.11h1.27c-8.04-.11-14.37-1.45-14.37-3.11" style="fill:url(#lamp-wick-dark)"/>
            <path d="m220.52 221-.16-.22a8.26 8.26 0 0 1-1.59-4.89v-22.51a4.34 4.34 0 0 0-4.34-4.34H195.1a4.33 4.33 0 0 0-4.33 4.34v22.82a8.25 8.25 0 0 1-1.53 4.8h.2-.2c0 1.72 7 3.11 15.64 3.11s15.64-1.39 15.64-3.11h-.2Z" style="fill:none;stroke:#fff;opacity:.33;stroke-linecap:round;stroke-linejoin:round"/>
            <path d="M199.06 272.77a21.8 21.8 0 0 1-6.65-.92c-2.89-.94-4.82-2.54-5.59-4.63l2.31-1c.46 1.28 1.88 2.36 4 3 6.28 2.05 17.66.44 25.81-5.8 1.78-1.37 1.73-2 1.72-2s-.23-.37-.77-.67a39.1 39.1 0 0 1-11 5c-4.41 1.19-7.22 1.09-8.35-.3a3.9 3.9 0 0 1-.8-4.32c2-4.13 11.85-4.69 16.71-4.07a17.3 17.3 0 0 1 3.2.69c2.15-1.65 3.54-3.38 3.9-5 2.88-12.9-7.87-18.67-13.65-21.77a22 22 0 0 1-3.09-1.83c-9-7.17-3.07-27.84-2.81-28.71l2.36.81c-.06.2-5.63 19.7 1.91 25.72a23 23 0 0 0 2.72 1.59c5.95 3.19 18.32 9.82 15 24.83a11.15 11.15 0 0 1-3.85 5.67 3.27 3.27 0 0 1 1 1.67c.55 2.4-1.9 4.28-2.71 4.9a36.46 36.46 0 0 1-21.37 7.14m13.59-13.23c-5.19 0-10 1.35-10.76 2.85 0 .11-.22.45.45 1.28.55.44 4 .41 9.55-1.74a38 38 0 0 0 4.56-2.13l-.34-.05a27 27 0 0 0-3.46-.21" style="fill:url(#lamp-wick-grad-2)"/>
            <path d="M207.11 189.64s.13-.32.7-7.4l-.79 1.41-1.02-1.41v2.12l-1.78-1.13.62 2-.62 4.43Z" style="fill:url(#lamp-wick-grad-3)"/>
            <rect width="17.74" height="2.1" x="196.01" y="189.64" rx=".94" style="fill:url(#lamp-ceramic-grad)"/>
            <path d="M212.7 191.69h-15.64a1 1 0 0 1-.74-.31v8.77a1.52 1.52 0 0 0 1.52 1.51h14.09a1.52 1.52 0 0 0 1.51-1.51v-8.77a1 1 0 0 1-.74.31" style="fill:url(#lamp-ceramic-grad-2)"/>
            
            <circle id="wick-trigger" cx="205" cy="188" r="12"/>

            <g id="flame-physics" style="transform-origin: 205px 190px;">
                <g id="flame-natural-motion">
                    <ellipse cx="205.09" cy="171.67" rx="12.8" ry="15.63" fill="url(#lamp-fire-blue)"/>
                    <ellipse cx="205.09" cy="161.45" rx="9.6" ry="11.73" fill="url(#lamp-fire-orange)"/>
                    <ellipse cx="203.88" cy="147.58" rx="6.92" ry="8.45" fill="url(#lamp-fire-yellow)"/>
                    <g id="flame-outer">
                        <ellipse cx="205.09" cy="168.53" rx="7.21" ry="17.29" fill="url(#lamp-fire-glow)"/>
                    </g>
                </g>
            </g>
        </g>`;

        // Group Nắp đèn
        const capGroup = `
        <g id="group-cap">
            <ellipse cx="204.88" cy="163.45" rx="13.36" ry="11.18" style="fill:url(#lamp-grad-glass-shine)"/>
            <path d="M222.93 170.33A18.05 18.05 0 0 0 204.85 152.27a18.05 18.05 0 0 0-18 18.06v46.76c.57 4.32 8.4 7.74 18 7.74 9.23 0 16.84-3.16 17.91-7.25h.14Z" style="fill:url(#lamp-wick-grad)"/>
            <path d="M195.76 217.09v-46.76a18.06 18.06 0 0 1 13.61-17.49 18 18 0 0 0-4.44-.57A18.05 18.05 0 0 0 186.85 170.33v46.76c.57 4.32 8.4 7.74 18 7.74a38 38 0 0 0 4.45-.26c-7.45-.86-13.06-3.85-13.54-7.48" style="fill:url(#lamp-wick-dark)"/>
            <path d="M222.93 170.33A18.05 18.05 0 0 0 204.85 152.27a18.05 18.05 0 0 0-18 18.06v46.76c.57 4.32 8.4 7.74 18 7.74 9.23 0 16.84-3.16 17.91-7.25h.14Z" style="fill:none;stroke:#fff;opacity:.33;stroke-miterlimit:10"/>
            <path d="M204.9 224.59c-9.75 0-17.73-3.52-18.48-8a4 4 0 0 0-.07.69c0 4.8 8.3 8.69 18.55 8.69s18.54-3.89 18.54-8.69a5 5 0 0 0-.06-.69c-.76 4.48-8.74 8-18.48 8" style="fill:url(#lamp-wick-grad-2)"/>
        </g>`;

        // Body Element
        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'lamp-part is-body alcohol-lamp-svg'; // Thêm class gốc để tương thích CSS
        bodyWrapper.innerHTML = `<svg viewBox="0 0 410 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${defs}${bodyGroup}</svg>`;

        // Cap Element
        const capWrapper = document.createElement('div');
        capWrapper.className = 'lamp-part is-cap alcohol-lamp-svg';
        capWrapper.innerHTML = `<svg viewBox="0 0 410 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${defs}${capGroup}</svg>`;

        return { body: bodyWrapper, cap: capWrapper };
    }

    initEvents() {
        let isDraggingLamp = false;
        let isDraggingCap = false;

        let startMouseX = 0, startMouseY = 0;
        let startLampLeft = 0, startLampTop = 0;
        let startCapLeft = 0, startCapTop = 0;
        
        let rafId = null;

        // Listener cho việc di chuyển chuột (cập nhật tọa độ cho Physics)
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // 1. Drag Thân Đèn
        this.lampGroup.addEventListener('mousedown', (e) => {
            if (isDraggingCap || e.target.id === 'wick-trigger') return;
            isDraggingLamp = true;
            
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            
            const bodyPos = this.getPos(this.bodyEl);
            startLampLeft = bodyPos.x;
            startLampTop = bodyPos.y;

            const capPos = this.getPos(this.capEl);
            startCapLeft = capPos.x;
            startCapTop = capPos.y;
            
            e.stopPropagation();
        });

        // 2. Drag Nắp Đèn
        this.capGroup.addEventListener('mousedown', (e) => {
            isDraggingCap = true;
            
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            
            const capPos = this.getPos(this.capEl);
            startCapLeft = capPos.x;
            startCapTop = capPos.y;
            
            e.stopPropagation();
        });

        // 3. Châm lửa
        this.wick.addEventListener('mousedown', (e) => {
            if (!this.isCapped && !this.isLit) {
                this.isLit = true;
                this.bodyEl.classList.add('lit');
                e.stopPropagation();
            }
        });

        // 4. Mouse Move
        window.addEventListener('mousemove', (e) => {
            if (!isDraggingLamp && !isDraggingCap) return;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const deltaX = e.clientX - startMouseX;
                const deltaY = e.clientY - startMouseY;

                if (isDraggingLamp) {
                    // Di chuyển thân đèn
                    this.bodyEl.style.left = (startLampLeft + deltaX) + 'px';
                    this.bodyEl.style.top = (startLampTop + deltaY) + 'px';

                    // Nếu nắp đang đóng, nắp di chuyển theo thân
                    if (this.isCapped) {
                        this.capEl.style.left = (startCapLeft + deltaX) + 'px';
                        this.capEl.style.top = (startCapTop + deltaY) + 'px';
                    }
                    // Nếu nắp mở, nắp ĐỨNG YÊN (vì là div riêng biệt)

                } else if (isDraggingCap) {
                    // Di chuyển nắp
                    this.capEl.style.left = (startCapLeft + deltaX) + 'px';
                    this.capEl.style.top = (startCapTop + deltaY) + 'px';

                    const bodyPos = this.getPos(this.bodyEl);
                    const capPos = this.getPos(this.capEl);
                    const dist = Math.hypot(capPos.x - bodyPos.x, capPos.y - bodyPos.y);
                    this.isCapped = dist <= this.SNAP_DISTANCE;
                }
                
                rafId = null;
            });
        });

        // 5. Mouse Up
        window.addEventListener('mouseup', () => {
            if (isDraggingCap) {
                const bodyPos = this.getPos(this.bodyEl);
                const capPos = this.getPos(this.capEl);
                const dist = Math.hypot(capPos.x - bodyPos.x, capPos.y - bodyPos.y);
                
                if (dist < this.SNAP_DISTANCE) {
                    // Snap nắp vào thân
                    this.capEl.style.left = bodyPos.x + 'px';
                    this.capEl.style.top = bodyPos.y + 'px';
                    this.isCapped = true;

                    // Tắt lửa nếu đang cháy
                    if (this.isLit) {
                        this.isLit = false;
                        this.bodyEl.classList.remove('lit');
                    }
                }
            }
            
            isDraggingLamp = false;
            isDraggingCap = false;
            if (rafId) cancelAnimationFrame(rafId);
        });
    }

    startPhysicsLoop() {
        const animate = () => {
            if (this.isLit) {
                this.calculateFlamePhysics();
            } else {
                this.flamePhysics.style.transform = 'none';
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    calculateFlamePhysics() {
        const currentLampX = parseFloat(this.bodyEl.style.left) || 0;
        const velocityX = currentLampX - this.lastLampX;
        this.lastLampX = currentLampX;

        let targetAngle = -velocityX * 3; 
        targetAngle = Math.max(-50, Math.min(50, targetAngle));

        let targetScaleX = 1;
        let targetScaleY = 1;

        // Lưu ý: getBoundingClientRect phải lấy từ bodyEl
        const rect = this.bodyEl.getBoundingClientRect();
        const wickX = rect.left + 205; 
        const wickY = rect.top + 190;

        let obstacleX = this.mouseX;
        let obstacleY = this.mouseY;
        let hasTool = false;

        const tools = document.querySelectorAll('.chemical-spoon-svg, .iron-wire-svg');
        let minVertDist = 999;

        tools.forEach(tool => {
            const toolRect = tool.getBoundingClientRect();
            const isWire = tool.classList.contains('iron-wire-svg');
            const heightRatio = isWire ? 0.85 : 0.95;

            const tipX = toolRect.left + toolRect.width / 2;
            const tipY = toolRect.top + toolRect.height * heightRatio;

            const dx = Math.abs(tipX - wickX);
            const dy = tipY - wickY;

            if (dx < 30 && dy < 20) {
                const dist = Math.hypot(tipX - wickX, tipY - wickY);
                if (dist < minVertDist) {
                    minVertDist = dist;
                    obstacleX = tipX;
                    obstacleY = tipY;
                    hasTool = true;
                }
            }
        });

        if (!hasTool) {
             const mouseDx = Math.abs(this.mouseX - wickX);
             const mouseDy = this.mouseY - wickY;
             if (mouseDx < 40 && mouseDy < 20) {
                 // OK
             } else {
                 obstacleY = -9999; 
             }
        }

        const dx = obstacleX - wickX; 
        const absDx = Math.abs(dx);   
        const dy = obstacleY - wickY; 

        if (absDx < 30 && dy < 20 && dy > -100) { 
            const effectiveHeight = 80;
            const currentHeight = Math.abs(Math.min(0, dy));
            let factor = Math.max(0, (effectiveHeight - currentHeight) / effectiveHeight);
            factor *= (30 - absDx) / 30;

            targetScaleY = 1 - factor * 0.5; 
            targetScaleX = 1 + factor * 0.6; 
            
            if (factor > 0.1) {
                targetAngle += -dx * 1.5 * factor; 
            }
        }

        this.flameState.angle += (targetAngle - this.flameState.angle) * 0.15;
        this.flameState.scaleX += (targetScaleX - this.flameState.scaleX) * 0.1;
        this.flameState.scaleY += (targetScaleY - this.flameState.scaleY) * 0.1;

        this.flamePhysics.style.transform = `rotate(${this.flameState.angle}deg) scale(${this.flameState.scaleX}, ${this.flameState.scaleY})`;
    }
}

window.AlcoholLamp = AlcoholLamp;