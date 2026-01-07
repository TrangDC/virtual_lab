// spoon.js - Fix lỗi hỗ trợ nhiều bình (Multi-instance support)

class ChemicalSpoon {
    constructor(container) {
        this.container = container;
        this.element = this.createSpoonElement();
        this.container.appendChild(this.element);

        const x = Math.random() * (window.innerWidth - 300) + 150;
        const y = Math.random() * (window.innerHeight - 500) + 150;
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';

        this.spoonBody = this.element.querySelector('#main-spoon-body');
        this.solidGroup = this.element.querySelector('#spoon-chemical');
        this.liquidGroup = this.element.querySelector('#spoon-liquid');

        this.isPlugged = false;
        this.attachedFlask = null;
        this.SNAP_DISTANCE = 70;
        this.plugOffsetX = 1.8;
        this.plugOffsetY = -67;

        this.justUnplugged = false;
        this.hasChemical = false; 
        this.isMolten = false;    
        this.heatLevel = 0;
        this.MELTING_THRESHOLD = 60;
        this.isDragging = false;

        this.initEvents();
    }

    createSpoonElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'chemical-spoon-svg';
        wrapper.innerHTML = `
<svg viewBox="150 0 100 400" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <style>.spoon-cls-1,.spoon-cls-8{fill:none;}.spoon-cls-2{fill:#343841;} .spoon-cls-3{fill:url(#spoon-grad-1);} .spoon-cls-4{fill:url(#spoon-grad-2);} .spoon-cls-5{fill:url(#spoon-rad-1);} .spoon-cls-6{fill:url(#spoon-rad-2);} .spoon-cls-7{fill:url(#spoon-grad-3);} .spoon-cls-8{stroke-miterlimit:10;stroke-width:0.48px;stroke:url(#spoon-grad-4);} .spoon-cls-9{opacity:0.25;fill:url(#spoon-rad-3);} .spoon-cls-10{clip-path:url(#spoon-clip-1);} .spoon-cls-11{fill:url(#spoon-grad-5);} .spoon-na-base {fill:#dcddda;} .spoon-na-light {fill:#e2e8e2;} .spoon-na-shadow {fill:#bebfbe;} .spoon-na-highlight {fill:#fdfffd;} 
        .spoon-liq-base {fill:#dcddda;} .spoon-liq-mid {fill:#fdfffd;} .spoon-liq-shadow {fill:#bebfbe;} .spoon-liq-light {fill:#e2e8e2;}
        </style>
        <linearGradient id="spoon-grad-1" x1="194.05" y1="197.15" x2="201.58" y2="197.15" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#593021"/><stop offset="0" stop-color="#7a4a3d"/><stop offset="0" stop-color="#231f20"/><stop offset="0.67" stop-color="#6d6e71"/><stop offset="1" stop-color="#6d6e71"/></linearGradient>
        <linearGradient id="spoon-grad-2" x1="169.46" y1="135.39" x2="227.36" y2="135.39" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#593021"/><stop offset="0.3" stop-color="#7a4a3d"/><stop offset="0.49" stop-color="#562e24"/><stop offset="0.75" stop-color="#35190f"/><stop offset="0.89" stop-color="#764b3d"/><stop offset="1" stop-color="#613121"/></linearGradient>
        <radialGradient id="spoon-rad-1" cx="16.28" cy="115.85" r="27.77" gradientTransform="translate(175.85 52.45) scale(1.39 0.55)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#593021"/><stop offset="0" stop-color="#7a4a3d"/><stop offset="0" stop-color="#562e24"/><stop offset="0" stop-color="#68382a"/><stop offset="1" stop-color="#35190f"/></radialGradient>
        <radialGradient id="spoon-rad-2" cx="222.47" cy="380.74" r="22.9" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#593021"/><stop offset="0" stop-color="#7a4a3d"/><stop offset="0" stop-color="#231f20"/><stop offset="0.32" stop-color="#414042"/><stop offset="0.76" stop-color="#666668"/></radialGradient>
        <linearGradient id="spoon-grad-3" x1="191.71" y1="370.63" x2="253.23" y2="370.63" xlink:href="#spoon-grad-1"/>
        <linearGradient id="spoon-grad-4" x1="191.47" y1="370.63" x2="253.47" y2="370.63" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#593021"/><stop offset="0" stop-color="#7a4a3d"/><stop offset="0" stop-color="#939598"/><stop offset="0.67" stop-color="#58595b"/><stop offset="1" stop-color="#6d6e71"/></linearGradient>
        <radialGradient id="spoon-rad-3" cx="-168.25" cy="-370.62" r="10.15" gradientTransform="translate(446.77 652.52) scale(1.39 0.76)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.4"/><stop offset="0" stop-color="#fff" stop-opacity="0.6"/><stop offset="0.71" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <clipPath id="spoon-clip-1"><rect x="184.99" y="6.81" width="25.65" height="109.25"/></clipPath>
        <linearGradient id="spoon-grad-5" x1="194.14" y1="197.15" x2="201.68" y2="197.15" xlink:href="#spoon-grad-1"/>
        <radialGradient id="spoon-na-rad-1" cx="209.39" cy="473.59" r="24.01" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#593021"/><stop offset="0" stop-color="#7a4a3d"/><stop offset="0" stop-color="#231f20"/><stop offset="0.32" stop-color="#414042"/><stop offset="0.76" stop-color="#666668"/></radialGradient>
        <radialGradient id="spoon-na-rad-2" cx="-716.46" cy="-106.57" r="10.64" gradientTransform="translate(1195.88 543.71) scale(1.39 0.76)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.4"/><stop offset="0" stop-color="#fff" stop-opacity="0.6"/><stop offset="0.71" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <g id="main-spoon-body">
        <rect x="160" y="0" width="80" height="400" fill="transparent" />
        <rect class="spoon-cls-3" x="194.05" y="16.47" width="7.54" height="361.36" rx="3.36"/>
        <g transform="translate(198, 130) scale(1.2, 1) translate(-198, -130)">
            <path class="spoon-cls-4" d="M227.36,115.37h-57.9l2.85,35.87a.68.68,0,0,0-.11.32c0,2.13,11.71,3.86,26.14,3.86s26.14-1.73,26.14-3.86h0Z"/>
            <ellipse class="spoon-cls-5" cx="198.41" cy="115.85" rx="28.95" ry="4.48"/>
            <g class="spoon-cls-10"><rect class="spoon-cls-11" x="194.14" y="16.47" width="7.54" height="361.36" rx="3.36"/></g>
        </g>
        <path class="spoon-cls-6" d="M191.76,370.63c0,.23,0,.45,0,.68,0,10.79,13.77,19.54,30.76,19.54s30.76-8.75,30.76-19.54c0-.23,0-.45-.06-.68Z"/>
        <ellipse class="spoon-cls-7" cx="222.47" cy="370.63" rx="30.76" ry="11.35"/>
        <ellipse class="spoon-cls-8" cx="222.47" cy="370.63" rx="30.76" ry="11.35"/>
        <ellipse class="spoon-cls-9" cx="210.59" cy="373.63" rx="14.93" ry="13.42" transform="translate(-55.68 37.41) rotate(-8.97)"/>
        
        <g id="spoon-chemical" transform="translate(0, -90)" style="opacity: 0; transition: opacity 0.3s ease;">
            <path class="spoon-na-base" d="M199,469l12.37,4.12,7.16-3.4s4.81-1.44,5.65-2.55,7.07-8.22,7.1-9.39,2.79-6.35,2.79-6.35l-1.79-2.95a12,12,0,0,0-7.2-1.09,16.32,16.32,0,0,1-8.54-1.59s-6.4,2.52-6.87,4.22-4,3.87-4,5.34-5.43,7.19-5.43,7.19S197.09,468.33,199,469Z"/>
            <path class="spoon-na-light" d="M201.15,467s8.78-6.31,9.46-6.3,3.36,1.89,3,2.14-.09,1.33,1.45,2.05a1.59,1.59,0,0,1-1,3c-2.07-.26-4.35-1.84-6.85-1.3A30.83,30.83,0,0,1,201.15,467Z"/>
            <path class="spoon-na-shadow" d="M200,466.23l10.39-6.38s3.83-4.84,3.14-5.31-.74-1.55.33-3l2.58-3.42-.82-1.45-2.34.49-3.41,2a4.68,4.68,0,0,1-1,3c-1.15,1.52-2.35,2.31-3.74,4.26s-1.82,4.47-2.75,5.71-3.82,4.29-3.82,4.29Z"/>
            <path class="spoon-na-shadow" d="M212.78,460.16s3.51-3,5.7-2.47,2.59,1.18,2.87.81-1.63,1.7,2-2.6,3.81-2.51,4.92-3a14.65,14.65,0,0,0,3-2.78s1.61-.05,1.12.84-1.83,3.1-2.55,4.29a17.35,17.35,0,0,0-2.12,4.42,22.81,22.81,0,0,1-4.18,6.68c-1,.83-2.43,1-2.81,1.88s-6.52,2.63-6.52,2.63,1.72-2,2.65-3.27l.92-1.22-.74-3.16-3.34-2.88Z"/>
            <path class="spoon-na-light" d="M215.7,456.3l6.13-3.27s.53.91.89.43a4.16,4.16,0,0,1,1.48-2,17.94,17.94,0,0,1,4.6-2.32s.13-.49-1.16-.62-1.08.4-3.75.76a5,5,0,0,1-4.52-1.32c-.76-.62-2.43-1.86-2.43-1.86s-.7-.22-.89,2.56.42,4.73.75,5,1.1-1.75.33.25a5.28,5.28,0,0,1-2.45,2.78l1.69-.78"/>
            <path class="spoon-na-highlight" d="M200.06,467.87s7-4.3,7.76-4.58.16.55,1.88-2.11,2.42-3,2.42-3l-.7.31a3.74,3.74,0,0,1-1.63,1.72,14.12,14.12,0,0,0-2.83,1.65c-1.25.86-2.64,1.71-3.64,2.32A23.35,23.35,0,0,0,200.06,467.87Z"/>
            <path class="spoon-na-highlight" d="M215.63,455a14.73,14.73,0,0,0,.56-3.14c-.1-.73-1.27-.51,0-2.23s1.64-2.16,1.64-2.16l-.91-1.34a2.06,2.06,0,0,0-1.4,1.85,3.32,3.32,0,0,1-.94,2.63c-.72,1-1.5,1.54-.87,2.3a7.11,7.11,0,0,1,1,1.79l-1.55,3.5,1.89-2.5Z"/>
        </g>
        <g id="spoon-liquid" transform="translate(13, -88) scale(1)" style="opacity: 0; transition: opacity 0.5s ease;">
            <path class="spoon-liq-base" d="M193.9,468.64s11.14,2.31,27.23-.95c0,0,10.4-1.26,11.56-3.89s-7.88-5.89-9.88-4.2-10.41-1.58-13.88-1.37-13.77-.42-14.5,1.79-8.1.94-8.1,3.47S184.23,467.69,193.9,468.64Z"/>
            <path class="spoon-liq-mid" d="M210.51,459.7s1.26-3.47,4.73-1.05,3.57,1.37,7.46,2.1,6.63,2.21,3.05,3.26,3.47,3.36-5.57,1.47-6.31-2.84-9.57-2.31-2.41,1.37-4.31,1.16-3.25-.84-3.15-2.11S206.09,459.39,210.51,459.7Z"/>
            <path class="spoon-liq-shadow" d="M194.85,463.8c1.57.42,3.36,3.15,7.25,2.84s5.05-1.05,7.25-.42,7.05-.11,6,1-1.26,1.26-4.41,1.05.42-.53-6-.31-5.47,1.57-8.62.21-5.15-1-5.57-2.84S194.85,463.8,194.85,463.8Z"/>
            <path class="spoon-liq-light" d="M209.77,466.55a21.81,21.81,0,0,1,5,.34c2.17.47,2.25.2,3.77-.41s.32.75-.72,1.09a13.21,13.21,0,0,1-4.25.82c-1.76,0-6.26.47-5.77-.48A3.58,3.58,0,0,1,209.77,466.55Z"/>
        </g>
    </g>
</svg>`;
        return wrapper;
    }

    meltSodium() {
        if (this.hasChemical && !this.isMolten) {
            this.isMolten = true;
            this.solidGroup.style.opacity = '0';
            this.liquidGroup.style.opacity = '1';
        }
    }

    fillChemical() {
        if (!this.hasChemical) {
            this.hasChemical = true;
            this.solidGroup.style.opacity = '1';
            
            if (this.isDragging) {
                this.startHeatingLoop();
            }
        }
    }

    emptyChemical() {
        this.hasChemical = false;
        this.isMolten = false;
        this.solidGroup.style.opacity = '0';
        this.liquidGroup.style.opacity = '0';
        this.heatLevel = 0;
    }

    startHeatingLoop() {
        const checkHeat = () => {
            if (!this.isDragging) return;
            if (this.isMolten) return;

            const lampBody = document.querySelector('.alcohol-lamp-svg');
            if (lampBody && lampBody.lampRef) {
                const lamp = lampBody.lampRef;
                
                if (lamp.isLit) {
                    const lampRect = lampBody.getBoundingClientRect();
                    const wickX = lampRect.left + 205;
                    const wickY = lampRect.top + 190;

                    const rect = this.element.getBoundingClientRect();
                    const spoonTipX = rect.left + rect.width / 2;
                    const spoonTipY = rect.top + 380; 

                    const dx = Math.abs(spoonTipX - wickX);
                    const dy = spoonTipY - wickY; 

                    if (dx < 40 && dy < 50 && dy > -200) {
                        this.heatLevel++;
                        if (this.heatLevel > this.MELTING_THRESHOLD) {
                            this.meltSodium();
                            return; 
                        }
                    } else {
                        if (this.heatLevel > 0) this.heatLevel--;
                    }
                }
            }
            requestAnimationFrame(checkHeat);
        };
        requestAnimationFrame(checkHeat);
    }

    moveWithFlask(deltaX, deltaY) {
        if (!this.isPlugged || !this.attachedFlask) return;
        const flaskBody = this.attachedFlask.bodyEl;
        const flaskPos = this.attachedFlask.getPos(flaskBody);
        this.element.style.left = (flaskPos.x + this.plugOffsetX) + 'px';
        this.element.style.top = (flaskPos.y + this.plugOffsetY) + 'px';
    }

    onFlaskDragEnd() {}

    initEvents() {
        this.isDragging = false;
        let startMouseX = 0, startMouseY = 0;
        let startLeft = 0, startTop = 0;
        let rafId = null;

        this.spoonBody.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            startLeft = parseFloat(this.element.style.left) || 0;
            startTop = parseFloat(this.element.style.top) || 0;
            this.element.style.zIndex = 1000;
            this.startHeatingLoop();
            e.stopPropagation();
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const deltaX = e.clientX - startMouseX;
                const deltaY = e.clientY - startMouseY;
                const newX = startLeft + deltaX;
                const newY = startTop + deltaY;

                this.element.style.left = newX + 'px';
                this.element.style.top = newY + 'px';

                // --- 1. Z-INDEX & MÚC (Hỗ trợ nhiều bình Natri) ---
                // Tìm tất cả các bình Natri và kiểm tra
                let inAnySodiumJar = false;
                const naBodies = document.querySelectorAll('.sodium-part.is-body');
                
                // Chỉ check múc nếu chưa cắm bình Chlorine
                if (!this.isPlugged) {
                    for (const naBody of naBodies) {
                         if (naBody.sodiumJarRef) {
                            const naJar = naBody.sodiumJarRef;
                            const naPos = naJar.getPos(naBody);
                            const jarMouthY = naPos.y - 130; 
                            const spoonTipY = newY + 180;    
                            const distX = Math.abs(newX - naPos.x); 

                            // Kiểm tra xem có đang ở trong bình Natri này không
                            if (distX < 25 && spoonTipY > jarMouthY) {
                                this.element.style.zIndex = 30; // Chìm
                                inAnySodiumJar = true;
                                
                                // Logic múc
                                if (!naJar.isCapped && !this.hasChemical) {
                                    if (spoonTipY > jarMouthY + 165) {
                                        this.fillChemical();
                                    }
                                }
                                break; // Đã tìm thấy bình đang tương tác, thoát vòng lặp
                            }
                        }
                    }
                    // Nếu không ở trong bình nào thì nổi lên
                    if (!inAnySodiumJar) {
                        this.element.style.zIndex = 1000; 
                    }
                }

                // --- 2. CẮM BÌNH CHLORINE & LOGIC RÚT (Hỗ trợ nhiều bình) ---
                if (this.isPlugged) {
                    const flaskBody = this.attachedFlask?.bodyEl;
                    if (flaskBody) {
                        const flaskPos = this.attachedFlask.getPos(flaskBody);
                        const adjustedDist = Math.hypot(
                            (newX - flaskPos.x - this.plugOffsetX),
                            (newY - flaskPos.y - this.plugOffsetY)
                        );
                        if (adjustedDist > this.SNAP_DISTANCE + 20) {
                            this.unplug();
                        }
                    }
                } else if (!this.justUnplugged) { 
                    // Duyệt qua tất cả các bình Chlorine
                    const clFlaskBodies = document.querySelectorAll('.chlorine-part.is-body');
                    
                    for (const clFlaskBody of clFlaskBodies) {
                        if (clFlaskBody.flaskRef) {
                            const flask = clFlaskBody.flaskRef;
                            const flaskPos = flask.getPos(clFlaskBody);
                            const adjustedDist = Math.hypot(
                                (newX - flaskPos.x - this.plugOffsetX),
                                (newY - flaskPos.y - this.plugOffsetY)
                            );

                            if (adjustedDist < this.SNAP_DISTANCE) {
                                const success = flask.plugTool(this);
                                if (success) {
                                    this.isPlugged = true;
                                    this.attachedFlask = flask;
                                    this.element.style.left = (flaskPos.x + this.plugOffsetX) + 'px';
                                    this.element.style.top = (flaskPos.y + this.plugOffsetY) + 'px';
                                    this.element.style.zIndex = 30; 
                                    
                                    // PHẢN ỨNG HÓA HỌC
                                    if (this.isMolten) {
                                        flask.triggerReaction();
                                        this.emptyChemical(); 
                                    }
                                    break; // Đã cắm vào một bình, dừng tìm kiếm
                                }
                            }
                        }
                    }
                }

                rafId = null;
            });
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.justUnplugged = false; 
                if (rafId) cancelAnimationFrame(rafId);

                if (this.isPlugged) {
                    this.moveWithFlask(0, 0);
                    this.element.style.zIndex = 30;
                } else {
                    // Logic giữ Z-Index (Hỗ trợ nhiều bình Natri)
                    let insideSodium = false;
                    const naBodies = document.querySelectorAll('.sodium-part.is-body');
                    
                    for (const naBody of naBodies) {
                        if (naBody.sodiumJarRef) {
                            const naJar = naBody.sodiumJarRef;
                            const naPos = naJar.getPos(naBody);
                            const jarMouthY = naPos.y - 130;
                            const currLeft = parseFloat(this.element.style.left);
                            const currTop = parseFloat(this.element.style.top);
                            const spoonTipY = currTop + 180;
                            const distX = Math.abs(currLeft - naPos.x);
                            
                            if (distX < 25 && spoonTipY > jarMouthY) {
                                insideSodium = true;
                                break;
                            }
                        }
                    }
                    
                    this.element.style.zIndex = insideSodium ? 30 : 50;
                }
            }
        });
    }

    unplug() {
        if (this.isPlugged && this.attachedFlask) {
            this.attachedFlask.unplugTool();
            this.attachedFlask = null;
        }
        this.isPlugged = false;
        this.justUnplugged = true;
        this.element.style.zIndex = 50;
    }
}

window.ChemicalSpoon = ChemicalSpoon;