// chlorine.js - High Fidelity + JS Animation Logic for Fire

class ChlorineFlask {
    constructor(container) {
        this.container = container;
        this.elements = this.createSeparatedElements();
        
        this.bodyEl = this.elements.body;
        this.capEl = this.elements.cap;

        this.container.appendChild(this.bodyEl);
        this.container.appendChild(this.capEl);

        const x = (window.innerWidth) / 2;
        const y = (window.innerHeight) / 2;
        
        this.setPosition(this.bodyEl, x, y);
        this.setPosition(this.capEl, x, y);

        // Cache elements
        this.bodyGroup = this.bodyEl.querySelector('#chlorine-body');
        this.capGroup = this.capEl.querySelector('#chlorine-cap');
        
        this.sodiumReaction = this.bodyEl.querySelector('#reaction-sodium'); 
        this.ironReaction = this.bodyEl.querySelector('#reaction-iron');     
        this.originalGas = this.bodyEl.querySelector('#original-gas');

        this.bodyEl.flaskRef = this; 
        
        this.isCapped = true;
        this.SNAP_DISTANCE = 50;
        this.pluggedTool = null;
        this.reactionTimer = null;
        this.animationFrameId = null; // ID để quản lý animation tắt lửa

        this.initEvents();
    }

    setPosition(element, x, y) {
        element.style.left = x + 'px';
        element.style.top = y + 'px';
    }

    getPos(element) {
        return {
            x: parseFloat(element.style.left) || 0,
            y: parseFloat(element.style.top) || 0
        };
    }

    createSeparatedElements() {
        const gasPathData = "M296,347.51a26.85,26.85,0,0,0-1.38-8.62L239.82,174.51a66.54,66.54,0,0,1-3.42-21.06V89.59H174.79v63.86a66.55,66.55,0,0,1-3.43,21.06l-54.6,163.88a29.55,29.55,0,0,0-1.53,9.52,16,16,0,0,0-.18,1.7c-.92,27.49,22.19,34.36,90.54,35,57.81.52,90.54-7.48,90.54-35A13.43,13.43,0,0,0,296,347.51Z";
        const croppedViewBox = "95 15 220 390"; 

        const defs = `
        <defs>
            <style>
                .chlorine-flask-svg { overflow: visible; }
                
                /* 1. Animation rung lửa (CSS chỉ lo việc rung) */
                @keyframes internal-flicker {
                    0% { transform: scale(1); opacity: 0.95; }
                    50% { transform: scale(0.95); opacity: 0.85; }
                    100% { transform: scale(1.05); opacity: 1; }
                }

                .reaction-core {
                    transform-origin: 205px 270px;
                    animation: internal-flicker 0.1s infinite alternate;
                    opacity: 1;
                    /* Không set transition ở đây nữa, JS sẽ lo việc mờ dần */
                }

                /* 2. Logic Khói (Cross-fade) - Vẫn dùng CSS transition cho khói vì nó đơn giản */
                .reaction-group { opacity: 0; pointer-events: none; transition: opacity 0.5s; }
                .reaction-group.active { opacity: 1; }
                
                .smoke-burning { opacity: 1; transition: opacity 2s ease; }
                .smoke-product { opacity: 0; transition: opacity 3s ease; }
                
                .reaction-group.finished .smoke-burning { opacity: 0; }
                .reaction-group.finished .smoke-product { opacity: 1; }

                #original-gas { transition: opacity 1s; }
                #original-gas.gas-faded { opacity: 0; }

                /* --- STYLES SVG --- */
                .ch-new-2{fill:url(#ch-grad-1);} .ch-new-3{fill:url(#ch-grad-2);} .ch-new-4{fill:url(#ch-grad-3);} .ch-new-5{fill:url(#ch-grad-4);} .ch-new-6{fill:url(#ch-grad-5);} 
                .ch-new-7{fill:url(#ch-rad-1);} .ch-new-8{fill:url(#ch-rad-2);} .ch-new-9{fill:url(#ch-grad-6);} .ch-new-10{fill:url(#ch-rad-3);} .ch-new-11,.ch-new-12{fill:url(#ch-rad-4);} 
                .ch-new-12{stroke:#fff;stroke-miterlimit:10;stroke-width:0.88px;opacity:0.33;} 
                .ch-new-13{fill:url(#ch-rad-6);} 
                .ch-new-14{fill:none;stroke:url(#ch-grad-7);stroke-miterlimit:10;stroke-width:1.35px;opacity:0.4;} 
                .ch-new-15{fill:url(#ch-grad-8);opacity:0.53;} 
                .ch-new-16{fill:url(#ch-grad-9);} 
                .ch-new-17{fill:url(#ch-grad-10);} 
                .ch-new-18{fill:url(#ch-grad-11);} 
                .ch-new-19{fill:url(#ch-grad-12);} 
                .ch-new-20{fill:none;stroke:url(#ch-grad-13);stroke-miterlimit:10;opacity:0.53;} 
                .ch-new-21{fill:url(#ch-grad-14);opacity:0.85;} 
                .ch-new-22{fill:none;stroke:url(#ch-grad-15);stroke-miterlimit:10;opacity:0.53;} 
                .ch-new-23{fill:url(#ch-rad-7);} 
                .ch-new-24{fill:url(#ch-rad-8);} 
                .ch-new-25{fill:url(#ch-rad-9);} 
                .ch-new-26,.ch-new-27{fill:#fff;} 
                .ch-new-27{font-size:12.58px;font-family:Arial, sans-serif;}
            </style>
            
            <linearGradient id="ch-grad-1" x1="174.11" y1="110.59" x2="236.77" y2="110.59" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.8"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.2"/><stop offset="1" stop-color="#fff" stop-opacity="0.8"/></linearGradient>
            <linearGradient id="ch-grad-2" x1="174.03" y1="110.59" x2="236.69" y2="110.59" xlink:href="#ch-grad-1"/>
            <linearGradient id="ch-grad-3" x1="184.07" y1="31.36" x2="228" y2="31.36" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.5"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.2"/><stop offset="1" stop-color="#fff" stop-opacity="0.4"/></linearGradient>
            <linearGradient id="ch-grad-4" x1="191.4" y1="58.46" x2="219.4" y2="58.46" xlink:href="#ch-grad-1"/>
            <linearGradient id="ch-grad-5" x1="183.05" y1="69.74" x2="227.75" y2="69.74" xlink:href="#ch-grad-1"/>
            <radialGradient id="ch-rad-1" cx="205.4" cy="58.46" r="10.71" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.4"/><stop offset="0" stop-color="#fff" stop-opacity="0.6"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.3"/><stop offset="0.95" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <radialGradient id="ch-rad-2" cx="205.4" cy="69.74" r="16.28" xlink:href="#ch-rad-1"/>
            <linearGradient id="ch-grad-6" x1="135.18" y1="80.77" x2="179.87" y2="80.77" gradientTransform="translate(-19.19) scale(1.43 1)" xlink:href="#ch-grad-1"/>
            <radialGradient id="ch-rad-3" cx="157.53" cy="80.77" r="16.28" gradientTransform="translate(-19.19) scale(1.43 1)" xlink:href="#ch-rad-1"/>
            <radialGradient id="ch-rad-4" cx="206.04" cy="31.36" r="21.96" xlink:href="#ch-rad-1"/>
            <radialGradient id="ch-rad-6" cx="520.88" cy="-691.9" r="12.35" gradientTransform="matrix(0, 0.94, -0.48, 0, -123.93, -469.23)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.4"/><stop offset="0" stop-color="#fff" stop-opacity="0.6"/><stop offset="0.79" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <linearGradient id="ch-grad-7" x1="204.72" y1="385.56" x2="204.72" y2="345.97" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.1"/><stop offset="1" stop-color="#fff" stop-opacity="0.6"/></linearGradient>
            <linearGradient id="ch-grad-8" x1="118.98" y1="365.16" x2="290.46" y2="365.16" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.4"/><stop offset="0.53" stop-color="#fff" stop-opacity="0.7"/><stop offset="1" stop-color="#fff" stop-opacity="0.4"/></linearGradient>
            <linearGradient id="ch-grad-9" x1="109.78" y1="238.3" x2="301.87" y2="238.3" xlink:href="#ch-grad-3"/>
            <linearGradient id="ch-grad-10" x1="205.66" y1="362.78" x2="204.27" y2="86.02" gradientUnits="userSpaceOnUse">
                <stop offset="0.02" stop-color="#e9eb9e" stop-opacity="0.9"/>
                <stop offset="0.44" stop-color="#e9eb9e" stop-opacity="0.6"/>
                <stop offset="1" stop-color="#eff2c3" stop-opacity="0.4"/>
            </linearGradient>
            <linearGradient id="ch-grad-11" x1="129.57" y1="226.3" x2="198.46" y2="244.03" gradientUnits="userSpaceOnUse"><stop offset="0.16" stop-color="#fff" stop-opacity="0.4"/><stop offset="0.42" stop-color="#fff" stop-opacity="0"/></linearGradient>
            <linearGradient id="ch-grad-12" x1="-3456.59" y1="280.31" x2="-3404.41" y2="293.74" gradientTransform="matrix(-1, 0, 0, 1, -3161.08, 0.33)" xlink:href="#ch-grad-11"/>
            <linearGradient id="ch-grad-13" x1="109.28" y1="238.3" x2="302.37" y2="238.3" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.4"/><stop offset="0.2" stop-color="#fff" stop-opacity="0.5"/><stop offset="0.44" stop-color="#fff" stop-opacity="0.62"/><stop offset="0.67" stop-color="#fff" stop-opacity="0.7"/><stop offset="0.92" stop-color="#fff" stop-opacity="0.4"/><stop offset="1" stop-color="#fff" stop-opacity="0.4"/></linearGradient>
            <linearGradient id="ch-grad-14" x1="168.76" y1="81.23" x2="242.89" y2="81.23" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.8"/><stop offset="0.2" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.44" stop-color="#fff" stop-opacity="0.62"/><stop offset="0.67" stop-color="#fff" stop-opacity="0.7"/><stop offset="0.92" stop-color="#fff" stop-opacity="0.4"/><stop offset="1" stop-color="#fff" stop-opacity="0.8"/></linearGradient>
            <linearGradient id="ch-grad-15" x1="168.26" y1="81.23" x2="243.39" y2="81.23" xlink:href="#ch-grad-13"/>
            <radialGradient id="ch-rad-7" cx="-606.24" cy="-165.96" r="14.07" gradientTransform="translate(1355.45 141.68) scale(1.88 0.34)" xlink:href="#ch-rad-6"/>
            <radialGradient id="ch-rad-8" cx="-820.13" cy="-787.77" r="15.45" gradientTransform="matrix(2.35, -0.07, 0.02, 0.65, 2146.44, 621.84)" gradientUnits="userSpaceOnUse"><stop offset="0.09" stop-color="#fff" stop-opacity="0.4"/><stop offset="0.79" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <radialGradient id="ch-rad-9" cx="186.45" cy="7.3" r="64.92" gradientTransform="matrix(0.31, -1.11, 0.09, 0.04, 108.89, 459.44)" gradientUnits="userSpaceOnUse"><stop offset="0.06" stop-color="#fff" stop-opacity="0.4"/><stop offset="0.79" stop-color="#fff" stop-opacity="0"/></radialGradient>

            <radialGradient id="sodium-fire-core-grad" cx="205" cy="270" r="70" gradientUnits="userSpaceOnUse">
                 <stop offset="0.1" stop-color="#ffffff" stop-opacity="1"/>
                 <stop offset="0.4" stop-color="#ffff40" stop-opacity="0.9"/>
                 <stop offset="0.8" stop-color="#ffb32d" stop-opacity="0.8"/>
                 <stop offset="1" stop-color="#ffb32d" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="sodium-burn-smoke-grad" x1="205" y1="400" x2="205" y2="150" gradientUnits="userSpaceOnUse">
                 <stop offset="0.1" stop-color="#f2a93b" stop-opacity="0.6"/>
                 <stop offset="0.4" stop-color="#f3a73b" stop-opacity="0.8"/>
                 <stop offset="1" stop-color="#f3a63c" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="sodium-final-grad" x1="205" y1="380" x2="205" y2="100" gradientUnits="userSpaceOnUse">
                 <stop offset="0" stop-color="#f0f0f0" stop-opacity="0.98"/>
                 <stop offset="0.5" stop-color="#e6e6e6" stop-opacity="0.95"/>
                 <stop offset="1" stop-color="#cccccc" stop-opacity="0.85"/>
            </linearGradient>
            <radialGradient id="iron-fire-core-grad" cx="205" cy="270" r="60" gradientUnits="userSpaceOnUse">
                 <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
                 <stop offset="0.4" stop-color="#ffcc00" stop-opacity="1"/>
                 <stop offset="1" stop-color="#ff4500" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="iron-burn-smoke-grad" x1="196" y1="469" x2="195" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#c88259" stop-opacity="0.7"/>
                <stop offset="1" stop-color="#70312d" stop-opacity="0.4"/>
            </linearGradient>
            <linearGradient id="iron-final-grad" x1="205" y1="400" x2="205" y2="100" gradientUnits="userSpaceOnUse">
                 <stop offset="0.1" stop-color="#6e3b1f" stop-opacity="0.98"/>
                 <stop offset="0.6" stop-color="#8a4b27" stop-opacity="0.95"/>
                 <stop offset="0.95" stop-color="#a65e33" stop-opacity="0.9"/> 
            </linearGradient>
        </defs>`;

        const capGroupHTML = `
        <g id="chlorine-cap">
            <circle class="ch-new-4" cx="206.04" cy="31.36" r="21.96"/>
            <circle class="ch-new-11" cx="206.04" cy="31.36" r="21.96"/>
            <circle class="ch-new-12" cx="206.04" cy="31.36" r="21.96"/>
            <rect class="ch-new-5" x="191.4" y="52.7" width="28" height="11.53" rx="3.41"/>
            <rect class="ch-new-7" x="191.4" y="52.7" width="28" height="11.53" rx="3.41"/>
            <rect class="ch-new-6" x="183.05" y="64.23" width="44.69" height="11.03" rx="3.41"/>
            <rect class="ch-new-8" x="183.05" y="64.23" width="44.69" height="11.03" rx="3.41"/>
            <rect class="ch-new-9" x="173.54" y="75.26" width="63.72" height="11.03" rx="3.41"/>
            <rect class="ch-new-10" x="173.54" y="75.26" width="63.72" height="11.03" rx="3.41"/>
            <path class="ch-new-2" d="M236.77,83.63A8.34,8.34,0,0,1,231,85.91H179.87a8.34,8.34,0,0,1-5.76-2.28l5.59,48.74a1.16,1.16,0,0,0-.08.32c0,2.68,11.52,4.86,25.74,4.86,13.61,0,24.72-2,25.65-4.52h.09Z"/>
            <path class="ch-new-3" d="M231,125h-.09c-.93,2.52-12.05,4.52-25.65,4.52-14.22,0-25.74-2.18-25.74-4.86a1.25,1.25,0,0,1,.08-.32l-4.57-39.89a8,8,0,0,1-1-.8l5.59,48.74a1.16,1.16,0,0,0-.08.32c0,2.68,11.52,4.86,25.74,4.86,13.6,0,24.72-2,25.65-4.52H231l5.67-49.4a8.76,8.76,0,0,1-1,.8Z"/>
            <ellipse class="ch-new-13" cx="206.04" cy="19.94" rx="9.81" ry="11.73" transform="translate(158.05 221.3) rotate(-82.12)"/>
        </g>`;

        const bodyGroupHTML = `
        <g id="chlorine-body">
            <ellipse class="ch-new-14" cx="204.72" cy="365.77" rx="85.74" ry="19.12"/>
            <ellipse class="ch-new-15" cx="204.72" cy="365.16" rx="85.74" ry="19.72"/>
            <path class="ch-new-16" d="M301.69,351.59a27.25,27.25,0,0,0-1.47-8.85L242.12,174.1a66.51,66.51,0,0,1-3.63-21.61V87H173.14v65.51a66.51,66.51,0,0,1-3.63,21.61L111.59,342.23A29.24,29.24,0,0,0,110,352a14.29,14.29,0,0,0-.18,1.73c-1,28.21,43,35.89,96,35.89s96-7.68,96-35.89A13.94,13.94,0,0,0,301.69,351.59Z"/>
            
            <path id="original-gas" class="ch-new-17" d="${gasPathData}"/>

            <g id="reaction-sodium" class="reaction-group">
                <path class="smoke-product" fill="url(#sodium-final-grad)" d="${gasPathData}"/>
                <path class="smoke-burning" fill="url(#sodium-burn-smoke-grad)" d="${gasPathData}"/>
                <ellipse class="reaction-core" fill="url(#sodium-fire-core-grad)" cx="205" cy="270" rx="70" ry="70"/>
            </g>

            <g id="reaction-iron" class="reaction-group">
                <path class="smoke-product" fill="url(#iron-final-grad)" d="${gasPathData}"/>
                <path class="smoke-burning" fill="url(#iron-burn-smoke-grad)" d="${gasPathData}"/>
                <ellipse class="reaction-core" fill="url(#iron-fire-core-grad)" cx="205" cy="270" rx="60" ry="60"/>
            </g>

            <path class="ch-new-18" d="M123.35,353.73a14.27,14.27,0,0,1,.17-1.73,29.24,29.24,0,0,1,1.62-9.77L183.06,174.1a66.24,66.24,0,0,0,3.63-21.61V87H173.14v65.51a66.51,66.51,0,0,1-3.63,21.61L111.59,342.23A29.24,29.24,0,0,0,110,352a14.29,14.29,0,0,0-.18,1.73c-1,28.21,43,35.89,96,35.89q3.42,0,6.78-.05C162.65,388.92,122.42,380.73,123.35,353.73Z"/>
            <path class="ch-new-19" d="M301.21,352.27a29.24,29.24,0,0,0-1.62-9.77L253.83,209.68q-8.58-5.07-17.1-10.29L286,342.5a29.24,29.24,0,0,1,1.62,9.77,14.27,14.27,0,0,1,.17,1.73c.94,27-39.3,35.19-89.25,35.84q3.35,0,6.77,0c53,0,97-7.67,96-35.88A14.27,14.27,0,0,0,301.21,352.27Z"/>
            <path class="ch-new-20" d="M301.69,351.59a27.25,27.25,0,0,0-1.47-8.85L242.12,174.1a66.51,66.51,0,0,1-3.63-21.61V87H173.14v65.51a66.51,66.51,0,0,1-3.63,21.61L111.59,342.23A29.24,29.24,0,0,0,110,352a14.29,14.29,0,0,0-.18,1.73c-1,28.21,43,35.89,96,35.89s96-7.68,96-35.89A13.94,13.94,0,0,0,301.69,351.59Z"/>
            <rect class="ch-new-21" x="168.76" y="75.34" width="74.12" height="11.78" rx="4.89"/>
            <rect class="ch-new-22" x="168.76" y="75.34" width="74.12" height="11.78" rx="4.89"/>
            <ellipse class="ch-new-23" cx="208.94" cy="87.6" rx="26.73" ry="7.86"/>
            <path class="ch-new-24" d="M233.31,156.21c.75,3.33-10.25,28.91-32.57,34.12-22.4,5.79-34.46-18.51-34.06-31.29-.76-13.37,10.25-2.61,32.57,1C221.65,164.31,233.7,152.27,233.31,156.21Z"/>
            <path class="ch-new-25" d="M181,159,137.12,312.24s25.18,21.76,37.78,6S198.57,159,198.57,159Z"/>
            <rect class="ch-new-26" x="183.8" y="317.51" width="18.69" height="0.66"/>
            <rect class="ch-new-26" x="183.8" y="250.25" width="18.69" height="0.66"/>
            <rect class="ch-new-26" x="183.8" y="339.21" width="18.69" height="0.66"/>
            <rect class="ch-new-26" x="183.8" y="290.2" width="18.69" height="0.66"/>
            <path class="ch-new-26" d="M209.51,260.36c0-.43,0-.79,0-1.14h.67l0,.68h0a1.43,1.43,0,0,1,1.32-.77,1.25,1.25,0,0,1,1.19.84h0a1.82,1.82,0,0,1,.47-.55,1.44,1.44,0,0,1,.93-.29c.56,0,1.38.36,1.38,1.83v2.48h-.75v-2.39c0-.81-.29-1.29-.91-1.29a1,1,0,0,0-.9.69,1.17,1.17,0,0,0-.07.38v2.61h-.74v-2.53c0-.67-.3-1.15-.88-1.15a1,1,0,0,0-1,.76.92.92,0,0,0-.06.38v2.54h-.75Z"/>
            <path class="ch-new-26" d="M216.8,257.57h.75v5.23h2.51v.64H216.8Z"/>
            <text class="ch-new-27" transform="translate(207.96 343.24)">100</text>
            <text class="ch-new-27" transform="translate(207.96 321.54)">150</text>
            <text class="ch-new-27" transform="translate(207.96 294.23)">200</text>
            <text class="ch-new-27" transform="translate(207.96 254.27)">250</text>
        </g>`;

        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'chlorine-part is-body chlorine-flask-svg';
        bodyWrapper.innerHTML = `<svg viewBox="${croppedViewBox}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${defs}${bodyGroupHTML}</svg>`;

        const capWrapper = document.createElement('div');
        capWrapper.className = 'chlorine-part is-cap chlorine-flask-svg';
        capWrapper.innerHTML = `<svg viewBox="${croppedViewBox}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${defs}${capGroupHTML}</svg>`;

        return { body: bodyWrapper, cap: capWrapper };
    }

    resetReactions() {
        if (this.reactionTimer) clearTimeout(this.reactionTimer);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        if (this.sodiumReaction) {
            this.sodiumReaction.classList.remove('active', 'finished');
            const core = this.sodiumReaction.querySelector('.reaction-core');
            if(core) { core.style.transform = 'scale(1)'; core.style.opacity = '1'; core.style.filter = 'none'; }
        }
        if (this.ironReaction) {
            this.ironReaction.classList.remove('active', 'finished');
            const core = this.ironReaction.querySelector('.reaction-core');
            if(core) { core.style.transform = 'scale(1)'; core.style.opacity = '1'; core.style.filter = 'none'; }
        }
        if (this.originalGas) {
            this.originalGas.classList.remove('gas-faded');
        }
    }

    // === HÀM ANIMATION TẮT LỬA BẰNG JS FRAME (MƯỢT MÀ, ĐỔI MÀU, BIẾN MẤT) ===
    animateExtinguish(coreElement) {
        let startTime = null;
        const duration = 2000; // 2 giây để tắt dần

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Hàm easing (Ease Out Cubic) cho mượt
            const ease = 1 - Math.pow(1 - progress, 3);
            
            // 1. Scale: 1 -> 0
            const currentScale = 1 - ease;
            
            // 2. Opacity: 1 -> 0
            const currentOpacity = 1 - ease;

            // 3. Brightness: Giảm độ sáng để giả lập đổi màu (xỉn đi)
            // Từ 1 (sáng) -> 0.4 (tối/xám)
            const currentBrightness = 1 - (ease * 0.6); 

            // Áp dụng style trực tiếp từng frame
            if (coreElement) {
                coreElement.style.transform = `scale(${currentScale})`;
                coreElement.style.opacity = currentOpacity;
                coreElement.style.filter = `brightness(${currentBrightness})`;
            }

            if (progress < 1) {
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                // Kết thúc: Ẩn hẳn
                if (coreElement) {
                    coreElement.style.opacity = 0;
                    coreElement.style.transform = 'scale(0)';
                }
            }
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    triggerReaction(type = 'sodium') {
        this.resetReactions(); 

        console.log(`💥 Bắt đầu phản ứng: ${type} + Clo`);

        if (this.originalGas) {
            this.originalGas.classList.add('gas-faded');
        }

        let reactionGroup = null;
        if (type === 'sodium') {
            reactionGroup = this.sodiumReaction;
        } else if (type === 'iron') {
            reactionGroup = this.ironReaction;
        }

        if (reactionGroup) {
            // Bước 1: Kích hoạt (Hiện lửa, khói cháy)
            reactionGroup.classList.add('active'); 
            const coreElement = reactionGroup.querySelector('.reaction-core');

            // Bước 2: Sau 4 giây -> Kích hoạt animation JS để tắt lửa
            this.reactionTimer = setTimeout(() => {
                reactionGroup.classList.add('finished'); // Để CSS xử lý khói
                
                // GỌI HÀM ANIMATION JS CHO LỬA
                if (coreElement) {
                    this.animateExtinguish(coreElement);
                }
                
                console.log(`💨 Phản ứng ${type} kết thúc.`);
            }, 4000); 
        }
    }

    initEvents() {
        let isDraggingBody = false;
        let isDraggingCap = false;

        let startMouseX = 0, startMouseY = 0;
        let startBodyLeft = 0, startBodyTop = 0;
        let startCapLeft = 0, startCapTop = 0;
        let rafId = null;

        this.bodyGroup.addEventListener('mousedown', (e) => {
            if (isDraggingCap) return;
            isDraggingBody = true;
            
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            
            const bodyPos = this.getPos(this.bodyEl);
            startBodyLeft = bodyPos.x;
            startBodyTop = bodyPos.y;

            const capPos = this.getPos(this.capEl);
            startCapLeft = capPos.x;
            startCapTop = capPos.y;

            this.bodyEl.style.zIndex = 1000;
            this.capEl.style.zIndex = 1001;
            e.stopPropagation();
        });

        this.capGroup.addEventListener('mousedown', (e) => {
            isDraggingCap = true;
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            
            const capPos = this.getPos(this.capEl);
            startCapLeft = capPos.x;
            startCapTop = capPos.y;
            
            e.stopPropagation();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDraggingBody && !isDraggingCap) return;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const deltaX = e.clientX - startMouseX;
                const deltaY = e.clientY - startMouseY;

                if (isDraggingBody) {
                    this.bodyEl.style.left = (startBodyLeft + deltaX) + 'px';
                    this.bodyEl.style.top = (startBodyTop + deltaY) + 'px';

                    if (this.isCapped) {
                        this.capEl.style.left = (startCapLeft + deltaX) + 'px';
                        this.capEl.style.top = (startCapTop + deltaY) + 'px';
                    }
                    if (this.pluggedTool && this.pluggedTool.moveWithFlask) {
                        this.pluggedTool.moveWithFlask(deltaX, deltaY);
                    }

                } else if (isDraggingCap) {
                    this.capEl.style.left = (startCapLeft + deltaX) + 'px';
                    this.capEl.style.top = (startCapTop + deltaY) + 'px';

                    const bodyPos = this.getPos(this.bodyEl);
                    const capPos = this.getPos(this.capEl);
                    const dist = Math.hypot(capPos.x - bodyPos.x, capPos.y - bodyPos.y);
                    
                    if (this.pluggedTool) {
                        this.isCapped = false;
                    } else {
                        this.isCapped = dist <= this.SNAP_DISTANCE;
                    }
                }
                
                rafId = null;
            });
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingCap) {
                const bodyPos = this.getPos(this.bodyEl);
                const capPos = this.getPos(this.capEl);
                const dist = Math.hypot(capPos.x - bodyPos.x, capPos.y - bodyPos.y);
                
                if (dist < this.SNAP_DISTANCE && !this.pluggedTool) {
                    this.capEl.style.left = bodyPos.x + 'px';
                    this.capEl.style.top = bodyPos.y + 'px';
                    this.isCapped = true;
                } else {
                    this.isCapped = false;
                }
            }
            
            if (isDraggingBody) {
                 this.bodyEl.style.zIndex = 40;
                 this.capEl.style.zIndex = 41;
                 
                 if (this.pluggedTool && this.pluggedTool.onFlaskDragEnd) {
                     this.pluggedTool.onFlaskDragEnd();
                 }
            }
            
            isDraggingBody = false;
            isDraggingCap = false;
            if (rafId) cancelAnimationFrame(rafId);
        });
    }

    plugTool(toolInstance) {
        if (this.isCapped || this.pluggedTool) return false;
        this.pluggedTool = toolInstance;
        return true;
    }

    unplugTool() {
        this.pluggedTool = null;
    }
}

window.ChlorineFlask = ChlorineFlask;